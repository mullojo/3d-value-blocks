const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'film-finale.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'film-credits.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'journal.js'),'utf8'),context);
const data=vm.runInContext('ValueJournal',context),mini=vm.runInContext('JournalBlocks',context);
const ids=new Set(),daily=new Map();
for(const e of data.entries){
 assert(!ids.has(e.id));ids.add(e.id);assert(data.projects.some(p=>p.id===e.project));assert(data.people.some(p=>p.id===e.person));assert(data.frames[e.frame]);assert(Number.isInteger(e.count)&&e.count>0&&e.count<=27);assert.equal(new Date(e.date+'T12:00:00Z').toISOString().slice(0,10),e.date);
 const key=e.project+e.date+e.person;daily.set(key,(daily.get(key)||0)+e.count);
}
for(const n of daily.values())assert(n<=27,'Sample contributor totals respect daily capacity');
for(const p of data.people)assert(fs.statSync(path.join(root,p.image)).size>1000,'Portrait is bundled locally');
for(const p of data.projects){const entries=data.entries.filter(e=>e.project===p.id),total=data.sum(entries);assert(total>0);assert.equal(total,entries.reduce((n,e)=>n+e.count,0));for(const value of [100,1000])assert.equal(total*value,entries.reduce((n,e)=>n+e.count*value,0));}
assert.equal(data.sum(data.entries.filter(e=>e.project==='life')),30);
assert.equal(data.sum(data.entries.filter(e=>e.project==='bay')),16);
assert.equal(data.sum(data.entries.filter(e=>e.project==='joy')),15);
assert.equal(data.dayName('2026-11-17'),'Tuesday, November 17');
console.log('Journal data passed: unique entries, valid projects/frames/contributors, real dates, daily capacity, local portraits, filtered totals and modeled values.');

for(const shape of ['row','tower','cubit'])for(const count of [0,1,2,9,27,30]){
 const positions=mini.computed.positions.call({count,shape}),occupied=new Set();assert.equal(positions.length,count);
 for(const p of positions){assert(!occupied.has(p.join(',')));assert(p[1]===0||occupied.has([p[0],p[1]-1,p[2]].join(',')));occupied.add(p.join(','));}
}
console.log('Journal miniatures passed: exact quantities, unique positions and supported stacks, including 30-block aggregates.');
