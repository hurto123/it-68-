// subjects.js
// โครงสร้างข้อมูลกลางสำหรับหน้า index.html (บทเรียน, สูตร, สรุป)

export const lessons = [
  {
    id: "lesson01",
    title: "บทที่ 1: ความรู้เบื้องต้นเกี่ยวกับสถิติ",
    desc: "ภาพรวม, กระบวนการ 5 ขั้นตอน, Descriptive vs Inferential",
    tags: "บท1 introduction สถิติ descriptive inferential",
    chip: "พื้นฐาน",
    link: "lesson01.html",
    summary: "summary-lesson01.html",
    meta: {
      version: "1.1.0",
      updated_at: "2025-09-23",
      depends_on: [
        "summary-lesson01.html",
        "data/lesson01.questions.th.json",
        "data/lesson01.solutions.th.json"
      ]
    }
  },
  {
    id: "lesson02",
    title: "บทที่ 2: การนำเสนอข้อมูล",
    desc: "ก้าน-ใบ, ฮิสโทแกรม, ตารางความถี่, อนุกรมเวลา",
    tags: "บท2 การนำเสนอข้อมูล ก้านใบ ฮิสโทแกรม อนุกรมเวลา",
    chip: "กราฟ",
    link: "lesson02.html",
    summary: "summary-lesson02.html"
  },
  {
    id: "lesson03",
    title: "บทที่ 3: สถิติเชิงพรรณนา",
    desc: "ศูนย์กลาง, ตำแหน่ง, การกระจาย & ความเบ้",
    tags: "บท3 descriptive mean median mode sd skew",
    chip: "สรุปค่า",
    link: "lesson03.html",
    summary: "summary-lesson03.html"
  },
  {
    id: "lesson04",
    title: "บทที่ 4: ความน่าจะเป็นเบื้องต้น",
    desc: "Experiment, Sample Space, กฎการนับ",
    tags: "บท4 ความน่าจะเป็น การนับ permutation combination",
    chip: "พื้นฐานความน่าจะเป็น",
    link: "lesson04.html",
    summary: "summary-lesson04.html"
  },
  {
    id: "lesson05",
    title: "บทที่ 5: ทฤษฎีความน่าจะเป็น",
    desc: "Conditional Probability, Total Probability, Bayes",
    tags: "บท5 เงื่อนไข conditional total probability bayes",
    chip: "Bayes",
    link: "lesson05.html",
    summary: "summary-lesson05.html"
  },
  {
    id: "lesson06",
    title: "บทที่ 6: ตัวแปรสุ่ม",
    desc: "Discrete/Continuous, PMF/PDF, E[X], Var(X)",
    tags: "บท6 ตัวแปรสุ่ม pmf pdf cdf expected variance",
    chip: "Random Variables",
    link: "lesson06.html",
    summary: "summary-lesson06.html"
  },
  {
    id: "lesson07",
    title: "บทที่ 7: การแจกแจงไม่ต่อเนื่อง",
    desc: "Bernoulli, Binomial, Poisson, Hypergeometric",
    tags: "บท7 การแจกแจงไม่ต่อเนื่อง bernoulli binomial poisson hypergeometric",
    chip: "Discrete",
    link: "lesson07.html",
    summary: "summary-lesson07.html"
  },
  {
    id: "lesson08",
    title: "บทที่ 8: แจกแจงต่อเนื่อง & โค้งปกติ",
    desc: "Normal, Z-score, Empirical Rule",
    tags: "บท8 แจกแจงต่อเนื่อง normal z-score empirical rule",
    chip: "Normal",
    link: "lesson08.html",
    summary: "summary-lesson08.html"
  },
  {
    id: "lesson09",
    title: "บทที่ 9: Sampling Distributions & CLT",
    desc: "x̄, p̂, Standard Error, Z ของตัวอย่าง",
    tags: "บท9 sampling distributions clt xbar phat se",
    chip: "CLT",
    link: "lesson09.html",
    summary: "summary-lesson09.html"
  }
];

export const formulas = [
  {
    id: "binomial",
    title: "Binomial Distribution",
    desc: "X ~ Bin(n, p), PMF, E/Var, ตัวอย่างคำนวณ",
    tags: "สูตร binomial การแจกแจงทวินาม",
    chip: "Discrete",
    link: "formula/binomial.html"
  },
  {
    id: "poisson",
    title: "Poisson Distribution",
    desc: "PMF, อัตราเกิด λ, การประมาณ Binomial",
    tags: "สูตร poisson นับเหตุการณ์ λ",
    chip: "Discrete",
    link: "formula/poisson.html"
  },
  {
    id: "zscore",
    title: "Z-Score",
    desc: "Z = (X−μ)/σ, ตาราง Φ(z), พื้นที่ใต้โค้ง",
    tags: "สูตร z-score มาตรฐาน normal",
    chip: "Normal",
    link: "formula/z-score.html"
  },
  {
    id: "clt",
    title: "CLT: x̄ & p̂",
    desc: "การกระจายของค่าเฉลี่ย/สัดส่วนตัวอย่าง",
    tags: "สูตร clt xbar phat standard error sampling",
    chip: "CLT",
    link: "formula/clt-xbar-phat.html"
  }
];

export const summaries = [
  {
    id: "all",
    title: "รวมสรุปทุกบท (1–9)",
    desc: "มีคั่นหน้า — เหมาะสำหรับพิมพ์/บันทึก PDF",
    tags: "สรุป รวม ทุกบท summary all",
    chip: "รวม",
    link: "summaries-all.html"
  },
  // สร้างสรุปรายบทจาก lessons อัตโนมัติ
  ...lessons.map(l => ({
    id: `${l.id}-summary`,
    title: `สรุป 1 หน้า — ${l.title}`,
    desc: l.desc,
    tags: `สรุป ${l.tags}`,
    chip: l.chip,
    link: l.summary
  }))
];

export const quizzes = [
  {
    id: "lesson01",
    title: "Quiz บทที่ 1 — ความรู้เบื้องต้น",
    desc: "โหมดฝึก + Quiz จับเวลา ข้อสอบตัวอย่าง 3+ ข้อ",
    tags: "quiz บท1 แบบฝึกหัด สถิติพื้นฐาน",
    chip: "พื้นฐาน",
    link: "quiz-lesson01.html",
    lesson: "lesson01.html",
    summary: "summary-lesson01.html",
    config: "data/quiz-lesson01.json"
  },
  {
    id: "lesson02",
    title: "Quiz บทที่ 2 — การนำเสนอข้อมูล",
    desc: "ฝึกอ่านกราฟ ตาราง และอนุกรมเวลา พร้อมจับเวลา",
    tags: "quiz บท2 การนำเสนอข้อมูล",
    chip: "กราฟ",
    link: "quiz-lesson02.html",
    lesson: "lesson02.html",
    summary: "summary-lesson02.html",
    config: "data/quiz-lesson02.json"
  },
  {
    id: "lesson03",
    title: "Quiz บทที่ 3 — สถิติเชิงพรรณนา",
    desc: "Mean/Median/Mode, SD, Skewness พร้อมเฉลยทีละขั้น",
    tags: "quiz บท3 descriptive",
    chip: "สรุปค่า",
    link: "quiz-lesson03.html",
    lesson: "lesson03.html",
    summary: "summary-lesson03.html",
    config: "data/quiz-lesson03.json"
  },
  {
    id: "lesson04",
    title: "Quiz บทที่ 4 — ความน่าจะเป็นเบื้องต้น",
    desc: "ทดลอง กฎการนับ พื้นฐานความน่าจะเป็น",
    tags: "quiz บท4 ความน่าจะเป็น",
    chip: "Probability",
    link: "quiz-lesson04.html",
    lesson: "lesson04.html",
    summary: "summary-lesson04.html",
    config: "data/quiz-lesson04.json"
  },
  {
    id: "lesson05",
    title: "Quiz บทที่ 5 — ทฤษฎีความน่าจะเป็น",
    desc: "Conditional / Total Probability / Bayes",
    tags: "quiz บท5 bayes",
    chip: "Bayes",
    link: "quiz-lesson05.html",
    lesson: "lesson05.html",
    summary: "summary-lesson05.html",
    config: "data/quiz-lesson05.json"
  },
  {
    id: "lesson06",
    title: "Quiz บทที่ 6 — ตัวแปรสุ่ม",
    desc: "Discrete/Continuous, PMF/PDF, E[X], Var(X)",
    tags: "quiz บท6 ตัวแปรสุ่ม",
    chip: "Random Var",
    link: "quiz-lesson06.html",
    lesson: "lesson06.html",
    summary: "summary-lesson06.html",
    config: "data/quiz-lesson06.json"
  },
  {
    id: "lesson07",
    title: "Quiz บทที่ 7 — การแจกแจงไม่ต่อเนื่อง",
    desc: "Bernoulli, Binomial, Poisson, Hypergeometric",
    tags: "quiz บท7 การแจกแจงไม่ต่อเนื่อง",
    chip: "Discrete",
    link: "quiz-lesson07.html",
    lesson: "lesson07.html",
    summary: "summary-lesson07.html",
    config: "data/quiz-lesson07.json"
  },
  {
    id: "lesson08",
    title: "Quiz บทที่ 8 — แจกแจงต่อเนื่อง & โค้งปกติ",
    desc: "Normal, Z-score, Empirical Rule",
    tags: "quiz บท8 normal",
    chip: "Normal",
    link: "quiz-lesson08.html",
    lesson: "lesson08.html",
    summary: "summary-lesson08.html",
    config: "data/quiz-lesson08.json"
  },
  {
    id: "lesson09",
    title: "Quiz บทที่ 9 — Sampling Distributions & CLT",
    desc: "x̄, p̂, Standard Error, CLT",
    tags: "quiz บท9 sampling",
    chip: "CLT",
    link: "quiz-lesson09.html",
    lesson: "lesson09.html",
    summary: "summary-lesson09.html",
    config: "data/quiz-lesson09.json"
  },
  {
    id: "mixed",
    title: "Quiz รวมทุกบท (1–9)",
    desc: "สุ่มข้อสอบจากทุกบท พร้อมจับเวลาและเกณฑ์ผ่าน",
    tags: "quiz รวมทุกบท",
    chip: "Final",
    link: "quiz-mixed.html",
    lesson: "index.html",
    summary: "summaries-all.html",
    config: "data/quiz-mixed.json"
  }
];
