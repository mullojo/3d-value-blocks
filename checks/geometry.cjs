const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const geometry = vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '../geometry.js'), 'utf8') + '\nBlockGeometry;');
for (const seed of [1, 2, 39]) {
  const full = geometry.fill(1000, seed);
  const occupied = new Set();
  full.forEach(([x, y, z], index) => {
    const key = [x, y, z].join(',');
    assert(!occupied.has(key), 'Every block occupies a unique cell');
    assert(y === 0 || occupied.has([x, y - 1, z].join(',')), 'Every new block has support below');
    occupied.add(key);
    assert(Math.max(x, y, z) <= Math.ceil(Math.cbrt(index + 1)) - 1, 'Growing shells keep the group compact');
  });
  for (const n of [1, 6, 27, 100, 337, 999, 1000]) {
    const blocks = geometry.fill(n, seed);
    assert.equal(blocks.length, n);
    assert.equal(JSON.stringify(blocks), JSON.stringify(full.slice(0, n)), 'Increasing the slider retains existing blocks');
  }
  const cubit = geometry.fill(27, seed);
  assert.equal(new Set(cubit.map(p => p.join(','))).size, 27);
  assert(cubit.every(p => p.every(v => v >= 0 && v < 3)), 'A perfect cubit is exactly 3 × 3 × 3');
}
assert.notEqual(JSON.stringify(geometry.fill(100, 1)), JSON.stringify(geometry.fill(100, 2)), 'Reshuffling changes the fill order');
const root = require('node:path').join(__dirname, '../archived/v1-simple-start');
const hashes = JSON.parse(fs.readFileSync(root + '/baseline-sha256.json'));
for (const [name, hash] of Object.entries(hashes)) assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(root + '/' + name)).digest('hex'), hash, 'Baseline remains unchanged: ' + name);
console.log('Geometry checks passed: counts, cubit, unique cells, support, stable growth, shuffle, and intact baseline.');

// Bound the actual exposed surfaces plus the capped in-flight population.
for (const seed of [1, 2, 39]) {
  const cells = geometry.fill(1000, seed), occupied = new Set();
  let surface = 0, peak = 0;
  const neighbors = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  for (let landed = 0; landed <= 1000; landed++) {
    peak = Math.max(peak, surface + Math.min(32, 1000 - landed) * 6);
    if (landed === 1000) break;
    const cell = cells[landed];
    surface += 6 - 2 * neighbors.filter(d => occupied.has(cell.map((v,i) => v + d[i]).join(','))).length;
    occupied.add(cell.join(','));
  }
  assert.equal(surface, 600, 'A completed thousand-block group has 600 exterior faces');
  assert(peak < 1000, 'Streaming arrivals plus exposed landed faces stay below 1,000 faces');
  console.log(`Seed ${seed}: conservative animated-face bound ${peak}, completed faces ${surface}.`);
}

const large = geometry.fill(100000, 1), cells = new Set();
for (const [x,y,z] of large) {
  const key=[x,y,z].join(',');assert(!cells.has(key));
  assert(y===0||cells.has([x,y-1,z].join(',')));cells.add(key);
}
assert.equal(cells.size,100000);
console.log('100,000-cell uniqueness and support checks passed.');
const secondArchive=pathForArchive();
function pathForArchive(){return require('node:path').join(__dirname,'../archived/v2-paced-css');}
for(const [name,hash] of Object.entries(JSON.parse(fs.readFileSync(secondArchive+'/baseline-sha256.json')))) assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(secondArchive+'/'+name)).digest('hex'),hash);
console.log('Paced CSS archive checksums passed.');
