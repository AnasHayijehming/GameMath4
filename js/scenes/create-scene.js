window.Game = window.Game || {};
Game.Scenes = Game.Scenes || {};

Game.Scenes.Create = (function () {
  'use strict';

  let message = '';

  const scene = {
    id: 'create',
    enter() { message = ''; },
    exit() {},
    render() {
      const cfg = Game.Config;
      const previewInventory = { equipped: { clothes: cfg.inventory.starterEquipped.clothes } };
      return `<div class="screen screen--forest">
        <section class="panel">
          <h2>สร้างนักผจญภัย</h2>
          <form class="form-grid" data-create-form>
            <label>ชื่อผู้เล่น
              <input name="playerName" maxlength="${cfg.player.nameMaxLength}" autocomplete="off" value="" placeholder="เช่น น้องแอน">
            </label>
            <label>ตัวละคร
              <select name="gender">
                <option value="female">หญิง</option>
                <option value="male">ชาย</option>
              </select>
            </label>
            <div class="item-preview"><svg viewBox="-8 -12 64 86" width="96" height="129">${Game.Render.Character.render({ gender: cfg.player.defaultGender }, previewInventory, 1)}</svg></div>
            <div class="toast">${Game.Infra.Util.escapeHtml(message)}</div>
            <div class="button-row">
              <button class="primary" type="submit">เริ่มผจญภัย</button>
              <button type="button" data-action="cancel">กลับ</button>
            </div>
          </form>
        </section>
      </div>`;
    },
    bind(root) {
      const form = root.querySelector('[data-create-form]');
      form.addEventListener('submit', function onSubmit(event) {
        event.preventDefault();
        const validation = Game.Main.validatePlayerName(form.elements.playerName.value);
        if (!validation.ok) {
          message = validation.message;
          Game.SceneManager.requestRender();
          return;
        }
        Game.State.init(Game.Main.createDefaultState(validation.name, form.elements.gender.value));
        Game.SceneManager.goTo('overworld', { message: 'เริ่มต้นที่ป่ามหัศจรรย์' });
        Game.Storage.save(Game.State.get());
      });
      form.elements.gender.addEventListener('change', function onGender() {
        const preview = root.querySelector('.item-preview');
        preview.innerHTML = `<svg viewBox="-8 -12 64 86" width="96" height="129">${Game.Render.Character.render({ gender: form.elements.gender.value }, { equipped: { clothes: Game.Config.inventory.starterEquipped.clothes } }, 1)}</svg>`;
      });
    },
    handleInput(action) {
      if (action === 'cancel') Game.SceneManager.goTo('title');
    }
  };

  return scene;
})();
