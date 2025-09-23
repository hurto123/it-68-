// subjects.js
// เก็บข้อมูลบทเรียนและสูตรต่าง ๆ ให้ index.html โหลดไปสร้างการ์ด

const lessons = [
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
  // … ทำต่อจนถึง lesson09
];

const formulas = [
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

// สำหรับสรุป
const summaries = [
  {
    id: "all",
    title: "รวมสรุปทุกบท (1–9)",
    desc: "มีคั่นหน้า — เหมาะสำหรับพิมพ์/บันทึก PDF",
    tags: "สรุป รวม ทุกบท summary all",
    chip: "รวม",
    link: "summaries-all.html"
  },
  ...lessons.map(l => ({
    id: l.id + "-summary",
    title: `สรุป 1 หน้า — ${l.title}`,
    desc: l.desc,
    tags: `สรุป ${l.tags}`,
    chip: l.chip,
    link: l.summary
  }))
];

// export ถ้าใช้ ES6 module
export { lessons, formulas, summaries };
