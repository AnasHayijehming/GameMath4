window.Game = window.Game || {};
Game.Scenes = Game.Scenes || {};

Game.Scenes.Inventory = (function () {
  'use strict';

  let message = '';

  const scene = {
    id: 'inventory',
    enter() { message = ''; },
    exit() {},
    render() { return Game.Render.Inventory.render(message); },
    bind(root) {
      root.querySelectorAll('[data-equip-slot]').forEach(function each(button) {
        button.addEventListener('click', function onEquip() {
          const slot = button.getAttribute('data-equip-slot');
          const itemId = button.getAttribute('data-equip') || null;
          if (slot === 'clothes' && !itemId) {
            message = 'ต้องใส่เสื้ออย่างน้อย 1 ตัว';
            Game.SceneManager.requestRender();
            return;
          }
          Game.State.update(function update(s) {
            const equipped = Object.assign({}, s.inventory.equipped, { [slot]: itemId });
            return Object.assign({}, s, { inventory: Object.assign({}, s.inventory, { equipped }) });
          });
          Game.EventBus.emit('item:equipped', { slot, itemId });
          Game.Storage.save(Game.State.get());
          message = 'เปลี่ยนชุดแล้ว';
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
