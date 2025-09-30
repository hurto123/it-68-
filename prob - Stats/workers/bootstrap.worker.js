self.addEventListener('message', (event) => {
  const {
    data = [],
    iterations = 1000,
    statistic = 'mean',
    alpha = 0.05,
    includeDistribution = true
  } = event.data || {};

  if (!Array.isArray(data) || data.length === 0) {
    self.postMessage({ error: 'ต้องมีข้อมูลอย่างน้อย 1 ค่า' });
    return;
  }

  const stats = new Float64Array(Math.max(1, iterations));
  const point = computeStatistic(data, statistic);

  for (let i = 0; i < stats.length; i++) {
    const sample = new Array(data.length);
    for (let j = 0; j < data.length; j++) {
      const idx = Math.floor(Math.random() * data.length);
      sample[j] = data[idx];
    }
    stats[i] = computeStatistic(sample, statistic);
  }

  const sorted = Array.from(stats).sort((a, b) => a - b);
  const quantile = (p) => {
    if (sorted.length === 1) return sorted[0];
    const index = Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))));
    return sorted[index];
  };

  const lower = quantile(alpha / 2);
  const upper = quantile(1 - alpha / 2);
  const meanStat = stats.reduce((acc, value) => acc + value, 0) / stats.length;
  const variance = stats.reduce((acc, value) => acc + (value - meanStat) ** 2, 0) / Math.max(1, stats.length - 1);
  const se = Math.sqrt(Math.max(variance, 0));
  const bias = meanStat - point;
  const basicLower = 2 * point - upper;
  const basicUpper = 2 * point - lower;

  const payload = {
    point,
    percentile: [lower, upper],
    basic: [basicLower, basicUpper],
    bias,
    se
  };

  if (includeDistribution) {
    payload.distribution = Array.from(stats);
  }

  self.postMessage(payload);
});

function computeStatistic(values, statistic) {
  if (statistic === 'median') {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }
  return values.reduce((a, b) => a + b, 0) / values.length;
}
