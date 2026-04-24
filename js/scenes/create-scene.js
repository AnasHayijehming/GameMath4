window.Game = window.Game || {};
Game.Scenes = Game.Scenes || {};

Game.Scenes.Create = (function () {
  'use strict';

  let message = '';
  let draftName = '';
  let draftGender = Game.Config.player.defaultGender;

  function renderGenderOption(value, label) {
    return `<option value="${value}" ${draftGender === value ? 'selected' : ''}>${label}</option>`;
  }

  const scene = {
    id: 'create',
    enter() {
      message = '';
      draftName = '';
      draftGender = Game.Config.player.defaultGender;
    },
    exit() {},
    render() {
      const cfg = Game.Config;
      const previewInventory = { equipped: { clothes: cfg.inventory.starterEquipped.clothes } };
      return `<div class="screen screen--forest">
        <section class="panel">
          <h2>สร้างนักผจญภัย</h2>
          <form class="form-grid" data-create-form>
            <label>ชื่อผู้เล่น
              <input name="playerName" maxlength="${cfg.player.nameMaxLength}" autocomplete="off" value="${Game.Infra.Util.escapeHtml(draftName)}" placeholder="เช่น น้องแอน">
            </label>
            <label>ตัวละคร
              <select name="gender">
                ${renderGenderOption('female', 'หญิง')}
                ${renderGenderOption('male', 'ชาย')}
              </select>
            </label>
            <div class="item-preview"><svg viewBox="-8 -12 64 86" width="96" height="129">${Game.Render.Character.render({ gender: draftGender }, previewInventory, 1)}</svg></div>
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
      const nameInput = form.elements.playerName;
      const preview = root.querySelector('.item-preview');
      const toast = root.querySelector('.toast');
      nameInput.addEventListener('input', function onNameInput() {
        draftName = nameInput.value;
        if (message && toast) {
          message = '';
          toast.textContent = '';
        }
      });
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
        draftGender = form.elements.gender.value;
        preview.innerHTML = `<svg viewBox="-8 -12 64 86" width="96" height="129">${Game.Render.Character.render({ gender: form.elements.gender.value }, { equipped: { clothes: Game.Config.inventory.starterEquipped.clothes } }, 1)}</svg>`;
      });
    },
    handleInput(action) {
      if (action === 'cancel') Game.SceneManager.goTo('title');
    }
  };

  return scene;
})();
