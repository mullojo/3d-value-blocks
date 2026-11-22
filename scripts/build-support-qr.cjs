// Separate from the fictional film QR: this encodes the real project address.
const fs = require('node:fs');
const path = require('node:path');
const qr = require('../vendor/qrcode-generator.js');
const support = require('../project-support.json');
function build() {
  const payload = `bitcoin:${support.address}`;
  const code = qr(0, 'H');
  code.addData(payload);
  code.make();
  const modules = code.getModuleCount(), quiet = 4, size = modules + quiet * 2;
  const dots = [];
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (code.isDark(y, x)) dots.push(`<rect x="${x + quiet}" y="${y + quiet}" width="1" height="1" rx="0.12"/>`);
    }
  }
  // No center cutout; preserve every module and a full four-module quiet zone.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 ${size} ${size}" role="img" aria-labelledby="title desc"><title id="title">Support Value Blocks with Bitcoin</title><desc id="desc">${payload}</desc><rect width="${size}" height="${size}" fill="#fff7ed"/><g fill="#7c2d12">${dots.join('')}</g></svg>\n`;
  return { svg, payload, code, modules, quiet };
}
if (require.main === module) {
  const result = build();
  fs.writeFileSync(path.join(__dirname, '../assets/support-bitcoin.svg'), result.svg);
  console.log(`Generated project support QR: ${result.modules} × ${result.modules}, ECC H, no amount.`);
}
module.exports = { build };
