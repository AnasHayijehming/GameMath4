window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.HUD = (function () {
  'use strict';

  let animated = { coins: 0, exp: 0, level: 1 };
  let lastTs = 0;
  let tickQueued = false;

  function init() {
    const state = Game.State.get();
    if (!state) return;
    animated = { coins: state.player.coins, exp: state.player.exp, level: state.player.level };
  }

  function render(state, message) {
    const need = Game.Systems.Progression.expNeeded(state.player.level);
    const zone = Game.Data.Zones.get(state.world.currentZone);
    const values = animateCounters(state);
    return `<header class="hud">
      <div>
        <div class="hud-stats">
          <span>${Game.Infra.Util.escapeHtml(state.player.name)}</span>
          <span>Lv ${values.level}</span>
          <span>EXP ${values.exp}/${need}</span>
          <span>เหรียญ ${values.coins}</span>
          <span>${zone.name}</span>
        </div>
        <div class="hud-message">${Game.Infra.Util.escapeHtml(message || 'เดินสำรวจ ตอบคำถาม และกด A เพื่อคุยหรือเข้า portal')}</div>
      </div>
      <div>${state.settings.soundEnabled ? 'เสียง: เปิด' : 'เสียง: ปิด'}</div>
    </header>`;
  }

  function animateCounters(state) {
    if (!state) return animated;
    if (!lastTs) lastTs = Date.now();
    const now = Date.now();
    const dt = Math.min(0.05, (now - lastTs) / 1000);
    lastTs = now;
    const motionOn = Game.Render.FX && Game.Render.FX.isMotionEnabled && Game.Render.FX.isMotionEnabled();
    if (!motionOn || state.ui.currentScene !== 'overworld') {
      animated = { coins: state.player.coins, exp: state.player.exp, level: state.player.level };
      tickQueued = false;
      return animated;
    }

    const speed = 18;
    animated = {
      coins: stepTo(animated.coins, state.player.coins, dt * speed),
      exp: stepTo(animated.exp, state.player.exp, dt * speed),
      level: state.player.level
    };

    if ((animated.coins !== state.player.coins || animated.exp !== state.player.exp) && !tickQueued) {
      tickQueued = true;
      window.requestAnimationFrame(function raf() {
        tickQueued = false;
        Game.SceneManager.requestRender();
      });
    }
    return animated;
  }

  function stepTo(current, target, step) {
    if (current === target) return target;
    const delta = target - current;
    if (Math.abs(delta) <= step) return target;
    return Math.round(current + Math.sign(delta) * Math.max(1, step));
  }

  return Object.freeze({ init, render });
})();
