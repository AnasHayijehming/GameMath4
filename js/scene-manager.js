window.Game = window.Game || {};

Game.SceneManager = (function () {
  'use strict';

  const scenes = {};
  let current = null;
  let params = null;
  let renderQueued = false;
  let renderedSceneId = null;

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
      const sceneId = current.id;
      const modalScrollTop = renderedSceneId === sceneId ? readModalScrollTop(root) : null;
      try {
        root.innerHTML = current.render();
        renderedSceneId = sceneId;
        if (current.bind) current.bind(root);
        restoreModalScrollTop(root, modalScrollTop);
      } catch (error) {
        console.error('[SceneManager] render failed', error);
        renderedSceneId = null;
        root.innerHTML = `<div class="screen"><section class="panel"><h2>เกิดข้อผิดพลาด</h2><p>${Game.Infra.Util.escapeHtml(error.message || error)}</p></section></div>`;
      }
    });
  }

  function readModalScrollTop(root) {
    const modal = root.querySelector('.modal');
    return modal ? modal.scrollTop : null;
  }

  function restoreModalScrollTop(root, scrollTop) {
    if (scrollTop === null || scrollTop === undefined) return;
    const modal = root.querySelector('.modal');
    if (!modal) return;
    modal.scrollTop = Math.min(scrollTop, Math.max(0, modal.scrollHeight - modal.clientHeight));
  }

  function currentId() {
    return current ? current.id : null;
  }

  return Object.freeze({ init, register, goTo, requestRender, currentId });
})();
