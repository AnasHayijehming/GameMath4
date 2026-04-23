window.Game = window.Game || {};
Game.Scenes = Game.Scenes || {};

Game.Scenes.Settings = (function () {
  'use strict';

  let message = '';

  const scene = {
    id: 'settings',
    enter() { message = ''; },
    exit() {},
    render() {
      const state = Game.State.get();
      const typingMultiplier = Game.Config.economy.typingCoinMultiplier;
      const timerOptions = Game.Config.quiz.timerOptions.map(function map(option) {
        const selected = state.settings.timerMultiplier === option.value ? 'selected' : '';
        return `<option value="${option.value}" ${selected}>${Game.Infra.Util.escapeHtml(option.label)}</option>`;
      }).join('');
      return `<div class="screen">
        <section class="panel">
          <h2>ตั้งค่า</h2>
          <form class="form-grid" data-settings-form>
            <label><input type="checkbox" name="typingMode" ${state.settings.typingMode ? 'checked' : ''}> โหมดพิมพ์ตอบ (เหรียญ x${typingMultiplier})</label>
            <label><input type="checkbox" name="soundEnabled" ${state.settings.soundEnabled ? 'checked' : ''}> เปิดเสียง</label>
            <label><input type="checkbox" name="reducedMotion" ${state.settings.reducedMotion ? 'checked' : ''}> ลดการเคลื่อนไหว</label>
            <label>เวลาเพิ่มเติม
              <select name="timerMultiplier">${timerOptions}</select>
            </label>
            <div class="toast">${Game.Infra.Util.escapeHtml(message)}</div>
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
        Game.State.update(function update(s) {
          return Object.assign({}, s, {
            settings: Object.assign({}, s.settings, {
              typingMode: form.elements.typingMode.checked,
              soundEnabled: form.elements.soundEnabled.checked,
              reducedMotion: form.elements.reducedMotion.checked,
              timerMultiplier: Game.Main.normalizeTimerMultiplier(form.elements.timerMultiplier.value, s.settings.timerMultiplier)
            })
          });
        });
        Game.Storage.save(Game.State.get());
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
