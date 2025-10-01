import { createWriteStream } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const buildDir = path.join(projectRoot, 'build');
const zipPath = path.join(buildDir, 'prob-stats-site.zip');

async function main() {
  try {
    const stats = await fs.stat(distDir);
    if (!stats.isDirectory()) {
      throw new Error('dist directory is not available. Run "npm run build" first.');
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('dist directory not found. Run "npm run build" first.');
    }
    throw error;
  }

  await fs.mkdir(buildDir, { recursive: true });

  const output = createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  const archivePromise = new Promise((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
  });

  archive.pipe(output);
  archive.directory(distDir, false);
  await archive.finalize();
  await archivePromise;

  console.log(`Created ${zipPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
