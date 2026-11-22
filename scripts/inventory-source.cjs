// Reproduce the source-volume snapshot without counting vendor/archive copies.
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const root = path.join(__dirname, '..');
const git = args => execFileSync('git', args, { cwd: root });
const ref = process.argv[2] || '5570a3d';
const commit = git(['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`]).toString().trim();
const selected = git(['ls-tree', '-r', '--name-only', commit]).toString().trim().split('\n').filter(file => (!file.includes('/') && /\.(js|css|html)$/.test(file)) || /^(checks|scripts)\/[^/]+\.cjs$/.test(file));
const files = selected.sort().map(file => {
  const bytes = git(['show', `${commit}:${file}`]);
  const text = bytes.toString();
  const lines = text.replace(/\n$/, '').split('\n');
  return {path:file,bytes:bytes.length,physicalLines:lines.length,nonblankLines:lines.filter(line => line.trim()).length,nonWhitespaceCharacters:[...text].filter(char => !/\s/u.test(char)).length};
});
const totals = Object.fromEntries(['bytes','physicalLines','nonblankLines','nonWhitespaceCharacters'].map(key => [key,files.reduce((sum,file) => sum + file[key],0)]));
totals.files = files.length;
totals.sourceUnits80Characters = totals.nonWhitespaceCharacters / 80;
console.log(JSON.stringify({snapshotCommit:commit,method:'Tracked root .js/.css/.html and checks/scripts .cjs at the frozen snapshot. Non-whitespace Unicode characters divided by 80 are text-volume units, not semantic lines of code.',exclusions:['vendor/','archived/','images','SVG QR artifacts','JSON data','documentation','this ledger and its checker'],totals,files}, null, 2));
