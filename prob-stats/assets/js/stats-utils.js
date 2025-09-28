export function mean(values) {
  if (!Array.isArray(values) || values.length === 0) return NaN;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function variance(values, sample = true) {
  if (!Array.isArray(values) || values.length < 2) return NaN;
  const avg = mean(values);
  const sumSq = values.reduce((acc, value) => acc + (value - avg) ** 2, 0);
  return sumSq / (values.length - (sample ? 1 : 0));
}

export function stdDev(values, sample = true) {
  const v = variance(values, sample);
  return Number.isNaN(v) ? NaN : Math.sqrt(v);
}

export function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i += 1) {
    result *= i;
  }
  return result;
}

export function combination(n, k) {
  if (k < 0 || k > n) return 0;
  return factorial(n) / (factorial(k) * factorial(n - k));
}

export function poissonPmf(lambda, k) {
  if (lambda <= 0) return 0;
  return (lambda ** k * Math.exp(-lambda)) / factorial(k);
}

export function normalCdf(z) {
  // Numerical approximation (Abramowitz & Stegun)
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-0.5 * z * z);
  let probability =
    d *
    t *
    (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) probability = 1 - probability;
  return probability;
}

export function zScore(x, meanValue, std) {
  return (x - meanValue) / std;
}

export function summarize(values) {
  return {
    mean: mean(values),
    std: stdDev(values),
    min: Math.min(...values),
    max: Math.max(...values)
  };
}
