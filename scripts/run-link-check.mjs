import { check } from 'linkinator';

async function main() {
  const result = await check({
    path: 'http://127.0.0.1:4173',
    recurse: true,
    skip: [/^mailto:/i, /^tel:/i, /^data:/i],
  });

  const broken = result.links.filter((link) => link.state !== 'OK');
  if (broken.length) {
    console.error('Broken links detected:');
    for (const link of broken) {
      console.error(`- ${link.url} (${link.status})`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Checked ${result.links.length} links.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
