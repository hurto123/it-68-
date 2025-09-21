
const CANVAS_ID = 'plot';

function getCtx() {
  const canvas = document.getElementById(CANVAS_ID);
  return canvas.getContext('2d');
}
function clearCanvas() {
  const ctx = getCtx();
  const c = ctx.canvas;
  ctx.clearRect(0,0,c.width,c.height);
  ctx.fillStyle = '#0a0e14'; ctx.fillRect(0,0,c.width,c.height);
  // axes
  ctx.strokeStyle = '#2a3345';
  ctx.beginPath();
  ctx.moveTo(0, c.height/2); ctx.lineTo(c.width, c.height/2);
  ctx.moveTo(c.width/2, 0); ctx.lineTo(c.width/2, c.height);
  ctx.stroke();
}

function parseInput() {
  const fstr = document.getElementById('fx').value;
  const xmin = parseFloat(document.getElementById('xmin').value);
  const xmax = parseFloat(document.getElementById('xmax').value);
  const a = parseFloat(document.getElementById('aPoint').value);
  const n = parseInt(document.getElementById('nRect').value);
  return { f: new Function('x', `return ${fstr};`), xmin, xmax, a, n, fstr };
}

function toCanvas(x, y, sx, sy, c) {
  const cx = (x - 0)*sx + c.width/2;
  const cy = c.height/2 - y*sy;
  return [cx, cy];
}

function plotFunction() {
  const ctx = getCtx();
  clearCanvas();
  const c = ctx.canvas;
  const { f, xmin, xmax } = parseInput();
  const sx = c.width / (xmax - xmin);
  const sy = c.height / (xmax - xmin); // keep scale roughly square based on x-range
  ctx.strokeStyle = '#7bdfff'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let px = 0; px <= c.width; px++) {
    const x = xmin + (px/c.width)*(xmax - xmin);
    let y = NaN;
    try { y = f(x); } catch {}
    const [cx, cy] = toCanvas(x, y, sx, sy, c);
    if (!isFinite(y)) continue;
    if (px === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.stroke();
}

function derivativeAt(f, x, h=1e-4) {
  return (f(x+h)-f(x-h))/(2*h);
}

function showTangent() {
  const ctx = getCtx();
  const c = ctx.canvas;
  const { f, xmin, xmax, a } = parseInput();
  const sx = c.width / (xmax - xmin);
  const sy = c.height / (xmax - xmin);
  // draw function if missing
  plotFunction();
  const fa = f(a);
  const m = derivativeAt(f, a);
  // y = m(x-a)+fa
  ctx.strokeStyle = '#ffd25f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let px = 0; px <= c.width; px++) {
    const x = xmin + (px/c.width)*(xmax - xmin);
    const y = m*(x - a) + fa;
    const [cx, cy] = toCanvas(x, y, sx, sy, c);
    if (px === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.stroke();
  // point marker
  ctx.fillStyle = '#ffd25f';
  const [cx, cy] = toCanvas(a, fa, sx, sy, c);
  ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 2*Math.PI); ctx.fill();
}

function showRiemann() {
  const ctx = getCtx();
  const c = ctx.canvas;
  const { f, xmin, xmax, n } = parseInput();
  clearCanvas();
  plotFunction();
  const sx = c.width / (xmax - xmin);
  const sy = c.height / (xmax - xmin);
  const dx = (xmax - xmin)/n;
  ctx.fillStyle = 'rgba(123,223,255,0.15)';
  ctx.strokeStyle = '#2a3345';
  for (let i=0; i<n; i++) {
    const xL = xmin + i*dx;
    let y = 0;
    try { y = f(xL); } catch {}
    const [cx, cy0] = toCanvas(xL, 0, sx, sy, c);
    const [cx2, cy] = toCanvas(xL+dx, y, sx, sy, c);
    const rectW = Math.abs(cx2 - cx);
    const rectH = Math.abs(cy - c.height/2);
    const topY = Math.min(cy, c.height/2);
    ctx.fillRect(cx, topY, rectW, rectH);
    ctx.strokeRect(cx, topY, rectW, rectH);
  }
}
