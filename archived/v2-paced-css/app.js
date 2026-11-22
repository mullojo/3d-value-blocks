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
  components: { ValueCube },
  setup() {
    const families = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'slate', 'gray', 'zinc', 'neutral', 'stone'];
    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    const family = ref('orange'), shade = ref(500), edgeShade = ref(300);
    const theme = ref('dark'), finish = ref('satin'), edges = ref(true), contrast = ref(55);
    const rotationX = ref(-24), rotationY = ref(-35), zoom = ref(1), motion = ref('still'), ground = ref(true), layout = ref('single');
    const dragging = ref(false), copyStatus = ref(''), reducedMotion = ref(false);
    const layouts = [{ id: 'single', label: 'Single' }, { id: 'stack', label: 'Stack' }, { id: 'cluster', label: 'Cluster' }, { id: 'cubit', label: 'Cubit · 27' }, { id: 'hundred', label: '100' }, { id: 'thousand', label: '1,000' }, { id: 'fill', label: 'Fill' }];
    const count = ref(1), seed = ref(1), dropEnabled = ref(true), autoFit = ref(true), epoch = ref(0);
    const buildRate = ref(32), progress = ref({ launched: 0, landed: 0, active: 0, target: 0 });
    const colorMode = ref('solid'), groupShade = ref(500), savedColors = ref([]), paletteStatus = ref('');
    const viewport = ref(null), stageSize = ref({ width: 700, height: 570 });
    const rawBlocks = computed(() => {
      if (layout.value === 'single') return [[0, 0, 0]];
      if (layout.value === 'stack') return [[0, 0, 0], [0, 1, 0], [0, 2, 0]];
      if (layout.value === 'cluster') return [[0, 0, 0], [1, 0, 0], [0, 0, 1], [1, 0, 1], [0, 1, 0], [1, 1, 0]];
      return BlockGeometry.fill(layout.value === 'cubit' ? 27 : layout.value === 'hundred' ? 100 : layout.value === 'thousand' ? 1000 : count.value, seed.value);
    });
    const bounds = computed(() => rawBlocks.value.reduce((size, p) => size.map((n, i) => Math.max(n, p[i] + 1)), [1, 1, 1]));
    const toneNeighbor = (tone, offset) => shades[Math.max(0, Math.min(shades.length - 1, shades.indexOf(tone) + offset))];
    function colorTokens(color, tone, edge) {
      return { '--block-front': `var(--color-${color}-${tone})`, '--block-top': `var(--color-${color}-${toneNeighbor(tone, -1)})`, '--block-side': `var(--color-${color}-${toneNeighbor(tone, 1)})`, '--block-edge': `var(--color-${color}-${edge})` };
    }
    const blocks = computed(() => {
      return rawBlocks.value.map((p, i) => {
        const random = BlockGeometry.hash(...p, seed.value);
        const chosen = colorMode.value === 'saved' && savedColors.value.length ? savedColors.value[random % savedColors.value.length] : { family: families[random % 17], shade: groupShade.value, edgeShade: toneNeighbor(groupShade.value, -1) };
        return { id: p.join(','), position: [p[0] - (bounds.value[0] - 1) / 2, (bounds.value[1] - 1) / 2 - p[1], p[2] - (bounds.value[2] - 1) / 2],
          material: colorMode.value === 'solid' ? {} : colorTokens(chosen.family, chosen.shade, chosen.edgeShade),
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
    let observer;
    const renderCache = new Map();
    const faceOffsets = { front: [0, 0, 1], back: [0, 0, -1], left: [-1, 0, 0], right: [1, 0, 0], top: [0, 1, 0], bottom: [0, -1, 0] };
    const dropHeight = computed(() => Math.max(260, stageSize.value.height * .7 / sceneScale.value));
    const renderedBlocks = computed(() => {
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
    const building = computed(() => progress.value.landed < blocks.value.length);
    const buildEstimate = computed(() => Math.ceil(blocks.value.length / Math.min(buildRate.value, BlockBuildQueue.MAX_ACTIVE / (BlockBuildQueue.LANDING_MS / 1000)) + BlockBuildQueue.LANDING_MS / 1000));
    const queue = BlockBuildQueue.create({ requestFrame: callback => requestAnimationFrame(callback), cancelFrame: id => cancelAnimationFrame(id), onUpdate: value => { progress.value = value; } });
    watch(layout, value => {
      const presets = { single: 1, stack: 3, cluster: 6, cubit: 27, hundred: 100, thousand: 1000 };
      if (presets[value]) count.value = presets[value];
    });
    watch([layout, seed], () => { epoch.value++; });
    watch([rawBlocks, epoch, dropEnabled, reducedMotion], (values, previous) => {
      const [cells, revision] = values;
      const reset = !previous || revision !== previous[1];
      if (reset) renderCache.clear();
      queue.setTarget(cells.length, { reset, animate: dropEnabled.value && !reducedMotion.value, rate: buildRate.value });
    }, { flush: 'post' });
    watch(buildRate, value => queue.setRate(value));
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
    onMounted(() => {
      updateMotion(); media.addEventListener('change', updateMotion);
      try {
        const stored = JSON.parse(localStorage.getItem('value-blocks-palette-v1') || '[]');
        if (Array.isArray(stored)) savedColors.value = stored.filter(c => c && families.includes(c.family) && shades.includes(c.shade) && shades.includes(c.edgeShade)).slice(0, 10);
      } catch { paletteStatus.value = 'Browser storage unavailable; colors can still be saved this session.'; }
      observer = new ResizeObserver(entries => { const { width, height } = entries[0].contentRect; stageSize.value = { width, height }; });
      observer.observe(viewport.value); queue.setTarget(rawBlocks.value.length, { reset: true, animate: dropEnabled.value && !reducedMotion.value, rate: buildRate.value });
    });
    onUnmounted(() => { media.removeEventListener('change', updateMotion); clearTimeout(copyTimer); queue.stop(); observer?.disconnect(); });
    return { renderedBlocks, progress, building, buildRate, buildEstimate, count, seed, dropEnabled, autoFit, epoch, colorMode, groupShade, savedColors, paletteStatus, viewport, bounds, sceneScale, replayDrop, shuffle, saveColor, removeColor, families, shades, family, shade, edgeShade, theme, finish, edges, contrast, rotationX, rotationY, zoom, motion, ground, layout, layouts, blocks, recipe, material, dragging, copyStatus, reducedMotion, startDrag, drag, stopDrag, resetView, copyMaterial, Math };
  }
}).mount('#app');
