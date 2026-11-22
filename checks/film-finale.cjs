const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),context=vm.createContext({});
for(const file of ['geometry.js','film-finale.js','film-credits.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const data=vm.runInContext('FilmCreditsData',context),model=vm.runInContext('FilmFinaleModel.build(FilmCreditsData)',context);
assert.equal(model.total,data.total);assert.equal(model.cells.length,1420);
const occupied=new Set(),colors=new Map();
for(const p of model.cells){assert(!occupied.has(p.slice(0,3).join(',')));assert(p[1]===0||occupied.has([p[0],p[1]-1,p[2]].join(',')));occupied.add(p.slice(0,3).join(','));assert(p[4]>=0&&p[4]<data.departments.length);colors.set(p[4],(colors.get(p[4])||0)+1);for(let a=0;a<3;a++)assert(p[a]>=0&&p[a]<model.bounds[a]);}
for(let i=0;i<data.departments.length;i++)assert.equal(colors.get(i),data.entries.filter(e=>e.department===data.departments[i].id).reduce((n,e)=>n+e.count,0),'Department colors retain the exact contributed block totals');
const qr=require('../vendor/qrcode-generator.js'),meta=JSON.parse(fs.readFileSync(path.join(root,'journal-assets/film-giving-concept.json'),'utf8')),code=qr(0,'H');
assert(new URL(meta.payload).hostname.endsWith('.example'));assert.equal(meta.quietZoneModules,4);code.addData(meta.payload);code.make();assert.equal(code.getModuleCount(),meta.modules);
const generated=require('../scripts/build-film-qr.cjs').build();
assert.equal(fs.readFileSync(path.join(root,'journal-assets/film-giving-concept.svg'),'utf8'),generated.svg);assert.deepEqual(meta,generated.meta);assert.equal(meta.errorCorrection,'H');assert.equal(meta.centerSymbol,'spark');assert.equal(meta.dots,'circles');
function luminance(hex){const rgb=hex.match(/[0-9a-f]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
assert((luminance(meta.ink)+.05)/(luminance(meta.paper)+.05)>7,'The integrated gold retains strong contrast');
console.log('Finale passed: all 1,420 supported unique cells, bounds, exact department colors, and reproducible concept QR with a reserved demo address and quiet zone.');
