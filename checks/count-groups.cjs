const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const g=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../geometry.js'),'utf8')+';BlockGeometry');
for(const count of [0,1,26,27,28,100,1000,100000])for(const shape of ['columns','cubits'])for(const spacing of ['compact','airy']){
 const m=g.arrange(count,shape,spacing),occupied=new Set();assert.equal(m.cells.length,count);assert.equal(m.groups,Math.ceil(count/27));
 for(const p of m.cells){const key=p.join(',');assert(!occupied.has(key));assert(p[1]===0||occupied.has([p[0],p[1]-1,p[2]].join(',')));occupied.add(key);for(let a=0;a<3;a++)assert(p[a]>=0&&p[a]<m.bounds[a]);}
 if(count>=27&&shape==='cubits')for(let i=0;i<27;i++)assert.deepEqual(Array.from(m.cells[i]),[i%3,Math.floor(i/9),Math.floor(i/3)%3]);
}
console.log('Count groups passed: exact totals through 100k, unique supported cells, bounds, both shapes/spacings, and cubit fill order.');
