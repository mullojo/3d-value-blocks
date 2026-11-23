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
  function build(ledger,scenario='working',periodId='all') {
    if (!scenarios[scenario]) throw new RangeError('Unknown estimate scenario');
    const periods=periodId==='all'?ledger.periods:ledger.periods.filter(p=>p.id===periodId);
    if (!periods.length) throw new RangeError('Unknown contribution period');
    const records=[];
    for (const period of periods) {
      period.entries.forEach((entry,i)=>records.push({id:period.id+':human:'+i,periodId:period.id,kind:'human',count:entry.blocks,family:families[entry.color]||'orange',description:entry.description}));
      records.push({id:period.id+':robot',periodId:period.id,kind:'robot',count:period.robotBlocks[scenario],family:'cyan',description:'Estimated AI-assisted effort saved for this contribution period.'});
    }
    const human=periods.reduce((n,p)=>n+p.blocks,0),robot=periods.reduce((n,p)=>n+p.robotBlocks[scenario],0),total=human+robot;
    return {scenario,periodId,periods,records,human,robot,total,humanValue:human*100,robotValue:robot*100,totalValue:total*100,robotMultiple:robot/human,grossGain:total/human,gift:null,combined:geometry(records),humanGroup:geometry(records.filter(r=>r.kind==='human')),robotGroup:geometry(records.filter(r=>r.kind==='robot'))};
  }
  return {build,geometry,families,scenarios};
})();
if (typeof module!=='undefined' && module.exports) module.exports=ValueBlocksLabModel;
