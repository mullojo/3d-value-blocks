const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const hooks={mounted:[],unmounted:[],watch:[]},frames=new Map(),events=[];let id=0,time=0,timeStep=.01;
class Node {
  constructor(fragment=false){this.fragment=fragment;this.children=[];this.style={};this.className='';}
  append(node){this.children.push(...(node.fragment?node.children:[node]));}
  replaceChildren(){this.children=[];}
  cloneNode(){const node=new Node();node.className=this.className;node.children=this.children.map(c=>c.cloneNode());return node;}
}
const context=vm.createContext({
  Vue:{ref:value=>({value}),computed:fn=>({get value(){return fn();}}),onMounted:fn=>hooks.mounted.push(fn),onBeforeUnmount:fn=>hooks.unmounted.push(fn),watch:(source,fn)=>hooks.watch.push(fn)},
  document:{createElement:()=>new Node(),createDocumentFragment:()=>new Node(true)},
  performance:{now:()=>time+=timeStep},
  requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:key=>frames.delete(key)
});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../cube-materials.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../lab.js'),'utf8').split('Vue.createApp({')[0],context);
const mesh=vm.runInContext('LabStaticMesh',context),host=new Node();
const blocks=n=>Array.from({length:n},(_,i)=>({id:i,position:[i*136,0,0]}));
const props={blocks:blocks(300),kind:'robot',family:'cyan',glass:4,fill:0};
const result=mesh.setup(props,{emit:(name,value)=>events.push([name,value])});result.host.value=host;hooks.mounted[0]();
function nextFrame(){const [key,fn]=frames.entries().next().value;frames.delete(key);fn();}
assert.equal(host.children.length,0,'Large geometry waits for a frame');
nextFrame();assert.equal(host.children.length,128,'At most 128 cubes are inserted per frame');
while(frames.size)nextFrame();assert.equal(host.children.length,300);
assert(host.children.every(n=>n.children.length===6),'Every cube retains all six faces');
assert.equal(host.children[299].style.transform,'translate3d(40664px,0px,0px)');
assert.equal(events.at(-1)[1],false,'Completion clears the preparing indicator');
props.blocks=blocks(1000);hooks.watch[0]();nextFrame();assert.equal(host.children.length,128);
props.blocks=blocks(20);hooks.watch[0]();assert.equal(host.children.length,20,'New small scopes replace the old build');
assert.equal(frames.size,0,'Old frames are canceled');
timeStep=1;props.blocks=blocks(1000);hooks.watch[0]();nextFrame();assert.equal(host.children.length,4,'The time budget can stop a frame before its cube cap');hooks.unmounted[0]();assert.equal(frames.size,0,'Unmount cancels pending work');
console.log('Static lab meshes passed: short 128-cube batches, all six original faces, exact transforms, latest-scope replacement and cancellation.');
