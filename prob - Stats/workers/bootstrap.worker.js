self.addEventListener('message', (event) => {
  const { data = [], iterations = 1000 } = event.data;
  const stats = [];
  for (let i = 0; i < iterations; i++) {
    const sample = [];
    for (let j = 0; j < data.length; j++) {
      const idx = Math.floor(Math.random() * data.length);
      sample.push(data[idx]);
    }
    stats.push(mean(sample));
  }
  stats.sort((a, b) => a - b);
  const lower = stats[Math.floor(0.025 * iterations)];
  const upper = stats[Math.floor(0.975 * iterations)];
  self.postMessage({
    point: mean(data),
    percentile: [lower, upper]
  });
});

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
