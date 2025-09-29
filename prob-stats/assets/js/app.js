import { navGroups } from './nav.js';
import { renderNav, renderDatasets, renderSearchResults, renderFileGroups } from './ui.js';
import { initTooltips } from './tooltips.js';
import { loadSearchIndex, searchIndex } from './search.js';

const datasets = [
  { name: 'lln.csv', href: 'data/lln.csv', description: 'ผลการโยนเหรียญจำลอง 1,000 ครั้ง (Law of Large Numbers)' },
  { name: 'clt_heights.csv', href: 'data/clt_heights.csv', description: 'ส่วนสูงนักศึกษา 3 คณะ ใช้สาธิต Central Limit Theorem' },
  { name: 'qc_defects.csv', href: 'data/qc_defects.csv', description: 'จำนวนของเสียรายล็อต สำหรับบทเรียนคุณภาพการผลิต' },
  { name: 'poisson_calls.csv', href: 'data/poisson_calls.csv', description: 'จำนวนสายเข้า Call Center รายชั่วโมง (Poisson)' },
  { name: 'binomial_shots.csv', href: 'data/binomial_shots.csv', description: 'สถิติโอกาสยิงเข้า/พลาด จากเกมกีฬา (Binomial)' },
  { name: 'hypergeo_urn.csv', href: 'data/hypergeo_urn.csv', description: 'ข้อมูลสุ่มหยิบลูกบอลจากไห สำหรับบท Hypergeometric' },
  { name: 'normal_noise.csv', href: 'data/normal_noise.csv', description: 'ตัวอย่างสัญญาณรบกวนแจกแจงปกติ' },
  { name: 'two_sample_weight.csv', href: 'data/two_sample_weight.csv', description: 'น้ำหนักก่อน-หลังโปรแกรม สาธิตการทดสอบสองกลุ่ม' },
  { name: 'paired_prepost.csv', href: 'data/paired_prepost.csv', description: 'ชุดข้อมูลแบบจับคู่ Pre/Post สำหรับ t-test' },
  { name: 'abtest_conversions.csv', href: 'data/abtest_conversions.csv', description: 'ผลการทดลอง A/B ด้าน Conversion บนเว็บไซต์' }
];

const fileGroups = [
  {
    name: 'โครงเว็บ/ระบบหลัก',
    countLabel: '5 ไฟล์',
    description: 'โครงสร้างนำทางหลัก หน้าแรก และข้อมูลเครดิตของโปรเจกต์',
    examples: ['index.html', 'content/index.json', 'about.html']
  },
  {
    name: 'บทเรียนเนื้อหา (ch01–ch16)',
    countLabel: '16 ไฟล์',
    description: 'บทเรียนเต็มสำหรับบทนำถึง Confidence Interval ครบทุกหัวข้อ',
    examples: ['content/01-intro.html', 'content/08-binomial.html', 'content/16-ci-intro.html']
  },
  {
    name: 'อ้างอิง/คู่มือ',
    countLabel: '4 ไฟล์',
    description: 'ตัวช่วยเสริม เช่น glossary, สัญลักษณ์ และ decision map',
    examples: ['content/glossary.html', 'content/symbols.html', 'content/decision-map.html']
  },
  {
    name: 'แบบฝึกหัด + เฉลย',
    countLabel: '32 ไฟล์',
    description: 'แบบฝึกหัดและเฉลยสำหรับทุกบท ใช้ทบทวนและเตรียมบทเรียน',
    examples: ['exercises/ch01.html', 'exercises/ch10.html', 'exercises/ch16-answer.html']
  },
  {
    name: 'ซิมูเลเตอร์',
    countLabel: '8 ไฟล์',
    description: 'ตัวอย่างอินเตอร์แอคทีฟสาธิต LLN, CLT, การแจกแจง และการทดสอบสมมติฐาน',
    examples: ['simulators/lln.html', 'simulators/clt.html', 'simulators/hypothesis-power.html']
  },
  {
    name: 'Web Workers',
    countLabel: '2 ไฟล์',
    description: 'สคริปต์เบื้องหลังสำหรับงานจำลอง Bootstrap และ CLT ที่ต้องประมวลผลหนัก',
    examples: ['workers/clt.worker.js', 'workers/bootstrap.worker.js']
  },
  {
    name: 'เครื่องคิด/ตารางสถิติ',
    countLabel: '10 ไฟล์',
    description: 'เครื่องคิดเลข Z, t, χ², F พร้อมตารางแจกแจงสำหรับอ้างอิงด่วน',
    examples: ['tools/z.html', 'tools/power-sample-size.html', 'tools/z-table.html']
  },
  {
    name: 'สองภาษา & สัญลักษณ์',
    countLabel: '3 ไฟล์',
    description: 'สตริงภาษาไทย/อังกฤษ และ metadata สัญลักษณ์ที่ใช้ทั้งระบบ',
    examples: ['i18n/th.json', 'i18n/en.json', 'content/symbols.json']
  },
  {
    name: 'สไตล์/ธีม',
    countLabel: '5 ไฟล์',
    description: 'โทเคนสี คอมโพเนนต์ ธีมหลัก โหมดพิมพ์ และสไตล์เสริมการเข้าถึง',
    examples: ['assets/css/theme-light.css', 'assets/css/components.css', 'assets/css/a11y.css']
  },
  {
    name: 'สคริปต์ยูทิล & UI',
    countLabel: '5 ไฟล์',
    description: 'โค้ดจัดการเนวิเกชัน UI, ทูลทิป, กราฟ และยูทิลสถิติพื้นฐาน',
    examples: ['assets/js/ui.js', 'assets/js/tooltips.js', 'assets/js/stats-utils.js']
  },
  {
    name: 'ค้นหา',
    countLabel: '2 ไฟล์',
    description: 'สคริปต์และดัชนีสำหรับค้นหาบทเรียนและเครื่องมือ',
    examples: ['assets/js/search.js', 'content/search-index.json']
  },
  {
    name: 'ชุดข้อมูล CSV',
    countLabel: '10 ไฟล์',
    description: 'ข้อมูลจริง/จำลองสำหรับประกอบบทเรียน ซิมูเลเตอร์ และแบบฝึกหัด',
    examples: ['data/lln.csv', 'data/poisson_calls.csv', 'data/abtest_conversions.csv']
  },
  {
    name: 'PWA',
    countLabel: '2 ไฟล์',
    description: 'ไฟล์ manifest และ service worker สำหรับโหมดติดตั้งใช้งานออฟไลน์',
    examples: ['pwa/manifest.json', 'pwa/sw.js']
  },
  {
    name: 'พิมพ์/รวมเล่ม',
    countLabel: '3 ไฟล์',
    description: 'เทมเพลตปก สารบัญ และเพจรวบรวมสำหรับสร้างฉบับพิมพ์',
    examples: ['pdf/cover.html', 'pdf/toc.html', 'build/print-all.html']
  },
  {
    name: 'ชีตสรุป',
    countLabel: '3 หน้า',
    description: 'ชีตสรุปสูตร การแจกแจง และการเลือกการทดสอบ สำหรับสรุปเร็ว',
    examples: ['content/cheatsheets/ci-tests.html', 'content/cheatsheets/distributions.html', 'content/cheatsheets/formulas-1page.html']
  },
  {
    name: 'ทรัพยากร UI',
    countLabel: '2 ไฟล์',
    description: 'ไอคอนพื้นฐานสำหรับปุ่มพิมพ์และสลับภาษา',
    examples: ['assets/icons/print.svg', 'assets/icons/globe.svg']
  }
];

async function initApp() {
  renderNav(navGroups, document.getElementById('nav-groups'));
  const datasetTable = document.getElementById('dataset-table');
  if (datasetTable) {
    renderDatasets(datasetTable, datasets);
  }
  renderFileGroups(document.getElementById('category-grid'), fileGroups);
  initTooltips();

  const entries = await loadSearchIndex();
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const container = document.getElementById('search-results');
  if (form && input) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const results = searchIndex(entries, input.value);
      renderSearchResults(container, results);
    });
  }
}

document.addEventListener('DOMContentLoaded', initApp);
