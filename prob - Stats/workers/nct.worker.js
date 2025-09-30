const cache = new Map();
self.cache = cache;
let requestCounter = 0;

function memoKey(fn, params) {
  return `${fn}:${JSON.stringify(params, Object.keys(params).sort())}`;
}

function withCache(fn, params, compute) {
  const key = memoKey(fn, params);
  if (cache.has(key)) {
    return cache.get(key);
  }
  const result = compute();
  cache.set(key, result);
  return result;
}

function normalizeTail(tail) {
  const value = typeof tail === 'string' ? tail.trim().toLowerCase() : '';
  if (value === 'two' || value === 'both' || value === 'two-sided' || value === 'two_sided') {
    return 'two-sided';
  }
  if (value === 'left' || value === 'less' || value === 'lower') {
    return 'left';
  }
  if (value === 'right' || value === 'greater' || value === 'upper') {
    return 'right';
  }
  return 'two-sided';
}

const LOG_SQRT_TWO_PI = 0.5 * Math.log(2 * Math.PI);

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

function logGamma(z) {
  const g = 7;
  const p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  let x = p[0];
  z -= 1;
  for (let i = 1; i < p.length; i += 1) {
    x += p[i] / (z + i);
  }
  const t = z + g + 0.5;
  return LOG_SQRT_TWO_PI + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function betacf(a, b, x) {
  const MAX_ITER = 200;
  const EPS = 3e-14;
  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < EPS) d = EPS;
  d = 1 / d;
  let h = d;
  for (let m = 1, m2 = 2; m <= MAX_ITER; m += 1, m2 += 2) {
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < EPS) d = EPS;
    c = 1 + aa / c;
    if (Math.abs(c) < EPS) c = EPS;
    d = 1 / d;
    h *= d * c;
    aa = -((a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < EPS) d = EPS;
    c = 1 + aa / c;
    if (Math.abs(c) < EPS) c = EPS;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

function regularizedIncompleteBeta(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const logBeta = logGamma(a + b) - logGamma(a) - logGamma(b);
  const lnFront = a * Math.log(x) + b * Math.log(1 - x) + logBeta;
  if (x < (a + 1) / (a + b + 2)) {
    return Math.exp(lnFront) * betacf(a, b, x) / a;
  }
  return 1 - Math.exp(lnFront) * betacf(b, a, 1 - x) / b;
}

function studentTCdf(t, df) {
  if (!Number.isFinite(t)) {
    return t > 0 ? 1 : 0;
  }
  if (!Number.isFinite(df)) {
    throw new Error('df ต้องเป็นตัวเลข');
  }
  if (df <= 0) {
    throw new Error('df ต้องมากกว่า 0');
  }
  if (df > 1e7) {
    return cumulativeNormal(t);
  }
  const x = df / (df + t * t);
  const ib = regularizedIncompleteBeta(x, df / 2, 0.5);
  return t >= 0 ? 1 - 0.5 * ib : 0.5 * ib;
}

function studentTPdf(t, df) {
  const logPdf = logGamma((df + 1) / 2) - logGamma(df / 2) - 0.5 * (Math.log(df) + Math.log(Math.PI))
    - ((df + 1) / 2) * Math.log(1 + ((t * t) / df));
  return Math.exp(logPdf);
}

function studentTInv(p, df) {
  if (!(p > 0 && p < 1)) {
    throw new Error('p ต้องอยู่ในช่วง (0,1)');
  }
  if (!Number.isFinite(df)) {
    throw new Error('df ต้องเป็นตัวเลข');
  }
  if (df <= 0) {
    throw new Error('df ต้องมากกว่า 0');
  }
  if (p === 0.5) return 0;
  const EPS = 1e-12;
  let t;
  if (df > 1e6) {
    t = inverseNormal(p);
  } else {
    t = inverseNormal(p);
    const g1 = (Math.pow(t, 3) + t) / (4 * df);
    const g2 = (5 * Math.pow(t, 5) + 16 * Math.pow(t, 3) + 3 * t) / (96 * df * df);
    t += g1 + g2;
  }
  for (let i = 0; i < 20; i += 1) {
    const err = studentTCdf(t, df) - p;
    const pdf = studentTPdf(t, df);
    if (pdf === 0) break;
    const step = err / pdf;
    t -= step;
    if (Math.abs(step) < EPS) break;
  }
  return t;
}

function noncentralTCdf(x, df, delta) {
  if (!Number.isFinite(x)) {
    return x > 0 ? 1 : 0;
  }
  if (!Number.isFinite(df)) {
    throw new Error('df ต้องเป็นตัวเลข');
  }
  if (df <= 0) {
    throw new Error('df ต้องมากกว่า 0');
  }
  if (!Number.isFinite(delta)) {
    throw new Error('delta ไม่ถูกต้อง');
  }
  if (x < 0) {
    return 1 - noncentralTCdf(-x, df, -delta);
  }
  if (df > 120 && Math.abs(delta) < 60) {
    return cumulativeNormal(x - delta);
  }
  const logConst = Math.log(2) - (df / 2) * Math.log(2) - logGamma(df / 2);
  const spread = Math.sqrt(df + delta * delta + x * x);
  const upper = Math.max(6, Math.sqrt(df) + 12 * Math.sqrt(Math.max(1, spread)) + Math.abs(delta) + Math.abs(x));
  let steps = Math.min(4096, Math.max(512, Math.ceil(upper / 0.01)));
  if (steps % 2 === 1) steps += 1;
  const h = upper / steps;

  const integrand = (t) => {
    if (t <= 0) {
      if (df === 1) {
        const inner = cumulativeNormal(-delta);
        return Math.exp(logConst) * inner;
      }
      return 0;
    }
    const inner = cumulativeNormal((x * t) / Math.sqrt(df) - delta);
    if (inner <= 0) {
      return 0;
    }
    const logTerm = logConst + (df - 1) * Math.log(t) - 0.5 * t * t + Math.log(inner);
    return Math.exp(logTerm);
  };

  let sum = integrand(0) + integrand(upper);
  let odd = 0;
  let even = 0;
  for (let i = 1; i < steps; i += 1) {
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

function computeCritical(alpha, df, tail = 'two-sided') {
  if (!(alpha > 0 && alpha < 1)) {
    throw new Error('alpha ต้องอยู่ในช่วง (0,1)');
  }
  if (!Number.isFinite(df)) {
    throw new Error('df ต้องเป็นตัวเลข');
  }
  if (df <= 0) {
    throw new Error('df ต้องมากกว่า 0');
  }
  const mode = normalizeTail(tail);
  if (mode === 'two-sided') {
    const value = Math.abs(studentTInv(1 - alpha / 2, df));
    return { lower: -value, upper: value, crit: value, mode };
  }
  if (mode === 'left') {
    const value = studentTInv(alpha, df);
    return { lower: value, upper: null, crit: Math.abs(value), mode };
  }
  const value = studentTInv(1 - alpha, df);
  return { lower: null, upper: value, crit: Math.abs(value), mode };
}

function computePower(params) {
  const { alpha = 0.05, df, delta = 0 } = params;
  const mode = normalizeTail(params.test || params.tail || params.tails);
  const critical = computeCritical(alpha, df, mode);
  let leftTail = 0;
  let rightTail = 0;
  if (mode === 'two-sided') {
    const upper = noncentralTCdf(critical.upper, df, delta);
    const lower = noncentralTCdf(critical.lower, df, delta);
    rightTail = Math.max(0, 1 - upper);
    leftTail = Math.max(0, lower);
  } else if (mode === 'left') {
    leftTail = Math.max(0, noncentralTCdf(critical.lower, df, delta));
  } else {
    rightTail = Math.max(0, 1 - noncentralTCdf(critical.upper, df, delta));
  }
  return {
    alpha,
    df,
    delta,
    tails: mode,
    test: mode,
    crit: critical.crit,
    critical,
    leftTail,
    rightTail,
    power: Math.min(1, leftTail + rightTail)
  };
}

self.addEventListener('message', (event) => {
  const { fn, params = {}, id } = event.data || {};
  const requestId = id != null ? id : `req-${++requestCounter}`;
  try {
    let payload;
    const alias = typeof fn === 'string' ? fn : '';
    const operation = {
      'nct-power': 'power',
      'nct-cdf': 'cdf',
      'nct-crit': 'crit',
      'student-t-inv': 'central-inv',
      'student-t-cdf': 'central-cdf'
    }[alias] || alias;
    switch (operation) {
      case 'cdf':
        {
          const df = params.nu ?? params.df;
          const delta = Number.isFinite(params.delta) ? params.delta : 0;
          payload = withCache(operation, { x: params.x, df, delta }, () => ({
            cdf: noncentralTCdf(params.x, df, delta)
          }));
        }
        break;
      case 'crit':
        {
          const df = params.nu ?? params.df;
          const tailParam = params.tail ?? params.tails ?? params.test;
          const normalizedTail = normalizeTail(tailParam);
          payload = withCache(operation, {
            alpha: params.alpha,
            df,
            tail: normalizedTail
          }, () => {
            const result = computeCritical(params.alpha, df, tailParam);
            return { critical: result, crit: result.crit };
          });
        }
        break;
      case 'power':
        {
          const df = params.nu ?? params.df;
          const tailParam = params.test || params.tail || params.tails;
          const normalizedTail = normalizeTail(tailParam);
          payload = withCache(operation, {
            alpha: params.alpha,
            df,
            delta: params.delta,
            tail: normalizedTail
          }, () => computePower({
            alpha: params.alpha,
            df,
            delta: params.delta,
            test: tailParam
          }));
        }
        break;
      case 'central-cdf':
        {
          const df = params.nu ?? params.df;
          payload = withCache(operation, { x: params.x, df }, () => ({
            cdf: studentTCdf(params.x, df)
          }));
        }
        break;
      case 'central-inv':
        {
          const df = params.nu ?? params.df;
          payload = withCache(operation, { p: params.p, df }, () => ({
            value: studentTInv(params.p, df)
          }));
        }
        break;
      default:
        throw new Error('ไม่รู้จักคำสั่ง worker');
    }
    self.postMessage({ id: requestId, ...payload });
  } catch (error) {
    self.postMessage({ id: requestId, error: error.message });
  }
});
