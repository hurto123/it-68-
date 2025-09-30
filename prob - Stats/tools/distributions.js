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

export function normCdf(z, mean = 0, sd = 1) {
  const standardized = (z - mean) / sd;
  return 0.5 * (1 + erf(standardized / Math.SQRT2));
}

export function normPdf(z, mean = 0, sd = 1) {
  const standardized = (z - mean) / sd;
  return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * standardized * standardized);
}

export function normInv(p) {
  if (p <= 0 || p >= 1) throw new Error('p ต้องอยู่ในช่วง (0,1)');
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
    return -normInv(1 - p);
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
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function gamma(z) {
  return Math.exp(logGamma(z));
}

function regularizedGammaP(s, x) {
  if (x < 0 || s <= 0) return NaN;
  if (x === 0) return 0;
  const eps = 1e-12;
  if (x < s + 1) {
    let sum = 1 / s;
    let term = sum;
    for (let n = 1; n < 1000; n++) {
      term *= x / (s + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * eps) break;
    }
    return sum * Math.exp(-x + s * Math.log(x) - logGamma(s));
  }
  let a0 = 1;
  let a1 = x;
  let b0 = 0;
  let b1 = 1;
  let fac = 1;
  let gOld = a1 / b1;
  for (let n = 1; n < 1000; n++) {
    const an = n - s;
    a0 = (a1 + a0 * an) * fac;
    b0 = (b1 + b0 * an) * fac;
    const anf = n * fac;
    a1 = x * a0 + anf * a1;
    b1 = x * b0 + anf * b1;
    if (a1 !== 0) {
      fac = 1 / a1;
      const g = b1 * fac;
      if (Math.abs((g - gOld) / g) < eps) {
        return 1 - Math.exp(-x + s * Math.log(x) - logGamma(s)) * g;
      }
      gOld = g;
    }
  }
  return 1;
}

function beta(a, b) {
  return Math.exp(logGamma(a) + logGamma(b) - logGamma(a + b));
}

function regularizedIncompleteBeta(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - Math.log(beta(a, b)));
  let sum = 1;
  let term = 1;
  for (let n = 1; n < 1000; n++) {
    term *= (a + n - 1) * x / (n * (1 - x));
    sum += term;
    if (Math.abs(term) < 1e-12) break;
  }
  const result = bt * sum / a;
  if (x < (a + 1) / (a + b + 2)) {
    return result;
  }
  return 1 - regularizedIncompleteBeta(1 - x, b, a);
}

function simpsonIntegral(fn, a, b, steps = 2048) {
  if (b <= a) return 0;
  let n = Math.max(2, steps);
  if (n % 2 === 1) n += 1;
  const h = (b - a) / n;
  let sum = fn(a) + fn(b);
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += fn(x) * (i % 2 === 0 ? 2 : 4);
  }
  return (h / 3) * sum;
}

export function studentTCdf(t, df) {
  if (!Number.isFinite(t)) {
    if (Number.isNaN(t)) return NaN;
    return t > 0 ? 1 : 0;
  }
  const nu = df;
  const coefficient = Math.exp(logGamma((nu + 1) / 2) - logGamma(nu / 2)) / Math.sqrt(nu * Math.PI);
  const pdf = (x) => coefficient * Math.pow(1 + (x * x) / nu, -(nu + 1) / 2);
  const upper = Math.abs(t);
  if (upper === 0) return 0.5;
  const steps = Math.min(8192, Math.max(200, Math.ceil(upper * 400)));
  const integral = simpsonIntegral(pdf, 0, upper, steps);
  const half = Math.min(1, 0.5 + integral);
  return t >= 0 ? half : 1 - half;
}

export function studentTInv(p, df) {
  if (p <= 0 || p >= 1) throw new Error('p ต้องอยู่ในช่วง (0,1)');
  let t = normInv(p);
  for (let i = 0; i < 12; i++) {
    const f = studentTCdf(t, df) - p;
    const pdf = Math.exp(logGamma((df + 1) / 2) - logGamma(df / 2)) / Math.sqrt(df * Math.PI) * Math.pow(1 + (t * t) / df, -(df + 1) / 2);
    t -= f / pdf;
    if (Math.abs(f) < 1e-8) break;
  }
  return t;
}

export function chiSquareCdf(x, k) {
  return regularizedGammaP(k / 2, x / 2);
}

export function chiSquareInv(p, k) {
  if (p <= 0 || p >= 1) throw new Error('p ต้องอยู่ในช่วง (0,1)');
  let x = k;
  for (let i = 0; i < 20; i++) {
    const f = chiSquareCdf(x, k) - p;
    const pdf = Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - logGamma(k / 2)) / Math.pow(2, k / 2);
    x -= f / pdf;
    if (x <= 0) x = p * k;
    if (Math.abs(f) < 1e-8) break;
  }
  return x;
}

export function fCdf(x, d1, d2) {
  if (x <= 0) return 0;
  const pdf = (value) => {
    if (value <= 0) return 0;
    const numerator = Math.pow(d1 * value, d1) * Math.pow(d2, d2);
    const denominator = Math.pow(d1 * value + d2, d1 + d2);
    return Math.sqrt(numerator / denominator) / (value * beta(d1 / 2, d2 / 2));
  };
  const steps = Math.min(8192, Math.max(400, Math.ceil(x * 200)));
  const integral = simpsonIntegral(pdf, 0, x, steps);
  return Math.min(1, Math.max(0, integral));
}

export function fInv(p, d1, d2) {
  if (p <= 0 || p >= 1) throw new Error('p ต้องอยู่ในช่วง (0,1)');
  let x = d2 / d1;
  for (let i = 0; i < 20; i++) {
    const fVal = fCdf(x, d1, d2) - p;
    const pdf = Math.sqrt(Math.pow(d1 * x, d1) * Math.pow(d2, d2) / Math.pow(d1 * x + d2, d1 + d2)) /
      (x * beta(d1 / 2, d2 / 2));
    x -= fVal / pdf;
    if (x <= 0) x = p * d2 / d1;
    if (Math.abs(fVal) < 1e-8) break;
  }
  return x;
}
