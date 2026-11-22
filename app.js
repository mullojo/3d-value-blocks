/* Build-free Vue. All dependencies are vendored; index.html also works over file://. */
const { createApp, ref, computed, onMounted, onUnmounted, watch } = Vue;

const ValueCube = {
  props: ['block', 'edges', 'finish'],
  computed: {
    placement() {
      return { ...this.block.material,
        transform: `translate3d(${this.block.position[0] * 130}px, ${this.block.position[1] * 130}px, ${this.block.position[2] * 130}px)`,
        '--drop-from': `${-this.block.dropHeight}px`, '--flight-duration': `${BlockBuildQueue.FLIGHT_MS}ms`
      };
    },
    faces() { return this.block.faces; }
  },
  template: `<div class="cube" :class="[finish, { 'has-edges': edges, dropping: block.fall }]" :style="placement" :data-cell="block.id" :data-falling="block.fall">
    <div v-for="face in faces" :key="face" class="face" :class="'face-' + face"></div>
  </div>`
};

createApp({
  components: { ValueCube,JournalLab,InputsLab,TypesLab },
  setup() {
    const families = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'slate', 'gray', 'zinc', 'neutral', 'stone'];
    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    const family = ref('orange'), shade = ref(500), edgeShade = ref(300);
    const theme = ref('dark'), finish = ref('satin'), edges = ref(true), contrast = ref(55);
    const rotationX = ref(-24), rotationY = ref(-35), zoom = ref(1), motion = ref('still'), ground = ref(true), layout = ref('single');
    const blockValue=ref(100),countShape=ref('volume'),countSpacing=ref('compact');
    const currency=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
    const panX=ref(0),panY=ref(0),dragMode=ref('orbit');
    const dragging = ref(false), copyStatus = ref(''), reducedMotion = ref(false);
    const layouts = [{ id: 'single', label: 'Single' }, { id: 'stack', label: 'Stack' }, { id: 'cluster', label: 'Cluster' }, { id: 'cubit', label: 'Cubit · 27' }, { id: 'hundred', label: '100' }, { id: 'thousand', label: '1,000' }, { id: 'year', label: 'Year · 9,855' }, { id: 'sixtyK', label: '60k' }, { id: 'hundredK', label: '100k' }, { id: 'fill', label: 'Fill' }];
    const activePane=ref('blocks'),typesVisited=ref(false);
    const sceneMode=ref('counts'),timeScope=ref('day'),timeShape=ref('columns'),timeYearLayout=ref('gallery'),timeSpacing=ref('compact');
    const today=new Date(),todayISO=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
    const timeAnchor=ref(todayISO),selectedDate=ref(todayISO),timeFirst=ref(1),timeSeed=ref(1),timeMin=ref(10),timeMax=ref(20),timeOverrides=ref({}),timeColorMode=ref('random');
    const weekdayFamilies=['sky','violet','rose','amber','emerald','cyan','blue'];
    const monthFamilies=['rose','orange','amber','lime','emerald','teal','cyan','sky','blue','indigo','violet','fuchsia'];
    const monthCornerOpen=ref(true),monthTotalsView=ref('both');
    const monthCalendar=computed(()=>ValueBlockTime.monthDays(timeAnchor.value,timeFirst.value,timeOptions.value));
    const timeOptions=computed(()=>({seed:timeSeed.value,min:timeMin.value,max:timeMax.value,overrides:timeOverrides.value}));
    const timeModel=computed(()=>ValueBlockTime.build({anchor:timeAnchor.value,scope:timeScope.value,shape:timeShape.value,yearLayout:timeYearLayout.value,spacing:timeSpacing.value,first:timeFirst.value,...timeOptions.value}));
    const weekdayNames=computed(()=>Array.from({length:7},(_,i)=>['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][(timeFirst.value+i)%7]));
    const inspectorDay=computed(()=>timeModel.value.days.find(d=>d.iso===selectedDate.value)||{iso:selectedDate.value,number:Number(selectedDate.value.slice(-2)),count:ValueBlockTime.dailyTotal(selectedDate.value,timeSeed.value,timeMin.value,timeMax.value,timeOverrides.value)});
    const inspectorCalendar=computed(()=>ValueBlockTime.monthDays(selectedDate.value,timeFirst.value,timeOptions.value));
    const inspectorMonth=computed(()=>new Intl.DateTimeFormat('en',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(selectedDate.value+'T00:00:00Z')));
    let countViewState=null;
    function setSceneMode(value){
      activePane.value='blocks';
      if(value===sceneMode.value)return;
      if(value==='time'){
        countViewState={panX:panX.value,panY:panY.value,x:rotationX.value,y:rotationY.value,zoom:zoom.value,motion:motion.value,drop:dropEnabled.value,renderer:rendererMode.value,fit:autoFit.value,palette:colorMode.value};
        sceneMode.value='time';if(colorMode.value==='gradient')colorMode.value='solid';if(timeColorMode.value==='random'&&colorMode.value==='solid')colorMode.value='rainbow';motion.value='still';dropEnabled.value=false;autoFit.value=true;setTimeView();
        if(timeScope.value==='year'&&gpuAvailable.value)rendererMode.value='gpu';
      } else {
        sceneMode.value='counts';
        if(countViewState){panX.value=countViewState.panX;panY.value=countViewState.panY;rotationX.value=countViewState.x;rotationY.value=countViewState.y;zoom.value=countViewState.zoom;motion.value=countViewState.motion;dropEnabled.value=countViewState.drop;autoFit.value=countViewState.fit;rendererMode.value=countViewState.renderer;colorMode.value=countViewState.palette;}
      }
      epoch.value++;
    }
    function setTimeScope(scope){
      if(scope==='year'){if(!gpuAvailable.value)return;rendererMode.value='gpu';}
      timeScope.value=scope;setTimeView();
    }
    function setTimeView(top=false){
      centerPan();
      rotationX.value=top?-90:({day:-24,week:-48,month:-72,year:-70}[timeScope.value]);
      rotationY.value=top?0:({day:-35,week:-15,month:-12,year:-10}[timeScope.value]);zoom.value=top?1:({day:1,week:1.25,month:1.35,year:1.25}[timeScope.value]);autoFit.value=true;motion.value='still';
    }
    function setTimeAnchor(value){
      if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value<'2000-01-01'||value>'2100-12-31'||Number.isNaN(Date.parse(value+'T00:00:00Z')))return;
      timeAnchor.value=value;selectedDate.value=value;
    }
    function navigateTime(direction){setTimeAnchor(ValueBlockTime.navigate(timeAnchor.value,timeScope.value,direction));}
    function openTimeDate(value,scope='day'){setTimeAnchor(value);setTimeScope(scope);}
    function selectTimeDate(value){selectedDate.value=value;if(timeScope.value==='day'||(timeScope.value==='week'&&!timeModel.value.days.some(d=>d.iso===value)))timeAnchor.value=value;}
    function resampleTime(){timeSeed.value++;timeOverrides.value={};}
    function updateTimeRange(which,value){
      const n=Math.max(0,Math.min(27,Math.round(Number(value)||0)));
      if(which==='min'){timeMin.value=n;timeMax.value=Math.max(n,timeMax.value);}else{timeMax.value=n;timeMin.value=Math.min(n,timeMin.value);}
    }
    function setDayTotal(value){timeOverrides.value={...timeOverrides.value,[selectedDate.value]:Math.max(0,Math.min(27,Math.round(Number(value)||0)))};}
    function resetDayTotal(){const next={...timeOverrides.value};delete next[selectedDate.value];timeOverrides.value=next;}
    const count = ref(1), seed = ref(1), dropEnabled = ref(true), autoFit = ref(true), epoch = ref(0);
    const buildRate = ref(32), cssProgress = ref({ launched: 0, landed: 0, active: 0, target: 0 });
    const colorMode = ref('solid'), groupShade = ref(500), savedColors = ref([]), paletteStatus = ref('');
    const gpuCanvas = ref(null), gpuAvailable = ref(false), rendererMode = ref('css');
    const gpuStats = ref({phase:'idle',target:0,prepared:0,landed:0,launched:0,active:0,bounds:[1,1,1],faces:0,drawCalls:0,fps:0,submitMs:0,prepareMs:0});
    let gpuRenderer = null;
    const useGpu = computed(() => gpuAvailable.value && rendererMode.value !== 'css');
    const maxCount = computed(() => useGpu.value ? 100000 : 1000);
    const presetCounts = {single:1,stack:3,cluster:6,cubit:27,hundred:100,thousand:1000,year:9855,sixtyK:60000,hundredK:100000};
    const desiredCount = computed(() => sceneMode.value==='time'?timeModel.value.total:Math.min(maxCount.value, presetCounts[layout.value] || count.value));
    const valueSummary=computed(()=>({blocks:desiredCount.value,hours:desiredCount.value,base:desiredCount.value*100,value:desiredCount.value*blockValue.value}));
    const countModel=computed(()=>sceneMode.value==='counts'&&countShape.value!=='volume'?BlockGeometry.arrange(desiredCount.value,countShape.value,countSpacing.value):null);
    const progress = computed(() => useGpu.value ? gpuStats.value : cssProgress.value);
    const viewport = ref(null), stageSize = ref({ width: 700, height: 570 });
    const rawBlocks = computed(() => {
      if (useGpu.value) return [];
      if(sceneMode.value==='time')return timeModel.value.cells.map(p=>p.slice(0,3));
      if(countModel.value)return countModel.value.cells;
      if (layout.value === 'single') return [[0, 0, 0]];
      if (layout.value === 'stack') return [[0, 0, 0], [0, 1, 0], [0, 2, 0]];
      if (layout.value === 'cluster') return [[0, 0, 0], [1, 0, 0], [0, 0, 1], [1, 0, 1], [0, 1, 0], [1, 1, 0]];
      return BlockGeometry.fill(layout.value === 'cubit' ? 27 : layout.value === 'hundred' ? 100 : layout.value === 'thousand' ? 1000 : count.value, seed.value);
    });
    const bounds = computed(() => {
      if(sceneMode.value==='time')return timeModel.value.bounds;
      if(countModel.value)return countModel.value.bounds;
      if(useGpu.value) return gpuStats.value.bounds;
      return rawBlocks.value.reduce((size, p) => size.map((n, i) => Math.max(n, p[i] + 1)), [1, 1, 1]);
    });
    const toneNeighbor = (tone, offset) => shades[Math.max(0, Math.min(shades.length - 1, shades.indexOf(tone) + offset))];
    function colorTokens(color, tone, edge) {
      return { '--block-front': `var(--color-${color}-${tone})`, '--block-top': `var(--color-${color}-${toneNeighbor(tone, -1)})`, '--block-side': `var(--color-${color}-${toneNeighbor(tone, 1)})`, '--block-edge': `var(--color-${color}-${edge})` };
    }
    const blocks = computed(() => {
      return rawBlocks.value.map((p, i) => {
        const random = BlockGeometry.hash(...p, seed.value);
        let chosen = colorMode.value === 'saved' && savedColors.value.length ? savedColors.value[random % savedColors.value.length] : { family: families[random % 17], shade: groupShade.value, edgeShade: toneNeighbor(groupShade.value, -1) };
        const grouped=sceneMode.value==='time'&&['weekday','month'].includes(timeColorMode.value);
        const randomTime=sceneMode.value==='time'&&timeColorMode.value==='random';
        if(sceneMode.value==='counts'&&colorMode.value==='gradient'){const tone=[200,300,400,500,600,700,800][Math.round(p[1]/Math.max(1,bounds.value[1]-1)*6)];chosen={family:family.value,shade:tone,edgeShade:toneNeighbor(tone,-1)};}
        if(sceneMode.value==='time'&&timeColorMode.value==='gradient'){const tone=ValueBlockTime.intensityShade(timeModel.value.cells[i][5]);chosen={family:family.value,shade:tone,edgeShade:toneNeighbor(tone,-1)};}
        if(randomTime){const key=timeModel.value.cells[i][4];chosen=colorMode.value==='saved'&&savedColors.value.length?savedColors.value[key%savedColors.value.length]:{family:families[key%17],shade:groupShade.value,edgeShade:toneNeighbor(groupShade.value,-1)};}
        if(grouped){const code=timeModel.value.cells[i][3];chosen={family:timeColorMode.value==='weekday'?weekdayFamilies[code%7]:monthFamilies[Math.floor(code/7)],shade:groupShade.value,edgeShade:toneNeighbor(groupShade.value,-1)};}
        return { id: p.join(','), position: [p[0] - (bounds.value[0] - 1) / 2, (bounds.value[1] - 1) / 2 - p[1], p[2] - (bounds.value[2] - 1) / 2],
          material: colorMode.value === 'solid' && !grouped && !randomTime && !(sceneMode.value==='time'&&timeColorMode.value==='gradient') ? {} : colorTokens(chosen.family, chosen.shade, chosen.edgeShade),
          cell: p
        };
      });
    });
    // Bounding sphere stays in-frame at every orbit angle, including spin.
    const fitScale = computed(() => {
      if (!autoFit.value) return 1;
      const radius = Math.hypot(...bounds.value) * 65;
      const available = Math.max(60, Math.min(stageSize.value.width - 72, stageSize.value.height - 150));
      return Math.min(1, available / (radius * 2.35));
    });
    const sceneScale = computed(() => zoom.value * fitScale.value);
    function projectTime(point){return ValueBlockTime.project(point,bounds.value,stageSize.value.width,stageSize.value.height,rotationX.value,rotationY.value,zoom.value,useGpu.value,autoFit.value);}
    const timePads=computed(()=>sceneMode.value!=='time'?[]:timeModel.value.pads.map(p=>{
      const corners=[[p.x-.5,-.55,p.z-.5],[p.x+p.width-.5,-.55,p.z-.5],[p.x+p.width-.5,-.55,p.z+p.depth-.5],[p.x-.5,-.55,p.z+p.depth-.5]];
      return {...p,points:corners.map(c=>{const q=projectTime(c);return `${q.x},${q.y}`;}).join(' ')};
    }));
    const timeWeekLabels=computed(()=>sceneMode.value==='time'&&timeScope.value==='month'?weekdayNames.value.map((label,i)=>({label,...projectTime([i*timeModel.value.pitch+(timeModel.value.footprint-1)/2,-.55,-3])})):[]);
    const timeBoards=computed(()=>{
      if(sceneMode.value!=='time')return [];
      const boards=timeModel.value.panels.length?timeModel.value.panels:[{id:'base',originX:0,originZ:0,width:bounds.value[0],depth:bounds.value[2]}];
      const margin=timeScope.value==='day' ? .55 : 1.5;
      return boards.map(p=>({...p,points:[[p.originX-.5-margin,-.7,p.originZ-.5-margin],[p.originX+p.width-.5+margin,-.7,p.originZ-.5-margin],[p.originX+p.width-.5+margin,-.7,p.originZ+p.depth-.5+margin],[p.originX-.5-margin,-.7,p.originZ+p.depth-.5+margin]].map(c=>{const q=projectTime(c);return `${q.x},${q.y}`;}).join(' ')}));
    });
    const timeLabels=computed(()=>{
      if(sceneMode.value!=='time'||(timeScope.value==='month'&&monthTotalsView.value==='calendar'))return [];
      const labels=timeScope.value==='year'?timeModel.value.panels.map(p=>({...p,count:p.total,kind:'month',...projectTime([p.originX+(p.width-1)/2,Math.max(0,p.top)-.3,p.originZ+(p.depth-1)/2])})):timeModel.value.days.map(d=>{
        const center=(timeModel.value.footprint-1)/2,top=timeModel.value.shape==='cubits'?Math.ceil(d.count/9):d.count;
        const q=projectTime([d.x+center,Math.max(0,top)-.3,d.z+center]);
        const shortMonth=new Intl.DateTimeFormat('en',{month:'short',timeZone:'UTC'}).format(new Date(d.iso+'T00:00:00Z'));
        return {...d,kind:'day',compact:timeScope.value==='month',label:timeScope.value==='week'?['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.weekday]+' '+d.number:d.number+' '+shortMonth,...q};
      });
      return ValueBlockTime.placeLabels(labels,stageSize.value.width);
    });
    let observer;
    const renderCache = new Map();
    const faceOffsets = { front: [0, 0, 1], back: [0, 0, -1], left: [-1, 0, 0], right: [1, 0, 0], top: [0, 1, 0], bottom: [0, -1, 0] };
    const dropHeight = computed(() => Math.max(260, stageSize.value.height * .7 / sceneScale.value));
    const renderedBlocks = computed(() => {
      if (useGpu.value) return [];
      const { landed, launched } = progress.value;
      const occupied = new Set(rawBlocks.value.slice(0, landed).map(p => p.join(',')));
      const visible = [];
      for (let i = 0; i < Math.min(launched, blocks.value.length); i++) {
        const block = blocks.value[i], fall = i >= landed;
        const faces = fall ? Object.keys(faceOffsets) : Object.entries(faceOffsets).filter(([, d]) => !occupied.has(block.cell.map((v, axis) => v + d[axis]).join(','))).map(([face]) => face);
        if (!faces.length) continue;
        const signature = faces.join(',') + fall;
        const cached = renderCache.get(block.id);
        if (cached && cached.source === block && cached.signature === signature && cached.height === dropHeight.value) visible.push(cached.record);
        else {
          const record = { ...block, fall, faces, dropHeight: dropHeight.value };
          renderCache.set(block.id, { source: block, signature, height: dropHeight.value, record });
          visible.push(record);
        }
      }
      return visible;
    });
    const building = computed(() => progress.value.landed < desiredCount.value || (useGpu.value && gpuStats.value.phase === 'preparing'));
    const effectiveRate = computed(() => useGpu.value ? Math.max(buildRate.value, desiredCount.value / 25 * (buildRate.value / 32)) : Math.min(buildRate.value, BlockBuildQueue.MAX_ACTIVE / (BlockBuildQueue.LANDING_MS / 1000)));
    const buildEstimate = computed(() => Math.ceil(desiredCount.value / effectiveRate.value + .76));
    const queue = BlockBuildQueue.create({ requestFrame: callback => requestAnimationFrame(callback), cancelFrame: id => cancelAnimationFrame(id), onUpdate: value => { cssProgress.value = value; } });
    watch(layout, value => {
      if (presetCounts[value]) count.value = Math.min(maxCount.value, presetCounts[value]);
    });
    watch([countShape,countSpacing],()=>{if(sceneMode.value==='counts'){renderCache.clear();epoch.value++;setCountView();}});
    watch([layout, seed], () => { if(sceneMode.value==='counts')epoch.value++; });
    watch([timeModel,countModel,sceneMode],()=>{if(sceneMode.value==='time'){renderCache.clear();epoch.value++;}});
    watch([rawBlocks, epoch, dropEnabled, reducedMotion, useGpu], (values, previous) => {
      if(useGpu.value) {queue.stop();return;}
      const [cells, revision] = values;
      const reset = !previous || revision !== previous[1];
      if (reset) renderCache.clear();
      queue.setTarget(cells.length, { reset, animate: dropEnabled.value && !reducedMotion.value, rate: buildRate.value });
    }, { flush: 'post' });
    watch(activePane,value=>{if(value==='types')typesVisited.value=true;gpuRenderer?.setEnabled(value==='blocks'&&useGpu.value);});
    function inspectJournal(entry){setSceneMode('counts');layout.value='fill';count.value=entry.count;countShape.value='volume';family.value=entry.color;colorMode.value='solid';dropEnabled.value=false;setCountView();zoom.value=1.5;window.scrollTo({top:0,behavior:'instant'});}
    watch(buildRate, value => queue.setRate(value));
    watch([useGpu, desiredCount, layout, seed, epoch, timeModel, sceneMode, countModel], (values, previous) => {
      if(!gpuRenderer)return;
      gpuRenderer.setEnabled(useGpu.value&&activePane.value==='blocks');
      if(useGpu.value)gpuRenderer.reset(desiredCount.value, sceneMode.value==='time'?'time':layout.value, seed.value, dropEnabled.value && !reducedMotion.value, sceneMode.value==='counts'&&!countModel.value&&Boolean(previous && previous[0] && previous[2] === layout.value && previous[3] === seed.value && previous[4] === epoch.value),sceneMode.value==='time'?timeModel.value:countModel.value);
    }, {flush:'post'});
    watch([dropEnabled,reducedMotion], () => {
      if(useGpu.value && (!dropEnabled.value || reducedMotion.value))gpuRenderer?.finishNow();
    });
    watch(rendererMode, () => {
      if(sceneMode.value==='time'){if(!useGpu.value && (timeScope.value==='year'||timeModel.value.total>1000))timeScope.value='month';return;}
      if(!useGpu.value && (count.value>1000 || (presetCounts[layout.value]||0)>1000)) {count.value=1000;layout.value='fill';}
    });
    watch([rotationX,rotationY,zoom,autoFit,motion,reducedMotion,edges,contrast,finish,buildRate,sceneMode,timeColorMode,colorMode], () => syncGpuSettings());
    function syncGpuSettings() {
      gpuRenderer?.setSettings({rotationX:rotationX.value,rotationY:rotationY.value,zoom:zoom.value,autoFit:autoFit.value,motion:motion.value,reducedMotion:reducedMotion.value,edges:edges.value,contrast:contrast.value,finish:finish.value,rate:buildRate.value,groupMode:sceneMode.value==='time'?(timeColorMode.value==='weekday'?1:timeColorMode.value==='month'?2:timeColorMode.value==='random'?3:timeColorMode.value==='gradient'?4:0):colorMode.value==='gradient'?5:0});
    }
    const colorContext = document.createElement('canvas').getContext('2d',{willReadFrequently:true});
    function syncGpuPalette() {
      if(!gpuRenderer)return;
      const grouped=sceneMode.value==='time'&&['weekday','month'].includes(timeColorMode.value);
      const randomTime=sceneMode.value==='time'&&timeColorMode.value==='random';
      const source=(sceneMode.value==='time'&&timeColorMode.value==='gradient')||(sceneMode.value==='counts'&&colorMode.value==='gradient')?[200,300,400,500,600,700,800].map(tone=>({family:family.value,shade:tone,edgeShade:toneNeighbor(tone,-1)})):randomTime?(colorMode.value==='saved'&&savedColors.value.length?savedColors.value:families.slice(0,17).map(color=>({family:color,shade:groupShade.value,edgeShade:toneNeighbor(groupShade.value,-1)}))):grouped?(timeColorMode.value==='weekday'?weekdayFamilies:monthFamilies).map(color=>({family:color,shade:groupShade.value,edgeShade:toneNeighbor(groupShade.value,-1)})):colorMode.value === 'solid' ? [{family:family.value,shade:shade.value,edgeShade:edgeShade.value}] : colorMode.value === 'saved' && savedColors.value.length ? savedColors.value : families.slice(0,17).map(color=>({family:color,shade:groupShade.value,edgeShade:toneNeighbor(groupShade.value,-1)}));
      const themeStyle=getComputedStyle(document.documentElement);
      const rgb=(color,tone) => {
        colorContext.clearRect(0,0,1,1);
        colorContext.fillStyle=themeStyle.getPropertyValue(`--color-${color}-${tone}`).trim();
        colorContext.fillRect(0,0,1,1);return Array.from(colorContext.getImageData(0,0,1,1).data).slice(0,3);
      };
      gpuRenderer.setPalette(source.map(c=>[rgb(c.family,c.shade),rgb(c.family,toneNeighbor(c.shade,-1)),rgb(c.family,toneNeighbor(c.shade,1)),rgb(c.family,c.edgeShade)]));
    }
    watch(timeColorMode,value=>{if(sceneMode.value==='time'&&value==='random'&&colorMode.value==='solid')colorMode.value='rainbow';});
    watch([family,shade,edgeShade,colorMode,groupShade,savedColors,sceneMode,timeColorMode],syncGpuPalette);
    function replayDrop() { epoch.value++; }
    function shuffle() { seed.value++; }
    function saveColor() {
      if (savedColors.value.some(c => c.family === family.value && c.shade === shade.value && c.edgeShade === edgeShade.value)) { paletteStatus.value = 'This material is already saved.'; return; }
      if (savedColors.value.length >= 10) { paletteStatus.value = 'Palette full. Remove a color to save another.'; return; }
      savedColors.value = [...savedColors.value, { family: family.value, shade: shade.value, edgeShade: edgeShade.value }];
      paletteStatus.value = 'Material saved.';
    }
    function removeColor(index) {
      savedColors.value = savedColors.value.filter((_, i) => i !== index);
      if (!savedColors.value.length && colorMode.value === 'saved') colorMode.value = 'solid';
    }
    watch(savedColors, colors => {
      try { localStorage.setItem('value-blocks-palette-v1', JSON.stringify(colors)); }
      catch { paletteStatus.value = 'Saved for this session; browser storage is unavailable.'; }
    });
    const neighbor = (offset) => shades[Math.max(0, Math.min(shades.length - 1, shades.indexOf(shade.value) + offset))];
    const recipe = computed(() => [{ label: 'Front', tone: shade.value }, { label: 'Top', tone: neighbor(-1) }, { label: 'Side', tone: neighbor(1) }, { label: 'Edge', tone: edgeShade.value }]);
    const material = computed(() => ({
      '--block-front': `var(--color-${family.value}-${shade.value})`,
      '--block-top': `var(--color-${family.value}-${neighbor(-1)})`,
      '--block-side': `var(--color-${family.value}-${neighbor(1)})`,
      '--block-edge': `var(--color-${family.value}-${edgeShade.value})`,
      '--block-glow': `var(--color-${family.value}-500)`,
      '--face-contrast': contrast.value / 100,
      '--assembly-lift': '0px',
      '--ground-y': `${bounds.value[1] * 65 + 2}px`,
      '--ground-size': `${Math.max(bounds.value[0], bounds.value[2]) * 200 + 420}px`
    }));
    let lastX = 0, lastY = 0, copyTimer,panDrag=false;
    function startDrag(event) {
      if (event.button !== 0) return;
      viewport.value.focus({preventScroll:true});
      panDrag=event.shiftKey||dragMode.value==='pan';
      dragging.value = true;
      lastX = event.clientX; lastY = event.clientY;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    function drag(event) {
      if (!dragging.value) return;
      if(panDrag)panBy(event.clientX-lastX,event.clientY-lastY);
      else {
      rotationY.value = ((rotationY.value + (event.clientX - lastX) * .5 + 540) % 360) - 180;
      rotationX.value = Math.max(-90, Math.min(80, rotationX.value - (event.clientY - lastY) * .4));
      }
      lastX = event.clientX; lastY = event.clientY;
    }
    function stopDrag() { dragging.value = false; }
    function panBy(x,y){panX.value+=x;panY.value+=y;}
    function centerPan(){panX.value=0;panY.value=0;}
    function changeZoom(direction) {
      zoom.value=Math.max(.05,Math.min(8,Math.round(zoom.value*Math.pow(1.2,direction)*100)/100));
    }
    function fitView() { centerPan();zoom.value=1;autoFit.value=true; }
    function viewKey(event) {
      if(event.ctrlKey||event.metaKey||event.altKey||event.target.closest('input,select,textarea,button,a,[contenteditable="true"]'))return;
      const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
      if(directions[event.key]){event.preventDefault();const [x,y]=directions[event.key],step=event.shiftKey?100:32;panBy(x*step,y*step);return;}
      if(['+','=','-','_','0'].includes(event.key)){
        event.preventDefault();
        if(event.key==='0')fitView();else changeZoom(event.key==='-'||event.key==='_'?-1:1);
      }
    }
    function setCountView(top=false){centerPan();rotationX.value=top?-90:countShape.value==='columns'?-48:countShape.value==='cubits'?-55:-30;rotationY.value=top?0:-35;zoom.value=1;autoFit.value=true;motion.value='still';}
    function resetView() { centerPan();if(sceneMode.value==='time'){setTimeView();return;}rotationX.value = -24; rotationY.value = -35; zoom.value = 1; motion.value = 'still'; }
    async function copyMaterial() {
      const css = `/* ${family.value} ${shade.value} · ${finish.value} · Tailwind CSS 4 tokens */\n.value-block {\n${Object.entries(material.value).filter(([key]) => !key.includes('assembly')).map(([key, value]) => `  ${key}: ${value};`).join('\n')}\n}\n/* Six-face geometry and surface treatments: styles.css */`;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(css); copyStatus.value = 'Material copied';
      } catch {
        const blob = new Blob([css], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = 'value-block-material.css'; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000); copyStatus.value = 'Material CSS downloaded';
      }
      clearTimeout(copyTimer); copyTimer = setTimeout(() => copyStatus.value = '', 2600);
    }
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    function updateMotion() { reducedMotion.value = media.matches; }
    onMounted(() => {
      updateMotion(); media.addEventListener('change', updateMotion);
      try {
        const stored = JSON.parse(localStorage.getItem('value-blocks-palette-v1') || '[]');
        if (Array.isArray(stored)) savedColors.value = stored.filter(c => c && families.includes(c.family) && shades.includes(c.shade) && shades.includes(c.edgeShade)).slice(0, 10);
      } catch { paletteStatus.value = 'Browser storage unavailable; colors can still be saved this session.'; }
      observer = new ResizeObserver(entries => { const { width, height } = entries[0].contentRect; stageSize.value = { width, height }; });
      observer.observe(viewport.value);
      try {
        gpuRenderer=ValueBlockGPU.create(gpuCanvas.value, stats=>{gpuStats.value={...gpuStats.value,...stats};});
        if(gpuRenderer){syncGpuSettings();syncGpuPalette();gpuAvailable.value=true;}
      } catch(error) {gpuStats.value={...gpuStats.value,phase:'unavailable',error:'GPU renderer unavailable. CSS supports up to 1,000 blocks.'};console.error(error);}
      if(!useGpu.value)queue.setTarget(rawBlocks.value.length,{reset:true,animate:dropEnabled.value&&!reducedMotion.value,rate:buildRate.value});
    });
    onUnmounted(() => { media.removeEventListener('change', updateMotion); clearTimeout(copyTimer); queue.stop(); gpuRenderer?.dispose(); observer?.disconnect(); });
    return { activePane,typesVisited,inspectJournal,blockValue,valueSummary,currency,countShape,countSpacing,countModel,setCountView,panX,panY,panBy,centerPan,dragMode,changeZoom,fitView,viewKey,monthCalendar,monthCornerOpen,monthTotalsView,sceneMode,setSceneMode,timeScope,setTimeScope,selectTimeDate,timeShape,timeYearLayout,timeSpacing,timeAnchor,setTimeAnchor,selectedDate,timeFirst,timeMin,timeMax,updateTimeRange,timeOverrides,timeColorMode,timeModel,timePads,timeBoards,timeWeekLabels,timeLabels,weekdayNames,inspectorDay,inspectorCalendar,inspectorMonth,navigateTime,openTimeDate,resampleTime,setDayTotal,resetDayTotal,setTimeView,ValueBlockTime, gpuCanvas, gpuStats, gpuAvailable, rendererMode, useGpu, maxCount, desiredCount, effectiveRate, renderedBlocks, progress, building, buildRate, buildEstimate, count, seed, dropEnabled, autoFit, epoch, colorMode, groupShade, savedColors, paletteStatus, viewport, stageSize, bounds, sceneScale, replayDrop, shuffle, saveColor, removeColor, families, shades, family, shade, edgeShade, theme, finish, edges, contrast, rotationX, rotationY, zoom, motion, ground, layout, layouts, blocks, recipe, material, dragging, copyStatus, reducedMotion, startDrag, drag, stopDrag, resetView, copyMaterial, Math };
  }
}).mount('#app');
