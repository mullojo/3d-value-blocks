// Ship a local JS data snapshot so lab.html works from file:// as well as Pages.
const fs = require('node:fs');
const path = require('node:path');
const ledger = require('../docs/value-block-records/ledger.json');
function build() {
  const data = { project:'Value Blocks Lab',people:ledger.contributors,ledger };
  return '/* Generated from the contribution ledger. Run node scripts/build-lab-data.cjs after ledger changes. */\nconst ValueBlocksLabData = '+JSON.stringify(data,null,2)+';\n';
}
if (require.main === module) {
  fs.writeFileSync(path.join(__dirname,'../lab-data.js'),build());
  console.log('Updated the real project journal data snapshot.');
}
module.exports = {build};
