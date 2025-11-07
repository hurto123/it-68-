export function mean(values){
  if(!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function variance(values){
  if(values.length < 2) return 0;
  const avg = mean(values);
  const sq = values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0);
  return sq / (values.length - 1);
}
