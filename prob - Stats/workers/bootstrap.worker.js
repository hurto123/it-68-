let requestCounter = 0;

self.addEventListener('message', (event) => {
  const { fn = 'bootstrap', params = {}, id } = event.data || {};
  const requestId = id != null ? id : `req-${++requestCounter}`;
  try {
    let result;
    switch (fn) {
      case 'bootstrap':
        result = runBootstrap(params);
        break;
      case 'jackknife':
        result = runJackknife(params);
        break;
      default:
        throw new Error('ไม่รู้จักคำสั่ง worker');
    }
    self.postMessage({ id: requestId, ...result });
  } catch (error) {
    self.postMessage({ id: requestId, error: error.message });
  }
});

function createRng(seed) {
  if (Number.isFinite(seed)) {
    let state = (seed >>> 0) + 0x6D2B79F5;
    return () => {
      state = Math.imul(state ^ (state >>> 15), state | 1);
      state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
      return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
    };
  }
  return Math.random;
}

function ensureNumericArray(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('ต้องมีข้อมูลอย่างน้อย 1 ค่า');
  }
  for (let i = 0; i < data.length; i += 1) {
    if (!Number.isFinite(data[i])) {
      throw new Error('ข้อมูลต้องเป็นตัวเลขทั้งหมด');
    }
  }
  return data;
}

function statisticValue(sample, statistic) {
  switch (statistic) {
    case 'mean':
      return average(sample);
    case 'median':
      return median(sample);
    case 'sum':
      return sum(sample);
    case 'variance':
      return variance(sample);
    case 'std':
      return Math.sqrt(variance(sample));
    case 'proportion': {
      if (!sample.length) return 0;
      const successes = sample.reduce((acc, value) => acc + (value ? 1 : 0), 0);
      return successes / sample.length;
    }
    default:
      throw new Error('statistic ไม่รองรับ');
  }
}

function runBootstrap(params) {
  const {
    data,
    iterations = 1000,
    statistic = 'mean',
    confidence = 0.95,
    seed,
    keepDistribution = false
  } = params;
  const sample = ensureNumericArray(data);
  const B = Math.floor(iterations);
  if (!Number.isFinite(B) || B <= 0) {
    throw new Error('iterations ต้องมากกว่า 0');
  }
  if (!(confidence > 0 && confidence < 1)) {
    throw new Error('confidence ต้องอยู่ในช่วง (0,1)');
  }
  const alpha = (1 - confidence) / 2;
  const rng = createRng(seed);
  const bootStats = new Array(B);
  const n = sample.length;
  const pointEstimate = statisticValue(sample, statistic);
  for (let i = 0; i < B; i += 1) {
    const resample = new Array(n);
    for (let j = 0; j < n; j += 1) {
      const idx = Math.floor(rng() * n);
      resample[j] = sample[idx];
    }
    bootStats[i] = statisticValue(resample, statistic);
  }
  const sorted = [...bootStats].sort((a, b) => a - b);
  const lowerIndex = Math.max(0, Math.floor(alpha * (B - 1)));
  const upperIndex = Math.min(B - 1, Math.ceil((1 - alpha) * (B - 1)));
  const percentile = {
    lower: sorted[lowerIndex],
    upper: sorted[upperIndex]
  };
  const bootMean = average(bootStats);
  const bias = bootMean - pointEstimate;
  const se = Math.sqrt(variance(bootStats));
  const basic = {
    lower: 2 * pointEstimate - percentile.upper,
    upper: 2 * pointEstimate - percentile.lower
  };
  const bca = computeBcaInterval({
    original: pointEstimate,
    sortedBoot: sorted,
    sample,
    statistic,
    alpha
  });

  return {
    pointEstimate,
    bootstrapMean: bootMean,
    bias,
    standardError: se,
    confidence,
    intervals: {
      percentile,
      basic,
      bca
    },
    distribution: keepDistribution ? [...bootStats] : undefined
  };
}

function runJackknife(params) {
  const { data, statistic = 'mean' } = params;
  const sample = ensureNumericArray(data);
  if (sample.length < 2) {
    throw new Error('ต้องมีข้อมูลอย่างน้อย 2 ค่าในการทำ jackknife');
  }
  const estimates = new Array(sample.length);
  for (let i = 0; i < sample.length; i += 1) {
    const subset = sample.slice(0, i).concat(sample.slice(i + 1));
    estimates[i] = statisticValue(subset, statistic);
  }
  return {
    estimates,
    mean: average(estimates)
  };
}

function computeBcaInterval({ original, sortedBoot, sample, statistic, alpha }) {
  const B = sortedBoot.length;
  let lessThan = 0;
  while (lessThan < B && sortedBoot[lessThan] < original) {
    lessThan += 1;
  }
  const proportion = Math.min(Math.max(lessThan / B, 1e-10), 1 - 1e-10);
  const z0 = inverseNormal(proportion);
  const jackknife = new Array(sample.length);
  for (let i = 0; i < sample.length; i += 1) {
    const subset = sample.slice(0, i).concat(sample.slice(i + 1));
    jackknife[i] = statisticValue(subset, statistic);
  }
  const jackMean = average(jackknife);
  let num = 0;
  let den = 0;
  for (let i = 0; i < jackknife.length; i += 1) {
    const diff = jackMean - jackknife[i];
    num += diff * diff * diff;
    den += diff * diff;
  }
  let acceleration = 0;
  if (den > 0) {
    acceleration = num / (6 * Math.pow(den, 1.5));
  }
  const zAlphaLower = inverseNormal(alpha);
  const zAlphaUpper = inverseNormal(1 - alpha);
  const adjLower = adjustQuantile(z0, zAlphaLower, acceleration);
  const adjUpper = adjustQuantile(z0, zAlphaUpper, acceleration);
  const lowerIndex = clampIndex(Math.floor(adjLower * (B - 1)), B);
  const upperIndex = clampIndex(Math.ceil(adjUpper * (B - 1)), B);
  return {
    lower: sortedBoot[Math.min(lowerIndex, upperIndex)],
    upper: sortedBoot[Math.max(lowerIndex, upperIndex)]
  };
}

function adjustQuantile(z0, zAlpha, acceleration) {
  const denom = 1 - acceleration * (z0 + zAlpha);
  const safeDenom = Math.abs(denom) < 1e-12 ? (denom >= 0 ? 1e-12 : -1e-12) : denom;
  return cumulativeNormal(z0 + (z0 + zAlpha) / safeDenom);
}

function clampIndex(idx, B) {
  if (idx < 0) return 0;
  if (idx > B - 1) return B - 1;
  return idx;
}

function average(values) {
  if (!values.length) return 0;
  let total = 0;
  for (let i = 0; i < values.length; i += 1) {
    total += values[i];
  }
  return total / values.length;
}

function sum(values) {
  let total = 0;
  for (let i = 0; i < values.length; i += 1) {
    total += values[i];
  }
  return total;
}

function variance(values) {
  if (values.length < 2) return 0;
  const mean = average(values);
  let total = 0;
  for (let i = 0; i < values.length; i += 1) {
    const diff = values[i] - mean;
    total += diff * diff;
  }
  return total / (values.length - 1);
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function cumulativeNormal(x) {
  if (!Number.isFinite(x)) {
    return x > 0 ? 1 : 0;
  }
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + p * absX);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return 0.5 * (1 + sign * y);
}

function inverseNormal(p) {
  if (!(p > 0 && p < 1)) {
    throw new Error('p ต้องอยู่ในช่วง (0,1)');
  }
  const a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637];
  const b = [-8.4735109309, 23.08336743743, -21.06224101826, 3.13082909833];
  const c = [0.3374754822726147, 0.9761690190917186, 0.1607979714918209, 0.0276438810333863,
    0.0038405729373609, 0.0003951896511919, 0.0000321767881768, 0.0000002888167364, 0.0000003960315187];
  if (p < 0.5) {
    const y = Math.sqrt(-2 * Math.log(p));
    const num = ((a[3] * y + a[2]) * y + a[1]) * y + a[0];
    const den = (((b[3] * y + b[2]) * y + b[1]) * y + b[0]) * y + 1;
    return -(num / den);
  }
  if (p > 0.5) {
    return -inverseNormal(1 - p);
  }
  let y = p - 0.5;
  let r = 0;
  for (let i = 0; i < c.length; i += 1) {
    r += c[i] * Math.pow(y, i + 1);
  }
  return y + r;
}
