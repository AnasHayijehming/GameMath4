window.Game = window.Game || {};
Game.Infra = Game.Infra || {};

Game.Infra.RNG = (function () {
  'use strict';

  function int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function chance(probability) {
    return Math.random() < probability;
  }

  function pick(items) {
    return items[int(0, items.length - 1)];
  }

  return Object.freeze({ int, chance, pick });
})();
