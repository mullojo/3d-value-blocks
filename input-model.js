/* Browser-local entry model. One daily capacity is shared across all contexts. */
const ValueInputModel=(()=>{
 const KEY='value-blocks-inputs-v1';
 const frames={...ValueJournal.frames,Lov:{name:'Love & care',color:'rose',icon:'♡'},Veg:{name:'Plants & vegan living',color:'emerald',icon:'↟'},Mov:{name:'Movement',color:'sky',icon:'↗'},Rest:{name:'Peace & rest',color:'violet',icon:'☾'},Coop:{name:'Cooperation',color:'amber',icon:'◇'},Spir:{name:'Spirit & reflection',color:'violet',icon:'✧'},Natr:{name:'Nature',color:'emerald',icon:'↟'},Play:{name:'Play & fun',color:'amber',icon:'✳'},Simp:{name:'Simplicity',color:'sky',icon:'◇'}};
 const frameInfo=code=>frames[code]||{name:code,color:'violet',icon:'◇'};
 const colorFrame={'🟦':'Hlth','🟩':'Eco','🟨':'Joy','🟧':'Bld','🟪':'Lrn','🟥':'Kind','⬛':'Rest','⬜':'Rest','■':'Bld'};
 function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;}
 function validate(e){
  if(!validDate(e.date))throw Error('Choose a valid calendar date.');
  if(!ValueJournal.people.some(p=>p.id===e.person))throw Error('Choose a person.');
  if(!Number.isInteger(e.count)||e.count<1||e.count>27)throw Error('Each entry needs 1–27 whole blocks.');
  if(typeof e.title!=='string'||!e.title.trim()||e.title.length>160)throw Error('Give the entry a title of 1–160 characters.');
  if(!Array.isArray(e.frames)||!e.frames.length||e.frames.length>8||e.frames.some(f=>typeof f!=='string'||!/^\+?[\p{L}\p{N}_:-]{1,24}$/u.test(f)))throw Error('Use 1–8 short frame codes (letters, numbers, +, _, : or -).');
  if(!['life','project'].includes(e.scope))throw Error('Choose a life or project context.');
  if(e.scope==='project'&&(typeof e.project!=='string'||!e.project.trim()||e.project.length>80))throw Error('Name the project (up to 80 characters).');
  if(e.blockColor!=null&&(typeof e.blockColor!=='string'||!/^(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(-(100|200|300|400|500|600|700|800|900))?$/.test(e.blockColor)))throw Error('Choose a valid entry block color and tone.');
  if(typeof e.notes!=='string'||e.notes.length>2000)throw Error('Keep notes under 2,000 characters.');
  return {...e,title:e.title.trim(),project:e.scope==='project'?e.project.trim():'',frames:[...new Set(e.frames.map(code=>Object.keys(frames).find(key=>key.toLowerCase()===code.toLowerCase())||code))],notes:e.notes.trim()};
 }
 const used=(entries,date,person)=>entries.filter(e=>e.date===date&&e.person===person).reduce((n,e)=>n+e.count,0);
 function append(existing,incoming){
  if(existing.length+incoming.length>5000)throw Error('This playground holds up to 5,000 entries. Clear some entries to keep exploring.');
  const next=[...existing],totals=new Map();for(const e of existing){const key=e.date+':'+e.person;totals.set(key,(totals.get(key)||0)+e.count);}
  for(const raw of incoming){const e=validate(raw),key=e.date+':'+e.person,total=totals.get(key)||0;if(total+e.count>27){const name=ValueJournal.people.find(p=>p.id===e.person).name;throw Error(`${name} has ${total} blocks on ${e.date}; only ${27-total} of 27 remain. Nothing from this batch was saved.`);}totals.set(key,total+e.count);next.push(e);}
  return next;
 }
 function update(existing,id,patch){
  const original=existing.find(e=>e.id===id);if(!original)throw Error('This entry no longer exists. Cancel editing and choose another entry.');
  const replacement=validate({...original,...patch,id:original.id,createdAt:original.createdAt,demo:false,updatedAt:new Date().toISOString()});
  try{append(existing.filter(e=>e.id!==id),[replacement]);}catch(error){throw Error(error.message.replace('Nothing from this batch was saved.','No changes were saved.'));}
  return existing.map(e=>e.id===id?replacement:e);
 }
 function restore(raw){if(!raw)return [];const saved=JSON.parse(raw);if(saved.version!==1||!Array.isArray(saved.entries))throw Error('Saved entries have an unsupported format.');const ids=new Set();for(const e of saved.entries){if(typeof e.id!=='string'||ids.has(e.id))throw Error('Saved entries contain invalid identifiers.');ids.add(e.id);}return append([],saved.entries);}
 function parse(text,defaults){
  const entries=[],errors=[],lines=text.split(/\r?\n/);if(lines.length>100)return {entries:[],errors:[{line:0,message:'Paste up to 100 lines at a time.'}]};
  lines.forEach((raw,index)=>{let line=raw.trim();if(!line)return;try{
    const symbols=line.match(/^(?:(?:🟦|🟩|🟨|🟧|🟪|🟥|⬛|⬜|■)\uFE0F?\s*)+/u),numeric=line.match(/^(?:\[(\d+)\]|\+?(\d+)(?:x|×)?(?=\s))\s*/u);let count,color;
    if(symbols){const tokens=symbols[0].match(/🟦|🟩|🟨|🟧|🟪|🟥|⬛|⬜|■/gu);count=tokens.length;color=colorFrame[tokens[0]];line=line.slice(symbols[0].length).trim();}
    else if(numeric){count=Number(numeric[1]||numeric[2]);line=line.slice(numeric[0].length).trim();}else throw Error('Start with colored blocks, 2x, +2, or [2].');
    let person=defaults.person,project='',scope='life';const personTag=line.match(/@([\p{L}\p{N}_-]+)/u);if(personTag){const p=ValueJournal.people.find(p=>p.id.toLowerCase()===personTag[1].toLowerCase()||p.name.toLowerCase()===personTag[1].toLowerCase());if(!p)throw Error('Unknown person @'+personTag[1]+'. Use Ada, Leo, Maya, or Sam.');person=p.id;line=line.replace(personTag[0],'');}
    const projectTag=line.match(/<([^<>]+)>/u);if(projectTag){project=projectTag[1].trim();scope='project';line=line.replace(projectTag[0],'');}
    const frameTags=[...line.matchAll(/\|([^|]+)\|/gu)];const codes=frameTags.flatMap(m=>m[1].split(/[,/]/).map(s=>s.trim()).filter(Boolean));line=line.replace(/\|[^|]+\|/gu,'').trim();
    const parts=line.split(/\s+\/\/\s+/u),title=parts.shift().replace(/\s+/g,' ').trim(),notes=parts.join(' // ');
    entries.push(validate({...defaults,person,scope,project,count,title,notes,frames:codes.length?codes:[color||defaults.frame||'Bld']}));
  }catch(error){errors.push({line:index+1,message:error.message});}});
  return {entries,errors};
 }
 function journalEntries(entries,date,lens='life',project=''){
  const day=entries.filter(e=>e.date===date);
  return lens==='project'?day.filter(e=>e.scope==='project'&&e.project===project):day;
 }
 function demoRows(date,existing=[]){
  const stories={
   ada:[[2,'Hlth','Rested and ate breakfast without rushing','Slept well, sat in the morning light, and took time over breakfast.'],[2,'Lov','Listened to my partner without distractions','Put our phones away and talked through what had been on our minds.'],[3,'Coop','Cooked dinner and tidied our shared space','Cooked, tidied, and made the day easier together.'],[3,'Eco','Recorded and shared water clarity observations','Logged the tide-line observations for the volunteer team.','Heal the Bay'],[4,'Bld','Coded the journal’s contribution preview','Coded the contribution preview and refined the spacing around each entry.','Value Blocks Lab'],[4,'Lrn','Read and took notes on community projects','Read, reflected, and wrote down a few new connections.']],
   leo:[[3,'Hlth','Got the rest I needed','Went to bed early and woke up feeling restored.'],[2,'Mov','Walked home along the waterfront','Walked by the water and noticed the changing light.'],[3,'Lov','Stayed and listened during a friend’s hard afternoon','Helped with a difficult afternoon and stayed to listen.'],[4,'Eco','Collected beach litter and prepared cleanup supplies','Collected litter and prepared the next cleanup kit.','Heal the Bay'],[4,'Bld','Prototyped a simpler entry form','Prototyped a simpler way to record a meaningful moment.','Value Blocks Lab'],[4,'Joy','Made dinner and welcomed a neighbor','Made a shared meal and welcomed a neighbor.']],
   maya:[[2,'Hlth','Ate lunch and took a screen-free break','Made a nourishing lunch and sat outside without looking at a screen.'],[3,'Lrn','Shared what I learned with the team','Explored an idea and shared the useful parts.'],[3,'Kind','Sorted clothes and helped free shop visitors','Sorted donated clothes and welcomed families to the free shop.','Sustainable Joy'],[4,'Bld','Designed and reviewed the journal layout','Designed the next journal layout and reviewed it with the team.','Value Blocks Lab'],[3,'Coop','Groceries and dishes','Picked up groceries, washed the pans and plates, and planned tomorrow’s meals.'],[2,'Lov','Brought homemade food to a neighbor','Checked in on a neighbor and brought something homemade.']],
   sam:[[3,'Hlth','Rested before a busy day','Made room for recovery before the busy part of the day.'],[3,'Mov','Cycled around the neighborhood instead of driving','Cycled through the neighborhood instead of driving.'],[2,'Lov','Listened while a friend talked things through','Listened closely and made space for someone else.'],[4,'Eco','Taught children about ocean life','Helped children explore the life beyond the shoreline.','Heal the Bay'],[4,'Kind','Prepared essentials and welcomed shop visitors','Prepared essentials and a welcoming space for new visitors.','Sustainable Joy'],[3,'Play','Played music with friends','Played, experimented, and enjoyed making something together.']]
  };
  const rows=[],ids=new Set(existing.map(e=>e.id));
  for(const [person,list] of Object.entries(stories)){
   const target=list.reduce((n,r)=>n+r[0],0);let room=Math.max(0,Math.min(27,target)-used(existing,date,person));
   list.forEach(([wanted,code,title,notes,project],i)=>{const id='demo2:'+date+':'+person+':'+i;if(room<1||ids.has(id))return;const count=Math.min(room,wanted);rows.push(validate({id,date,person,count,title,notes,frames:[code],scope:project?'project':'life',project:project||'',demo:true,createdAt:date+'T12:00:00.000Z'}));room-=count;});
  }
  return rows;
 }
 // Refresh only untouched simulated copy; retain each record’s identity, count and palette.
 function refreshDemoCopy(entries){const days=new Map();return entries.map(e=>{if(!e.demo)return e;if(!days.has(e.date))days.set(e.date,new Map(demoRows(e.date).map(row=>[row.id,row])));const sample=days.get(e.date).get(e.id);return sample&&(sample.title!==e.title||sample.notes!==e.notes)?{...e,title:sample.title,notes:sample.notes}:e;});}
 return {demoRows,refreshDemoCopy,journalEntries,KEY,frames,frameInfo,validate,validDate,used,append,update,restore,parse};
})();
