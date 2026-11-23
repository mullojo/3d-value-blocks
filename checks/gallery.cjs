const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const items = require('../gallery-assets/captures.json');
const { cards } = require('../scripts/build-gallery.cjs');
const html = fs.readFileSync(path.join(root, 'gallery.html'), 'utf8');
assert(items.length > 0);
assert.equal(new Set(items.map(item => item.file)).size, items.length, 'Unique capture files');
assert(html.includes(cards()), 'Static gallery cards match the caption manifest');
const names = new Set(fs.readdirSync(path.join(root, 'gallery-assets/captures')));
assert.equal(names.size, items.length, 'Every published capture is represented');
for (const item of items) {
  assert(names.has(item.file));
  assert(item.title && item.description && ['Count','Time','Journal','Inputs','Types','Bitcoin','Lab'].includes(item.category));
}
// Validate real local asset resolution from a project Pages subpath, not /.
const base = new URL('https://example.github.io/value-blocks/gallery.html');
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const target = match[1];
  if (target.startsWith('#')) continue;
  const resolved = new URL(target, base);
  assert(resolved.pathname.startsWith('/value-blocks/'), `Asset escapes repository prefix: ${target}`);
  assert(fs.existsSync(path.join(root, decodeURIComponent(target))), `Missing gallery asset: ${target}`);
}
assert(fs.existsSync(path.join(root, '.nojekyll')));
assert(fs.readFileSync(path.join(root, 'index.html'), 'utf8').includes('href="gallery.html"'));
console.log(`Gallery passed: ${items.length} complete captures, reproducible static markup, and assets resolving beneath a GitHub Pages project prefix.`);
