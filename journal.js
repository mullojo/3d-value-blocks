/* Local concept data and reusable CSS 3D specimens for the Journal studies. */
const ValueJournal = (() => {
  const frames = {
    Hlth:{name:'Health & wellness',color:'sky',icon:'☀'},
    Eco:{name:'Earth & ocean',color:'emerald',icon:'↟'},
    Joy:{name:'Joy & connection',color:'amber',icon:'✳'},
    Bld:{name:'Building & making',color:'orange',icon:'◇'},
    Kind:{name:'Kindness & care',color:'rose',icon:'♡'},
    Lrn:{name:'Learning & growth',color:'violet',icon:'✧'}
  };
  const people = [
    {id:'ada',name:'Ada',role:'Community organizer',image:'journal-assets/portrait-ada.jpg',initials:'AD',color:'rose'},
    {id:'leo',name:'Leo',role:'Volunteer & ocean advocate',image:'journal-assets/portrait-leo.jpg',initials:'LE',color:'sky'},
    {id:'maya',name:'Maya',role:'Designer & storyteller',image:'journal-assets/portrait-maya.jpg',initials:'MA',color:'violet'},
    {id:'sam',name:'Sam',role:'Educator & maker',image:'journal-assets/portrait-sam.jpg',initials:'SA',color:'amber'}
  ];
  const projects=[
    {id:'life',label:'Life journal',title:'Life recognized',subtitle:'The everyday things that add up to something extraordinary.',context:'Across all frames',color:'violet',kicker:'THE EVERYDAY JOURNAL'},
    {id:'bay',label:'Heal the Bay',title:'A healthier bay, together.',subtitle:'A shared record of care for the coast we call home.',context:'Santa Monica · Ocean care',color:'sky',kicker:'HEAL THE BAY / PROJECT JOURNAL'},
    {id:'joy',label:'Sustainable Joy',title:'Good things, passed on.',subtitle:'Small acts of generosity. A community with room for everyone.',context:'Wildfire relief · The free shop',color:'emerald',kicker:'SUSTAINABLE JOY / PROJECT JOURNAL'}
  ];
  const rows = [
    ['life','2026-11-17','08:00','ada',2,'Hlth','Slept well and woke up rested','Rested, reset, and ready for a gentler start.'],
    ['life','2026-11-17','09:00','ada',2,'Eco','Walked to the beach instead of driving','Walked instead of driving. Took a coffee and noticed the ocean.'],
    ['life','2026-11-17','10:30','ada',1,'Joy','Made vegan teff pancakes','Made teff pancakes with berries and shared breakfast with a friend.'],
    ['life','2026-11-17','11:00','ada',3,'Bld','Sketched a clearer value block journal','Sketched a clearer way to help people see the value they create.'],
    ['life','2026-11-17','14:00','ada',2,'Lrn','Read about community-owned projects','Read about community-owned projects and noted ideas to discuss with the team.'],
    ['life','2026-11-17','16:00','ada',1,'Kind','Listened to a friend through a hard afternoon','Made space for a friend. No fixing, just being there.'],
    ['life','2026-11-17','18:00','ada',2,'Eco','Cooked dinner and composted the scraps','Composted the scraps and made dinner from what we already had.'],
    ['life','2026-11-16','08:30','leo',2,'Hlth','Walked and stretched in the morning sun','Walked around the neighborhood and stretched outside before breakfast.'],
    ['life','2026-11-16','10:00','leo',4,'Bld','Coded the journal entry preview','Coded the entry preview and adjusted the block spacing after trying it with the team.'],
    ['life','2026-11-16','15:00','leo',2,'Kind','Carried groceries home for a neighbor','Helped a neighbor with groceries and stayed for a conversation.'],
    ['life','2026-11-16','18:30','leo',2,'Joy','Cooked dinner for friends','Cooked a shared meal. Good food, better company.'],
    ['life','2026-11-15','09:00','ada',2,'Eco','Mended a favorite jacket','Repaired a favorite jacket instead of replacing it.'],
    ['life','2026-11-15','13:00','ada',3,'Lrn','Read and took notes on a new idea','Read a chapter on cooperation and wrote down connections to our own projects.'],
    ['life','2026-11-15','17:00','ada',2,'Joy','Watched the sunset with friends','Met friends at the beach and let the day land softly.'],
    ['bay','2026-11-17','06:30','ada',3,'Eco','Recorded water clarity along the tide line','Walked the tide line to record water clarity and storm-drain activity. Shared observations with the volunteer team.'],
    ['bay','2026-11-17','09:00','leo',2,'Eco','Collected and sorted litter by the pier','Collected and sorted litter along the pier. Logged the finds for the next cleanup briefing.'],
    ['bay','2026-11-17','11:00','maya',2,'Eco','Created a coastal care field guide','Created a field guide to the small actions that protect our coastline.'],
    ['bay','2026-11-17','13:30','sam',1,'Eco','Taught an ocean awareness class','Helped local students explore ocean biodiversity and microplastics.'],
    ['bay','2026-11-16','09:00','maya',2,'Eco','Scheduled volunteers for the next cleanup','Coordinated the next volunteer shift and welcomed three new neighbors.'],
    ['bay','2026-11-16','14:00','ada',3,'Eco','Drafted a coastal awareness grant proposal','Drafted a community grant proposal for a new coastal awareness program.'],
    ['bay','2026-11-15','10:00','sam',2,'Eco','Hosted a neighborhood waterways discussion','Hosted a conversation with residents about protecting local waterways.'],
    ['bay','2026-11-15','15:00','leo',1,'Eco','Cleaned and restocked the water sampling kit','Cleaned, checked, and restocked the volunteer sampling kit.'],
    ['joy','2026-11-17','08:00','ada',3,'Kind','Ran the free shop and welcomed families','Led the free shop day: welcoming neighbors and helping everyone find what they needed.'],
    ['joy','2026-11-17','10:00','maya',2,'Kind','Sorted seven boxes of donated clothes','Unpacked seven boxes of donated clothes, sorted sizes, and refreshed the display.'],
    ['joy','2026-11-17','11:30','leo',1,'Kind','Delivered essentials to a displaced family','Delivered a bundle of essentials to a family settling into temporary housing.'],
    ['joy','2026-11-17','14:00','sam',2,'Kind','Wrote thank-you notes to firefighters','Wrote and illustrated thank-you notes for the firefighters supporting our community.'],
    ['joy','2026-11-16','09:00','maya',1,'Kind','Scheduled next week’s free shop volunteers','Scheduled the next volunteer group and shared a simple welcome guide.'],
    ['joy','2026-11-16','13:00','leo',2,'Kind','Arranged shoe donations with local shops','Connected with local shops donating shoes and everyday essentials.'],
    ['joy','2026-11-15','10:00','sam',3,'Kind','Set up a rest area for visiting families','Built a welcoming corner for families to pause, connect, and find support.'],
    ['joy','2026-11-15','16:00','ada',1,'Kind','Checked in with volunteers after the shift','Checked in with the team and recorded the small moments we want to remember.']
  ];
  const entries=rows.map((r,i)=>({id:'entry-'+i,project:r[0],date:r[1],time:r[2],person:r[3],count:r[4],frame:r[5],title:r[6],note:r[7]}));
  const sum=entries=>entries.reduce((n,e)=>n+e.count,0);
  const dayName=iso=>new Intl.DateTimeFormat('en',{weekday:'long',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(iso+'T12:00:00Z'));
  return {frames,people,projects,entries,sum,dayName};
})();

const JournalBlocks = {
  props:{count:{default:1},color:{default:'emerald'},shape:{default:'row'},size:{default:22},rainbow:Boolean,colors:Array},
  computed:{
    positions(){return Array.from({length:this.count},(_,i)=>this.shape==='cubit'?[i%3,Math.floor(i/9),Math.floor(i/3)%3]:this.shape==='tower'?[0,i,0]:[i,0,0]);},
    bounds(){return this.positions.reduce((b,p)=>b.map((n,i)=>Math.max(n,p[i]+1)),[1,1,1]);},
    scale(){return this.size/130;},
    box(){return {width:Math.ceil((this.bounds[0]*.83+this.bounds[2]*.58)*this.size+12)+'px',height:Math.ceil((this.bounds[1]*.92+this.bounds[0]*.25+this.bounds[2]*.35)*this.size+10)+'px'};}
  },
  methods:{
    cube(p,i){const token=this.colors?.[i]||(this.rainbow?['sky','emerald','amber','orange','violet','rose'][i%6]:this.color),parts=token.match(/^(.+)-(100|200|300|400|500|600|700|800|900)$/),color=parts?parts[1]:token,shade=parts?Number(parts[2]):500;return {transform:`translate3d(${(p[0]-(this.bounds[0]-1)/2)*130}px,${((this.bounds[1]-1)/2-p[1])*130}px,${(p[2]-(this.bounds[2]-1)/2)*130}px)`,'--block-front':`var(--color-${color}-${shade})`,'--block-top':`var(--color-${color}-${Math.max(100,shade-200)})`,'--block-side':`var(--color-${color}-${Math.min(950,shade+100)})`,'--block-edge':`var(--color-${color}-${Math.max(100,shade-200)})`};}
  },
  template:`<div class="journal-mini" :style="box" role="img" :aria-label="count+' three-dimensional value blocks'"><div class="journal-mini-scale" :style="{transform:'scale('+scale+')'}"><div class="journal-mini-world"><div v-for="(p,i) in positions" :key="i" class="cube has-edges satin" :style="cube(p,i)"><div v-for="face in ['front','back','left','right','top','bottom']" :key="face" :class="['face','face-'+face]"></div></div></div></div></div>`
};

const JournalLab = {
  components:{JournalBlocks,FilmCredits:createFilmCredits(JournalBlocks)},props:{modelValue:Number,visible:Boolean},emits:['update:modelValue','inspect'],
  setup(props,{emit}){
    const {ref,computed,watch}=Vue;
    const project=ref('life'),layout=ref('people'),date=ref('all'),frame=ref('all'),query=ref(''),selected=ref(null),showNotes=ref(true),colorMode=ref('frames');
    const detail=ref(null),feed=ref(null);
    const data=ValueJournal;
    const current=computed(()=>data.projects.find(p=>p.id===project.value));
    const all=computed(()=>data.entries.filter(e=>e.project===project.value));
    const dates=computed(()=>[...new Set(all.value.map(e=>e.date))]);
    const filtered=computed(()=>all.value.filter(e=>(date.value==='all'||e.date===date.value)&&(frame.value==='all'||e.frame===frame.value)&&(!query.value||[e.title,e.note,data.people.find(p=>p.id===e.person).name,data.frames[e.frame].name,e.frame].join(' ').toLowerCase().includes(query.value.toLowerCase()))));
    const groups=computed(()=>dates.value.map(d=>({date:d,entries:filtered.value.filter(e=>e.date===d)})).filter(g=>g.entries.length));
    const total=computed(()=>data.sum(filtered.value));
    const frameGroups=computed(()=>Object.entries(data.frames).map(([code,f])=>({code,...f,color:ValueBlockColors.frame(code),entries:filtered.value.filter(e=>e.frame===code),total:data.sum(filtered.value.filter(e=>e.frame===code))})).filter(f=>f.total));
    const person=id=>data.people.find(p=>p.id===id);
    const colors=e=>colorMode.value==='project'&&project.value!=='life'?ValueBlockColors.colors({...e,scope:'project',project:current.value.label}):Array(e.count).fill(colorMode.value==='people'?person(e.person).color:ValueBlockColors.frame(e.frame));
    const color=e=>ValueBlockColors.family(colors(e)[0]);
    const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
    const active=computed(()=>filtered.value.find(e=>e.id===selected.value)||filtered.value[0]||null);
    const contributors=computed(()=>data.people.filter(p=>filtered.value.some(e=>e.person===p.id)));
    function selectEntry(id){selected.value=id;if(matchMedia('(max-width:740px)').matches)Vue.nextTick(()=>detail.value?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'}));}
    function backToFeed(){feed.value?.scrollIntoView({behavior:'smooth',block:'start'});}
    watch(project,()=>{date.value='all';frame.value='all';query.value='';selected.value=null;colorMode.value=project.value==='life'?'frames':'project';});
    return {detail,feed,selectEntry,backToFeed,data,project,layout,date,frame,query,selected,showNotes,colorMode,current,dates,filtered,groups,total,frameGroups,person,color,colors,money,active,contributors,emit};
  },
  template:`<section class="journal-lab" aria-label="Journal layout studies" :style="{'--journal-accent':'var(--color-'+current.color+'-400)'}">
    <div class="journal-controls"><div><span class="eyebrow">LAYOUT STUDIES</span><div class="journal-layout-tabs" aria-label="Journal layout"><button v-for="option in [{id:'ledger',name:'01 / Daily flow'},{id:'people',name:'02 / People & stacks'},{id:'frames',name:'03 / Frame stories'},{id:'credits',name:'04 / Film credits'}]" :key="option.id" :aria-pressed="layout===option.id" @click="layout=option.id">{{option.name}}</button></div></div><label v-if="layout !== 'credits'" class="journal-project-label">Journal<select v-model="project"><option v-for="p in data.projects" :key="p.id" :value="p.id">{{p.label}}</option></select></label></div>
    <film-credits v-show="layout === 'credits'" :active="visible && layout === 'credits'" :model-value="modelValue" @update:model-value="emit('update:modelValue',$event)" @inspect="emit('inspect',$event)"></film-credits>
    <div v-show="layout !== 'credits'">
    <div class="journal-cover"><div class="journal-cover-copy"><span class="eyebrow">{{current.kicker}}</span><h2>{{current.title}}</h2><p>{{current.subtitle}}</p><span class="journal-context">◈ {{current.context}}</span><div class="journal-sample">SIMULATED ENTRIES · NOVEMBER 2026</div></div><div class="journal-cover-cube"><journal-blocks :count="total" shape="cubit" :colors="filtered.flatMap(e=>colors(e))" :size="39"/><div><b>{{total}}</b><span>value blocks, made visible</span></div></div></div>
    <div class="journal-stats"><div><span>VALUE CREATED</span><strong>{{money(total*modelValue)}}</strong><small>{{money(modelValue)}} / block · modeled</small></div><div><span>TIME GIVEN</span><strong>{{total}}<em> hrs</em></strong><small>~1 hour / value block</small></div><div><span>THE COLLECTIVE</span><div class="journal-avatar-group"><span v-for="p in contributors" :key="p.id" class="journal-avatar" :title="p.name"><img :src="p.image" alt="" @error="$event.target.hidden=true"><i>{{p.initials}}</i></span><strong>{{contributors.length}}</strong></div><small>{{contributors.length===1?'person':'people'}} in this selection</small></div><div class="journal-value-control"><label for="journal-block-value">VALUE / BLOCK <output>{{money(modelValue)}}</output></label><input id="journal-block-value" type="range" min="100" max="1000" step="25" :value="modelValue" @input="emit('update:modelValue',Number($event.target.value))"><small>Base {{money(total*100)}} at $100 / block</small></div></div>
    <div class="journal-filter-bar"><label class="journal-search"><span>⌕</span><input aria-label="Search journal" v-model="query" placeholder="Find a moment, a person, a frame…"></label><label>Date<select v-model="date" aria-label="Journal date"><option value="all">All three days</option><option v-for="d in dates" :key="d" :value="d">{{data.dayName(d)}}</option></select></label><label v-if="project==='life'">Frame<select v-model="frame" aria-label="Journal frame"><option value="all">Every frame</option><option v-for="(f,code) in data.frames" :key="code" :value="code">{{f.name}}</option></select></label><label>Block colors<select v-model="colorMode"><option value="frames">By frame</option><option value="project">Journal palette</option><option value="people">By contributor</option></select></label><button class="journal-notes-toggle" :aria-pressed="showNotes" @click="showNotes=!showNotes">{{showNotes?'− Hide notes':'+ Show notes'}}</button></div>
    <div class="journal-body"><div class="journal-feed" ref="feed">
      <div v-if="!filtered.length" class="journal-empty"><h3>Room to begin again.</h3><p>No entries match this selection.</p><button @click="query='';frame='all';date='all'">Clear filters</button></div>
      <template v-if="layout!=='frames'"><section v-for="group in groups" :key="group.date" class="journal-day"><div class="journal-day-heading"><h3>{{data.dayName(group.date)}}</h3><span>{{data.sum(group.entries)}} blocks · {{money(data.sum(group.entries)*modelValue)}}</span></div><article v-for="e in group.entries" :key="e.id" @click="selectEntry(e.id)" :class="['journal-entry',layout,{selected:active && active.id===e.id}]" :style="{'--entry-color':'var(--color-'+color(e)+'-400)'}">
        <span v-if="layout==='people'" class="journal-person"><span class="journal-avatar"><img :src="person(e.person).image" alt="" @error="$event.target.hidden=true"><i>{{person(e.person).initials}}</i></span><b>{{person(e.person).name}}</b></span>
        <span v-else class="journal-entry-time">{{e.time}}</span>
        <div v-if="layout==='people'" class="journal-entry-stack"><journal-blocks :count="e.count" shape="tower" :colors="colors(e)" :size="27"/></div>
        <div class="journal-entry-copy"><div class="journal-entry-meta"><span v-if="layout==='people'">{{e.time}}</span><span v-if="project==='life'" class="journal-frame-tag" :title="data.frames[e.frame].name">{{data.frames[e.frame].icon}} {{e.frame}}</span><span v-else>{{person(e.person).role}}</span></div><button class="journal-entry-title" @click.stop="selectEntry(e.id)" :aria-pressed="active && active.id===e.id">{{e.title}} <span>↗</span></button><p v-if="showNotes">{{e.note}}</p></div>
        <div v-if="layout==='ledger'" class="journal-entry-stack"><journal-blocks :count="e.count" :colors="colors(e)" :size="25"/></div><div class="journal-entry-total"><b>+{{e.count}}</b><span>{{money(e.count*modelValue)}}</span></div>
      </article></section></template>
      <div v-else class="journal-frame-grid"><section v-for="f in frameGroups" :key="f.code" class="journal-frame-card" @click="selectEntry(f.entries[0].id)" :style="{'--entry-color':'var(--color-'+f.color+'-400)'}"><div class="journal-frame-card-top"><span class="journal-frame-tag">{{f.icon}} {{f.code}}</span><b>{{f.total}} blocks</b></div><button class="journal-frame-visual" :aria-label="'Inspect first entry in '+f.name" @click.stop="selectEntry(f.entries[0].id)"><journal-blocks :count="f.total" shape="cubit" :colors="f.entries.flatMap(e=>colors(e))" :size="30"/></button><h3>{{f.name}}</h3><p>{{money(f.total*modelValue)}} modeled · ~{{f.total}} hours</p><button v-for="e in f.entries" :key="e.id" class="journal-frame-link" @click.stop="selectEntry(e.id)" :aria-pressed="active && active.id===e.id"><span>{{e.title}}</span><b>+{{e.count}}</b></button></section></div>
      <p class="journal-end" v-if="filtered.length">◇ &nbsp; {{filtered.length}} moments. {{total}} blocks. More possibility.</p>
    </div>
    <aside class="journal-detail" ref="detail" v-if="active" aria-label="Selected journal entry"><button class="journal-back" @click="backToFeed">↑ Back to entries</button><span class="eyebrow">A CLOSER LOOK</span><div class="journal-detail-visual"><journal-blocks :count="active.count" :colors="colors(active)" shape="tower" :size="39"/></div><span class="journal-detail-date">{{data.dayName(active.date)}} · {{active.time}}</span><h3>{{active.title}}</h3><p>{{active.note}}</p><div class="journal-detail-author"><span class="journal-avatar"><img :src="person(active.person).image" alt="" @error="$event.target.hidden=true"><i>{{person(active.person).initials}}</i></span><div><b>{{person(active.person).name}}</b><small>Sample contributor</small></div></div><div class="journal-detail-numbers"><div><b>{{active.count}}</b><small>value blocks / ~hours</small></div><div><b>{{money(active.count*modelValue)}}</b><small>modeled value</small></div></div><div class="journal-detail-frame"><span>FRAME</span><b>{{project==='life'?data.frames[active.frame].name:current.label}}</b></div><button class="journal-open-lab" @click="emit('inspect',{count:active.count,color:color(active)})">Explore this stack in 3D <span>↗</span></button><p class="journal-fiction-note">Concept data, not a live record. Portraits illustrate fictional contributors.</p></aside></div>
    </div>
  </section>`
};
