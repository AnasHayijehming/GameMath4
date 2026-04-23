window.Game = window.Game || {};

Game.Loop = (function () {
  'use strict';

  let last = 0;
  let acc = 0;

  function start() {
    last = performance.now();
    requestAnimationFrame(tick);
  }

  function tick(now) {
    const dt = now - last;
    last = now;
    acc += dt;
    if (acc >= 1000 && Game.State.get()) {
      const inc = acc;
      acc = 0;
      Game.State.update(function update(s) {
        return Object.assign({}, s, {
          stats: Object.assign({}, s.stats, { totalPlayTimeMs: s.stats.totalPlayTimeMs + inc })
        });
      });
    }
    requestAnimationFrame(tick);
  }

  return Object.freeze({ start });
})();
