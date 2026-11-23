const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const ledger = require('../docs/value-block-records/ledger.json');
const inventory = require('../docs/value-block-records/source-inventory.json');
const human = fs.readFileSync(path.join(root, 'docs/HUMAN_VALUE_BLOCKS.md'), 'utf8');
const robot = fs.readFileSync(path.join(root, 'docs/ROBOT_VALUE_BLOCKS.md'), 'utf8');
const close = (a,b) => assert(Math.abs(a-b) < 1e-9, `${a} != ${b}`);
assert.equal(new Set(ledger.periods.map(p => p.id)).size, ledger.periods.length);
const additions=ledger.additionalContributions||[];
const originalHuman=ledger.periods.reduce((n,p)=>n+p.blocks,0),addedHuman=additions.reduce((n,e)=>n+e.blocks,0);
assert.equal(originalHuman,24);assert.equal(addedHuman,7);
assert.equal(ledger.periods.filter(p=>p.status==='contributor-confirmed').reduce((n,p)=>n+p.blocks,0),21);
assert.equal(new Set(additions.map(e=>e.id)).size,additions.length);
assert.equal(new Set(additions.filter(e=>!e.supplemental).map(e=>e.date)).size,6);
assert.equal(additions.filter(e=>e.supplemental).length,1);
assert.equal(ledger.humanBlocks,originalHuman+addedHuman);
assert.equal(new Set(additions.map(e=>e.date)).size,6);
assert(additions.every(e=>e.contributor==='Lindsay'&&e.blocks===1&&e.status==='reported-by-Bob'&&e.reportedBy==='Bob'));
assert.equal(ledger.contributors.reduce((n,p)=>n+p.blocks,0),ledger.humanBlocks);
for(const e of additions){const p=ledger.periods.find(p=>p.id===e.periodId);assert(p && e.date>=p.start && e.date<=p.end);}
assert.equal(ledger.humanValueUSD, ledger.humanBlocks*ledger.blockBaselineUSD);
assert.equal(ledger.giftResourcesRecorded, null, 'Unreconciled gifts are not a zero received balance');
const squares = [...human.matchAll(/^([🟥🟧🟨🟩🟦🟪🟫]+) .*?\*\*(\d+) human blocks? · \$([\d,]+)\*\*/gmu)];
const allEntries=ledger.periods.flatMap(p=>p.entries).concat(additions);
assert.equal(squares.length,allEntries.length);
for (const [i,entry] of allEntries.entries()) {
  assert.equal(squares[i][1],entry.color.repeat(entry.blocks));
  assert.equal(Number(squares[i][2]),entry.blocks);
  assert.equal(Number(squares[i][3].replaceAll(',','')),entry.blocks*100);
}
for (const period of ledger.periods) {
  assert(period.start <= period.end && period.end <= ledger.prepared);
  assert(period.blocks > 0 && period.blocks <= 27);
  assert.equal(period.entries.reduce((n,e)=>n+e.blocks,0),period.blocks);
  assert.equal(period.humanValueUSD,period.blocks*100);
  for (const file of period.evidence) assert(fs.existsSync(path.join(root,file)),file);
  for (const [scenario,key,index] of [['fast','fastHours',0],['working','workingHours',1],['deep','deepHours',2]]) {
    const direct=ledger.manualWorkloads.filter(l=>l.periodId===period.id).reduce((n,l)=>n+l[key],0);
    assert.equal(period.manualHours[scenario],direct+ledger.sharedVerificationAllocation[period.id][index]);
    assert.equal(period.robotBlocks[scenario],period.manualHours[scenario]-period.blocks);
  }
}
for (const [scenario,key,index] of [['fast','fastHours',0],['working','workingHours',1],['deep','deepHours',2]]) {
  const extra=ledger.additionalHumanWorkloads.reduce((n,l)=>n+l[key],0);
  assert.equal(extra,addedHuman);
  const budget=ledger.manualWorkloads.reduce((n,l)=>n+l[key],0)+extra,s=ledger.scenarios[scenario];
  assert.equal(ledger.manualWorkloads.find(l=>l.periodId===null)[key],Object.values(ledger.sharedVerificationAllocation).reduce((n,a)=>n+a[index],0));
  assert.equal(s.manualEquivalentHours,budget);
  assert.equal(s.robotBlocks,budget-ledger.humanBlocks);
  assert.equal(s.robotBlocks,ledger.periods.reduce((n,p)=>n+p.robotBlocks[scenario],0));
  assert.equal(s.robotBlocks-ledger.periods.at(-1).robotBlocks[scenario],ledger.originalBaseline.scenarios[scenario].robotBlocks,'Only the new implementation scope adds robot expansion');
  close(s.grossGain,s.robotMultiple+1);
  close(s.grossGain,budget/ledger.humanBlocks);
  assert.equal(s.combinedEquivalentUSD,s.humanValueUSD+s.robotEquivalentUSD);
}
assert.equal(inventory.snapshotCommit,ledger.snapshotCommit);
// Keep normal checks usable from a downloaded ZIP with no .git directory.
// Full reproduction is an explicit optional command against the frozen Git ref.
for (const key of ['bytes','physicalLines','nonblankLines','nonWhitespaceCharacters']) {
  assert.equal(inventory.totals[key],inventory.files.reduce((n,f)=>n+f[key],0));
}
assert.equal(inventory.totals.files,inventory.files.length);
assert.equal(new Set(inventory.files.map(f=>f.path)).size,inventory.files.length);
close(inventory.totals.sourceUnits80Characters,inventory.totals.nonWhitespaceCharacters/80);
const evidence = require('../docs/value-block-records/chat-evidence.json');
assert.equal(evidence.completedTurns,evidence.days.reduce((n,d)=>n+d.completedTurns,0));
assert.equal(evidence.assistantTurnaroundSeconds,evidence.days.reduce((n,d)=>n+d.assistantTurnaroundSeconds,0));
assert(human.includes('31 human value blocks') && human.includes('$3,100'));
assert(robot.includes('31 human blocks + 689 robot blocks = 720'));
for (const file of ['README.md','SUPPORT.md']) {
  const content=fs.readFileSync(path.join(root,file),'utf8');
  assert(content.includes('31 human blocks') && content.includes('$3,100'),`${file} summary agrees`);
}
console.log('Value records passed: 31 human blocks across two contributors, original daily Lindsay reports and one explicit follow-up, matching squares and values, all three robot budgets, exact period allocation, and consistent 39-file source inventory / chat timing evidence.');
