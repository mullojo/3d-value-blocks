/* Read-only visualization of the recorded contribution ledger. */
const ValueBlocksLabModel = (() => {
  const families = {'🟧':'orange','🟥':'rose','🟨':'amber','🟩':'emerald','🟦':'sky','🟪':'violet','🟫':'stone'};
  const scenarios = {fast:{label:'Fast',name:'Fast estimate'},working:{label:'Working',name:'Working estimate'},deep:{label:'Deep',name:'Deep estimate'}};
  function geometry(records) {
    const total = records.reduce((sum,r)=>sum+r.count,0);
    const side = Math.max(1,Math.ceil(Math.cbrt(total)));
    const height = Math.max(1,Math.ceil(total/(side*side)));
    const center = [(side-1)/2,(height-1)/2,(side-1)/2];
    const blocks = [];
    for (const record of records) for (let j=0;j<record.count;j++) {
      const i=blocks.length,x=i%side,y=Math.floor(i/(side*side)),z=Math.floor(i/side)%side;
      blocks.push({id:record.id+':'+j,kind:record.kind,family:record.family,periodId:record.periodId,entryId:record.id,x,y,z,position:[(x-center[0])*136,(center[1]-y)*136,(z-center[2])*136]});
    }
    const batches = [];
    for (const block of blocks) {
      let batch=batches.find(b=>b.kind===block.kind && b.family===block.family);
      if (!batch) {batch={id:block.kind+':'+block.family,kind:block.kind,family:block.family,blocks:[]};batches.push(batch);}
      batch.blocks.push(block);
    }
    return {total,side,height,blocks,batches};
  }
  function periods(ledger) {
    return ledger.periods.map(period=>{
      const additions=(ledger.additionalContributions||[]).filter(e=>e.periodId===period.id);
      const entries=period.entries.map((e,i)=>({...e,id:period.id+':human:'+i,contributor:period.contributor,personId:'bob',status:period.status})).concat(additions);
      const extra=additions.reduce((n,e)=>n+e.blocks,0);
      return {...period,entries,blocks:period.blocks+extra,manualHours:Object.fromEntries(Object.entries(period.manualHours).map(([key,n])=>[key,n+extra]))};
    });
  }
  function createSession(ledger) {
    const cache=new Map();
    return {build(scenario='working',periodId='all'){
      const key=scenario+':'+periodId;
      if(!cache.has(key))cache.set(key,build(ledger,scenario,periodId));
      return cache.get(key);
    }};
  }
  function build(ledger,scenario='working',periodId='all') {
    if (!scenarios[scenario]) throw new RangeError('Unknown estimate scenario');
    const allPeriods=periods(ledger),selected=periodId==='all'?allPeriods:allPeriods.filter(p=>p.id===periodId);
    if (!selected.length) throw new RangeError('Unknown contribution period');
    const records=[];
    for (const period of selected) {
      period.entries.forEach((entry,i)=>records.push({id:entry.id,personId:entry.personId,periodId:period.id,kind:'human',count:entry.blocks,family:families[entry.color]||'orange',description:entry.description}));
      records.push({id:period.id+':robot',periodId:period.id,kind:'robot',count:period.robotBlocks[scenario],family:'cyan',description:'Estimated AI-assisted effort saved for this contribution period.'});
    }
    const human=selected.reduce((n,p)=>n+p.blocks,0),robot=selected.reduce((n,p)=>n+p.robotBlocks[scenario],0),total=human+robot;
    const side=Math.max(1,Math.ceil(Math.cbrt(total))),bounds={side,height:Math.max(1,Math.ceil(total/(side*side)))};
    const result={bounds,scenario,periodId,periods:selected,records,human,robot,total,humanValue:human*100,robotValue:robot*100,totalValue:total*100,robotMultiple:robot/human,grossGain:total/human,gift:null };
    for(const [key,filter] of [['combined',()=>true],['humanGroup',r=>r.kind==='human'],['robotGroup',r=>r.kind==='robot']]){
      Object.defineProperty(result,key,{enumerable:true,configurable:true,get(){const value=geometry(records.filter(filter));Object.defineProperty(result,key,{value,enumerable:true});return value;}});
    }
    return result;
  }
  return {build,periods,createSession,geometry,families,scenarios};
})();
if (typeof module!=='undefined' && module.exports) module.exports=ValueBlocksLabModel;
