/* Build-free Vue. All dependencies are vendored; index.html also works over file://. */
const { createApp, ref, computed, onMounted, onUnmounted } = Vue;

const ValueCube = {
  props: ['position', 'index', 'edges', 'finish'],
  computed: {
    placement() {
      return { transform: `translate3d(${this.position[0] * 130}px, ${this.position[1] * 130}px, ${this.position[2] * 130}px)` };
    }
  },
  template: `<div class="cube" :class="[finish, { 'has-edges': edges }]" :style="placement">
    <div v-for="face in ['front', 'back', 'left', 'right', 'top', 'bottom']" :key="face" class="face" :class="'face-' + face"><span class="face-sheen"></span></div>
  </div>`
};

createApp({
  components: { ValueCube },
  setup() {
    const families = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'slate', 'gray', 'zinc', 'neutral', 'stone'];
    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    const family = ref('orange'), shade = ref(500), edgeShade = ref(300);
    const theme = ref('dark'), finish = ref('satin'), edges = ref(true), contrast = ref(55);
    const rotationX = ref(-24), rotationY = ref(-35), zoom = ref(1), motion = ref('still'), ground = ref(true), layout = ref('single');
    const dragging = ref(false), copyStatus = ref(''), reducedMotion = ref(false);
    const layouts = [{ id: 'single', label: 'Single' }, { id: 'stack', label: 'Stack' }, { id: 'cluster', label: 'Cluster' }];
    const blocks = computed(() => layout.value === 'single' ? [[0, 0, 0]] : layout.value === 'stack' ? [[0, 0, 0], [0, -1, 0], [0, -2, 0]] : [[-.5, 0, -.5], [.5, 0, -.5], [-.5, 0, .5], [.5, 0, .5], [-.5, -1, -.5], [.5, -1, -.5]]);
    const neighbor = (offset) => shades[Math.max(0, Math.min(shades.length - 1, shades.indexOf(shade.value) + offset))];
    const recipe = computed(() => [{ label: 'Front', tone: shade.value }, { label: 'Top', tone: neighbor(-1) }, { label: 'Side', tone: neighbor(1) }, { label: 'Edge', tone: edgeShade.value }]);
    const material = computed(() => ({
      '--block-front': `var(--color-${family.value}-${shade.value})`,
      '--block-top': `var(--color-${family.value}-${neighbor(-1)})`,
      '--block-side': `var(--color-${family.value}-${neighbor(1)})`,
      '--block-edge': `var(--color-${family.value}-${edgeShade.value})`,
      '--block-glow': `var(--color-${family.value}-500)`,
      '--face-contrast': contrast.value / 100,
      '--assembly-lift': layout.value === 'single' ? '0px' : layout.value === 'stack' ? '100px' : '48px'
    }));
    let lastX = 0, lastY = 0, copyTimer;
    function startDrag(event) {
      if (event.button !== 0) return;
      dragging.value = true;
      lastX = event.clientX; lastY = event.clientY;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    function drag(event) {
      if (!dragging.value) return;
      rotationY.value = ((rotationY.value + (event.clientX - lastX) * .5 + 540) % 360) - 180;
      rotationX.value = Math.max(-80, Math.min(80, rotationX.value - (event.clientY - lastY) * .4));
      lastX = event.clientX; lastY = event.clientY;
    }
    function stopDrag() { dragging.value = false; }
    function resetView() { rotationX.value = -24; rotationY.value = -35; zoom.value = 1; motion.value = 'still'; }
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
    onMounted(() => { updateMotion(); media.addEventListener('change', updateMotion); });
    onUnmounted(() => { media.removeEventListener('change', updateMotion); clearTimeout(copyTimer); });
    return { families, shades, family, shade, edgeShade, theme, finish, edges, contrast, rotationX, rotationY, zoom, motion, ground, layout, layouts, blocks, recipe, material, dragging, copyStatus, reducedMotion, startDrag, drag, stopDrag, resetView, copyMaterial, Math };
  }
}).mount('#app');
