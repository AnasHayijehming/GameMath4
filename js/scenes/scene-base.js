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
        <button data-action="menu">Menu</button>
        <button data-action="cancel">B</button>
        <button class="primary" data-action="confirm">A</button>
      </div>
    </footer>`;
  }

  return Object.freeze({ controls });
})();
