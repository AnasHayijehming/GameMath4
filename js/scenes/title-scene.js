window.Game = window.Game || {};
Game.Scenes = Game.Scenes || {};

Game.Scenes.Title = (function () {
  'use strict';

  const scene = {
    id: 'title',
    enter() {},
    exit() {},
    render() {
      const hasSave = Game.Storage.exists();
      const titleBg = Game.Render.AssetLoader.titleBackground();
      return `<div class="screen screen--forest" style="background-image:linear-gradient(rgba(24,33,43,.52), rgba(24,33,43,.52)), url('${titleBg}'); background-size:cover; background-position:center;">
        <div class="title-stage">
          <div class="title-art">${Game.Render.SVG.titleArt()}</div>
          <section class="title-copy">
            <h1>Math Adventure</h1>
            <p>เกมคณิตศาสตร์ผจญภัยสำหรับ ป.4 สำรวจโลก ตอบโจทย์ สะสมเหรียญ และแต่งตัวละคร</p>
            <div class="button-row">
              <button class="primary" data-title-start>เริ่มเกมใหม่</button>
              <button class="blue" data-title-load ${hasSave ? '' : 'disabled'}>โหลดเกม</button>
            </div>
          </section>
        </div>
      </div>`;
    },
    bind(root) {
      const start = root.querySelector('[data-title-start]');
      const load = root.querySelector('[data-title-load]');
      if (start) start.addEventListener('click', function onStart() {
        Game.Storage.clear();
        Game.State.init(Game.Main.createDefaultState(Game.Config.player.defaultName, Game.Config.player.defaultGender));
        Game.SceneManager.goTo('create');
      });
      if (load) load.addEventListener('click', function onLoad() {
        const saved = Game.Main.hydrateSavedState(Game.Storage.load());
        if (saved) {
          Game.State.init(saved);
          Game.SceneManager.goTo('overworld', { message: 'โหลดเกมแล้ว' });
        } else {
          Game.Storage.clear();
          Game.SceneManager.requestRender();
        }
      });
    },
    handleInput(action) {
      if (action === 'confirm') Game.SceneManager.goTo('create');
    }
  };

  return scene;
})();
