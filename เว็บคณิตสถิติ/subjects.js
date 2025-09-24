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
    id: "bernoulli",
    title: "Bernoulli Distribution",
    desc: "ลองครั้งเดียว สำเร็จ/ล้มเหลว พร้อมเครื่องคิดเลข p",
    tags: "สูตร bernoulli trial success failure",
    chip: "Discrete",
    link: "formula/bernoulli.html"
  },
  {
    id: "binomial",
    title: "Binomial Distribution",
    desc: "X ~ Bin(n, p), PMF, E/Var, ตัวอย่างคำนวณ",
    tags: "สูตร binomial การแจกแจงทวินาม",
    chip: "Discrete",
    link: "formula/binomial.html"
  },
  {
    id: "hypergeometric",
    title: "Hypergeometric Distribution",
    desc: "สุ่มโดยไม่ใส่คืน + ตาราง PMF และขั้นบันได C(a,b)",
    tags: "สูตร hypergeometric without replacement",
    chip: "Discrete",
    link: "formula/hypergeometric.html"
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
    id: "normal",
    title: "Normal Distribution",
    desc: "PDF/CDF, Empirical Rule, กราฟระบายพื้นที่ พร้อมดาวน์โหลด",
    tags: "สูตร normal distribution pdf cdf",
    chip: "Normal",
    link: "formula/normal.html"
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
    id: "inference-updates",
    title: "แฟ้มรวมไฟล์สรุปอนุมาน (11–22)",
    desc: "รวมลิงก์ไฟล์ที่แก้ไขและสร้างใหม่ เพื่อการตรวจทานอย่างรวดเร็ว",
    tags: "สรุป อัปเดต inference summary 11 12 13 14 15 16 17 18 19 20 21 22",
    chip: "อัปเดต",
    link: "updates.html"
  },
  {
    id: "all",
    title: "รวมสรุปทุกบท (1–9)",
    desc: "มีคั่นหน้า — เหมาะสำหรับพิมพ์/บันทึก PDF",
    tags: "สรุป รวม ทุกบท summary all",
    chip: "รวม",
    link: "summaries-all.html"
  },
  {
    id: "lesson11-summary",
    title: "สรุปบทที่ 11 — รู้จักการประมาณค่า",
    desc: "ประชากร vs ตัวอย่าง พร้อมสูตร Bias/MSE, ตัวอย่างชิมต้มยำ และแบบฝึกคิด",
    tags: "สรุป บท11 estimation population sample point interval",
    chip: "บท11",
    link: "summary-lesson11.html",
    meta: {
      version: "2.0.0",
      updated_at: "2025-10-05",
      read_time: "7 นาที"
    }
  },
  {
    id: "lesson12-summary",
    title: "สรุปบทที่ 12 — หัวใจของการประมาณค่าแบบช่วง",
    desc: "โครงสร้าง CI + ตารางสูตร Z/t, Workflow ทีละขั้น, ตัวอย่าง 95% vs 99%",
    tags: "สรุป บท12 confidence interval critical value standard error",
    chip: "บท12",
    link: "summary-lesson12.html",
    meta: {
      version: "2.0.0",
      updated_at: "2025-10-05",
      read_time: "8 นาที"
    }
  },
  {
    id: "lesson13-summary",
    title: "สรุปบทที่ 13 — การประมาณค่าเฉลี่ย 1 กลุ่ม",
    desc: "เลือกใช้ Z หรือ t พร้อมตารางตัดสินใจ, ตัวอย่างรู้/ไม่รู้ σ, Checklist สมมติฐาน",
    tags: "สรุป บท13 mean interval z t",
    chip: "บท13",
    link: "summary-lesson13.html",
    meta: {
      version: "2.0.0",
      updated_at: "2025-10-05",
      read_time: "8 นาที"
    }
  },
  {
    id: "lesson14-summary",
    title: "สรุปบทที่ 14 — การประมาณค่าสัดส่วน",
    desc: "สูตร CI ของ p + FPC, ตัวอย่างโพลจริง, เคล็ดลับเลือก p*",
    tags: "สรุป บท14 proportion interval np>=10",
    chip: "บท14",
    link: "summary-lesson14.html",
    meta: {
      version: "2.0.0",
      updated_at: "2025-10-05",
      read_time: "7 นาที"
    }
  },
  {
    id: "lesson15-summary",
    title: "สรุปบทที่ 15 — การประมาณค่าผลต่างสองกลุ่ม",
    desc: "ผลต่างค่าเฉลี่ย/สัดส่วน, ตาราง pooled vs Welch, ตัวอย่างเปรียบเทียบ",
    tags: "สรุป บท15 difference mean proportion pooled",
    chip: "บท15",
    link: "summary-lesson15.html",
    meta: {
      version: "2.0.0",
      updated_at: "2025-10-05",
      read_time: "8 นาที"
    }
  },
  {
    id: "lesson16-summary",
    title: "สรุปบทที่ 16 — การคำนวณขนาดตัวอย่าง",
    desc: "สูตรกำหนด n สำหรับ μ/p, ตัวอย่างคุมงบ, เทคนิค Pilot Study",
    tags: "สรุป บท16 sample size margin of error",
    chip: "บท16",
    link: "summary-lesson16.html",
    meta: {
      version: "2.0.0",
      updated_at: "2025-10-05",
      read_time: "7 นาที"
    }
  },
  {
    id: "lesson17-summary",
    title: "สรุปบทที่ 17 — พื้นฐานการทดสอบสมมติฐาน",
    desc: "H0/H1, ตาราง Type I/II, ขั้นตอน 6 ข้อ และตัวอย่างตีความ P-value",
    tags: "สรุป บท17 hypothesis testing basics type i type ii",
    chip: "บท17",
    link: "summary-lesson17.html",
    meta: {
      version: "2.0.0",
      updated_at: "2025-10-05",
      read_time: "6 นาที"
    }
  },
  {
    id: "lesson18-summary",
    title: "สรุปบทที่ 18 — ประเภทของการทดสอบตามทิศทาง",
    desc: "Two/Left/Right-tailed พร้อมแผนภาพ, ตัวอย่างคำนวณ, คำแนะนำเลือกทิศ",
    tags: "สรุป บท18 test direction two tailed right left",
    chip: "บท18",
    link: "summary-lesson18.html",
    meta: {
      version: "2.0.0",
      updated_at: "2025-10-05",
      read_time: "5 นาที"
    }
  },
  {
    id: "lesson19-summary",
    title: "สรุปบทที่ 19 — การทดสอบค่าเฉลี่ย 1 กลุ่ม",
    desc: "Z-test vs t-test, สูตร + ตัวอย่างเต็ม, Checklist ก่อนสรุป",
    tags: "สรุป บท19 mean test z t",
    chip: "บท19",
    link: "summary-lesson19.html",
    meta: {
      version: "2.0.0",
      updated_at: "2025-10-05",
      read_time: "7 นาที"
    }
  },
  {
    id: "lesson20-summary",
    title: "สรุปบทที่ 20 — การทดสอบสัดส่วน 1 กลุ่ม",
    desc: "Z-test สำหรับ p, เงื่อนไข np₀, ตัวอย่างธุรกิจพร้อมการตีความ",
    tags: "สรุป บท20 proportion test z",
    chip: "บท20",
    link: "summary-lesson20.html",
    meta: {
      version: "2.0.0",
      updated_at: "2025-10-05",
      read_time: "6 นาที"
    }
  },
  {
    id: "lesson21-summary",
    title: "สรุปบทที่ 21 — การทดสอบผลต่างสองกลุ่ม",
    desc: "ตารางเลือก t (pooled/Welch) + z สัดส่วน, ตัวอย่างเปรียบเทียบ",
    tags: "สรุป บท21 two sample t z",
    chip: "บท21",
    link: "summary-lesson21.html",
    meta: {
      version: "2.0.0",
      updated_at: "2025-10-05",
      read_time: "7 นาที"
    }
  },
  {
    id: "lesson22-summary",
    title: "สรุปบทที่ 22 — การทดสอบความแปรปรวน",
    desc: "Chi-square & F-test, ขั้นตอนตรวจ Normality, ตัวอย่างโรงงาน",
    tags: "สรุป บท22 variance chi-square f-test",
    chip: "บท22",
    link: "summary-lesson22.html",
    meta: {
      version: "2.0.0",
      updated_at: "2025-10-05",
      read_time: "6 นาที"
    }
  },
  // สร้างสรุปรายบทจาก lessons อัตโนมัติ
  ...lessons.map(l => ({
    id: `${l.id}-summary`,
    title: `สรุป 1 หน้า — ${l.title}`,
    desc: l.desc,
    tags: `สรุป ${l.tags}`,
    chip: l.title.split(':')[0].replace('บทที่', 'บท').trim(),
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
