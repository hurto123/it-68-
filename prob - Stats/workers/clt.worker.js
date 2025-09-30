self.addEventListener('message', (event) => {
  const { samples = 1000, n = 30, mean = 0, sd = 1 } = event.data;
  const results = [];
  for (let i = 0; i < samples; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      const value = mean + sd * gaussian();
      sum += value;
    }
    results.push(sum / n);
  }
  self.postMessage({ means: results });
});

function gaussian() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
