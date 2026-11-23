/* Real project journal. Appearance controls never modify the confirmed records. */
/* Static six-face cubes are appended in short frame-budgeted batches. Vue owns
   the material wrapper and camera, rather than thousands of unchanged faces. */
let labCubeTemplate;
const LabStaticMesh={
  props:{blocks:Array,kind:String,family:String,glass:Number,fill:Number},emits:['building'],
  setup(props,{emit}){
    const {ref,computed,onMounted,onBeforeUnmount,watch}=Vue;
    const host=ref(null);let frame=0,generation=0,pending=false;
    const material=computed(()=>TypesBlock.computed.style.call({kind:props.kind,family:props.family,glass:props.glass,fill:props.fill,position:[0,0,0]}));
    function setPending(value){if(pending!==value){pending=value;emit('building',value);}}
    function build(){
      cancelAnimationFrame(frame);const token=++generation;
      if(!host.value)return;
      if(!labCubeTemplate){labCubeTemplate=document.createElement('div');for(const face of ['front','back','left','right','top','bottom']){const node=document.createElement('div');node.className='face face-'+face;labCubeTemplate.append(node);}}
      const blocks=props.blocks||[];let index=0;
      host.value.replaceChildren();setPending(blocks.length>0);
      function append(){
        if(token!==generation||!host.value)return;
        const fragment=document.createDocumentFragment(),start=performance.now();let count=0;
        while(index<blocks.length && count<128 && (count===0||performance.now()-start<4)){
          const block=blocks[index++],node=labCubeTemplate.cloneNode(true);
          node.className='cube types-block '+props.kind;
          node.style.transform='translate3d('+block.position.join('px,')+'px)';
          fragment.append(node);count++;
        }
        host.value.append(fragment);
        if(index<blocks.length)frame=requestAnimationFrame(append);else setPending(false);
      }
      if(blocks.length<=32)append();else frame=requestAnimationFrame(append);
    }
    onMounted(build);watch(()=>props.blocks,build);
    onBeforeUnmount(()=>{generation++;cancelAnimationFrame(frame);setPending(false);});
    return {host,material};
  },
  template:`<div ref="host" class="types-mesh" :style="material"></div>`
};
const LabStack = {
  components:{LabStaticMesh},
  props:{geometry:Object,fitGeometry:Object,yaw:Number,tilt:Number,zoom:Number,compact:Boolean,gpu:Boolean,showHuman:{default:true},showRobot:{default:true}},
  setup(props) {
    const {ref,computed,onMounted,onBeforeUnmount,shallowReactive}=Vue;
    const pending=shallowReactive({});
    const building=computed(()=>Object.values(pending).some(Boolean));
    function setBuilding(id,value){pending[id]=value;}
    const {watch}=Vue;
    const frame=ref(null),canvas=ref(null),width=ref(0),height=ref(0),glassReady=ref(false),checkingGlass=ref(props.gpu);
    const robotBatch=computed(()=>props.gpu ? props.geometry.batches.find(batch=>batch.kind==='robot') : undefined);
    let observer,renderer,paint=0;

    const scale=computed(()=>{
      if (!width.value || !height.value) return 0;
      const g=props.fitGeometry||props.geometry;
      // Bound all camera angles at 100%, including CSS perspective magnification.
      const horizontal=Math.hypot(g.side,g.side)*136;
      const diameter=Math.hypot(g.side,g.height,g.side)*136;
      const room=Math.min((width.value-(props.compact?12:26))/horizontal,
        (height.value-(props.compact?10:24))/diameter);
      const depthCorrection=1+Math.max(room,0)*diameter/3600;
      return Math.max(0,room/depthCorrection)*props.zoom;
    });
    const transform=computed(()=>`rotateX(${props.tilt}deg) rotateY(${props.yaw}deg) scale3d(${scale.value},${scale.value},${scale.value})`);
    function paintGlass(){
      cancelAnimationFrame(paint);
      if(!renderer || !robotBatch.value || !props.showRobot || !scale.value)return;
      paint=requestAnimationFrame(()=>{
        renderer.draw(robotBatch.value.blocks,width.value,height.value,props.yaw,props.tilt,scale.value);
      });
    }
    function loseGlass(){
      glassReady.value=false;
      cancelAnimationFrame(paint);
      renderer?.dispose();
      renderer=null;
    }
    onMounted(()=>{
      // Measure before the first paint; hidden layouts stay unmeasured until shown.
      width.value=frame.value.clientWidth;
      height.value=frame.value.clientHeight;
      observer=new ResizeObserver(([entry])=>{
        if (entry.contentRect.width && entry.contentRect.height) {
          width.value=entry.contentRect.width;
          height.value=entry.contentRect.height;
        }
      });
      observer.observe(frame.value);
    });
    watch(canvas,node=>{
      loseGlass();
      if (!node) return;
      try {renderer=LabGlass.create(node);} catch {renderer=null;}
      glassReady.value=Boolean(renderer);
      checkingGlass.value=false;
      paintGlass();
    },{flush:'post'});
    watch([width,height,scale,robotBatch,()=>props.yaw,()=>props.tilt,()=>props.showRobot],paintGlass,{flush:'post'});
    onBeforeUnmount(()=>{observer?.disconnect();loseGlass();});
    return {frame,canvas,scale,transform,building,setBuilding,robotBatch,glassReady,checkingGlass,loseGlass};
  },
  template:`<div ref="frame" class="lab-stack-scene">
    <canvas v-if="robotBatch" v-show="glassReady && showRobot" ref="canvas" class="lab-glass-canvas" aria-hidden="true" @webglcontextlost="loseGlass"></canvas>
    <div v-if="scale" class="lab-stack-world" :style="{transform}" aria-hidden="true">
      <template v-for="batch in geometry.batches" :key="batch.id">
        <lab-static-mesh v-if="batch!==robotBatch || (!glassReady && !checkingGlass)" v-show="batch.kind==='human'?showHuman:showRobot" :blocks="batch.blocks" :kind="batch.kind" :family="batch.family" :glass="4" :fill="0" @building="setBuilding(batch.id,$event)"/>
      </template>
    </div>
    <span v-if="building" class="lab-stack-progress" role="status">Preparing blocks…</span>
  </div>`

};
const LabMini = {
  components:{TypesBlock},props:{entry:Object},
  computed:{family(){return ValueBlocksLabModel.families[this.entry.color]||'orange';}},
  template:`<div class="lab-mini" role="img" :aria-label="entry.blocks+' solid '+family+' human '+(entry.blocks===1?'block':'blocks')"><div class="lab-mini-world" aria-hidden="true"><types-block v-for="i in entry.blocks" :key="i" kind="human" :family="family" :fill="0" :position="[(i-1-(entry.blocks-1)/2)*136,0,0]"/></div></div>`
};
const LabRobotPreview = {
  components:{LabStack},props:{count:Number},
  setup(props){
    const {ref,computed,onMounted,onBeforeUnmount}=Vue;
    const frame=ref(null),visible=ref(false);let observer;
    onMounted(()=>{observer=new IntersectionObserver(entries=>{visible.value=entries[0].isIntersecting;},{rootMargin:'180px'});observer.observe(frame.value);});
    onBeforeUnmount(()=>observer?.disconnect());
    const geometry=computed(()=>ValueBlocksLabModel.geometry([{id:'period-preview',kind:'robot',family:'cyan',count:visible.value?props.count:0}]));
    return {frame,visible,geometry};
  },
  template:`<div ref="frame" class="lab-period-preview" role="img" :aria-label="count+' translucent robot value blocks'"><lab-stack v-if="visible" :geometry="geometry" :yaw="-32" :tilt="-22" :zoom="1" compact/></div>`
};
const LabStageLayout={
  components:{LabStack},props:{model:Object,layout:String,gpu:Boolean,showHuman:Boolean,showRobot:Boolean,yaw:Number,tilt:Number,zoom:Number},
  template:`<div :class="['lab-mode-layout',layout]">                <template v-if="layout==='separate'"><div class="lab-stage-group human-stage"><lab-stack v-show="showHuman" :geometry="model.humanGroup" :fit-geometry="model.bounds" :yaw="yaw" :tilt="tilt" :zoom="zoom"></lab-stack><div v-if="!showHuman" class="lab-hidden">Human blocks hidden</div><div class="lab-group-label"><b>{{model.human}}</b><span>human blocks</span><small>Solid · human contributions</small></div></div><div class="lab-stage-group robot-stage"><lab-stack v-show="showRobot" :geometry="model.robotGroup" :gpu="gpu" :fit-geometry="model.bounds" :yaw="yaw" :tilt="tilt" :zoom="zoom"></lab-stack><div v-if="!showRobot" class="lab-hidden">Robot blocks hidden</div><div class="lab-group-label"><b>{{model.robot.toLocaleString('en-US')}}</b><span>robot blocks</span><small>Transparent · effort-saved estimate</small></div></div><span class="lab-bridge" aria-hidden="true">↗</span></template>
                <lab-stack v-else :geometry="model.combined" :yaw="yaw" :tilt="tilt" :zoom="zoom" :show-human="showHuman" :show-robot="showRobot"></lab-stack>
</div>`
};
const LabViewer={
  components:{LabStageLayout},props:{model:Object,layout:String,gpu:Boolean,showHuman:Boolean,showRobot:Boolean,busy:Boolean},
  setup(props){
    const {ref,shallowReactive,watch,onMounted,onBeforeUnmount}=Vue;
    const yaw=ref(-32),tilt=ref(-22),zoom=ref(1),orbit=ref(false),inView=ref(true);
    const shownModels=shallowReactive({separate:null,combined:null});
    watch(()=>[props.layout,props.model],([layout,model])=>{shownModels[layout]=model;},{immediate:true});
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)'),reducedMotion=ref(motion.matches);
    let pointer=null,animation=0,last=0,observer;
    function stop(){cancelAnimationFrame(animation);animation=0;last=0;}
    function tick(time){if(!orbit.value||document.hidden||!inView.value||reducedMotion.value||(!props.showHuman&&!props.showRobot)){stop();return;}if(last)yaw.value+=(time-last)*.004;last=time;animation=requestAnimationFrame(tick);}
    function sync(){stop();if(orbit.value&&!document.hidden&&inView.value&&!reducedMotion.value&&(props.showHuman||props.showRobot))animation=requestAnimationFrame(tick);}
    function reset(){yaw.value=-32;tilt.value=-22;zoom.value=1;orbit.value=false;}
    function down(e){if(e.button!==0)return;orbit.value=false;pointer={x:e.clientX,y:e.clientY,yaw:yaw.value,tilt:tilt.value};e.currentTarget.setPointerCapture(e.pointerId);}
    function move(e){if(!pointer)return;yaw.value=pointer.yaw+(e.clientX-pointer.x)*.35;tilt.value=Math.max(-65,Math.min(-5,pointer.tilt-(e.clientY-pointer.y)*.25));}
    function up(){pointer=null;}
    function key(e){if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','+','=','-'].includes(e.key))return;e.preventDefault();orbit.value=false;if(e.key==='Home')reset();else if(e.key==='ArrowLeft')yaw.value-=10;else if(e.key==='ArrowRight')yaw.value+=10;else if(e.key==='ArrowUp')tilt.value=Math.max(-65,tilt.value-5);else if(e.key==='ArrowDown')tilt.value=Math.min(-5,tilt.value+5);else zoom.value=Math.max(.5,Math.min(2,zoom.value+(e.key==='-'?-.15:.15)));}
    function motionChange(){reducedMotion.value=motion.matches;if(motion.matches)orbit.value=false;sync();}
    watch([orbit,inView],sync);watch(()=>props.showHuman||props.showRobot,sync);
    onMounted(()=>{document.addEventListener('visibilitychange',sync);motion.addEventListener('change',motionChange);observer=new IntersectionObserver(entries=>{inView.value=entries[0].isIntersecting;});observer.observe(document.getElementById('project-stack'));});
    onBeforeUnmount(()=>{stop();observer?.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',motionChange);});
    return {yaw,tilt,zoom,orbit,reducedMotion,shownModels,down,move,up,key,reset};
  },
  template:`              <div id="project-stack" class="lab-stage" :class="{'is-busy':busy}" tabindex="0" role="group" :aria-label="'3D contribution stacks: '+model.human+' human and '+model.robot+' estimated robot blocks. Drag or use arrow keys to rotate; plus and minus zoom; Home resets.'" @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up" @lostpointercapture="up" @keydown="key">
<template v-for="mode in ['separate','combined']" :key="mode"><div v-if="shownModels[mode]" v-show="layout===mode" class="lab-mode"><lab-stage-layout :model="shownModels[mode]" :layout="mode" :gpu="gpu" :show-human="showHuman" :show-robot="showRobot" :yaw="layout===mode?yaw:-32" :tilt="layout===mode?tilt:-22" :zoom="layout===mode?zoom:1"></lab-stage-layout></div></template>                <div v-if="!showHuman&&!showRobot" class="lab-hidden full">Turn on a block type to explore it.</div>
                <span class="lab-stage-corner">{{layout==='combined'?'RECORDED PERIOD ORDER / BOTTOM LAYER FIRST':'HUMAN INPUT → ESTIMATED EXPANSION'}}</span><span v-if="busy" class="lab-loading" role="status">Preparing the stack…</span>
              </div>
              <div class="lab-camera"><div><button @click="yaw-=15" aria-label="Rotate left">↶</button><button @click="yaw+=15" aria-label="Rotate right">↷</button><button @click="reset" aria-label="Reset stack view">Reset view</button></div><div><button @click="zoom=Math.max(.5,zoom-.15)" aria-label="Zoom out">−</button><span>{{Math.round(zoom*100)}}%</span><button @click="zoom=Math.min(2,zoom+.15)" aria-label="Zoom in">+</button></div><label><input type="checkbox" v-model="orbit" :disabled="reducedMotion"> Slow orbit</label></div>
`
};
Vue.createApp({
  components:{LabViewer,LabMini,LabRobotPreview},
  setup() {
    const {ref,computed,markRaw,nextTick}=Vue;
    const data=markRaw(ValueBlocksLabData),periods=markRaw(ValueBlocksLabModel.periods(data.ledger)),scenarios=ValueBlocksLabModel.scenarios;
    const session=ValueBlocksLabModel.createSession(data.ledger),people=data.people;
    const peopleById=Object.fromEntries(people.map(p=>[p.id,p]));
    const statusSummary=periods.flatMap(p=>p.entries).reduce((counts,e)=>{const label=e.status==='contributor-confirmed'?'confirmed':e.status==='chat-estimated'?'estimated':'reported';counts[label]=(counts[label]||0)+e.blocks;return counts;},{});
    const statusSummaryText=Object.entries(statusSummary).map(([label,n])=>n+' '+label).join(' · ')+' human blocks';
    const theme=ref('dark'),scenario=ref('working'),periodId=ref('all'),layout=ref('separate');
    const showHuman=ref(true),showRobot=ref(true),busy=ref(false),gpu=ref(true);
    const model=computed(()=>markRaw(session.build(scenario.value,periodId.value)));
    const selectedPeriod=computed(()=>periods.find(p=>p.id===periodId.value));
    const visiblePeriods=computed(()=>selectedPeriod.value?[selectedPeriod.value]:periods);
    const visibleCount=computed(()=>(showHuman.value?model.value.human:0)+(showRobot.value?model.value.robot:0));
    const integerFormat=new Intl.NumberFormat('en-US');
    const currencyFormat=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
    const shortDateFormat=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
    const number=n=>integerFormat.format(n);
    const money=n=>currencyFormat.format(n);
    const short=iso=>shortDateFormat.format(new Date(iso+'T12:00:00Z'));
    const shortRange=p=>p.start===p.end?short(p.start):short(p.start)+'–'+(p.start.slice(0,7)===p.end.slice(0,7)?Number(p.end.slice(8)):short(p.end));
    const dateRange=p=>shortRange(p)+', '+p.end.slice(0,4);
    function selectPeriod(id){periodId.value=id;}
    async function chooseScenario(id) {
      if (id===scenario.value || busy.value) return;
      busy.value=true;await nextTick();await new Promise(resolve=>requestAnimationFrame(resolve));
      scenario.value=id;await nextTick();busy.value=false;
    }
    function explorePeriod(id){selectPeriod(id);document.getElementById('project-stack').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});document.getElementById('project-stack').focus({preventScroll:true});}
    return {data,people,peopleById,statusSummary:statusSummaryText,periods,scenarios,theme,scenario,periodId,layout,showHuman,showRobot,busy,gpu,model,selectedPeriod,visiblePeriods,visibleCount,number,money,shortRange,dateRange,selectPeriod,chooseScenario,explorePeriod};
  }
}).mount('#lab-app');
