/* Fictional film credits. All portraits and rendering dependencies are local. */
const FilmCreditsData = (() => {
  const departments=[
    {id:'story',name:'Story & direction',color:'amber',line:'It began with an idea, and people who believed in it.'},
    {id:'cast',name:'The people on screen',color:'rose',line:'For every quiet glance, a whole world of feeling.'},
    {id:'camera',name:'Camera & light',color:'sky',line:'Finding the light. Making room for the shadows.'},
    {id:'art',name:'The world of the film',color:'emerald',line:'Every place, texture, and object tells a story.'},
    {id:'sound',name:'Sound & music',color:'violet',line:'The things we hear. The things we feel.'},
    {id:'post',name:'The final weave',color:'cyan',line:'Every detail that makes a film whole.'}
  ];
  const rows=[
    ['iris','Iris Vale','Writer & director','story',120,'Wrote seven drafts, shaped the visual language, and guided every scene from the first rehearsal to the final take.',['Story development & screenplay','Rehearsals and directing','Final creative review']],
    ['noah','Noah Chen','Producer','story',96,'Brought a small crew together, built the production plan, and made a thousand quiet decisions so the story could happen.',['Production planning','Crew care & coordination','Locations and festival delivery']],
    ['amina','Amina Brooks','Co-producer','story',60,'Found the spaces, people, and practical support that helped a small film feel possible.',['Community partnerships','Location agreements','Production support']],
    ['leo','Leo Moreno','First assistant director','story',48,'Kept the set calm, the schedule human, and every department moving together.',['Daily schedules','On-set coordination','Safety briefings']],
    ['ada','Ada Solis','Mara','cast',48,'Built Mara’s inner world through movement, rehearsal, and the small moments between the lines.',['Character research','Rehearsals','Six days of principal photography']],
    ['jules','Jules Rivera','Eli','cast',40,'Brought warmth and restraint to the person Mara meets at the edge of the city.',['Character development','Scene rehearsals','Principal photography']],
    ['eli','Eli Park','The neighbor','cast',24,'Turned a short encounter into a moment of unexpected recognition.',['Preparation & rehearsal','Performance','Additional dialogue recording']],
    ['sora','Sora Bell','Casting & rehearsal support','cast',32,'Made space for new voices, thoughtful auditions, and generous work in rehearsal.',['Casting sessions','Performer coordination','Rehearsal support']],
    ['ravi','Ravi Shah','Director of photography','camera',96,'Followed the changing coastal light and designed an intimate, patient visual approach.',['Camera tests & shot design','Principal photography','Finishing consultation']],
    ['lena','Lena Hart','Gaffer','camera',64,'Built a lighting language from practical lamps, soft windows, and the last light of the day.',['Lighting plans','Lighting the set','Equipment preparation']],
    ['nina','Nina Okafor','First assistant camera','camera',48,'Kept a careful eye on focus, lenses, and the small technical details behind every image.',['Lens tests','Focus pulling','Camera reports']],
    ['sam','Sam Arden','Grip & camera support','camera',40,'Made the camera moves safe and the impossible setups work.',['Rigging & safety','Camera movement','Equipment care']],
    ['maya','Maya Quinn','Production designer','art',80,'Found the film’s palette in weathered paint, warm wood, and objects with a past.',['World building & visual research','Set dressing','Art direction']],
    ['rose','Rose Laurent','Costume designer','art',48,'Built a lived-in wardrobe that quietly follows each character’s journey.',['Costume research','Fittings & sourcing','On-set wardrobe']],
    ['alex','Alex Kim','Props & set dressing','art',40,'Sourced, repaired, and placed the everyday objects that make the rooms feel remembered.',['Prop sourcing','Set dressing','Continuity photographs']],
    ['tomas','Tomás Silva','Hair & makeup','art',32,'Created a natural, understated look and cared for the cast through changing weather and long days.',['Look tests','On-set hair & makeup','Continuity']],
    ['ben','Ben Ito','Production sound mixer','sound',64,'Captured the texture of each voice, and the room around it, through wind, traffic, and changing tides.',['Location sound tests','Dialogue recording','Sound reports']],
    ['owen','Owen Reed','Composer','sound',80,'Wrote a spare score for piano, breath, and a few notes that stay after the picture fades.',['Themes & composition','Recording sessions','Score revisions']],
    ['marc','Marc Baptiste','Sound designer','sound',72,'Built the off-screen world: distant kitchens, night buses, and a shoreline just beyond the frame.',['Field recordings','Sound design','Atmosphere & transitions']],
    ['dan','Dan Ellis','Re-recording mixer','sound',40,'Balanced dialogue, music, and silence into the final listening experience.',['Dialogue preparation','Final mix','Theatrical & streaming masters']],
    ['zara','Zara James','Editor','post',120,'Found the story’s rhythm in pauses, gestures, and the space between two people.',['Assembly & picture edit','Director revisions','Picture lock']],
    ['min','Min Seo','Colorist','post',40,'Shaped a gentle palette of dusk blues and warm interiors, keeping the light feeling true.',['Color workflow','Creative grade','Final image review']],
    ['gabe','Gabriel Stone','Assistant editor & finishing','post',56,'Organized the footage, tracked every change, and delivered the final film in all its forms.',['Media management','Conform & titles','Mastering and delivery']],
    ['cleo','Cleo Morgan','Access & community screenings','post',32,'Helped the film reach more people through thoughtful captions, access notes, and local screenings.',['Captions & access review','Screening coordination','Community outreach']]
  ];
  const entries=rows.map((r,i)=>({id:'credit-'+i,image:'journal-assets/portrait-'+r[0]+'.jpg',name:r[1],role:r[2],department:r[3],count:r[4],note:r[5],work:r[6],initials:r[1].split(' ').map(s=>s[0]).slice(0,2).join('')}));
  const total=entries.reduce((n,e)=>n+e.count,0);
  function stripLayout(count,width,size=8){const columns=Math.max(1,Math.floor((width-4)/size));return {columns,rows:Math.ceil(count/columns),height:Math.max(14,Math.ceil(count/columns)*(size*1.25)+4)};}
  return {departments,entries,total,stripLayout};
})();

/* Tiny credits cubes are rasterized once from projected three-face geometry.
   This keeps thousands of miniature blocks out of the DOM during the roll. */
const FilmBlockStrip = {
  props:{count:Number,color:String,size:{default:8}},
  setup(props){
    const canvas=Vue.ref(null);let observer;
    function paint(){
      const el=canvas.value;if(!el)return;
      const available=el.parentElement.clientWidth;if(available<1)return;
      const width=Math.max(24,available),s=props.size,{columns,height}=FilmCreditsData.stripLayout(props.count,width,s),dpr=Math.min(2,devicePixelRatio||1);
      el.style.height=height+'px';el.width=Math.ceil(width*dpr);el.height=Math.ceil(height*dpr);
      const ctx=el.getContext('2d');ctx.scale(dpr,dpr);
      const style=getComputedStyle(document.documentElement),tone=n=>style.getPropertyValue('--color-'+props.color+'-'+n).trim();
      const top=tone(300),front=tone(500),side=tone(700),edge=tone(200);
      function face(points,fill){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=.35;ctx.stroke();}
      for(let i=0;i<props.count;i++){
        const x=(i%columns)*s+s*.5+1,y=Math.floor(i/columns)*s*1.25+s*.3+1,w=s*.43,h=s*.23,d=s*.6;
        face([[x,y-h],[x+w,y],[x,y+h],[x-w,y]],top);
        face([[x-w,y],[x,y+h],[x,y+h+d],[x-w,y+d]],front);
        face([[x,y+h],[x+w,y],[x+w,y+d],[x,y+h+d]],side);
      }
    }
    Vue.onMounted(()=>{observer=new ResizeObserver(paint);observer.observe(canvas.value.parentElement);paint();});
    Vue.watch(()=>[props.count,props.color,props.size],()=>Vue.nextTick(paint));
    Vue.onUnmounted(()=>observer?.disconnect());
    return {canvas};
  },
  template:`<canvas ref="canvas" class="film-block-strip" role="img" :aria-label="count+' miniature 3D value blocks'"></canvas>`
};

function createFilmCredits(JournalBlocks){return {
  components:{JournalBlocks,FilmBlockStrip,FilmFinale},props:{modelValue:Number,active:Boolean},emits:['update:modelValue','inspect'],
  setup(props,{emit}){
    const {ref,computed,watch,onMounted,onUnmounted,nextTick}=Vue;
    const data=FilmCreditsData,detail=ref(null),viewport=ref(null),playing=ref(!matchMedia('(prefers-reduced-motion:reduce)').matches),photos=ref(true),speed=ref(26),progress=ref(0),selected=ref(data.entries[0].id),dragging=ref(false),department=ref(''),onscreen=ref(false),finale=ref(false),finaleSeen=ref(false),finaleRoot=ref(null);
    const current=computed(()=>data.entries.find(e=>e.id===selected.value));
    const currentDepartment=computed(()=>data.departments.find(d=>d.id===current.value.department));
    const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
    let frame=null,last=null,intersection,startY=0,startTop=0,down=false,moved=false,suppressUntil=0;
    const motion=matchMedia('(prefers-reduced-motion:reduce)');
    function stop(){if(frame!==null)cancelAnimationFrame(frame);frame=null;last=null;}
    function sync(){stop();if(props.active&&!finale.value&&onscreen.value&&playing.value&&!document.hidden&&!dragging.value)frame=requestAnimationFrame(tick);}
    function tick(now){frame=null;const el=viewport.value;if(!el||!props.active||!playing.value||document.hidden)return;
      const dt=last===null?0:Math.min(.05,(now-last)/1000);last=now;el.scrollTop+=speed.value*dt;
      if(el.scrollTop>=el.scrollHeight-el.clientHeight-1){playing.value=false;progress.value=100;endFilm();last=null;return;}
      frame=requestAnimationFrame(tick);
    }
    function onScroll(){const el=viewport.value;if(el){const max=el.scrollHeight-el.clientHeight;progress.value=Math.round(el.scrollTop/Math.max(1,max)*100);if(max>1&&el.scrollTop>=max-2&&!down)endFilm();}}
    function pause(){playing.value=false;}
    function replay(){pause();finale.value=false;finaleSeen.value=false;department.value='';viewport.value.scrollTop=0;progress.value=0;playing.value=!motion.matches;}
    function endFilm(force=false){if(!props.active||(finaleSeen.value&&!force)||(!force&&down))return;pause();progress.value=100;finaleSeen.value=true;finale.value=true;nextTick(()=>finaleRoot.value?.$el?.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'}));}
    function showCredits(){finale.value=false;department.value='thanks';pause();}
    function select(entry){if(performance.now()<suppressUntil)return;pause();selected.value=entry.id;if(matchMedia('(max-width:740px)').matches)nextTick(()=>detail.value?.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'}));}
    function backToCredits(){viewport.value?.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'});}
    function pointerDown(event){if(event.button!==0||event.clientX>viewport.value.getBoundingClientRect().right-16)return;pause();down=true;moved=false;startY=event.clientY;startTop=viewport.value.scrollTop;}
    function pointerMove(event){if(!down)return;const dy=event.clientY-startY;if(!moved&&Math.abs(dy)>5){moved=true;dragging.value=true;viewport.value.setPointerCapture(event.pointerId);}if(moved){event.preventDefault();viewport.value.scrollTop=startTop-dy;}}
    function pointerUp(){if(moved)suppressUntil=performance.now()+250;down=false;dragging.value=false;const el=viewport.value;if(el.scrollHeight>el.clientHeight&&el.scrollTop>=el.scrollHeight-el.clientHeight-2)endFilm();}
    function captureClick(event){if(performance.now()<suppressUntil){event.preventDefault();event.stopPropagation();}}
    function jump(){pause();if(department.value==='finale'){endFilm(true);return;}if(!department.value){viewport.value.scrollTop=0;return;}const el=viewport.value.querySelector('[data-department="'+department.value+'"]');if(el)viewport.value.scrollTop+=el.getBoundingClientRect().top-viewport.value.getBoundingClientRect().top-28;}
    function key(event){if(event.ctrlKey||event.metaKey||event.altKey||event.target.closest('button,input,select'))return;
      if(event.key===' '){event.preventDefault();playing.value=!playing.value;return;}
      if(['ArrowUp','ArrowDown','Home','End'].includes(event.key)){event.preventDefault();pause();if(event.key==='Home')viewport.value.scrollTop=0;else if(event.key==='End')viewport.value.scrollTop=viewport.value.scrollHeight;else viewport.value.scrollTop+=event.key==='ArrowUp'?-72:72;}
    }
    function visibility(){if(document.hidden)stop();else sync();}
    function motionChanged(){if(motion.matches)pause();}
    watch(()=>[props.active,finale.value,onscreen.value,playing.value,dragging.value],()=>nextTick(sync));
    onMounted(()=>{intersection=new IntersectionObserver(entries=>onscreen.value=entries[0].isIntersecting);intersection.observe(viewport.value);document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',motionChanged);sync();});
    onUnmounted(()=>{stop();intersection?.disconnect();document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',motionChanged);});
    return {finale,finaleRoot,endFilm,showCredits,data,detail,backToCredits,viewport,playing,photos,speed,progress,current,currentDepartment,money,dragging,department,emit,replay,pause,select,onScroll,pointerDown,pointerMove,pointerUp,captureClick,jump,key};
  },
  template:`<section class="film-study" aria-label="Interactive film credits study">
    <header class="film-heading"><div><span class="film-eyebrow">A SHORT FILM / A LONG LIST OF HUMAN CONTRIBUTIONS</span><h2>The Light We Leave</h2><p>A fictional 14-minute film about the small things that bring us home.</p></div><span class="film-edition">CREDIT STUDY<br>№ 004 / 2026</span></header>
    <div class="film-summary"><span><b>{{data.entries.length}}</b> people</span><span><b>{{data.total.toLocaleString()}}</b> value blocks / ~hours</span><span><b>{{money(data.total*modelValue)}}</b> modeled value</span><small>Every small cube represents one block of work.</small></div>
    <div class="film-controls" v-show="!finale"><button class="film-play" @click="playing=!playing" :aria-label="playing?'Pause credits':'Play credits'">{{playing?'Ⅱ Pause':'▶ Play'}}</button><button @click="replay">↺ Restart</button><label class="film-photo-toggle"><input type="checkbox" v-model="photos" role="switch"> Profile photos</label><label class="film-speed">Roll speed <input type="range" min="12" max="60" step="2" v-model.number="speed" aria-label="Credits roll speed"><output>{{speed}} px/s</output></label><label class="film-jump">Jump to<select v-model="department" @change="jump" aria-label="Jump to film department"><option value="">Opening title</option><option v-for="d in data.departments" :key="d.id" :value="d.id">{{d.name}}</option><option value="thanks">With gratitude</option><option value="finale">Finale / giving concept</option></select></label></div>
    <film-finale v-if="finale" ref="finaleRoot" :active="active" :model-value="modelValue" @credits="showCredits" @restart="replay"></film-finale>
    <div class="film-body" v-show="!finale"><div class="film-screen-wrap"><div class="film-screen" ref="viewport" tabindex="0" :class="{dragging,'without-photos':!photos}" aria-label="Interactive credits roll. Drag or scroll to explore. Space plays or pauses. Arrow keys scroll." @scroll="onScroll" @wheel.passive="pause" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="pointerUp" @lostpointercapture="pointerUp" @click.capture="captureClick" @keydown="key">
      <div class="film-roll"><div class="film-opening"><span class="film-eyebrow">A VALUE BLOCK PICTURE</span><div class="film-opening-symbol"><journal-blocks :count="3" color="amber" :size="24"/></div><h3>The Light<br><i>We Leave</i></h3><p>A film made of people.<br>A record of what they gave.</p><span class="film-opening-rule"></span><small>CAST, CREW & THE WORK BEHIND THE PICTURE</small></div>
      <section v-for="d in data.departments" :key="d.id" class="film-department" :data-department="d.id"><div class="film-department-heading"><span>◇</span><h4>{{d.name}}</h4><p>{{d.line}}</p></div><button v-for="e in data.entries.filter(e=>e.department===d.id)" :key="e.id" :class="['film-credit-row',{selected:current.id===e.id}]" :aria-pressed="current.id===e.id" @click="select(e)" :style="{'--credit-color':'var(--color-'+d.color+'-400)'}"><span v-if="photos" class="film-portrait"><img draggable="false" :src="e.image" alt="" loading="lazy" @error="$event.target.hidden=true"><i>{{e.initials}}</i></span><span class="film-credit-person"><small>{{e.role}}</small><b>{{e.name}}</b></span><span class="film-credit-blocks"><film-block-strip :count="e.count" :color="d.color"/></span><span class="film-credit-quantity">{{e.count}}<small>blocks</small></span></button></section>
      <section class="film-thanks" data-department="thanks"><span class="film-eyebrow">WITH GRATITUDE</span><h3>It takes all of us.</h3><p>For every shared meal, early call, late train,<br>patient revision, and person who said yes.</p><div class="film-thanks-portraits" v-if="photos"><span v-for="e in data.entries" :key="e.id" class="film-portrait"><img draggable="false" :src="e.image" :alt="e.name" loading="lazy" @error="$event.target.hidden=true"><i>{{e.initials}}</i></span></div><div class="film-end-total"><b>{{data.total.toLocaleString()}}</b><span>blocks of human possibility</span></div><p class="film-end-note">All names, roles, hours, and work are fictional.<br>Portraits are illustrative. This is a local design experiment.</p><button class="film-watch-finale" @click="endFilm(true)">Watch the film take shape ↗</button><span class="film-fin">FIN</span></section></div>
    </div><div class="film-screen-footer"><span>{{playing?'● ROLLING':'Ⅱ PAUSED'}} · {{progress}}%</span><span>Drag to explore · Space to pause · Click anyone</span></div></div>
    <aside class="film-detail" ref="detail" aria-label="Selected film contribution"><button class="film-back" @click="backToCredits">↑ Back to credits</button><span class="film-eyebrow">BEHIND THE CREDIT</span><div class="film-detail-person"><span v-if="photos" class="film-portrait"><img draggable="false" :src="current.image" alt="" @error="$event.target.hidden=true"><i>{{current.initials}}</i></span><div><h3>{{current.name}}</h3><p>{{current.role}}</p></div></div><span class="film-detail-department">{{currentDepartment.name}}</span><p class="film-detail-note">{{current.note}}</p><div class="film-detail-blocks"><film-block-strip :count="current.count" :color="currentDepartment.color" :size="14"/></div><div class="film-detail-totals"><div><b>{{current.count}}</b><small>blocks / ~hours</small></div><div><b>{{money(current.count*modelValue)}}</b><small>modeled value</small></div></div><h4>THE WORK BEHIND IT</h4><ul><li v-for="work in current.work" :key="work">{{work}}</li></ul><label class="film-value" for="film-value">Modeled value / block <output>{{money(modelValue)}}</output></label><input id="film-value" type="range" min="100" max="1000" step="25" :value="modelValue" @input="emit('update:modelValue',Number($event.target.value))"><p class="film-base">Base {{money(current.count*100)}} at $100 / block.<br>Modeled contribution value, not a wage or payment.</p><button class="film-open-lab" @click="emit('inspect',{count:current.count,color:currentDepartment.color})">Explore these blocks in 3D <span>↗</span></button><p class="film-detail-hint">Selecting a credit pauses the roll.<br>Press Play whenever you’re ready.</p></aside></div>
  </section>`
};}
