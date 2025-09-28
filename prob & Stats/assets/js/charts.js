export function renderLineChart(ctx, { labels, datasets }){
  if(!ctx) return;
  const chartJs = window.Chart;
  if(!chartJs) return;
  return new chartJs(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}
