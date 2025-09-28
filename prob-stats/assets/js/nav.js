export const navGroups = [
  {
    id: 'core-lessons',
    label: 'บทเรียน ch01–ch16',
    summary: 'ลำดับบทเรียนหลัก ครบตั้งแต่บทนำจนถึง Confidence Interval',
    items: [
      { title: 'บทที่ 1: บทนำ', href: 'content/01-intro.html', meta: 'ch01' },
      { title: 'บทที่ 2: การนำเสนอข้อมูล', href: 'content/02-descriptive.html', meta: 'ch02' },
      { title: 'บทที่ 3: ความน่าจะเป็นเบื้องต้น', href: 'content/03-probability-basics.html', meta: 'ch03' },
      { title: 'บทที่ 4: เงื่อนไขและความน่าจะเป็นร่วม', href: 'content/04-conditional.html', meta: 'ch04' },
      { title: 'บทที่ 5: ตัวแปรสุ่ม', href: 'content/05-random-variables.html', meta: 'ch05' },
      { title: 'บทที่ 6: ความคาดหมายและความแปรปรวน', href: 'content/06-expectation-variance.html', meta: 'ch06' },
      { title: 'บทที่ 7: การแจกแจงไม่ต่อเนื่อง', href: 'content/07-discrete-uniform.html', meta: 'ch07' },
      { title: 'บทที่ 8: Binomial Distribution', href: 'content/08-binomial.html', meta: 'ch08' },
      { title: 'บทที่ 9: Hypergeometric Distribution', href: 'content/09-hypergeometric.html', meta: 'ch09' },
      { title: 'บทที่ 10: Poisson Distribution', href: 'content/10-poisson.html', meta: 'ch10' },
      { title: 'บทที่ 11: Continuous & Normal', href: 'content/11-continuous-normal.html', meta: 'ch11' },
      { title: 'บทที่ 12: Standard Normal (Z)', href: 'content/12-standard-normal-z.html', meta: 'ch12' },
      { title: 'บทที่ 13: t, χ², F', href: 'content/13-t-chi2-f.html', meta: 'ch13' },
      { title: 'บทที่ 14: Central Limit Theorem', href: 'content/14-clt.html', meta: 'ch14' },
      { title: 'บทที่ 15: Sampling & Estimators', href: 'content/15-sampling-other-stats.html', meta: 'ch15' },
      { title: 'บทที่ 16: Confidence Intervals', href: 'content/16-ci-intro.html', meta: 'ch16' }
    ]
  },
  {
    id: 'practice-tools',
    label: 'แบบฝึกหัด & เครื่องมือ',
    summary: 'แบบฝึกหัด+เฉลย 32 ไฟล์ ซิมูเลเตอร์ 8 รายการ และเครื่องคิดเลข 10 รายการ',
    items: [
      { title: 'ดัชนีแบบฝึกหัด (ch01–ch16)', href: 'exercises/ch01.html', meta: '16 บท' },
      { title: 'ชุดเฉลยแบบฝึกหัด', href: 'exercises/ch01-answer.html', meta: '16 ไฟล์' },
      { title: 'ห้องซิมูเลเตอร์', href: 'simulators/lln.html', meta: '8 รายการ' },
      { title: 'เครื่องคิด & ตารางสถิติ', href: 'tools/z.html', meta: '10 ไฟล์' },
      { title: 'ชีตสรุปสูตร & การทดสอบ', href: 'content/cheatsheets/formulas-1page.html', meta: '3 หน้า' }
    ]
  },
  {
    id: 'ux-ui',
    label: 'UX / UI & อ้างอิง',
    summary: 'รวมไฟล์ธีม การออกแบบ และคู่มือประกอบสำหรับปรับ UX ต่อ',
    items: [
      { title: 'ธีมและโทเคนสี', href: 'assets/css/theme-light.css', meta: 'CSS' },
      { title: 'คอมโพเนนต์ & A11y', href: 'assets/css/components.css', meta: 'CSS' },
      { title: 'UI Utilities', href: 'assets/js/ui.js', meta: 'JS' },
      { title: 'Tooltips (ARIA)', href: 'assets/js/tooltips.js', meta: 'JS' },
      { title: 'เกี่ยวกับโปรเจกต์', href: 'about.html', meta: 'ข้อมูลทีม' }
    ],
    cta: { label: 'ดูโครงสร้างไฟล์ทั้งหมด', href: 'content/index.json' }
  },
  {
    id: 'references-data',
    label: 'อ้างอิง & ข้อมูล',
    summary: 'รวม glossary, สัญลักษณ์, decision map, ชุดข้อมูล และระบบค้นหา',
    items: [
      { title: 'Glossary คำศัพท์', href: 'content/glossary.html' },
      { title: 'สัญลักษณ์ & notation', href: 'content/symbols.html' },
      { title: 'Decision Map', href: 'content/decision-map.html' },
      { title: 'Pitfalls & Checklist', href: 'content/pitfalls.html' },
      { title: 'ดัชนีค้นหา', href: 'content/search-index.json', meta: 'search' }
    ]
  },
  {
    id: 'data-delivery',
    label: 'ข้อมูล & การเผยแพร่',
    summary: 'เข้าถึงชุดข้อมูล ตัวเลือกพิมพ์ และการใช้งานแบบ PWA',
    items: [
      { title: 'ชุดข้อมูล CSV', href: '#overview', meta: '10 ไฟล์' },
      { title: 'ไฟล์พิมพ์รวมบท', href: 'build/print-all.html', meta: 'Print' },
      { title: 'โหมด PWA', href: 'pwa/manifest.json', meta: 'Install' },
      { title: 'PDPA & สิทธิข้อมูล', href: 'pdpa.html' },
      { title: 'Service Worker', href: 'pwa/sw.js', meta: 'Offline' }
    ]
  }
];
