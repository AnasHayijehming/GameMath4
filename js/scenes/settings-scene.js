window.Game = window.Game || {};
Game.Scenes = Game.Scenes || {};

Game.Scenes.Settings = (function () {
  'use strict';

  let message = '';

  function escape(value) {
    return Game.Infra.Util.escapeHtml(value);
  }

  function renderField(field, settings) {
    if (field.input === 'checkbox') {
      const checked = settings[field.key] ? 'checked' : '';
      const suffix = field.description ? ` (${escape(field.description)})` : '';
      return `<label><input type="checkbox" name="${field.key}" ${checked}> ${escape(field.label)}${suffix}</label>`;
    }

    if (field.input === 'select') {
      const options = (field.options || []).map(function map(option) {
        const selected = Number(settings[field.key]) === Number(option.value) ? 'selected' : '';
        return `<option value="${option.value}" ${selected}>${escape(option.label)}</option>`;
      }).join('');
      return `<label>${escape(field.label)}
        <select name="${field.key}">${options}</select>
      </label>`;
    }

    return '';
  }

  function applySettings(nextSettings) {
    Game.State.update(function update(state) {
      return Object.assign({}, state, {
        settings: Object.assign({}, state.settings, nextSettings)
      });
    });
    Game.Storage.save(Game.State.get());
  }

  const scene = {
    id: 'settings',
    enter() { message = ''; },
    exit() {},
    render() {
      const state = Game.State.get();
      const fields = Game.Data.GameSettings.uiFields().map(function map(field) {
        return renderField(field, state.settings);
      }).join('');
      return `<div class="screen">
        <section class="panel">
          <h2>ตั้งค่า</h2>
          <form class="form-grid" data-settings-form>
            ${fields}
            <div class="toast">${escape(message)}</div>
            <div class="button-row">
              <button class="primary" type="submit">บันทึก</button>
              <button type="button" data-action="cancel">กลับ</button>
              <button class="danger" type="button" data-reset-save>Reset ข้อมูล</button>
            </div>
          </form>
        </section>
      </div>`;
    },
    bind(root) {
      const form = root.querySelector('[data-settings-form]');
      form.addEventListener('submit', function onSubmit(event) {
        event.preventDefault();
        const previousSettings = Game.State.get().settings;
        const nextSettings = Game.Data.GameSettings.readForm(form, previousSettings);
        applySettings(nextSettings);
        message = 'บันทึกแล้ว';
        Game.SceneManager.requestRender();
      });
      root.querySelector('[data-reset-save]').addEventListener('click', function onReset() {
        if (!window.confirm('ลบข้อมูลทั้งหมดและเริ่มใหม่?')) return;
        Game.Storage.clear();
        Game.State.init(Game.Main.createDefaultState(Game.Config.player.defaultName, Game.Config.player.defaultGender));
        Game.SceneManager.goTo('title');
      });
    },
    handleInput(action) {
      if (action === 'cancel') Game.SceneManager.goTo('overworld');
    }
  };

  return scene;
})();
