import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const indexPath = path.join(projectRoot, 'content', 'index.json');

const outputTargets = [
  path.join(projectRoot, 'search-index.json'),
  path.join(projectRoot, 'prob - Stats', 'search-index.json'),
];

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Mark}\p{Number}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function uniqueTokens(...parts) {
  const tokens = new Set();
  for (const part of parts) {
    if (!part) continue;
    for (const token of tokenize(String(part))) {
      tokens.add(token);
    }
  }
  return Array.from(tokens);
}

function buildEntries(index) {
  const entries = [];

  entries.push(
    {
      title: 'หลักสูตรสถิติ',
      href: 'index.html#curriculum',
      snippet: 'สำรวจบทเรียนทั้งหมด',
      tokens: uniqueTokens('curriculum', 'หลักสูตร', 'บทเรียน', 'stat'),
    },
    {
      title: 'รีวิวเร่งด่วน',
      href: 'index.html#review',
      snippet: 'สรุปประเด็นสำคัญ',
      tokens: uniqueTokens('review', 'รีวิว', 'สรุป'),
    },
    {
      title: 'ต่อยอดใช้งานจริง',
      href: 'index.html#advanced',
      snippet: 'หัวข้อเชิงลึก',
      tokens: uniqueTokens('advanced', 'หัวข้อ', 'เชิงลึก'),
    },
    {
      title: 'เครื่องมือสถิติ',
      href: 'index.html#tools',
      snippet: 'เปิดคำนวณและซิมูเลเตอร์',
      tokens: uniqueTokens('tools', 'เครื่องมือ', 'calculator', 'sim'),
    },
  );

  const sectionMap = [
    { key: 'lessons', list: index.lessons },
    { key: 'review', list: index.review },
    { key: 'advanced', list: index.advanced },
    { key: 'tools', list: index.tools },
  ];

  for (const { list } of sectionMap) {
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
      const tokens = uniqueTokens(entry.title, entry.summary, entry.tags?.join(' '), entry.number);
      entries.push({
        title: entry.title,
        href: entry.href,
        snippet: entry.summary || '',
        tokens,
      });
    }
  }

  return entries;
}

async function writeOutputs(entries) {
  const payload = `${JSON.stringify(entries, null, 2)}\n`;
  await Promise.all(
    outputTargets.map(async (target) => {
      try {
        await fs.access(path.dirname(target));
        await fs.writeFile(target, payload, 'utf8');
      } catch (error) {
        if (error.code === 'ENOENT') {
          return;
        }
        throw error;
      }
    }),
  );
}

async function main() {
  const raw = await fs.readFile(indexPath, 'utf8');
  const index = JSON.parse(raw);
  const entries = buildEntries(index);
  await writeOutputs(entries);
  console.log(`Generated search index with ${entries.length} entries.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
