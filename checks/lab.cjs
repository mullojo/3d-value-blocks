const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const ledger=require('../docs/value-block-records/ledger.json');
const model=require('../lab-model.js');
const generated=require('../scripts/build-lab-data.cjs').build();
assert.equal(fs.readFileSync(path.join(root,'lab-data.js'),'utf8'),generated,'Public journal snapshot follows the ledger');
const context=vm.createContext({});vm.runInContext(generated,context);
const data=vm.runInContext('ValueBlocksLabData',context);
assert.equal(data.project,'Value Blocks Lab');assert.deepEqual(Array.from(data.people,p=>p.name),['Bob','Lindsay']);for(const person of data.people)assert(fs.existsSync(path.join(root,person.image)));
assert.equal(ledger.additionalContributions.length,7);
assert.equal(ledger.periods.filter(p=>p.status==='contributor-confirmed').reduce((n,p)=>n+p.blocks,0),21);
assert.equal(ledger.periods.at(-1).status,'chat-estimated');
for(const scenario of Object.keys(model.scenarios)) {
  const whole=model.build(ledger,scenario);
  const expected=ledger.scenarios[scenario];
  assert.equal(whole.human,31);assert.equal(whole.robot,expected.robotBlocks);assert.equal(whole.totalValue,expected.combinedEquivalentUSD);
  assert.equal(whole.gift,null,'No fictional gift records added');
  for(const periodId of ['all',...ledger.periods.map(p=>p.id)]) {
    const view=model.build(ledger,scenario,periodId);
    assert.equal(view.human+view.robot,view.total);
    assert.equal(view.humanValue+view.robotValue,view.totalValue);
    assert.equal(view.combined.blocks.length,view.total);
    assert.equal(view.humanGroup.blocks.length,view.human);
    assert.equal(view.robotGroup.blocks.length,view.robot);
    for(const g of [view.combined,view.humanGroup,view.robotGroup]) {
      const occupied=new Set();
      for(const b of g.blocks) {
        const cell=[b.x,b.y,b.z].join(',');assert(!occupied.has(cell));
        assert(b.y===0||occupied.has([b.x,b.y-1,b.z].join(',')),'Bottom layer fills first with support below');
        occupied.add(cell);assert(b.position.every(Number.isFinite));
      }
      assert.equal(g.batches.reduce((n,b)=>n+b.blocks.length,0),g.total);
    }
    const first=view.records[0];assert.equal(first.kind,'human');
    for(const record of view.records) {
      const blocks=view.combined.blocks.filter(b=>b.entryId===record.id);
      assert.equal(blocks.length,record.count);
      assert(blocks.every(b=>b.kind===record.kind && b.family===record.family),'Every contribution has one material and color');
    }
  }
}
const working=model.build(ledger);assert.equal(working.robot,689);assert.equal(working.total,720);assert.equal(working.totalValue,72000);
assert.throws(()=>model.build(ledger,'unknown'),RangeError);assert.throws(()=>model.build(ledger,'working','unknown'),RangeError);
const session=model.createSession(ledger),cached=session.build();
assert.equal(typeof Object.getOwnPropertyDescriptor(cached,'combined').get,'function','Combined geometry stays lazy until visited');
const robotGeometry=cached.robotGroup;
assert.equal(typeof Object.getOwnPropertyDescriptor(cached,'combined').get,'function','A separate group does not build the combined scene');
session.build('deep');session.build('working',ledger.periods[0].id);
assert.strictEqual(session.build(),cached,'Returning to a scenario/scope reuses its model');
assert.strictEqual(session.build().robotGroup,robotGeometry,'Geometry identity survives view visits');
const rendered=model.periods(ledger);
assert(rendered.every(p=>p.entries.some(e=>e.contributor==='Lindsay')&&p.entries.some(e=>e.contributor==='Bob')));
const html=fs.readFileSync(path.join(root,'lab.html'),'utf8');
assert(!/<(?:lab-stack|lab-mini|lab-robot-preview|lab-viewer)\b[^>]*\/>/.test(html),'In-DOM Vue custom elements need explicit end tags');
assert(html.includes('Gift blocks: not recorded'));
const index=fs.readFileSync(path.join(root,'README.md'),'utf8');assert(index.includes('https://mullojo.github.io/3d-value-blocks/lab.html'));
console.log('Lab passed: ledger-derived data, two real contributors with distinct reporting status, exact three-scenario/per-period geometry and values, uniform entry colors, supported bottom-first stacks, real portrait, no invented gifts, and file-based template structure.');
