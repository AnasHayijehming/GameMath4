window.Game = window.Game || {};
Game.Scenes = Game.Scenes || {};

Game.Scenes.Shop = (function () {
  'use strict';

  let message = '';

  const scene = {
    id: 'shop',
    enter() { message = ''; },
    exit() {},
    render() { return Game.Render.Shop.render(message); },
    bind(root) {
      root.querySelectorAll('[data-buy]').forEach(function each(button) {
        button.addEventListener('click', function onBuy() {
          const outcome = Game.Systems.Economy.purchase(button.getAttribute('data-buy'));
          message = outcome.message;
          if (outcome.ok) Game.Storage.save(Game.State.get());
          Game.SceneManager.requestRender();
        });
      });
    },
    handleInput(action) {
      if (action === 'cancel') Game.SceneManager.goTo('overworld');
    }
  };

  return scene;
})();
