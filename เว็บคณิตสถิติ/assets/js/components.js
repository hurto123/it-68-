/* assets/js/components.js */
window.initComponents = function initComponents() {
  // Tooltip สัญลักษณ์สถิติ (ตั้ง title อัตโนมัติจาก data-symbol)
  const map = {
    'mu': 'μ – ค่าเฉลี่ยประชากร',
    'sigma': 'σ – ส่วนเบี่ยงเบนมาตรฐานประชากร',
    'phat': 'p̂ – สัดส่วนตัวอย่าง',
    'xbar': 'x̄ – ค่าเฉลี่ยตัวอย่าง'
  };
  document.querySelectorAll('[data-symbol]').forEach(el => {
    const key = (el.getAttribute('data-symbol') || '').toLowerCase();
    if (!el.getAttribute('title') && map[key]) el.setAttribute('title', map[key]);
  });

  // ปุ่มคัดลอกลิงก์
  document.querySelectorAll('[data-copy-link]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        const old = btn.textContent;
        btn.textContent = 'คัดลอกลิงก์แล้ว ✓';
        setTimeout(() => (btn.textContent = old), 1600);
      } catch { alert('คัดลอกไม่สำเร็จ'); }
    }, { once: true });
  });

  // Hook สำหรับกราฟ/ตาราง (เติมได้ตามต้องการ)
  // document.querySelectorAll('[data-chart]').forEach(el => { ... });
};

window.teardownComponents = function teardownComponents() {
  // ถ้ามี instance ที่ต้อง destroy ให้จัดการในนี้
  // เช่น chart.destroy(), observer.disconnect(), ฯลฯ
};
