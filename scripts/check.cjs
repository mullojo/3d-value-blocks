// All checks use Node built-ins and the vendored browser libraries. No install.
const { readdirSync } = require('node:fs');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');
const root = join(__dirname, '..');
const files = readdirSync(join(root, 'checks')).filter(name => name.endsWith('.cjs')).sort();
let failed = 0;
for (const file of files) {
  console.log(`\n--- ${file} ---`);
  const result = spawnSync(process.execPath, [join(root, 'checks', file)], { cwd: root, stdio: 'inherit' });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0 || result.error) failed++;
}
console.log(`\n${files.length - failed}/${files.length} check suites passed.`);
process.exitCode = failed ? 1 : 0;
