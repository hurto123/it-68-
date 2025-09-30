const cache = new Map();
let requestCounter = 0;

function key(fn, params) {
  return `${fn}:${JSON.stringify(params)}`;
}

const LOG_SQRT_TWO_PI = 0.5 * Math.log(2 * Math.PI);

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

function cumulativeNormal(x) {
  if (!Number.isFinite(x)) return x > 0 ? 1 : 0;
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function inverseNormal(p) {
  if (p <= 0 || p >= 1 || !Number.isFinite(p)) throw new Error('p ต้องอยู่ในช่วง (0,1)');
  const a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637];
  const b = [-8.4735109309, 23.08336743743, -21.06224101826, 3.13082909833];
  const c = [0.3374754822726147, 0.9761690190917186, 0.1607979714918209, 0.0276438810333863,
    0.0038405729373609, 0.0003951896511919, 0.0000321767881768, 0.0000002888167364, 0.0000003960315187];
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

function logGamma(z) {
  const g = 7;
  const p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  z -= 1;
  let x = p[0];
  for (let i = 1; i < p.length; i++) {
    x += p[i] / (z + i);
  }
  const t = z + g + 0.5;
  return LOG_SQRT_TWO_PI + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function regularizedIncompleteBeta(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - logGamma(a) - logGamma(b) + logGamma(a + b));
  let continuedFraction = 1;
  let term = 1;
  for (let n = 1; n < 200; n++) {
    term *= (a + n - 1) * x / (n * (1 - x));
    continuedFraction += term;
    if (Math.abs(term) < 1e-12) break;
  }
  const result = bt * continuedFraction / a;
  if (x < (a + 1) / (a + b + 2)) {
    return result;
  }
  return 1 - regularizedIncompleteBeta(1 - x, b, a);
}

function studentTCdf(t, df) {
  const x = df / (df + t * t);
  const ib = regularizedIncompleteBeta(x, df / 2, 0.5);
  return t >= 0 ? 1 - 0.5 * ib : 0.5 * ib;
}

function studentTInv(p, df) {
  if (p <= 0 || p >= 1) throw new Error('p ต้องอยู่ในช่วง (0,1)');
  let t = inverseNormal(p);
  for (let i = 0; i < 20; i++) {
    const f = studentTCdf(t, df) - p;
    const pdf = Math.exp(logGamma((df + 1) / 2) - logGamma(df / 2)) / Math.sqrt(df * Math.PI) * Math.pow(1 + (t * t) / df, -(df + 1) / 2);
    t -= f / pdf;
    if (Math.abs(f) < 1e-10) break;
  }
  return t;
}

function noncentralTCdf(x, df, delta) {
  if (!Number.isFinite(x)) return x > 0 ? 1 : 0;
  if (df > 250 && Math.abs(delta) < 20) {
    // สำหรับ df ใหญ่ ใช้ normal approximation
    return cumulativeNormal(x - delta);
  }
  const sqrtDf = Math.sqrt(df);
  const logConst = Math.log(2) - (df / 2) * Math.log(2) - logGamma(df / 2);
  const uUpper = df + 16 * Math.sqrt(df + delta * delta + x * x) + Math.abs(delta) * Math.abs(x) + 25;
  const upper = Math.max(Math.sqrt(Math.max(uUpper, 4)), 6);
  let n = Math.max(400, Math.min(4096, Math.ceil(upper / 0.02)));
  if (n % 2 === 1) n += 1;
  const h = upper / n;

  function integrand(t) {
    if (t === 0) {
      if (df === 1) {
        const inner = Math.max(cumulativeNormal(-delta), 0);
        return Math.exp(logConst) * inner;
      }
      if (df < 1) return 0;
      return 0;
    }
    const inner = cumulativeNormal((x * t) / sqrtDf - delta);
    if (inner <= 0) return 0;
    const logTerm = logConst + Math.log(inner) + (df - 1) * Math.log(t) - 0.5 * t * t;
    return Math.exp(logTerm);
  }

  let sum = integrand(0) + integrand(upper);
  let odd = 0;
  let even = 0;
  for (let i = 1; i < n; i++) {
    const t = i * h;
    const fx = integrand(t);
    if (i % 2 === 0) {
      even += fx;
    } else {
      odd += fx;
    }
  }
  const integral = (h / 3) * (sum + 4 * odd + 2 * even);
  return Math.min(1, Math.max(0, integral));
}

function computePower({ df, delta, alpha, tails }) {
  const mode = tails ?? 'two-sided';
  let crit;
  let rightTail = 0;
  let leftTail = 0;
  let approx = false;
  if (df > 250 && Math.abs(delta) < 20) {
    approx = true;
  }
  if (mode === 'two-sided') {
    crit = Math.abs(studentTInv(1 - alpha / 2, df));
    const upper = noncentralTCdf(crit, df, delta);
    const lower = noncentralTCdf(-crit, df, delta);
    rightTail = Math.max(0, 1 - upper);
    leftTail = Math.max(0, lower);
  } else if (mode === 'greater') {
    crit = studentTInv(1 - alpha, df);
    rightTail = Math.max(0, 1 - noncentralTCdf(crit, df, delta));
    leftTail = 0;
  } else {
    crit = studentTInv(1 - alpha, df);
    leftTail = Math.max(0, noncentralTCdf(-crit, df, delta));
    rightTail = 0;
  }
  return {
    crit,
    df,
    delta,
    leftTail,
    rightTail,
    power: Math.min(1, leftTail + rightTail),
    approx
  };
}

self.addEventListener('message', (event) => {
  const { fn, params, id } = event.data;
  const memoKey = key(fn, params);
  if (cache.has(memoKey)) {
    self.postMessage({ id, ...cache.get(memoKey) });
    return;
  }
  let result;
  try {
    switch (fn) {
      case 'nct-cdf':
        result = { cdf: noncentralTCdf(params.x, params.df, params.delta) };
        break;
      case 'nct-power':
        result = computePower(params);
        break;
      case 'student-t-inv':
        result = { value: studentTInv(params.p, params.df) };
        break;
      default:
        result = { error: 'unsupported' };
    }
  } catch (error) {
    result = { error: error.message };
  }
  cache.set(memoKey, result);
  self.postMessage({ id, ...result });
});
