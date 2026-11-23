/* The Lab's cyan glass uses the studio's instancing approach, with interior faces kept visible. */
const LabGlass = (() => {
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
      gl_Position = vec4(2. * vec2(p.x,-p.y) / viewport, 0., 1. - p.z / 1800.);
    }`;
  const fragment = `#version 300 es
    precision highp float;
    in vec2 uv;
    flat in int face;
    out vec4 color;
    void main() {
      vec2 distance = min(uv, 1. - uv) / max(fwidth(uv), vec2(.0001));
      float edge = 1. - smoothstep(.15, .95, min(distance.x, distance.y));
      float alpha = mix(face == 4 ? .06 : .04, .31, edge);
      // All faces share one tint, so source-over is independent of draw order.
      color = vec4(vec3(.13,.83,.93) * alpha, alpha);
    }`;

  function create(canvas) {
    const gl = canvas.getContext('webgl2', { alpha:true, depth:false, antialias:false });
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
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(0, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let previousBlocks;
    return {
      draw(blocks, width, height, yaw, tilt, scale, moving = false) {
        if (!width || !height || gl.isContextLost()) return;
        if (blocks !== previousBlocks) {
          const positions = new Float32Array(blocks.length * 3);
          blocks.forEach((block, index) => positions.set(block.position, index * 3));
          gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
          previousBlocks = blocks;
        }
        // Blending many interior faces is pixel-heavy. Restore full detail when the camera settles.
        const ratio = Math.min(window.devicePixelRatio || 1, moving ? .85 : 1.5);
        const pixelWidth = Math.round(width * ratio), pixelHeight = Math.round(height * ratio);
        if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
        if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
        gl.viewport(0, 0, pixelWidth, pixelHeight);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const y = yaw * Math.PI / 180, x = tilt * Math.PI / 180;
        gl.uniform2f(viewport, width, height);
        gl.uniform4f(rotation, Math.cos(y), Math.sin(y), Math.cos(x), Math.sin(x));
        gl.uniform1f(pointScale, scale);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, blocks.length);
      },
      dispose() {
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      }
    };
  }

  return {create};
})();
