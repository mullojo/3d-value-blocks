const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const support = require('../project-support.json');
const { build } = require('../scripts/build-support-qr.cjs');
const jsQR = require('../vendor/jsqr.js');
const result = build();
assert.equal(fs.readFileSync(path.join(root, 'assets/support-bitcoin.svg'), 'utf8'), result.svg);
assert.equal(result.payload, `bitcoin:${support.address}`);
assert(!result.payload.includes('?'), 'Support QR must not specify an amount or tracking fields');
// Validate the supplied SegWit address locally, including checksum and program.
const alphabet = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const address = support.address;
assert(address.startsWith('bc1') && address === address.toLowerCase());
const data = [...address.slice(3)].map(c => { const n = alphabet.indexOf(c); assert(n >= 0); return n; });
const hrp = 'bc';
const values = [...hrp].map(c => c.charCodeAt(0) >> 5).concat(0, [...hrp].map(c => c.charCodeAt(0) & 31), data);
let chk = 1;
const gen = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
for (const value of values) {
  const top = chk >>> 25;
  chk = ((chk & 0x1ffffff) << 5) ^ value;
  for (let i = 0; i < 5; i++) if ((top >>> i) & 1) chk ^= gen[i];
}
assert.equal(data[0], 0, 'Current destination is SegWit v0');
assert.equal(chk >>> 0, 1, 'Bitcoin address Bech32 checksum');
let acc = 0, bits = 0;
const program = [];
for (const n of data.slice(1, -6)) {
  acc = ((acc << 5) | n) & 0xfff; bits += 5;
  if (bits >= 8) { bits -= 8; program.push((acc >>> bits) & 255); }
}
assert([20, 32].includes(program.length));
assert(bits < 5 && ((acc << (8 - bits)) & 255) === 0);
// Rasterize the generated SVG's actual rectangles (including rounded corners),
// then decode them. This checks the published artifact rather than just its URI.
const scale = 10, width = (result.modules + result.quiet * 2) * scale;
const pixels = new Uint8ClampedArray(width * width * 4);
const paper = [255, 247, 237], ink = [124, 45, 18];
for (let i = 0; i < pixels.length; i += 4) { pixels.set(paper, i); pixels[i + 3] = 255; }
for (const match of result.svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="1" height="1" rx="0.12"\/>/g)) {
  const px = Number(match[1]) * scale, py = Number(match[2]) * scale, r = 0.12 * scale;
  for (let y = 0; y < scale; y++) for (let x = 0; x < scale; x++) {
    const dx = Math.max(r - x - .5, x + .5 - (scale - r), 0);
    const dy = Math.max(r - y - .5, y + .5 - (scale - r), 0);
    if (dx * dx + dy * dy <= r * r) pixels.set(ink, ((py + y) * width + px + x) * 4);
  }
}
assert.equal(jsQR(pixels, width, width)?.data, result.payload, 'Published QR decodes to the exact destination');
for (const file of ['README.md', 'SUPPORT.md', '.github/FUNDING.yml']) {
  assert(fs.readFileSync(path.join(root, file), 'utf8').includes(address), `${file} matches canonical address`);
}
// Public Markdown must not depend on private chats or machine-specific paths.
function markdown(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
    if (item.name.startsWith('.') || ['vendor', 'archived'].includes(item.name)) return [];
    const full = path.join(dir, item.name);
    return item.isDirectory() ? markdown(full) : item.name.endsWith('.md') ? [full] : [];
  });
}
for (const file of markdown(root)) {
  const text = fs.readFileSync(file, 'utf8');
  assert(!/chatgpt-conversation:\/\/|\/Users\//.test(text), `Private reference in ${file}`);
  for (const match of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^[a-z]+:|^#/.test(target)) continue;
    assert(fs.existsSync(path.resolve(path.dirname(file), decodeURIComponent(target.split('#')[0]))), `Broken local link in ${file}: ${target}`);
  }
}
console.log('Repository passed: valid Bitcoin address, reproducible scan-tested support QR, consistent destinations, public Markdown links and no private chat references.');
// Static pages must resolve links locally as well as beneath a Pages prefix.
for (const file of ['index.html','gallery.html','lab.html','archived/v1-simple-start/index.html','archived/v2-paced-css/index.html','archived/v3-gpu-counts/index.html']) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^[a-z]+:|^#/.test(target)) continue;
    const local = decodeURIComponent(target.split(/[?#]/)[0]);
    assert(fs.existsSync(path.resolve(root, path.dirname(file), local)), `Broken static link in ${file}: ${target}`);
  }
}
console.log('Main, gallery, and archived static page links resolve locally.');
