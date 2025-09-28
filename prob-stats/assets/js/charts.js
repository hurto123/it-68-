export function histogramFromArray(values, binCount = 10) {
  if (!Array.isArray(values) || values.length === 0) {
    return { bins: [], counts: [] };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / binCount || 1;
  const bins = Array.from({ length: binCount }, (_, i) => min + i * step);
  const counts = new Array(binCount).fill(0);
  values.forEach((value) => {
    const index = Math.min(
      binCount - 1,
      Math.floor((value - min) / step)
    );
    counts[index] += 1;
  });
  return { bins, counts };
}

export function empiricalCdf(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.map((value, index) => ({
    value,
    probability: (index + 1) / sorted.length
  }));
}
