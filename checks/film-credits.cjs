const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'film-credits.js'),'utf8');
const data=vm.runInNewContext(source+';FilmCreditsData');
assert.equal(data.entries.length,24);assert.equal(data.total,1420);
assert.equal(new Set(data.entries.map(e=>e.id)).size,24);assert.equal(new Set(data.entries.map(e=>e.image)).size,24);
for(const e of data.entries){assert(data.departments.some(d=>d.id===e.department));assert(Number.isInteger(e.count)&&e.count>0);assert.equal(e.work.length,3);assert(fs.statSync(path.join(root,e.image)).size>1000);}
for(const d of data.departments)assert.equal(data.entries.filter(e=>e.department===d.id).length,4);
assert.equal(data.total*100,142000);assert.equal(data.total*1000,1420000);
for(const width of [24,90,200,350])for(const count of [1,24,48,96,120]){const l=data.stripLayout(count,width);assert(l.columns>=1);assert.equal(l.rows,Math.ceil(count/l.columns));assert(l.columns*8<=width-4);assert(l.height>=l.rows*10);}

// Exercise the actual component's playback/drag controller against a fake viewport and frame clock.
let clock=0,id=0,frames=new Map(),mounts=[],unmounts=[],watches=[],intersection,mediaChange,reduced=false;
const events=new Map(),document={hidden:false,addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n)};
const Vue={ref:value=>({value}),computed:fn=>({get value(){return fn();}}),watch:(get,fn)=>watches.push({get,fn,old:get()}),nextTick:fn=>fn(),onMounted:fn=>mounts.push(fn),onUnmounted:fn=>unmounts.push(fn)};
const context=vm.createContext({Vue,document,performance:{now:()=>clock},matchMedia:()=>({get matches(){return reduced;},addEventListener:(n,f)=>mediaChange=f,removeEventListener(){mediaChange=null;}}),IntersectionObserver:class{constructor(fn){intersection=fn;}observe(){intersection([{isIntersecting:true}]);}disconnect(){}},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:key=>frames.delete(key)});
vm.runInContext(fs.readFileSync(path.join(root,'film-finale.js'),'utf8'),context);
vm.runInContext(source,context);const component=vm.runInContext('createFilmCredits({})',context),props={active:false,modelValue:100},app=component.setup(props,{emit(){}});
const viewport={_top:0,scrollHeight:4000,clientHeight:500,get scrollTop(){return this._top;},set scrollTop(n){this._top=Math.max(0,Math.min(3500,n));},setPointerCapture(){},getBoundingClientRect:()=>({top:0,right:600}),querySelector:()=>({getBoundingClientRect:()=>({top:900-viewport.scrollTop})})};
app.viewport.value=viewport;
function flush(){for(const w of watches){const next=w.get();if(next.some((v,i)=>v!==w.old[i])){w.old=next;w.fn(next);}}}
function step(ms=16){clock+=ms;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(clock));flush();}
mounts.forEach(fn=>fn());flush();assert.equal(frames.size,0,'Hidden layout does not animate');
props.active=true;flush();for(let i=0;i<60;i++)step();assert(viewport.scrollTop>20&&viewport.scrollTop<30,'Auto-roll advances at the selected speed');
app.pause();flush();assert.equal(frames.size,0);const stopped=viewport.scrollTop;step();assert.equal(viewport.scrollTop,stopped);
app.playing.value=true;flush();document.hidden=true;events.get('visibilitychange')();assert.equal(frames.size,0);document.hidden=false;events.get('visibilitychange')();assert.equal(frames.size,1);
intersection([{isIntersecting:false}]);flush();assert.equal(frames.size,0,'Offscreen roll is suspended');intersection([{isIntersecting:true}]);flush();assert.equal(frames.size,1);
app.select(data.entries[1]);flush();assert.equal(app.current.value.name,'Noah Chen');assert.equal(app.playing.value,false,'Selection pauses playback');
viewport.scrollTop=500;app.pointerDown({button:0,clientX:100,clientY:200});app.pointerMove({clientY:140,pointerId:1,preventDefault(){}});assert.equal(viewport.scrollTop,560);app.pointerUp();assert.equal(app.dragging.value,false);
let blocked=false;app.captureClick({preventDefault(){blocked=true;},stopPropagation(){}});assert(blocked,'Dragging does not accidentally select a credit');app.select(data.entries[2]);assert.equal(app.current.value.name,'Noah Chen');clock+=300;app.select(data.entries[2]);assert.equal(app.current.value.name,'Amina Brooks');
app.department.value='camera';app.jump();assert.equal(viewport.scrollTop,872);assert.equal(app.playing.value,false);
app.replay();flush();assert.equal(viewport.scrollTop,0);assert.equal(app.playing.value,true);reduced=true;mediaChange();flush();assert.equal(app.playing.value,false);app.replay();flush();assert.equal(app.playing.value,false,'Restart respects reduced motion');
reduced=false;viewport.scrollTop=3500;app.playing.value=true;flush();step();assert.equal(app.playing.value,false);assert.equal(app.progress.value,100,'Roll stops at the ending');assert.equal(app.finale.value,true,'Reaching the end opens the finale');app.showCredits();flush();assert.equal(app.finale.value,false);app.endFilm(true);flush();assert.equal(app.finale.value,true,'The finale can be previewed again');app.replay();flush();assert.equal(app.finale.value,false);assert.equal(viewport.scrollTop,0);
unmounts.forEach(fn=>fn());assert.equal(frames.size,0);assert.equal(events.size,0);
console.log('Film credits passed: 24 local portraits, 1,420 exact blocks, six departments, strip bounds, playback/pause, offscreen/background suspension, drag suppression, selection, jumps, restart, reduced motion, ending and cleanup.');
