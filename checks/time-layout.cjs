const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context=vm.createContext({Date,Intl,Math,Array,Object,Number,Map,Set});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../geometry.js'),'utf8'),context);
const time=vm.runInContext(fs.readFileSync(path.join(__dirname,'../time-layout.js'),'utf8')+'\nValueBlockTime;',context);
const build=options=>time.build({anchor:'2026-11-16',...options});
const full=build({scope:'day',min:27,max:27});
assert.equal(full.cells.length,27);
for(let i=0;i<27;i++)assert.deepEqual(Array.from(full.cells[i].slice(0,3)),[i%3,Math.floor(i/9),Math.floor(i/3)%3]);
assert.equal(build({scope:'day',min:0,max:0}).cells.length,0);
assert.equal(build({scope:'day',min:0,max:0,overrides:{'2026-11-16':27}}).total,27);
const week=build({scope:'week'}),month=build({scope:'month'}),year=build({scope:'year'});
assert.equal(week.days.length,7);assert.equal(week.days[0].iso,'2026-11-16');assert.equal(week.days[6].iso,'2026-11-22');
assert.equal(build({scope:'week',first:0}).days[0].iso,'2026-11-15');
assert.equal(month.days.length,30);assert.equal(month.days[0].slot,6,'November 2026 starts on Sunday');
assert.equal(year.days.length,365);assert.equal(year.panels.length,12);
assert.equal(build({scope:'year',anchor:'2024-02-29'}).days.length,366);
assert.equal(build({scope:'month',anchor:'2024-02-29'}).days.length,29);
assert.equal(build({scope:'month',anchor:'2100-02-01'}).days.length,28);
assert.equal(build({scope:'year',anchor:'2000-02-29'}).days.length,366);
assert.equal(time.weekStart('2027-01-01',1),'2026-12-28');
assert.equal(time.navigate('2026-12-31','month',1),'2027-01-01');
assert.equal(time.navigate('2024-02-29','year',1),'2025-02-01');
assert.equal(week.days.find(d=>d.iso==='2026-11-16').count,month.days.find(d=>d.iso==='2026-11-16').count);
assert.equal(month.days.find(d=>d.iso==='2026-11-16').count,year.days.find(d=>d.iso==='2026-11-16').count);
for(const scope of ['day','week','month','year'])for(const shape of ['columns','cubits'])for(const yearLayout of ['quarters','gallery']) {
  const model=build({scope,shape,yearLayout}),occupied=new Set();
  assert.equal(model.total,model.days.reduce((sum,d)=>sum+d.count,0));
  for(const d of model.days)assert(d.count>=10&&d.count<=20);
  for(const [x,y,z,code] of model.cells){
    const key=[x,y,z].join(',');assert(!occupied.has(key),'Dates cannot occupy the same cell');
    assert(y===0||occupied.has([x,y-1,z].join(',')),'Every stacked block has support');
    assert(x>=0&&y>=0&&z>=0&&x<model.bounds[0]&&y<model.bounds[1]&&z<model.bounds[2]);
    assert(code>=0&&code<=83);occupied.add(key);
  }
}
const reshuffled=build({scope:'year',seed:2});assert.notEqual(reshuffled.total,year.total);
const february=time.monthDays('2024-02-01',1,{seed:1,min:10,max:20,overrides:{}});
assert.equal(february.filter(Boolean).length,29);assert.equal(february[3].number,1);
console.log('Calendar checks passed: exact cubit order, supported unique cells, stable daily estimates, week starts, month offsets, Gregorian leap years, zero/full days, year layouts and navigation.');

const center=time.project([1,1,1],[3,3,3],800,600,-90,0,1,true);
assert.equal(center.x,400);assert.equal(center.y,300);
const fitted=time.project([10,0,0],[21,27,21],800,600,-65,-12,1,true);
const unfitted=time.project([10,0,0],[21,27,21],800,600,-65,-12,1,true,false);
assert(Math.abs(unfitted.y-300)>Math.abs(fitted.y-300),'Labels respect the Auto fit toggle');

function keysFor(model,value){let offset=0;for(const day of model.days){if(day.iso===value)return model.cells.slice(offset,offset+day.count).map(p=>p[4]);offset+=day.count;}return [];}
const reference=keysFor(build({scope:'day'}),'2026-11-16');
for(const scope of ['week','month','year'])for(const shape of ['columns','cubits'])for(const spacing of ['compact','airy'])assert.deepEqual(keysFor(build({scope,shape,spacing}),'2026-11-16'),reference,'Per-block colors remain stable across calendar arrangements');
assert(new Set(reference.map(key=>key%17)).size>3,'A daily stack contains varied Tailwind families');
for(const cell of year.cells){const packed=cell[3]+128*cell[4];assert.equal(new Float32Array([packed])[0],packed);assert.equal(packed%128,cell[3]);assert.equal(Math.floor(packed/128),cell[4]);}
assert(build({scope:'week'}).pitch<build({scope:'week',spacing:'airy'}).pitch);
assert(build({scope:'month'}).pitch<build({scope:'month',spacing:'airy'}).pitch);
const tags=time.placeLabels([{kind:'day',x:100,y:100},{kind:'day',x:100,y:100},{kind:'day',x:110,y:110}],500);
for(let i=0;i<tags.length;i++){
 assert(tags[i].y<tags[i].anchorY,'Count tags stay above their anchors');
 for(let j=0;j<i;j++)assert(Math.abs(tags[i].x-tags[j].x)>=(tags[i].width+tags[j].width)/2||tags[i].y-tags[i].height>=tags[j].y||tags[j].y-tags[j].height>=tags[i].y,'Tags must not overlap');
}
assert.equal(year.panels.reduce((sum,p)=>sum+p.total,0),year.total);
console.log('Stable random colors, exact GPU metadata packing, compact spacing, top label placement and monthly totals passed.');

for(const shape of ['columns','cubits']) {
 const compact=build({scope:'year',shape}),airy=build({scope:'year',shape,spacing:'airy'});
 assert(compact.pitch<airy.pitch);
 assert(compact.bounds[0]<airy.bounds[0]&&compact.bounds[2]<airy.bounds[2]);
 let offset=0;for(const day of compact.days){for(const cell of compact.cells.slice(offset,offset+day.count))assert.equal(cell[5],day.count);offset+=day.count;}
}
assert.equal(time.intensityShade(1),200);assert.equal(time.intensityShade(27),800);
for(let n=2;n<=27;n++)assert(time.intensityShade(n)>=time.intensityShade(n-1));
assert(time.intensityShade(10)<time.intensityShade(20));
console.log('Compact year bounds and monotonic daily-total gradient passed.');
