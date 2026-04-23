window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.HUD = (function () {
  'use strict';

  function render(state, message) {
    const need = Game.Systems.Progression.expNeeded(state.player.level);
    const zone = Game.Data.Zones.get(state.world.currentZone);
    return `<header class="hud">
      <div>
        <div class="hud-stats">
          <span>${Game.Infra.Util.escapeHtml(state.player.name)}</span>
          <span>Lv ${state.player.level}</span>
          <span>EXP ${state.player.exp}/${need}</span>
          <span>เหรียญ ${state.player.coins}</span>
          <span>${zone.name}</span>
        </div>
        <div class="hud-message">${Game.Infra.Util.escapeHtml(message || 'เดินสำรวจ ตอบคำถาม และกด A เพื่อคุยหรือเข้า portal')}</div>
      </div>
      <div>${state.settings.soundEnabled ? 'เสียง: เปิด' : 'เสียง: ปิด'}</div>
    </header>`;
  }

  return Object.freeze({ render });
})();
