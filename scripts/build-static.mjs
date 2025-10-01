import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

const directoriesToCopy = [
  'content',
  'data',
  'i18n',
  'pwa',
  'sim',
  'styles',
  'tools',
  'workers',
  'tables',
  'tests',
  'app',
  'prob - Stats',
];

const additionalFiles = [
  'app.js',
  'search.js',
  'hotfix.css',
  'hotfix.js',
  'symbols.json',
  'search-index.json',
];

async function emptyDist() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });
}

function resolveDirectory(directory) {
  const direct = path.join(projectRoot, directory);
  const nested = path.join(projectRoot, 'prob - Stats', directory);
  return Promise.allSettled([fs.stat(direct), fs.stat(nested)]).then(([rootStat, nestedStat]) => {
    if (rootStat.status === 'fulfilled' && rootStat.value.isDirectory()) {
      return direct;
    }
    if (nestedStat.status === 'fulfilled' && nestedStat.value.isDirectory()) {
      return nested;
    }
    return null;
  });
}

async function copyDirectoryIfExists(directory) {
  const source = await resolveDirectory(directory);
  try {
    if (!source) return;
    await fs.cp(source, path.join(distDir, directory), { recursive: true });
    console.log(`Copied directory: ${directory}`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

async function copyFileIfExists(file) {
  const source = path.join(projectRoot, file);
  try {
    const stats = await fs.stat(source);
    if (!stats.isFile()) return;
    const destination = path.join(distDir, file);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.copyFile(source, destination);
    console.log(`Copied file: ${file}`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

async function copyRootHtmlFiles() {
  const entries = await fs.readdir(projectRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      await copyFileIfExists(entry.name);
    }
  }
}

async function main() {
  await emptyDist();

  for (const directory of directoriesToCopy) {
    await copyDirectoryIfExists(directory);
  }

  await copyRootHtmlFiles();

  for (const file of additionalFiles) {
    await copyFileIfExists(file);
  }

  console.log('Static build complete.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
