window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.HUD = (function () {
  'use strict';

  let currentValues = { coins: 0, exp: 0, level: 1 };

  function init() {
    const state = Game.State.get();
    if (!state) return;
    currentValues = { coins: state.player.coins, exp: state.player.exp, level: state.player.level };
  }

  function render(state, message) {
    const need = Game.Systems.Progression.expNeeded(state.player.level);
    const zone = Game.Data.Zones.get(state.world.currentZone);
    const values = readCounters(state);
    const expPercent = Math.max(0, Math.min(100, Math.round((values.exp / need) * 100)));
    return `<header class="hud">
      <div class="hud-main">
        <div class="hud-stats">
          <span class="hud-name">${Game.Infra.Util.escapeHtml(state.player.name)}</span>
          <span class="hud-pill">Lv ${values.level}</span>
          <span class="hud-pill hud-pill--coin">เหรียญ ${values.coins}</span>
          <span class="hud-pill hud-pill--zone">${zone.name}</span>
        </div>
        <div class="hud-exp-row" aria-label="EXP ${values.exp} จาก ${need}">
          <span class="hud-exp-label">EXP</span>
          <div class="hud-exp">
            <span style="width:${expPercent}%"></span>
          </div>
        </div>
        <div class="hud-message">${Game.Infra.Util.escapeHtml(message || 'ภารกิจ: สำรวจแผนที่ ตอบคำถาม และเก็บเหรียญเพื่อแต่งตัวละคร')}</div>
      </div>
      <div class="hud-sound">${state.settings.soundEnabled ? 'เสียง: เปิด' : 'เสียง: ปิด'}</div>
    </header>`;
  }

  function readCounters(state) {
    if (!state) return currentValues;
    currentValues = { coins: state.player.coins, exp: state.player.exp, level: state.player.level };
    return currentValues;
  }

  return Object.freeze({ init, render });
})();
