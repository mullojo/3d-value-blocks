/* Shared, browser-local palettes for life frames and project journals. */
const ValueBlockColors=(()=>{
 const KEY='value-blocks-colors-v1',families=['red','orange','amber','yellow','lime','green','emerald','teal','cyan','sky','blue','indigo','violet','purple','fuchsia','pink','rose'];
 const shades=[100,200,300,400,500,600,700,800,900];
 const validToken=token=>typeof token==='string'&&families.some(f=>token===f||shades.some(n=>token===f+'-'+n));
 const family=token=>String(token).replace(/-\d+$/,'');
 const state=Vue.reactive({frames:{},projects:{}}),notice=Vue.ref('');
 const defaultProject=name=>({mode:name==='Heal the Bay'?'mixed':'solid',color:name==='Sustainable Joy'?'emerald':name==='Heal the Bay'?'red':'orange'});
 function frame(code){return state.frames[code]||ValueInputModel.frameInfo(code).color;}
 function project(name){return state.projects[name]||defaultProject(name);}
 function persist(){try{localStorage.setItem(KEY,JSON.stringify({version:1,frames:state.frames,projects:state.projects}));notice.value='Colors saved in this browser.';}catch{notice.value='Colors changed for this session; browser storage is unavailable.';}}
 function load(raw){if(!raw)return;const data=JSON.parse(raw);if(data.version!==1)return;state.frames=Object.fromEntries(Object.entries(data.frames||{}).filter(([k,v])=>k.length<=24&&families.includes(v)));state.projects=Object.fromEntries(Object.entries(data.projects||{}).filter(([k,v])=>k.length<=80&&v&&['mixed','solid','custom'].includes(v.mode)&&families.includes(v.color)).map(([k,v])=>[k,{...v,palette:Array.isArray(v.palette)?v.palette.filter(item=>item&&validToken(item.token)&&typeof item.label==='string').slice(0,20):undefined}]));}
 try{load(localStorage.getItem(KEY));}catch{notice.value='Saved colors could not be loaded. Default palettes are shown.';}
 if(typeof window!=='undefined')window.addEventListener('storage',e=>{if(e.key===KEY){try{state.frames={};state.projects={};load(e.newValue);}catch{notice.value='Colors in another tab could not be read.';}}});
 function setFrame(code,color){if(!families.includes(color))return;state.frames={...state.frames,[code]:color};persist();}
 function setProject(name,patch){const next={...project(name),...patch};if(!name||!families.includes(next.color)||!['mixed','solid','custom'].includes(next.mode))return;state.projects={...state.projects,[name]:next};persist();}
 function meaning(e){const token=colors(e)[0];return e.scope==='project'?(options(e.project).find(o=>o.token===token)?.label||token):'';}
 function reset(){state.frames={};state.projects={};persist();}
 function options(name){const config=project(name);if(config.mode==='custom'&&config.palette?.length)return config.palette;
  if(config.mode==='mixed')return ['sky','emerald','amber','orange','violet','rose'].map(color=>({token:color+'-500',label:color}));
  return [200,400,500,600,800].map(shade=>({token:config.color+'-'+shade,label:config.color+' '+shade}));
 }
 function editPalette(name,index,patch){const palette=options(name).map((item,i)=>i===index?{...item,...patch}:item);if(palette.some(item=>!validToken(item.token)||typeof item.label!=='string'||item.label.length>80))return;setProject(name,{mode:'custom',palette});}
 function addColor(name){const palette=options(name);if(palette.length<20)setProject(name,{mode:'custom',palette:[...palette,{token:'rose-500',label:'New work type'}]});}
 function removeColor(name,index){const palette=options(name).filter((_,i)=>i!==index);if(palette.length)setProject(name,{mode:'custom',palette});}
 function colors(e){const config=e.scope==='project'?project(e.project):{mode:'solid',color:frame(e.frames[0])};let seed=0;for(const c of String(e.id||e.title||''))seed=(seed*31+c.charCodeAt(0))>>>0;
  const token=e.scope==='project'&&validToken(e.blockColor)?e.blockColor:e.scope!=='project'?config.color:options(e.project)[seed%options(e.project).length].token;
  return Array(e.count).fill(token);
 }

 return {state,notice,families,shades,validToken,family,frame,project,setFrame,setProject,reset,colors,meaning,options,editPalette,addColor,removeColor};
})();
