/* WebGL2 surface instancing. No per-block DOM, dependencies, or build step. */
const ValueBlockGPU = (() => {
  const OPPOSITE = [1, 0, 3, 2, 5, 4];
  const DIRECTIONS = [[0,0,1],[0,0,-1],[-1,0,0],[1,0,0],[0,1,0],[0,-1,0]];
  const FLIGHT = .7, MAX_FLYING = 4096, TEX_WIDTH = 512;
  const vertex = `#version 300 es
  precision highp float;
  precision highp int;
  layout(location=0) in vec2 corner;
  layout(location=1) in vec4 surface;
  uniform mat4 matrix;
  uniform sampler2D cells;
  uniform bool flying;
  uniform int firstFlying;
  uniform int paletteCount;
  uniform uint seed;
  uniform float clockTime;
  uniform float dropHeight;
  uniform vec3 center;
  out vec2 uv;
  flat out int face;
  flat out int materialIndex;
  uint hashCell(uvec3 p) {
    uint n = (p.x+11u)*73856093u ^ (p.y+17u)*19349663u ^ (p.z+23u)*83492791u ^ seed*2654435761u;
    n = (n ^ (n >> 16u))*2246822507u;
    return n ^ (n >> 13u);
  }
  void main() {
    vec3 cell;
    float lift = 0.;
    if (flying) {
      int id = firstFlying + gl_InstanceID / 6;
      vec4 record = texelFetch(cells, ivec2(id % 512, id / 512), 0);
      cell = record.xyz;
      face = gl_InstanceID % 6;
      float t = clamp((clockTime-record.w)/.7, 0., 1.);
      lift = dropHeight * pow(1.-t, 2.);
      if (t > .86) lift += .045*sin((t-.86)/.14*3.14159);
    } else { cell = surface.xyz; face = int(surface.w); }
    vec2 q = corner*.5;
    vec3 p;
    if (face==0) p=vec3(q.x,q.y,.5);
    else if (face==1) p=vec3(-q.x,q.y,-.5);
    else if (face==2) p=vec3(-.5,q.y,q.x);
    else if (face==3) p=vec3(.5,q.y,-q.x);
    else if (face==4) p=vec3(q.x,.5,-q.y);
    else p=vec3(q.x,-.5,q.y);
    materialIndex=int(hashCell(uvec3(cell)) % uint(paletteCount));
    uv=corner*.5+.5;
    gl_Position=matrix*vec4(cell-center+p+vec3(0.,lift,0.),1.);
  }`;
  const fragment = `#version 300 es
  precision highp float;
  precision highp int;
  in vec2 uv;
  flat in int face;
  flat in int materialIndex;
  uniform sampler2D palette;
  uniform bool edges;
  uniform float contrast;
  uniform int finish;
  out vec4 outputColor;
  void main() {
    int column=face==4 ? 1 : (face==0 ? 0 : 2);
    vec3 base=texelFetch(palette,ivec2(column,materialIndex),0).rgb;
    float gradient=(uv.y+1.-uv.x)*.5;
    float strength=finish==2 ? .025 : .10;
    base=mix(base,vec3(1.),gradient*strength*contrast);
    base*=1.-(1.-gradient)*.08*contrast;
    if(finish==1) base=mix(base,vec3(1.),.22*contrast*pow(max(0.,1.-abs(uv.x+uv.y-1.2)),8.));
    if(edges) {
      float distanceToEdge=min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y));
      float pixel=max(fwidth(uv.x),fwidth(uv.y));
      float line=1.-smoothstep(.006,.006+min(pixel,.08),distanceToEdge);
      // Fade subpixel lines instead of turning every tiny cube into an edge-colored tile.
      line*=clamp(.07/max(pixel,.0001),0.,1.);
      base=mix(base,texelFetch(palette,ivec2(3,materialIndex),0).rgb,line*.85);
    }
    outputColor=vec4(base,1.);
  }`;
  function multiply(a,b) {
    const out=new Float32Array(16);
    for(let c=0;c<4;c++) for(let r=0;r<4;r++) for(let k=0;k<4;k++) out[c*4+r]+=a[k*4+r]*b[c*4+k];
    return out;
  }
  function cameraMatrix(width,height,scale,rx,ry,radius) {
    const halfW=width/(2*scale),halfH=height/(2*scale),far=radius*12+100, distance=radius*4+20;
    const projection=new Float32Array([1/halfW,0,0,0, 0,1/halfH,0,0, 0,0,-2/far,0, 0,0,-1,1]);
    const x=rx*Math.PI/180,y=ry*Math.PI/180,cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y);
    const rotX=new Float32Array([1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1]);
    const rotY=new Float32Array([cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1]);
    const translation=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,-distance,1]);
    return multiply(projection,multiply(translation,multiply(rotX,rotY)));
  }
  function create(canvas,onStats) {
    const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'high-performance'});
    if(!gl) return null;
    function shader(type,source) {
      const object=gl.createShader(type);gl.shaderSource(object,source);gl.compileShader(object);
      if(!gl.getShaderParameter(object,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(object));
      return object;
    }
    const program=gl.createProgram(),vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);
    gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.deleteShader(vs);gl.deleteShader(fs);
    const uniforms=Object.fromEntries(['matrix','cells','flying','firstFlying','paletteCount','seed','clockTime','dropHeight','center','palette','edges','contrast','finish'].map(n=>[n,gl.getUniformLocation(program,n)]));
    const quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,-1,1,1,-1,1]),gl.STATIC_DRAW);
    const surfaceBuffer=gl.createBuffer();
    function vao(instanced) {
      const v=gl.createVertexArray();gl.bindVertexArray(v);gl.bindBuffer(gl.ARRAY_BUFFER,quad);
      gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
      if(instanced) { gl.bindBuffer(gl.ARRAY_BUFFER,surfaceBuffer);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,4,gl.FLOAT,false,16,0);gl.vertexAttribDivisor(1,1); }
      return v;
    }
    const staticVAO=vao(true),flightVAO=vao(false);
    const cellTexture=gl.createTexture(),paletteTexture=gl.createTexture();
    function configureTexture(texture) {
      gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    }
    configureTexture(cellTexture);configureTexture(paletteTexture);
    let settings={rotationX:-24,rotationY:-35,zoom:1,autoFit:true,motion:'still',reducedMotion:false,edges:true,contrast:55,finish:'satin',rate:32};
    let enabled=false,disposed=false,lost=false,frame=null,last=null,clock=0,credit=0,dirty=true;
    let target=0,prepared=0,launched=0,landed=0,surfaceCount=0,phase='idle',generator=null,dimension=1;
    let records=new Float32Array(0),grid=new Int32Array(0),slots=new Int32Array(0),keys=new Int32Array(0),surfaceData=new Float32Array(0);
    let bounds=[1,1,1],sceneSeed=1,animate=true,prepareStart=0,prepareMs=0,dirtyMin=Infinity,dirtyMax=-1,textureHeight=1;
    let lastStats=0,sampleStart=0,sampleFrames=0,fps=0,drawCalls=0,renderMs=0,paletteCount=1,retained=0;
    const resize=new ResizeObserver(()=>{dirty=true;wake();});resize.observe(canvas);
    function effectiveRate() {return Math.max(settings.rate,target/25*(settings.rate/32));}
    function emit(now,force=false) {
      if(!force && now-lastStats<180) return;
      lastStats=now;
      onStats({phase,target,prepared,launched,landed,active:launched-landed,bounds:[...bounds],faces:surfaceCount+(launched-landed)*6,drawCalls,fps:Math.round(fps),submitMs:Math.round(renderMs*100)/100,prepareMs:Math.round(prepareMs),pixels:canvas.width*canvas.height});
    }
    function reset(count,layout,seed,shouldAnimate,preserve=false) {
      retained=preserve?Math.min(count,Math.max(landed,retained)):0;
      prepareMs=0;
      target=Math.min(100000,Math.max(1,Math.floor(count)));sceneSeed=seed;animate=shouldAnimate;
      prepared=launched=landed=surfaceCount=0;drawCalls=0;clock=credit=0;phase='preparing';last=null;fps=0;sampleFrames=0;sampleStart=0;
      dimension=Math.ceil(Math.cbrt(target));
      const special=layout==='single'?[[0,0,0]]:layout==='stack'?[[0,0,0],[0,1,0],[0,2,0]]:layout==='cluster'?[[0,0,0],[1,0,0],[0,0,1],[1,0,1],[0,1,0],[1,1,0]]:null;
      if(special)dimension=Math.max(...special.flat())+1;
      bounds=[1,1,1];textureHeight=Math.ceil(target/TEX_WIDTH);
      records=new Float32Array(TEX_WIDTH*textureHeight*4);grid=new Int32Array(dimension**3).fill(-1);
      slots=new Int32Array(target*6).fill(-1);
      const capacity=Math.min(target*6,dimension*dimension*24);
      surfaceData=new Float32Array(capacity*4);keys=new Int32Array(capacity);
      generator=special?special[Symbol.iterator]():BlockGeometry.cells(target,seed);
      gl.bindBuffer(gl.ARRAY_BUFFER,surfaceBuffer);gl.bufferData(gl.ARRAY_BUFFER,surfaceData.byteLength,gl.DYNAMIC_DRAW);
      dirtyMin=Infinity;dirtyMax=-1;prepareStart=performance.now();dirty=true;
      emit(performance.now(),true);wake();
    }
    function cellKey(x,y,z) {return (y*dimension+z)*dimension+x;}
    function mark(slot) {dirtyMin=Math.min(dirtyMin,slot);dirtyMax=Math.max(dirtyMax,slot);}
    function addFace(index,face) {
      const slot=surfaceCount++;
      if(surfaceCount>keys.length) throw new Error('Surface capacity exceeded');
      keys[slot]=index*6+face;slots[index*6+face]=slot;
      const a=index*4,b=slot*4;surfaceData[b]=records[a];surfaceData[b+1]=records[a+1];surfaceData[b+2]=records[a+2];surfaceData[b+3]=face;mark(slot);
    }
    function removeFace(index,face) {
      const key=index*6+face,slot=slots[key];if(slot<0)return;
      const lastSlot=--surfaceCount;
      if(slot!==lastSlot) {surfaceData.copyWithin(slot*4,lastSlot*4,lastSlot*4+4);keys[slot]=keys[lastSlot];slots[keys[slot]]=slot;mark(slot);}
      slots[key]=-1;
    }
    function land(index) {
      const a=index*4,x=records[a],y=records[a+1],z=records[a+2];
      for(let f=0;f<6;f++) {
        const d=DIRECTIONS[f],nx=x+d[0],ny=y+d[1],nz=z+d[2];
        const neighbor=nx<0||ny<0||nz<0||nx>=dimension||ny>=dimension||nz>=dimension?-1:grid[cellKey(nx,ny,nz)];
        if(neighbor>=0 && neighbor<index) removeFace(neighbor,OPPOSITE[f]); else addFace(index,f);
      }
    }
    function uploadRecords(first,end) {
      if(end<=first)return;
      const firstRow=Math.floor(first/TEX_WIDTH),lastRow=Math.floor((end-1)/TEX_WIDTH);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,cellTexture);
      gl.texSubImage2D(gl.TEXTURE_2D,0,0,firstRow,TEX_WIDTH,lastRow-firstRow+1,gl.RGBA,gl.FLOAT,records.subarray(firstRow*TEX_WIDTH*4,(lastRow+1)*TEX_WIDTH*4));
    }
    function prepare() {
      const start=performance.now();
      while(prepared<target && performance.now()-start<5) {
        const next=generator.next();if(next.done)break;
        const [x,y,z]=next.value,i=prepared++;
        records.set([x,y,z,-10000],i*4);grid[cellKey(x,y,z)]=i;
        bounds[0]=Math.max(bounds[0],x+1);bounds[1]=Math.max(bounds[1],y+1);bounds[2]=Math.max(bounds[2],z+1);
      }
      if(prepared===target) {
        gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,cellTexture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,TEX_WIDTH,textureHeight,0,gl.RGBA,gl.FLOAT,records);
        prepareMs=performance.now()-prepareStart;phase=retained?'preparing':'building';generator=null;
      }
    }
    function advance(dt) {
      if(phase==='preparing') {
        if(generator)prepare();
        else {
          const started=performance.now();
          while(landed<retained && performance.now()-started<5)land(landed++);
          launched=landed;
          if(landed===retained){phase=landed===target?'complete':'building';retained=0;prepareMs=performance.now()-prepareStart;}
        }
        return;
      }
      if(phase!=='building')return;
      clock+=dt;
      // Even instant mode batches CPU topology work into short, cancelable slices.
      const start=performance.now();
      if(!animate) {
        while(landed<target && performance.now()-start<5)land(landed++);
        launched=landed;
      } else {
        credit=Math.min(512,credit+effectiveRate()*dt);
        const first=launched,amount=Math.min(Math.floor(credit),target-launched,MAX_FLYING-(launched-landed));
        for(let i=0;i<amount;i++)records[(launched++)*4+3]=clock;
        credit-=amount;uploadRecords(first,launched);
        while(landed<launched && records[landed*4+3]+FLIGHT<=clock && performance.now()-start<5)land(landed++);
      }
      if(landed===target){phase='complete';dirty=true;}
    }
    function draw(now) {
      const started=performance.now();
      if(phase==='preparing'){drawCalls=0;return;}
      const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;
      const dpr=Math.min(devicePixelRatio||1,1.5);
      if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
      gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      const radius=Math.hypot(...bounds)*.5;
      const available=Math.max(60,Math.min(width-72,height-150));
      const scale=(settings.autoFit?Math.min(130,available/(radius*2.35)):130)*settings.zoom;
      let ry=settings.rotationY,rx=-settings.rotationX;
      if(settings.motion==='spin'&&!settings.reducedMotion)ry+=now*.018;
      const center=bounds.map(n=>(n-1)/2);
      if(settings.motion==='float'&&!settings.reducedMotion)center[1]-=Math.sin(now*.0016)*.12;
      gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.frontFace(gl.CCW);
      gl.uniformMatrix4fv(uniforms.matrix,false,cameraMatrix(width,height,scale,rx,ry,radius));
      gl.uniform3fv(uniforms.center,center);gl.uniform1ui(uniforms.seed,sceneSeed);
      gl.uniform1f(uniforms.clockTime,clock);gl.uniform1f(uniforms.dropHeight,height*.75/scale);
      gl.uniform1i(uniforms.edges,settings.edges?1:0);gl.uniform1f(uniforms.contrast,settings.contrast/100);
      gl.uniform1i(uniforms.finish,['satin','gloss','matte'].indexOf(settings.finish));
      gl.uniform1i(uniforms.paletteCount,paletteCount);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,cellTexture);gl.uniform1i(uniforms.cells,0);
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,paletteTexture);gl.uniform1i(uniforms.palette,1);
      drawCalls=0;
      if(surfaceCount) {
        gl.bindBuffer(gl.ARRAY_BUFFER,surfaceBuffer);
        if(dirtyMax>=dirtyMin)gl.bufferSubData(gl.ARRAY_BUFFER,dirtyMin*16,surfaceData.subarray(dirtyMin*4,(dirtyMax+1)*4));
        dirtyMin=Infinity;dirtyMax=-1;
        gl.bindVertexArray(staticVAO);gl.uniform1i(uniforms.flying,0);gl.drawArraysInstanced(gl.TRIANGLES,0,6,surfaceCount);drawCalls++;
      }
      if(launched>landed){gl.bindVertexArray(flightVAO);gl.uniform1i(uniforms.flying,1);gl.uniform1i(uniforms.firstFlying,landed);gl.drawArraysInstanced(gl.TRIANGLES,0,6,(launched-landed)*6);drawCalls++;}
      renderMs=performance.now()-started;dirty=false;
    }
    function tick(now) {
      frame=null;if(disposed||!enabled||lost)return;
      const dt=last===null?0:Math.min(.04,Math.max(0,(now-last)/1000));last=now;
      advance(dt);
      const moving=phase==='building'||phase==='preparing'||(settings.motion!=='still'&&!settings.reducedMotion);
      if(dirty||moving){draw(now);sampleFrames++;}
      if(!sampleStart)sampleStart=now;
      if(now-sampleStart>=500){fps=sampleFrames*1000/(now-sampleStart);sampleFrames=0;sampleStart=now;}
      emit(now,phase==='complete'&&!moving);
      if(moving)frame=requestAnimationFrame(tick);else{last=null;emit(now,true);}
    }
    function wake(){if(enabled&&!disposed&&!lost&&frame===null){if(last===null){sampleStart=0;sampleFrames=0;fps=0;}frame=requestAnimationFrame(tick);}}
    function setPalette(colors) {
      paletteCount=colors.length;
      const bytes=new Uint8Array(colors.length*4*4);
      colors.forEach((material,i)=>material.forEach((rgb,j)=>bytes.set([...rgb,255],i*16+j*4)));
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,paletteTexture);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,4,colors.length,0,gl.RGBA,gl.UNSIGNED_BYTE,bytes);
      dirty=true;wake();
    }
    function setSettings(value){Object.assign(settings,value);dirty=true;wake();}
    function setEnabled(value){enabled=value;last=null;if(!value&&frame!==null){cancelAnimationFrame(frame);frame=null;}else wake();}
    function finishNow(){animate=false;dirty=true;wake();}
    function lostContext(event){event.preventDefault();lost=true;if(frame!==null)cancelAnimationFrame(frame);frame=null;onStats({phase:'unavailable',error:'GPU context lost. Reload to restore it, or switch to CSS for up to 1,000 blocks.'});}
    canvas.addEventListener('webglcontextlost',lostContext);
    function dispose(){disposed=true;if(frame!==null)cancelAnimationFrame(frame);resize.disconnect();canvas.removeEventListener('webglcontextlost',lostContext);[quad,surfaceBuffer].forEach(x=>gl.deleteBuffer(x));[cellTexture,paletteTexture].forEach(x=>gl.deleteTexture(x));[staticVAO,flightVAO].forEach(x=>gl.deleteVertexArray(x));gl.deleteProgram(program);}
    return {reset,setPalette,setSettings,setEnabled,finishNow,dispose};
  }
  return {create,MAX_FLYING};
})();
