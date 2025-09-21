
// assets/js/app.js — Pure front-end (no PHP). Updated: 2025-09-21
window.CALC = {
  submitAnswer: async function({ user, problem_id, answer, is_correct, score }) {
    const key = 'calc_submissions';
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.push({ ts: new Date().toISOString(), user, problem_id, answer, is_correct, score });
    localStorage.setItem(key, JSON.stringify(arr));
    return { ok: true };
  },
  listLocal: function() {
    const key = 'calc_submissions';
    return JSON.parse(localStorage.getItem(key) || '[]');
  },
  exportLocal: function() {
    const rows = [['ts','user','problem_id','answer','is_correct','score']];
    for (const r of CALC.listLocal()) {
      rows.push([r.ts, r.user, r.problem_id, JSON.stringify(r.answer), r.is_correct ? 1 : 0, r.score ?? '']);
    }
    const csv = rows.map(a => a.map(x => '"'+String(x).replaceAll('"','""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'submissions_local.csv'; a.click();
    URL.revokeObjectURL(url);
  },
  resetLocal: function(){
    localStorage.removeItem('calc_submissions');
    alert('ล้างข้อมูลคำตอบในเครื่องเรียบร้อย');
  }
};
