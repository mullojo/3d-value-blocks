/* UTC civil dates: calendar geometry never depends on DST or parsing local midnight. */
const ValueBlockTime = (() => {
  const DAY=86400000;
  const date=(iso)=>new Date(iso+'T00:00:00Z');
  const iso=(d)=>d.toISOString().slice(0,10);
  const shift=(value,days)=>iso(new Date(date(value).getTime()+days*DAY));
  const startMonth=(year,month)=>new Date(Date.UTC(year,month,1));
  function weekStart(value,first=1){const d=date(value);return shift(value,-((d.getUTCDay()-first+7)%7));}
  function dailyTotal(value,seed=1,min=10,max=20,overrides={}) {
    if(Number.isFinite(overrides[value]))return Math.max(0,Math.min(27,Math.round(overrides[value])));
    min=Math.max(0,Math.min(27,Math.round(min)));max=Math.max(min,Math.min(27,Math.round(max)));
    const ordinal=Math.floor(date(value).getTime()/DAY);
    return min+BlockGeometry.hash(ordinal,0,0,seed)%(max-min+1);
  }
  function monthDays(value,first=1,options={}) {
    const anchor=date(value),year=anchor.getUTCFullYear(),month=anchor.getUTCMonth();
    const begin=startMonth(year,month),offset=(begin.getUTCDay()-first+7)%7;
    const length=new Date(Date.UTC(year,month+1,0)).getUTCDate();
    return Array.from({length:42},(_,slot)=>{
      const day=slot-offset+1;
      if(day<1||day>length)return null;
      const value=iso(new Date(Date.UTC(year,month,day)));
      return {iso:value,number:day,weekday:date(value).getUTCDay(),month,slot,count:dailyTotal(value,options.seed,options.min,options.max,options.overrides)};
    });
  }
  function build({anchor='2026-11-16',scope='month',shape='columns',yearLayout='quarters',spacing='compact',first=1,seed=1,min=10,max=20,overrides={}}={}) {
    const a=date(anchor),year=a.getUTCFullYear();
    const cubits=scope==='day'||shape==='cubits';
    const pitch=spacing==='airy'?(scope==='week'?5:7):scope==='week'?(cubits?4:2):(scope==='month'||scope==='year')?(cubits?5:4):7;
    const footprint=cubits?3:1,capacityHeight=cubits?3:27;
    const days=[],panels=[],pads=[],cells=[];
    const options={seed,min,max,overrides};
    function addDay(value,x,z,slot=0){
      const d=date(value),count=dailyTotal(value,seed,min,max,overrides),day={iso:value,number:d.getUTCDate(),weekday:d.getUTCDay(),month:d.getUTCMonth(),count,x,z,slot};
      days.push(day);pads.push({id:value,x,z,width:footprint,depth:footprint,date:value,weekend:day.weekday===0||day.weekday===6});
      const code=day.month*7+day.weekday;
      for(let i=0;i<count;i++) {
        // Back (low Z) to front, left to right. Complete all 9 cells before rising.
        const dx=cubits?i%3:0,dy=cubits?Math.floor(i/9):i,dz=cubits?Math.floor(i/3)%3:0;
        const colorKey=BlockGeometry.hash(Math.floor(d.getTime()/DAY),i,0,seed)%65521;
        cells.push([x+dx,dy,z+dz,code,colorKey,count]);
      }
    }
    function addMonth(month,originX,originZ) {
      const value=iso(startMonth(year,month));
      const list=monthDays(value,first,options);
      list.forEach((d,slot)=>{
        const x=originX+(slot%7)*pitch,z=originZ+Math.floor(slot/7)*pitch;
        if(d)addDay(d.iso,x,z,slot);
        else pads.push({id:value+'-blank-'+slot,x,z,width:footprint,depth:footprint,date:null});
      });
      const monthlyTotal=list.reduce((sum,d)=>sum+(d?d.count:0),0),maximum=Math.max(0,...list.filter(Boolean).map(d=>d.count));
      panels.push({month,total:monthlyTotal,top:cubits?Math.ceil(maximum/9):maximum,originX,originZ,width:6*pitch+footprint,depth:5*pitch+footprint,id:value,label:new Intl.DateTimeFormat('en',{month:'long',timeZone:'UTC'}).format(startMonth(year,month)),date:value,x:originX+3*pitch+(footprint-1)/2,z:originZ+5*pitch+footprint+2});
    }
    let title;
    if(scope==='day'){
      addDay(anchor,0,0);
      title=new Intl.DateTimeFormat('en',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(a);
    } else if(scope==='week'){
      const start=weekStart(anchor,first);
      for(let i=0;i<7;i++)addDay(shift(start,i),i*pitch,0,i);
      title=`${shortDate(start)} – ${shortDate(shift(start,6))}`;
    } else if(scope==='month'){
      addMonth(a.getUTCMonth(),0,0);
      title=new Intl.DateTimeFormat('en',{month:'long',year:'numeric',timeZone:'UTC'}).format(a);
    } else {
      const columns=yearLayout==='gallery'?4:3;
      const gap=spacing==='compact'?4:9;
      const tileWidth=6*pitch+footprint+gap,tileDepth=5*pitch+footprint+gap;
      for(let m=0;m<12;m++)addMonth(m,(m%columns)*tileWidth,Math.floor(m/columns)*tileDepth);
      title=String(year);
    }
    const bounds=[1,capacityHeight,1];
    for(const pad of pads){bounds[0]=Math.max(bounds[0],pad.x+pad.width);bounds[2]=Math.max(bounds[2],pad.z+pad.depth);}
    for(const panel of panels)bounds[2]=Math.max(bounds[2],panel.z+1);
    return {title,scope,shape:cubits?'cubits':'columns',days,panels,pads,cells,bounds,total:cells.length,capacity:days.length*27,average:days.length?cells.length/days.length:0,footprint,pitch};
  }
  function intensityShade(total){return [200,300,400,500,600,700,800][Math.min(6,Math.max(0,Math.floor((total-1)*7/27)))];}
  function shortDate(value){return new Intl.DateTimeFormat('en',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(date(value));}
  function navigate(anchor,scope,direction){
    const d=date(anchor);
    if(scope==='day'||scope==='week')return shift(anchor,direction*(scope==='day'?1:7));
    const year=d.getUTCFullYear()+(scope==='year'?direction:0),month=d.getUTCMonth()+(scope==='month'?direction:0);
    return iso(startMonth(year,month));
  }
  // Project physical cube coordinates to labels/pads in either renderer's screen space.
  function project(point,bounds,width,height,rotationX,rotationY,zoom=1,gpu=false,autoFit=true){
    const radius=Math.hypot(...bounds)*.5,available=Math.max(60,Math.min(width-72,height-150));
    const scale=(autoFit?Math.min(130,available/(radius*2.35)):130)*zoom;
    const rx=-rotationX*Math.PI/180,ry=rotationY*Math.PI/180;
    const [x,y,z]=point.map((v,i)=>v-(bounds[i]-1)/2);
    const xx=Math.cos(ry)*x+Math.sin(ry)*z,zz=-Math.sin(ry)*x+Math.cos(ry)*z;
    const yy=Math.cos(rx)*y-Math.sin(rx)*zz,depth=Math.sin(rx)*y+Math.cos(rx)*zz;
    const perspective=gpu?1:1100/(1100-depth*scale);
    return {x:width/2+xx*scale*perspective,y:height*(gpu ? .5 : .49)-yy*scale*perspective};
  }
  function placeLabels(labels,width){
    const placed=[];
    for(const label of [...labels].sort((a,b)=>a.y-b.y)){
      const w=label.kind==='month'?62:label.compact?22:32,h=label.compact?18:29;
      const anchorX=label.x,anchorY=label.y;
      const overlaps=(x,y)=>placed.some(other=>Math.abs(other.x-x)<(other.width+w)/2+3 && y>other.y-other.height-3 && y-h<other.y+3);
      let position=null;
      for(let tier=0;tier<=placed.length&&!position;tier++){
        const dy=6+tier*(h+4);
        for(const dx of [0,-w-5,w+5,-(w+5)*2,(w+5)*2]){
          const x=Math.max(w/2+5,Math.min(width-w/2-5,anchorX+dx)),y=anchorY-dy;
          if(!overlaps(x,y)){position={x,y};break;}
        }
      }
      placed.push({...label,...position,anchorX,anchorY,width:w,height:h});
    }
    return placed;
  }
  return {intensityShade,placeLabels,build,monthDays,dailyTotal,weekStart,shift,shortDate,navigate,project};
})();
