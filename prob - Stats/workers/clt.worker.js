let requestCounter = 0;

self.addEventListener('message', (event) => {
  const { fn = 'simulate', params = {}, id } = event.data || {};
  const requestId = id != null ? id : `req-${++requestCounter}`;
  try {
    let result;
    switch (fn) {
      case 'simulate':
      case 'sample-means':
      case 'clt':
        result = runCltSimulation(params);
        break;
      case 'lln':
        result = runLlnSimulation(params);
        break;
      case 'draw-samples':
        result = drawSamples(params);
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

function drawFromDistribution(rng, distribution) {
  const { type = 'normal' } = distribution || {};
  switch (type) {
    case 'normal': {
      const mean = Number.isFinite(distribution.mean) ? distribution.mean : 0;
      const sd = Number.isFinite(distribution.sd) && distribution.sd > 0 ? distribution.sd : 1;
      return mean + sd * gaussian(rng);
    }
    case 'uniform': {
      const min = Number.isFinite(distribution.min) ? distribution.min : 0;
      const max = Number.isFinite(distribution.max) ? distribution.max : 1;
      return min + rng() * (max - min);
    }
    case 'exponential': {
      const rate = Number.isFinite(distribution.rate) && distribution.rate > 0 ? distribution.rate : 1;
      return -Math.log(1 - rng()) / rate;
    }
    case 'bernoulli': {
      const p = Math.min(1, Math.max(0, Number.isFinite(distribution.p) ? distribution.p : 0.5));
      return rng() < p ? 1 : 0;
    }
    case 'custom': {
      const values = Array.isArray(distribution.values) ? distribution.values : [];
      if (!values.length) {
        throw new Error('custom distribution ต้องมี values');
      }
      const probs = Array.isArray(distribution.probabilities) ? distribution.probabilities : null;
      if (probs && probs.length && probs.length !== values.length) {
        throw new Error('probabilities ต้องมีขนาดเท่ากับ values');
      }
      if (probs && probs.length) {
        let total = 0;
        for (let i = 0; i < probs.length; i += 1) {
          const weight = probs[i];
          if (!(weight >= 0)) {
            throw new Error('probabilities ต้องไม่ติดลบ');
          }
          total += weight;
        }
        if (!(total > 0)) {
          throw new Error('probabilities ต้องมีผลรวมมากกว่า 0');
        }
        let target = rng() * total;
        for (let i = 0; i < values.length; i += 1) {
          target -= probs[i];
          if (target <= 0) {
            return values[i];
          }
        }
        return values[values.length - 1];
      }
      const index = Math.floor(rng() * values.length);
      return values[index];
    }
    default:
      throw new Error('distribution type ไม่ถูกต้อง');
  }
}

function gaussian(rng) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function distributionMoments(distribution) {
  const { type = 'normal' } = distribution || {};
  switch (type) {
    case 'normal': {
      const mean = Number.isFinite(distribution.mean) ? distribution.mean : 0;
      const variance = Math.pow(Number.isFinite(distribution.sd) ? distribution.sd : 1, 2);
      return { mean, variance };
    }
    case 'uniform': {
      const min = Number.isFinite(distribution.min) ? distribution.min : 0;
      const max = Number.isFinite(distribution.max) ? distribution.max : 1;
      const mean = (min + max) / 2;
      const variance = Math.pow(max - min, 2) / 12;
      return { mean, variance };
    }
    case 'exponential': {
      const rate = Number.isFinite(distribution.rate) && distribution.rate > 0 ? distribution.rate : 1;
      const mean = 1 / rate;
      const variance = 1 / (rate * rate);
      return { mean, variance };
    }
    case 'bernoulli': {
      const p = Math.min(1, Math.max(0, Number.isFinite(distribution.p) ? distribution.p : 0.5));
      const mean = p;
      const variance = p * (1 - p);
      return { mean, variance };
    }
    case 'custom': {
      const values = Array.isArray(distribution.values) ? distribution.values : [];
      if (!values.length) {
        throw new Error('custom distribution ต้องมี values');
      }
      const probs = Array.isArray(distribution.probabilities) ? distribution.probabilities : [];
      if (probs.length && probs.length !== values.length) {
        throw new Error('probabilities ต้องมีขนาดเท่ากับ values');
      }
      let mean = 0;
      let variance = 0;
      let totalWeight = 0;
      if (!probs.length) {
        for (let i = 0; i < values.length; i += 1) {
          mean += values[i];
        }
        mean /= values.length;
        for (let i = 0; i < values.length; i += 1) {
          const diff = values[i] - mean;
          variance += diff * diff;
        }
        variance /= values.length;
        return { mean, variance };
      }
      for (let i = 0; i < values.length; i += 1) {
        const weight = probs[i];
        if (!(weight >= 0)) {
          throw new Error('probabilities ต้องไม่ติดลบ');
        }
        totalWeight += weight;
        mean += weight * values[i];
      }
      if (!(totalWeight > 0)) {
        throw new Error('probabilities ต้องมีผลรวมมากกว่า 0');
      }
      mean /= totalWeight;
      for (let i = 0; i < values.length; i += 1) {
        const weight = probs[i] / totalWeight;
        const diff = values[i] - mean;
        variance += weight * diff * diff;
      }
      return { mean, variance };
    }
    default:
      throw new Error('distribution type ไม่ถูกต้อง');
  }
}

function runCltSimulation(params) {
  const {
    distribution = { type: 'normal', mean: 0, sd: 1 },
    sampleSize = 30,
    replications = 1000,
    seed,
    keepRaw = false,
    trackVariance = false
  } = params;
  const size = Math.floor(sampleSize);
  const reps = Math.floor(replications);
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error('sampleSize ต้องมากกว่า 0');
  }
  if (!Number.isFinite(reps) || reps <= 0) {
    throw new Error('replications ต้องมากกว่า 0');
  }
  const rng = createRng(seed);
  const sampleMeans = [];
  const sampleSums = [];
  const sampleVariances = trackVariance ? [] : undefined;
  const rawSamples = keepRaw ? [] : undefined;
  const { mean: mu, variance: sigma2 } = distributionMoments(distribution);

  for (let r = 0; r < reps; r += 1) {
    let sum = 0;
    let sumSq = 0;
    const sample = keepRaw ? new Array(size) : null;
    for (let i = 0; i < size; i += 1) {
      const value = drawFromDistribution(rng, distribution);
      sum += value;
      sumSq += value * value;
      if (sample) sample[i] = value;
    }
    const mean = sum / size;
    sampleMeans.push(mean);
    sampleSums.push(sum);
    if (trackVariance && size > 1) {
      const variance = (sumSq - (sum * sum) / size) / (size - 1);
      sampleVariances.push(variance);
    }
    if (sample) rawSamples.push(sample);
  }

  const meanOfMeans = average(sampleMeans);
  const varianceOfMeans = variance(sampleMeans);
  const summary = {
    populationMean: mu,
    populationVariance: sigma2,
    expectedMeanVariance: sigma2 / size,
    meanOfMeans,
    varianceOfMeans,
    standardError: Math.sqrt(varianceOfMeans)
  };

  return {
    sampleMeans,
    sampleSums,
    sampleVariances,
    rawSamples,
    summary
  };
}

function runLlnSimulation(params) {
  const {
    distribution = { type: 'normal', mean: 0, sd: 1 },
    draws = 1000,
    seed,
    trackVariance = false
  } = params;
  const totalDraws = Math.floor(draws);
  if (!Number.isFinite(totalDraws) || totalDraws <= 0) {
    throw new Error('draws ต้องมากกว่า 0');
  }
  const rng = createRng(seed);
  const runningMean = [];
  const runningVariance = trackVariance ? [] : undefined;
  const values = [];
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < totalDraws; i += 1) {
    const value = drawFromDistribution(rng, distribution);
    values.push(value);
    sum += value;
    sumSq += value * value;
    const mean = sum / (i + 1);
    runningMean.push(mean);
    if (trackVariance) {
      const variance = i > 0 ? (sumSq - (sum * sum) / (i + 1)) / i : 0;
      runningVariance.push(variance);
    }
  }
  const { mean: mu, variance: sigma2 } = distributionMoments(distribution);
  return {
    values,
    runningMean,
    runningVariance,
    theoreticalMean: mu,
    theoreticalVariance: sigma2
  };
}

function drawSamples(params) {
  const {
    distribution = { type: 'normal', mean: 0, sd: 1 },
    sampleSize = 30,
    replications = 1,
    seed
  } = params;
  const size = Math.floor(sampleSize);
  const reps = Math.floor(replications);
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error('sampleSize ต้องมากกว่า 0');
  }
  if (!Number.isFinite(reps) || reps <= 0) {
    throw new Error('replications ต้องมากกว่า 0');
  }
  const rng = createRng(seed);
  const samples = [];
  for (let r = 0; r < reps; r += 1) {
    const sample = new Array(size);
    for (let i = 0; i < size; i += 1) {
      sample[i] = drawFromDistribution(rng, distribution);
    }
    samples.push(sample);
  }
  return { samples };
}

function average(values) {
  if (!values.length) return 0;
  let total = 0;
  for (let i = 0; i < values.length; i += 1) {
    total += values[i];
  }
  return total / values.length;
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
