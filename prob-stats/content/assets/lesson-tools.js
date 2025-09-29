(function () {
  const LessonTools = {};

  LessonTools.formatNumber = function (value, digits = 2) {
    if (!Number.isFinite(value)) return '–';
    const abs = Math.abs(value);
    if (abs >= 100000) return value.toLocaleString('en-US', { maximumFractionDigits: digits });
    if (abs >= 1) return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    return value.toLocaleString('en-US', { minimumFractionDigits: digits + 1, maximumFractionDigits: digits + 1 });
  };

  LessonTools.formatPercent = function (value, digits = 1) {
    if (!Number.isFinite(value)) return '–';
    return (value * 100).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + '%';
  };

  LessonTools.clamp = function (value, min, max) {
    return Math.min(Math.max(value, min), max);
  };

  LessonTools.normPdf = function (x, mean = 0, sd = 1) {
    if (!(sd > 0)) return 0;
    const z = (x - mean) / sd;
    return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
  };

  LessonTools.normCdf = function (x, mean = 0, sd = 1) {
    if (!(sd > 0)) return 0;
    const z = (x - mean) / (sd * Math.sqrt(2));
    return 0.5 * (1 + erf(z));
  };

  function erf(x) {
    // Abramowitz & Stegun 7.1.26 approximation
    const sign = Math.sign(x);
    const abs = Math.abs(x);
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const t = 1 / (1 + p * abs);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-abs * abs);
    return sign * y;
  }

  LessonTools.normInv = function (p) {
    if (p <= 0 || p >= 1 || Number.isNaN(p)) return NaN;
    const a = [
      -3.969683028665376e+01,
      2.209460984245205e+02,
      -2.759285104469687e+02,
      1.383577518672690e+02,
      -3.066479806614716e+01,
      2.506628277459239e+00
    ];
    const b = [
      -5.447609879822406e+01,
      1.615858368580409e+02,
      -1.556989798598866e+02,
      6.680131188771972e+01,
      -1.328068155288572e+01
    ];
    const c = [
      -7.784894002430293e-03,
      -3.223964580411365e-01,
      -2.400758277161838e+00,
      -2.549732539343734e+00,
      4.374664141464968e+00,
      2.938163982698783e+00
    ];
    const d = [
      7.784695709041462e-03,
      3.224671290700398e-01,
      2.445134137142996e+00,
      3.754408661907416e+00
    ];
    const plow = 0.02425;
    const phigh = 1 - plow;
    let q, r;
    if (p < plow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    if (p > phigh) {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  };

  LessonTools.tInv = function (p, df) {
    if (!(df > 0) || p <= 0 || p >= 1) return NaN;
    const z = LessonTools.normInv(p);
    const g1 = (Math.pow(z, 3) + z) / (4 * df);
    const g2 = (5 * Math.pow(z, 5) + 16 * Math.pow(z, 3) + 3 * z) / (96 * df * df);
    const g3 = (3 * Math.pow(z, 7) + 19 * Math.pow(z, 5) + 17 * Math.pow(z, 3) - 15 * z) / (384 * Math.pow(df, 3));
    return z + g1 + g2 + g3;
  };

  LessonTools.chiSquareInv = function (p, df) {
    if (!(df > 0) || p <= 0 || p >= 1) return NaN;
    const z = LessonTools.normInv(p);
    const a = 2 / (9 * df);
    const term = 1 - a + z * Math.sqrt(a);
    return df * Math.pow(term, 3);
  };

  const lanczosCoefficients = [
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];

  function logGamma(z) {
    if (z < 0.5) {
      return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
    }
    z -= 1;
    let x = 0.99999999999980993;
    for (let i = 0; i < lanczosCoefficients.length; i++) {
      x += lanczosCoefficients[i] / (z + i + 1);
    }
    const t = z + lanczosCoefficients.length - 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }

  LessonTools.chiSquarePdf = function (x, df) {
    if (x <= 0 || !(df > 0)) return 0;
    const k = df / 2;
    const logPdf = (k - 1) * Math.log(x) - x / 2 - k * Math.log(2) - logGamma(k);
    return Math.exp(logPdf);
  };

  function setupCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    return ctx;
  }

  LessonTools.drawNormal = function (canvas, mean, sd, lower, upper) {
    const ctx = setupCanvas(canvas);
    if (!ctx || !(sd > 0)) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const minX = mean - 4 * sd;
    const maxX = mean + 4 * sd;
    const samples = 220;
    let maxPdf = 0;
    for (let i = 0; i <= samples; i++) {
      const x = minX + (i / samples) * (maxX - minX);
      maxPdf = Math.max(maxPdf, LessonTools.normPdf(x, mean, sd));
    }
    const baseline = height * 0.88;
    const scaleX = width / (maxX - minX);
    const scaleY = (height * 0.78) / maxPdf;

    ctx.strokeStyle = 'rgba(120, 193, 255, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, baseline);
    ctx.lineTo(width, baseline);
    ctx.stroke();

    if (Number.isFinite(lower) && Number.isFinite(upper) && upper > lower) {
      ctx.beginPath();
      const clippedLower = Math.max(lower, minX);
      const clippedUpper = Math.min(upper, maxX);
      ctx.moveTo((clippedLower - minX) * scaleX, baseline);
      const shadingSteps = Math.max(4, Math.floor(samples * (clippedUpper - clippedLower) / (maxX - minX)));
      for (let i = 0; i <= shadingSteps; i++) {
        const x = clippedLower + (i / shadingSteps) * (clippedUpper - clippedLower);
        const pdf = LessonTools.normPdf(x, mean, sd);
        const px = (x - minX) * scaleX;
        const py = baseline - pdf * scaleY;
        ctx.lineTo(px, py);
      }
      ctx.lineTo((clippedUpper - minX) * scaleX, baseline);
      ctx.closePath();
      ctx.fillStyle = 'rgba(120, 193, 255, 0.28)';
      ctx.fill();
    }

    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const x = minX + (i / samples) * (maxX - minX);
      const pdf = LessonTools.normPdf(x, mean, sd);
      const px = (x - minX) * scaleX;
      const py = baseline - pdf * scaleY;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(120, 193, 255, 0.9)';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    const meanX = (mean - minX) * scaleX;
    ctx.moveTo(meanX, baseline);
    ctx.lineTo(meanX, baseline - LessonTools.normPdf(mean, mean, sd) * scaleY - 6);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  LessonTools.drawTwoNormals = function (canvas, curves) {
    const ctx = setupCanvas(canvas);
    if (!ctx || !Array.isArray(curves) || curves.length === 0) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    let minX = Infinity;
    let maxX = -Infinity;
    curves.forEach(curve => {
      if (!(curve.sd > 0)) return;
      minX = Math.min(minX, curve.mean - 4 * curve.sd);
      maxX = Math.max(maxX, curve.mean + 4 * curve.sd);
    });
    if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return;
    const samples = 240;
    let maxPdf = 0;
    curves.forEach(curve => {
      if (!(curve.sd > 0)) return;
      for (let i = 0; i <= samples; i++) {
        const x = minX + (i / samples) * (maxX - minX);
        maxPdf = Math.max(maxPdf, LessonTools.normPdf(x, curve.mean, curve.sd));
      }
    });
    const baseline = height * 0.9;
    const scaleX = width / (maxX - minX);
    const scaleY = (height * 0.78) / maxPdf;

    ctx.strokeStyle = 'rgba(120, 193, 255, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, baseline);
    ctx.lineTo(width, baseline);
    ctx.stroke();

    curves.forEach(curve => {
      if (!(curve.sd > 0)) return;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const x = minX + (i / samples) * (maxX - minX);
        const pdf = LessonTools.normPdf(x, curve.mean, curve.sd);
        const px = (x - minX) * scaleX;
        const py = baseline - pdf * scaleY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = curve.color || 'rgba(120, 193, 255, 0.9)';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      if (curve.shade) {
        ctx.beginPath();
        const [lower, upper] = curve.shade;
        const clippedLower = Math.max(lower, minX);
        const clippedUpper = Math.min(upper, maxX);
        ctx.moveTo((clippedLower - minX) * scaleX, baseline);
        const shadingSteps = Math.max(4, Math.floor(samples * (clippedUpper - clippedLower) / (maxX - minX)));
        for (let i = 0; i <= shadingSteps; i++) {
          const x = clippedLower + (i / shadingSteps) * (clippedUpper - clippedLower);
          const pdf = LessonTools.normPdf(x, curve.mean, curve.sd);
          const px = (x - minX) * scaleX;
          const py = baseline - pdf * scaleY;
          ctx.lineTo(px, py);
        }
        ctx.lineTo((clippedUpper - minX) * scaleX, baseline);
        ctx.closePath();
        ctx.fillStyle = curve.fill || 'rgba(120, 193, 255, 0.18)';
        ctx.fill();
      }
    });
  };

  LessonTools.drawBars = function (canvas, bars, options = {}) {
    const ctx = setupCanvas(canvas);
    if (!ctx || !Array.isArray(bars) || bars.length === 0) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const paddingX = width * 0.1;
    const paddingY = height * 0.18;
    const availableWidth = width - paddingX * 2;
    const barWidth = availableWidth / (bars.length * 1.5);
    const maxValue = Math.max(...bars.map(bar => Math.max(0, bar.value)));
    const scaleY = (height - paddingY * 2) / (maxValue === 0 ? 1 : maxValue);

    ctx.strokeStyle = 'rgba(120, 193, 255, 0.16)';
    ctx.beginPath();
    ctx.moveTo(paddingX, height - paddingY);
    ctx.lineTo(width - paddingX * 0.2, height - paddingY);
    ctx.stroke();

    bars.forEach((bar, index) => {
      const x = paddingX + index * barWidth * 1.5;
      const barHeight = bar.value * scaleY;
      ctx.fillStyle = bar.color || 'rgba(120, 193, 255, 0.5)';
      ctx.beginPath();
      ctx.roundRect(x, height - paddingY - barHeight, barWidth, barHeight, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bar.label, x + barWidth / 2, height - paddingY + 18);
    });
  };

  LessonTools.drawCurve = function (canvas, points, options = {}) {
    const ctx = setupCanvas(canvas);
    if (!ctx || !Array.isArray(points) || points.length === 0) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const paddingX = width * 0.08;
    const paddingY = height * 0.15;
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const scaleX = (width - paddingX * 2) / (maxX - minX || 1);
    const scaleY = (height - paddingY * 2) / (maxY - minY || 1);

    ctx.strokeStyle = 'rgba(120, 193, 255, 0.18)';
    ctx.beginPath();
    ctx.moveTo(paddingX, height - paddingY);
    ctx.lineTo(width - paddingX * 0.4, height - paddingY);
    ctx.stroke();

    ctx.beginPath();
    points.forEach((point, idx) => {
      const x = paddingX + (point[0] - minX) * scaleX;
      const y = height - paddingY - (point[1] - minY) * scaleY;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = options.color || 'rgba(120, 193, 255, 0.9)';
    ctx.lineWidth = 2.2;
    ctx.stroke();
  };

  LessonTools.drawChiSquare = function (canvas, df, lower, upper) {
    const ctx = setupCanvas(canvas);
    if (!ctx || !(df > 0)) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const maxX = df + 5 * Math.sqrt(2 * df);
    const minX = 0;
    const samples = 260;
    let maxPdf = 0;
    for (let i = 0; i <= samples; i++) {
      const x = minX + (i / samples) * (maxX - minX);
      maxPdf = Math.max(maxPdf, LessonTools.chiSquarePdf(x, df));
    }
    const baseline = height * 0.9;
    const scaleX = width / (maxX - minX);
    const scaleY = (height * 0.78) / (maxPdf || 1);

    ctx.strokeStyle = 'rgba(120, 193, 255, 0.16)';
    ctx.beginPath();
    ctx.moveTo(0, baseline);
    ctx.lineTo(width, baseline);
    ctx.stroke();

    if (Number.isFinite(lower) && Number.isFinite(upper) && upper > lower) {
      ctx.beginPath();
      const clippedLower = Math.max(lower, minX);
      const clippedUpper = Math.min(upper, maxX);
      ctx.moveTo((clippedLower - minX) * scaleX, baseline);
      const shadingSteps = Math.max(4, Math.floor(samples * (clippedUpper - clippedLower) / (maxX - minX)));
      for (let i = 0; i <= shadingSteps; i++) {
        const x = clippedLower + (i / shadingSteps) * (clippedUpper - clippedLower);
        const pdf = LessonTools.chiSquarePdf(x, df);
        const px = (x - minX) * scaleX;
        const py = baseline - pdf * scaleY;
        ctx.lineTo(px, py);
      }
      ctx.lineTo((clippedUpper - minX) * scaleX, baseline);
      ctx.closePath();
      ctx.fillStyle = 'rgba(120, 193, 255, 0.25)';
      ctx.fill();
    }

    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const x = minX + (i / samples) * (maxX - minX);
      const pdf = LessonTools.chiSquarePdf(x, df);
      const px = (x - minX) * scaleX;
      const py = baseline - pdf * scaleY;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(120, 193, 255, 0.9)';
    ctx.lineWidth = 2.2;
    ctx.stroke();
  };

  LessonTools.attachResizeRedraw = function (canvas, redraw) {
    const debounced = () => redraw();
    window.addEventListener('resize', debounced);
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(debounced);
      observer.observe(canvas);
      return () => {
        observer.disconnect();
        window.removeEventListener('resize', debounced);
      };
    }
    return () => window.removeEventListener('resize', debounced);
  };

  window.LessonTools = LessonTools;
})();
