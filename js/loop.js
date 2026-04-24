window.Game = window.Game || {};

Game.Loop = (function () {
  'use strict';

  let last = 0;
  let acc = 0;

  function shouldTrackPlayTime() {
    const sceneId = Game.SceneManager && Game.SceneManager.currentId
      ? Game.SceneManager.currentId()
      : Game.State.get() && Game.State.get().ui && Game.State.get().ui.currentScene;
    return sceneId !== 'title' && sceneId !== 'create';
  }

  function start() {
    last = performance.now();
    requestAnimationFrame(tick);
  }

  function tick(now) {
    const dt = now - last;
    last = now;
    acc += dt;
    if (acc >= 1000 && Game.State.get()) {
      if (!shouldTrackPlayTime()) {
        acc = 0;
        requestAnimationFrame(tick);
        return;
      }
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
