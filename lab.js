/* Real project journal. Appearance controls never modify the confirmed records. */
const LabStack = {
  components:{TypesMesh},
  props:{geometry:Object,fitGeometry:Object,yaw:Number,tilt:Number,zoom:Number,compact:Boolean,showHuman:{default:true},showRobot:{default:true}},
  setup(props) {
    const {ref,computed,onMounted,onBeforeUnmount}=Vue;
    const frame=ref(null),width=ref(420),height=ref(370);
    let observer;
    onMounted(()=>{observer=new ResizeObserver(entries=>{const r=entries[0].contentRect;width.value=r.width;height.value=r.height;});observer.observe(frame.value);});
    onBeforeUnmount(()=>observer?.disconnect());
    const transform=computed(()=>{
      const g=props.fitGeometry||props.geometry;
      const scale=Math.max(.03,Math.min((width.value-(props.compact?16:34))/(g.side*136*1.65),(height.value-(props.compact?12:65))/(g.height*136+g.side*95)))*props.zoom;
      return `rotateX(${props.tilt}deg) rotateY(${props.yaw}deg) scale3d(${scale},${scale},${scale})`;
    });
    return {frame,transform};
  },
  template:`<div ref="frame" class="lab-stack-scene"><div class="lab-stack-world" :style="{transform}" aria-hidden="true"><types-mesh v-for="batch in geometry.batches" :key="batch.id" v-show="batch.kind==='human'?showHuman:showRobot" :blocks="batch.blocks" :kind="batch.kind" :family="batch.family" :glass="4" :fill="0"/></div></div>`
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
Vue.createApp({
  components:{LabStack,LabMini,LabRobotPreview},
  setup() {
    const {ref,computed,markRaw,onMounted,onBeforeUnmount,nextTick,watch}=Vue;
    const data=markRaw(ValueBlocksLabData),periods=data.ledger.periods,scenarios=ValueBlocksLabModel.scenarios;
    const theme=ref('dark'),scenario=ref('working'),periodId=ref('all'),layout=ref('separate');
    const showHuman=ref(true),showRobot=ref(true),yaw=ref(-32),tilt=ref(-22),zoom=ref(1),orbit=ref(false),busy=ref(false);
    const reducedMotion=ref(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const model=computed(()=>markRaw(ValueBlocksLabModel.build(data.ledger,scenario.value,periodId.value)));
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
    function explorePeriod(id){selectPeriod(id);document.getElementById('project-stack').scrollIntoView({behavior:reducedMotion.value?'instant':'smooth',block:'center'});document.getElementById('project-stack').focus({preventScroll:true});}
    function reset(){yaw.value=-32;tilt.value=-22;zoom.value=1;orbit.value=false;}
    let pointer=null,frame=0,last=0;
    function down(e){if(e.button!==0)return;orbit.value=false;pointer={x:e.clientX,y:e.clientY,yaw:yaw.value,tilt:tilt.value};e.currentTarget.setPointerCapture(e.pointerId);}
    function move(e){if(!pointer)return;yaw.value=pointer.yaw+(e.clientX-pointer.x)*.35;tilt.value=Math.max(-65,Math.min(-5,pointer.tilt-(e.clientY-pointer.y)*.25));}
    function up(){pointer=null;}
    function key(e){if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','+','=','-'].includes(e.key))return;e.preventDefault();orbit.value=false;if(e.key==='Home')reset();else if(e.key==='ArrowLeft')yaw.value-=10;else if(e.key==='ArrowRight')yaw.value+=10;else if(e.key==='ArrowUp')tilt.value=Math.max(-65,tilt.value-5);else if(e.key==='ArrowDown')tilt.value=Math.min(-5,tilt.value+5);else zoom.value=Math.max(.5,Math.min(2,zoom.value+(e.key==='-'?-.15:.15)));}
    function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
    function tick(time){if(!orbit.value||document.hidden||reducedMotion.value){stop();return;}if(last)yaw.value+=(time-last)*.004;last=time;frame=requestAnimationFrame(tick);}
    function synchronizeOrbit(){stop();if(orbit.value&&!document.hidden&&!reducedMotion.value)frame=requestAnimationFrame(tick);}
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    function motionChange(){reducedMotion.value=motion.matches;if(motion.matches)orbit.value=false;synchronizeOrbit();}
    watch(orbit,synchronizeOrbit);
    onMounted(()=>{document.addEventListener('visibilitychange',synchronizeOrbit);motion.addEventListener('change',motionChange);});
    onBeforeUnmount(()=>{stop();document.removeEventListener('visibilitychange',synchronizeOrbit);motion.removeEventListener('change',motionChange);});
    return {data,periods,scenarios,theme,scenario,periodId,layout,showHuman,showRobot,yaw,tilt,zoom,orbit,busy,reducedMotion,model,selectedPeriod,visiblePeriods,visibleCount,number,money,shortRange,dateRange,selectPeriod,chooseScenario,explorePeriod,reset,down,move,up,key};
  }
}).mount('#lab-app');
