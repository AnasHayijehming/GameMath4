window.Game = window.Game || {};

Game.SceneManager = (function () {
  'use strict';

  const scenes = {};
  let current = null;
  let params = null;
  let renderQueued = false;

  function init() {
    Game.EventBus.on('scene:change', function onScene(payload) {
      goTo(payload.to, payload.params || {});
    });
    Game.EventBus.on('input:action', function onInput(payload) {
      if (current && current.handleInput) current.handleInput(payload.action);
    });
  }

  function register(scene) {
    scenes[scene.id] = scene;
  }

  function goTo(id, nextParams) {
    if (!scenes[id]) throw new Error(`Scene not registered: ${id}`);
    if (current && current.exit) current.exit();
    current = scenes[id];
    params = nextParams || {};
    Game.State.update(function update(s) {
      if (!s || !s.ui) return s;
      return Object.assign({}, s, { ui: Object.assign({}, s.ui, { currentScene: id, sceneParams: params }) });
    });
    if (current.enter) current.enter(params);
    requestRender();
  }

  function requestRender() {
    if (renderQueued) return;
    renderQueued = true;
    window.requestAnimationFrame(function renderNow() {
      renderQueued = false;
      const root = document.getElementById('app');
      if (!root || !current) return;
      try {
        root.innerHTML = current.render();
        if (current.bind) current.bind(root);
      } catch (error) {
        console.error('[SceneManager] render failed', error);
        root.innerHTML = `<div class="screen"><section class="panel"><h2>เกิดข้อผิดพลาด</h2><p>${Game.Infra.Util.escapeHtml(error.message || error)}</p></section></div>`;
      }
    });
  }

  function currentId() {
    return current ? current.id : null;
  }

  return Object.freeze({ init, register, goTo, requestRender, currentId });
})();
