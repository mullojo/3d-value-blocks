const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
let clock=0,id=0,frames=new Map(),stats,constants=1,draws=0;
const gl=new Proxy({}, {get:(o,key)=>{
  if(key in o)return o[key];
  if(/^[A-Z_0-9]+$/.test(key))return o[key]=constants++;
  if(key==='getShaderParameter'||key==='getProgramParameter')return ()=>true;
  if(key==='drawArraysInstanced')return ()=>{draws++;};
  return (...args)=>({});
}});
const context=vm.createContext({Float32Array,Int32Array,Uint8Array,Math,Array,Object,performance:{now:()=>clock+=.025},devicePixelRatio:1,
  ResizeObserver:class{observe(){}disconnect(){}},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:key=>frames.delete(key)});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../geometry.js'),'utf8'),context);
const api=vm.runInContext(fs.readFileSync(path.join(__dirname,'../gpu-renderer.js'),'utf8')+'\nValueBlockGPU;',context);
const canvas={clientWidth:800,clientHeight:600,width:0,height:0,getContext:()=>gl,addEventListener(){},removeEventListener(){}};
const renderer=api.create(canvas,value=>{stats=value;});
renderer.setPalette([[[240,90,20],[250,120,40],[200,60,10],[255,180,90]]]);renderer.setEnabled(true);
function step(){clock+=16;const list=[...frames.values()];frames.clear();list.forEach(fn=>fn(clock));}
function finish(){for(let i=0;i<20000 && (stats.phase!=='complete'||frames.size);i++)step();assert.equal(stats.phase,'complete');}
for(const n of [1,27,1000,9855,60000,100000]) {
  renderer.reset(n,n===1?'single':'fill',1,false);finish();
  assert.equal(stats.landed,n);assert.equal(stats.active,0);assert.equal(stats.drawCalls,1);
  assert(stats.faces<=24*Math.ceil(Math.cbrt(n))**2,'Only the boundary is rendered');
  if(n===27)assert.equal(stats.faces,54);if(n===1000)assert.equal(stats.faces,600);if(n===100000)assert.equal(stats.faces,13038);
  console.log(`${n.toLocaleString()} logical blocks: ${stats.faces.toLocaleString()} exposed faces, ${stats.drawCalls} draw call.`);
}
renderer.reset(100000,'fill',1,true);
for(let i=0;i<1500;i++)step();
assert(stats.landed>0&&stats.landed<100000,'Large build remains paced');assert(stats.active<=api.MAX_FLYING);assert(stats.drawCalls<=2);
renderer.reset(3,'stack',1,true);finish();assert.equal(stats.landed,3);assert.equal(stats.faces,14,'Switching cancels old arrivals');
renderer.reset(100000,'fill',1,true);for(let i=0;i<200;i++)step();renderer.finishNow();finish();assert.equal(stats.landed,100000);
renderer.reset(60000,'fill',1,false);finish();
renderer.reset(100000,'fill',1,true,true);
for(let i=0;i<3000 && stats.phase==='preparing';i++)step();
assert(stats.landed>=60000,'Growing a fill retains already-landed blocks');
renderer.finishNow();finish();assert.equal(stats.landed,100000);
renderer.reset(60000,'fill',1,true,true);finish();assert.equal(stats.landed,60000,'Shrinking keeps the retained prefix complete');
vm.runInContext(fs.readFileSync(path.join(__dirname,'../time-layout.js'),'utf8'),context);
const time=vm.runInContext('ValueBlockTime',context);
const directions=[[0,0,1],[0,0,-1],[-1,0,0],[1,0,0],[0,1,0],[0,-1,0]];
for(const scope of ['day','week','month','year'])for(const shape of ['columns','cubits']) {
  const model=time.build({anchor:'2024-02-29',scope,shape,min:10,max:20});
  const occupied=new Set(model.cells.map(p=>p.slice(0,3).join(',')));
  const expected=model.cells.reduce((sum,p)=>sum+directions.filter(d=>!occupied.has(p.slice(0,3).map((v,i)=>v+d[i]).join(','))).length,0);
  renderer.reset(model.total,'time',1,false,false,model);finish();
  assert.equal(stats.landed,model.total);assert.equal(stats.faces,expected,'Sparse calendar faces must match independent occupancy');
  assert.equal(stats.drawCalls,1);assert.equal(stats.bounds.join(','),model.bounds.join(','));
}
const empty=time.build({anchor:'2024-02-29',scope:'year',min:0,max:0});
renderer.reset(0,'time',1,false,false,empty);finish();assert.equal(stats.faces,0);assert.equal(stats.landed,0);assert.equal(stats.drawCalls,0);
console.log('Sparse day/week/month/leap-year calendars, both shapes, and empty year passed through the GPU pipeline.');
const geometry=vm.runInContext('BlockGeometry',context);
for(const shape of ['columns','cubits'])for(const n of [100,100000]){
 const model=geometry.arrange(n,shape,'compact');
 renderer.setSettings({groupMode:5});renderer.reset(n,'fill',1,false,false,model);finish();
 assert.equal(stats.landed,n);assert.equal(stats.drawCalls,1);assert.equal(stats.bounds.join(','),model.bounds.join(','));
}
console.log('Count towers/cubit groups through 100k passed the GPU pipeline.');
vm.runInContext(fs.readFileSync(path.join(__dirname,'../film-finale.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../film-credits.js'),'utf8'),context);
const film=vm.runInContext('FilmFinaleModel.build(FilmCreditsData)',context);
renderer.setSettings({groupMode:3,rate:20});renderer.reset(film.total,'film',7,true,false,film);finish();assert.equal(stats.landed,1420);assert.equal(stats.active,0);assert.equal(stats.drawCalls,1);
console.log('Whole-film finale passed: all 1,420 animated arrivals and one completed draw call.');
renderer.setEnabled(false);assert.equal(frames.size,0);renderer.dispose();
console.log('GPU CPU-pipeline checks passed. Shader compilation, appearance and actual frame rate require the browser check.');
