/* The exact film contribution totals, reunited in one supported 3D volume. */
const FilmFinaleModel = {
  build(data){
    const positions=BlockGeometry.fill(data.total,7),cells=[],bounds=[1,1,1],contributions=[];
    for(const entry of data.entries){const color=data.departments.findIndex(d=>d.id===entry.department);for(let n=0;n<entry.count;n++)contributions.push([color,entry.count]);}
    // Mix the colors through the sculpture while preserving every contribution.
    for(let i=contributions.length-1;i>0;i--){const j=BlockGeometry.hash(i,0,0,19)%(i+1);[contributions[i],contributions[j]]=[contributions[j],contributions[i]];}
    positions.forEach((p,i)=>{cells.push([...p,0,...contributions[i]]);for(let axis=0;axis<3;axis++)bounds[axis]=Math.max(bounds[axis],p[axis]+1);});
    return {cells,bounds,total:cells.length};
  }
};

const FilmFinale = {
  props:{active:Boolean,modelValue:Number},emits:['credits','restart'],
  setup(props){
    const {ref,computed,watch,onMounted,onUnmounted}=Vue;
    const data=FilmCreditsData,canvas=ref(null),fallback=ref(null),stage=ref(null),stats=ref({phase:'preparing',landed:0,active:0}),running=ref(true),gpu=ref(true),onscreen=ref(false),orbit=ref(false),demoGift=ref(25),giftPreview=ref(false);
    const progress=computed(()=>Math.round((stats.value.landed||0)/data.total*100));
    const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
    const motion=matchMedia('(prefers-reduced-motion:reduce)'),model=FilmFinaleModel.build(data);let renderer=null,intersection,resize;
    function palette(){
      const ctx=document.createElement('canvas').getContext('2d',{willReadFrequently:true}),style=getComputedStyle(document.documentElement);
      const rgb=(color,tone)=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=style.getPropertyValue('--color-'+color+'-'+tone).trim();ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3);};
      return data.departments.map(d=>[rgb(d.color,500),rgb(d.color,300),rgb(d.color,700),rgb(d.color,300)]);
    }
    function sync(){renderer?.setEnabled(gpu.value&&props.active&&onscreen.value&&running.value&&!document.hidden);}
    function replay(){running.value=true;orbit.value=false;if(renderer&&gpu.value){renderer.setSettings({motion:'still'});renderer.reset(data.total,'film',7,!motion.matches,false,model);sync();}else drawStatic();}
    function drawStatic(){
      const el=fallback.value,ctx=el.getContext('2d');if(!ctx)return;
      const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;const dpr=Math.min(2,devicePixelRatio||1);el.width=w*dpr;el.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
      const occupied=new Set(model.cells.map(p=>p.slice(0,3).join(','))),style=getComputedStyle(document.documentElement);
      const faces=[{d:[0,1,0],tone:300,corners:[[-.5,.5,-.5],[.5,.5,-.5],[.5,.5,.5],[-.5,.5,.5]]},{d:[0,0,1],tone:500,corners:[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]},{d:[1,0,0],tone:700,corners:[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]]}];
      for(const p of [...model.cells].sort((a,b)=>(a[1]-a[0]+a[2])-(b[1]-b[0]+b[2]))){for(const face of faces){if(occupied.has(face.d.map((v,i)=>v+p[i]).join(',')))continue;const points=face.corners.map(c=>ValueBlockTime.project(c.map((v,i)=>v+p[i]),model.bounds,w,h,-24,-35,1.65,true));ctx.beginPath();points.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();ctx.fillStyle=style.getPropertyValue('--color-'+data.departments[p[4]].color+'-'+face.tone).trim();ctx.fill();ctx.strokeStyle='#ffffff45';ctx.lineWidth=.4;ctx.stroke();}}
      stats.value={phase:'complete',landed:data.total,active:0};
    }
    function motionChanged(){renderer?.setSettings({reducedMotion:motion.matches});if(motion.matches){orbit.value=false;renderer?.finishNow();}}
    watch(()=>[props.active,onscreen.value,running.value],sync);
    watch(orbit,value=>renderer?.setSettings({motion:value?'spin':'still'}));
    onMounted(()=>{
      try{renderer=ValueBlockGPU.create(canvas.value,value=>{stats.value={...stats.value,...value};if(value.phase==='unavailable'){gpu.value=false;Vue.nextTick(drawStatic);}});}catch{renderer=null;}
      if(renderer){renderer.setSettings({rotationX:-24,rotationY:-35,zoom:1.65,autoFit:true,motion:'still',edges:true,contrast:55,finish:'satin',rate:20,groupMode:3,reducedMotion:motion.matches});renderer.setPalette(palette());replay();}
      else{gpu.value=false;Vue.nextTick(drawStatic);}
      resize=new ResizeObserver(()=>{if(!gpu.value)drawStatic();});resize.observe(stage.value);
      intersection=new IntersectionObserver(entries=>{onscreen.value=entries[0].isIntersecting;sync();});intersection.observe(stage.value);
      document.addEventListener('visibilitychange',sync);motion.addEventListener('change',motionChanged);
    });
    onUnmounted(()=>{renderer?.dispose();intersection?.disconnect();resize?.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',motionChanged);});
    return {data,canvas,fallback,stage,stats,running,gpu,orbit,progress,money,replay,demoGift,giftPreview};
  },
  template:`<section class="film-finale" aria-label="Film finale and concept giving invitation">
    <div class="film-finale-heading"><div><span class="film-eyebrow">THE LIGHT WE LEAVE / ONE LAST SCENE</span><h3>Every hour. Every person.<br><i>One shared story.</i></h3></div><button @click="$emit('credits')">← Back to credits</button></div>
    <div class="film-finale-body"><div class="film-finale-stage" ref="stage"><div class="film-finale-glow"></div><div class="film-finale-stage-label"><span>THE WHOLE FILM, TAKING SHAPE</span><b>{{data.total.toLocaleString()}} VALUE BLOCKS</b></div><canvas ref="canvas" v-show="gpu" aria-label="All 1,420 film contribution blocks falling into a 3D stack"></canvas><canvas ref="fallback" v-show="!gpu" aria-label="Static 3D preview of all 1,420 film blocks"></canvas><div class="film-finale-caption"><span>{{stats.phase === 'complete' ? 'Every block, together.' : 'A film is built one contribution at a time.'}}</span><div><button v-if="gpu && stats.phase !== 'complete'" @click="running=!running">{{running?'Ⅱ Pause drop':'▶ Resume drop'}}</button><button @click="replay">↺ Replay drop</button><button v-if="gpu" :aria-pressed="orbit" @click="orbit=!orbit">{{orbit?'■ Hold view':'↻ Orbit stack'}}</button></div></div><div class="film-finale-progress" role="progressbar" aria-label="Film blocks landed" :aria-valuenow="stats.landed" :aria-valuemax="data.total" aria-valuemin="0"><i :style="{width:progress+'%'}"></i></div><div class="film-finale-color-key"><span v-for="d in data.departments" :key="d.id"><i :style="{background:'var(--color-'+d.color+'-400)'}"></i>{{d.name}}</span></div><div class="film-finale-landed"><span>{{(stats.landed||0).toLocaleString()}} / {{data.total.toLocaleString()}} landed</span><span>{{gpu?'LIVE 3D FINALE':'STATIC 3D PREVIEW'}}</span></div></div>
    <aside class="film-giving"><span class="film-eyebrow">KEEP THE LIGHT MOVING</span><h4>Help the next<br>story find its light.</h4><p>You’ve seen what people gave.<br>Imagine helping make the next film possible.</p><div class="film-giving-qr"><img src="journal-assets/film-giving-concept.svg?v=9-style" alt="Rounded gold concept QR with a central spark. Scan to support the next story."></div><span class="film-giving-demo">CONCEPT QR · NO LIVE PAYMENTS</span><div class="film-gift-amounts" aria-label="Concept gift amount"><button v-for="amount in [10,25,50]" :key="amount" :aria-pressed="demoGift === amount" @click="demoGift=amount">{{money(amount)}}</button></div><button class="film-gift-preview" @click="giftPreview=!giftPreview">{{giftPreview?'Close concept preview':'Preview a '+money(demoGift)+' gift'}} <span>↗</span></button><p v-if="giftPreview" class="film-gift-message" role="status">Imagine your {{money(demoGift)}} helping the next story begin. This is only a design preview—nothing is charged or submitted.</p><p class="film-giving-footnote">The QR encodes a reserved .example demo address. Giving is a concept; no checkout is connected.</p></aside></div>
    <div class="film-finale-footer"><div><strong>{{data.entries.length}} people</strong><span>{{data.total.toLocaleString()}} hours of possibility</span><span>{{money(data.total*modelValue)}} modeled value</span></div><button @click="$emit('restart')">↺ Watch the credits again</button></div>
  </section>`
};
