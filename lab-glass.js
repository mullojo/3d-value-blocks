/* The Lab's cyan glass uses the studio's instancing approach, with interior faces kept visible. */
const LabGlass = (() => {
  // sRGB face colors matching the CSS palette's light top, bright front, and shaded sides.
  const materials = {
    orange:['f97316','fdba74','ea580c'], rose:['f43f5e','fda4af','e11d48'],
    amber:['f59e0b','fcd34d','d97706'], emerald:['10b981','6ee7b7','059669'],
    sky:['0ea5e9','7dd3fc','0284c7'], violet:['8b5cf6','c4b5fd','7c3aed'],
    stone:['78716c','d6d3d1','57534e']
  };
  const colors = Object.fromEntries(Object.entries(materials).map(([family, faces])=>[
    family, faces.flatMap(hex=>hex.match(/../g).map(channel=>parseInt(channel,16)/255))
  ]));
  const vertex = `#version 300 es
    precision highp float;
    layout(location=0) in vec3 center;
    uniform vec2 viewport;
    uniform vec4 rotation;
    uniform float scale;
    out vec2 uv;
    flat out int face;
    const vec2 corners[6] = vec2[6](vec2(-1,-1),vec2(1,-1),vec2(1,1),vec2(-1,-1),vec2(1,1),vec2(-1,1));
    void main() {
      vec2 q = corners[gl_VertexID % 6];
      uv = q * .5 + .5;
      face = gl_VertexID / 6;
      vec3 p;
      if (face < 2) p = vec3(q, face == 0 ? 1. : -1.);
      else if (face < 4) p = vec3(face == 2 ? 1. : -1., q);
      else p = vec3(q.x, face == 4 ? 1. : -1., q.y);
      p = center + p * 65.;
      p = vec3(rotation.x * p.x + rotation.y * p.z, p.y, rotation.x * p.z - rotation.y * p.x);
      p = vec3(p.x, rotation.z * p.y - rotation.w * p.z, rotation.w * p.y + rotation.z * p.z) * scale;
      gl_Position = vec4(2. * vec2(p.x,-p.y) / viewport, -p.z / 1800., 1. - p.z / 1800.);
    }`;
  const fragment = `#version 300 es
    precision highp float;
    in vec2 uv;
    flat in int face;
    uniform bool solid;
    uniform vec3 material[3];
    out vec4 color;
    void main() {
      vec2 distance = min(uv, 1. - uv) / max(fwidth(uv), vec2(.0001));
      float edge = 1. - smoothstep(.15, .95, min(distance.x, distance.y));
      if (solid) {
        vec3 base = material[face == 5 ? 1 : face < 2 ? 0 : 2];
        color = vec4(mix(base, material[1], edge * .36), 1.);
        return;
      }
      float alpha = mix(face == 4 ? .06 : .04, .31, edge);
      // All faces share one tint, so source-over is independent of draw order.
      color = vec4(vec3(.13,.83,.93) * alpha, alpha);
    }`;

  function create(canvas, mixed = false) {
    const gl = canvas.getContext('webgl2', { alpha:true, depth:mixed, antialias:false });
    if (!gl) return null;
    const program = gl.createProgram();
    for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]]) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        gl.deleteProgram(program);
        return null;
      }
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return null;
    }
    const buffer = gl.createBuffer();
    const viewport = gl.getUniformLocation(program, 'viewport');
    const rotation = gl.getUniformLocation(program, 'rotation');
    const pointScale = gl.getUniformLocation(program, 'scale');
    const solid = gl.getUniformLocation(program, 'solid');
    const material = gl.getUniformLocation(program, 'material[0]');
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(0, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let previousGeometry, ranges;
    return {
      draw(geometry, width, height, yaw, tilt, scale, moving = false, showHuman = true, showRobot = true) {
        if (!width || !height || gl.isContextLost()) return;
        if (geometry !== previousGeometry) {
          const positions = new Float32Array(geometry.blocks.length * 3);
          let offset = 0;
          ranges = geometry.batches.map(batch => {
            const start = offset;
            for (const block of batch.blocks) {
              positions.set(block.position, offset);
              offset += 3;
            }
            return {kind:batch.kind, family:batch.family, count:batch.blocks.length, offset:start * 4};
          });
          gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
          previousGeometry = geometry;
        }
        // Blending many interior faces is pixel-heavy. Restore full detail when the camera settles.
        const ratio = Math.min(window.devicePixelRatio || 1, moving ? .85 : 1.5);
        const pixelWidth = Math.round(width * ratio), pixelHeight = Math.round(height * ratio);
        if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
        if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
        gl.viewport(0, 0, pixelWidth, pixelHeight);
        if (mixed) gl.enable(gl.DEPTH_TEST);
        gl.depthMask(true);
        gl.clear(gl.COLOR_BUFFER_BIT | (mixed ? gl.DEPTH_BUFFER_BIT : 0));
        const y = yaw * Math.PI / 180, x = tilt * Math.PI / 180;
        gl.uniform2f(viewport, width, height);
        gl.uniform4f(rotation, Math.cos(y), Math.sin(y), Math.cos(x), Math.sin(x));
        gl.uniform1f(pointScale, scale);
        // Opaque faces write depth first. Glass reads that depth but leaves it unchanged,
        // so it stays transparent and never shows through a solid cube behind it.
        if (mixed && showHuman) {
          gl.disable(gl.BLEND);
          gl.uniform1i(solid, 1);
          for (const range of ranges) {
            if (range.kind !== 'human') continue;
            gl.uniform3fv(material, colors[range.family] || colors.orange);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, range.offset);
            gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, range.count);
          }
        }
        if (showRobot) {
          gl.enable(gl.BLEND);
          gl.depthMask(false);
          gl.uniform1i(solid, 0);
          for (const range of ranges) {
            if (range.kind !== 'robot') continue;
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, range.offset);
            gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, range.count);
          }
        }
      },
      dispose() {
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        canvas.width=1;
        canvas.height=1;
      }
    };
  }

  return {create};
})();
