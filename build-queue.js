/* Frame-paced arrivals; detached/hidden tabs never accumulate a catch-up burst. */
const BlockBuildQueue = (() => {
  const FLIGHT_MS = 700, LANDING_MS = 760, MAX_ACTIVE = 32;
  function create({ requestFrame, cancelFrame, onUpdate }) {
    let target = 0, launched = 0, landed = 0, pending = [], frame = null;
    let lastTime = null, credit = 1, rate = 48, animate = true;
    function publish() { onUpdate({ launched, landed, active: pending.length, target }); }
    function tick(now) {
      frame = null;
      const beforeLaunched = launched, beforeLanded = landed;
      // Limit catch-up work after an expensive frame or a background-tab pause.
      const elapsed = lastTime === null ? 0 : Math.max(0, Math.min(24, now - lastTime));
      lastTime = now;
      while (pending.length && pending[0].due <= now) landed = pending.shift().index + 1;
      credit = Math.min(2, credit + elapsed / 1000 * rate);
      const batch = Math.min(2, Math.floor(credit), MAX_ACTIVE - pending.length, target - launched);
      for (let i = 0; i < batch; i++) pending.push({ index: launched++, due: now + LANDING_MS });
      credit -= batch;
      if (launched !== beforeLaunched || landed !== beforeLanded) publish();
      if (launched < target || pending.length) frame = requestFrame(tick);
      else lastTime = null;
    }
    function setTarget(nextTarget, options = {}) {
      target = Math.max(0, Math.min(1000, Math.floor(nextTarget)));
      if (options.rate !== undefined) rate = Math.max(12, Math.min(90, options.rate));
      if (options.animate !== undefined) animate = options.animate;
      if (frame !== null) cancelFrame(frame);
      frame = null; lastTime = null; credit = 1;
      if (options.reset) { launched = 0; landed = 0; pending = []; }
      launched = Math.min(launched, target); landed = Math.min(landed, target);
      pending = pending.filter(p => p.index < target);
      if (!animate) { landed = launched = target; pending = []; }
      publish();
      if (launched < target || pending.length) frame = requestFrame(tick);
    }
    function setRate(next) { rate = Math.max(12, Math.min(90, next)); }
    function stop() { if (frame !== null) cancelFrame(frame); frame = null; pending = []; }
    return { setTarget, setRate, stop };
  }
  return { create, FLIGHT_MS, LANDING_MS, MAX_ACTIVE };
})();
