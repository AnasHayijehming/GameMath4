window.Game = window.Game || {};
Game.Scenes = Game.Scenes || {};

Game.Scenes.Base = (function () {
  'use strict';

  function controls() {
    return `<footer class="controls" aria-label="ปุ่มควบคุม">
      <div class="dpad">
        <button data-action="up" aria-label="ขึ้น">▲</button>
        <button data-action="left" aria-label="ซ้าย">◀</button>
        <button data-action="down" aria-label="ลง">▼</button>
        <button data-action="right" aria-label="ขวา">▶</button>
      </div>
      <div class="mini-map-note">WASD/ลูกศร เดิน | Enter/Z = A | Esc/X = B | M = Menu</div>
      <div class="action-pad">
        <button class="menu-button" data-action="menu" aria-label="เมนู">Menu</button>
        <button class="action-button action-button--secondary" data-action="cancel" aria-label="ปุ่ม B">B</button>
        <button class="action-button primary" data-action="confirm" aria-label="ปุ่ม A">A</button>
      </div>
    </footer>`;
  }

  return Object.freeze({ controls });
})();
