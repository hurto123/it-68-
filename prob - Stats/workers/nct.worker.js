self.cache = new Map();

function key(params) {
  return JSON.stringify(params);
}

function normalApproxPower(alpha, df, delta) {
  const zAlpha = inverseNormal(1 - alpha / 2);
  const zPower = (Math.sqrt(df) * delta) - zAlpha;
  return cumulativeNormal(zPower);
}

function cumulativeNormal(x) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

function inverseNormal(p) {
  const a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637];
  const b = [-8.4735109309, 23.08336743743, -21.06224101826, 3.13082909833];
  const c = [0.3374754822726147, 0.9761690190917186, 0.1607979714918209, 0.0276438810333863,
    0.0038405729373609, 0.0003951896511919, 0.0000321767881768, 0.0000002888167364];
  if (p < 0.5) {
    const y = Math.sqrt(-2 * Math.log(p));
    const num = ((a[3] * y + a[2]) * y + a[1]) * y + a[0];
    const den = (((b[3] * y + b[2]) * y + b[1]) * y + b[0]) * y + 1;
    return num / den;
  }
  if (p > 0.5) {
    return -inverseNormal(1 - p);
  }
  let y = p - 0.5;
  let r = 0;
  for (let i = 0; i < c.length; i++) {
    r += c[i] * Math.pow(y, i);
  }
  return y * (1 + r);
}

self.addEventListener('message', (event) => {
  const params = event.data;
  const memoKey = key(params);
  if (self.cache.has(memoKey)) {
    self.postMessage(self.cache.get(memoKey));
    return;
  }
  let result;
  switch (params.fn) {
    case 'power':
      result = { power: normalApproxPower(params.alpha, params.df, params.delta) };
      break;
    case 'cdf':
      result = { cdf: cumulativeNormal(params.x) };
      break;
    case 'crit':
      result = { crit: inverseNormal(1 - params.alpha / 2) };
      break;
    default:
      result = { error: 'unsupported' };
  }
  self.cache.set(memoKey, result);
  self.postMessage(result);
});
