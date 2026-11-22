/* Stable, supported, growing cubic shells. Shared by the browser and geometry checks. */
const BlockGeometry = (() => {
  const hash = (x, y, z, seed = 1) => {
    let n = Math.imul(x + 11, 73856093) ^ Math.imul(y + 17, 19349663) ^ Math.imul(z + 23, 83492791) ^ Math.imul(seed, 2654435761);
    n = Math.imul(n ^ (n >>> 16), 2246822507);
    return (n ^ (n >>> 13)) >>> 0;
  };
  function* cells(count, seed = 1) {
    count = Math.max(0, Math.min(100000, Math.floor(count)));
    let emitted = 0;
    for (let shell = 0; emitted < count; shell++) {
      for (let y = 0; y <= shell && emitted < count; y++) {
        const layer = [];
        for (let x = 0; x <= shell; x++) for (let z = 0; z <= shell; z++) {
          if (Math.max(x, y, z) === shell) layer.push([x, y, z]);
        }
        layer.sort((a, b) => hash(...a, seed) - hash(...b, seed));
        for (const cell of layer) {
          if (emitted >= count) break;
          emitted++; yield cell;
        }
      }
    }
  }
  function fill(count, seed = 1) { return Array.from(cells(count, seed)); }
  return { hash, fill, cells };
})();
