window.Game = window.Game || {};
Game.Scenes = Game.Scenes || {};

Game.Scenes.Stats = (function () {
  'use strict';

  return {
    id: 'stats',
    enter() {},
    exit() {},
    render() { return Game.Render.Stats.render(); },
    bind() {},
    handleInput(action) {
      if (action === 'cancel') Game.SceneManager.goTo('overworld');
    }
  };
})();
