window.Game = window.Game || {};
Game.Data = Game.Data || {};

Game.Data.GameSettings = (function () {
  'use strict';

  function normalizeTimerMultiplier(value, fallback) {
    const number = Number(value);
    const allowed = Game.Config.quiz.timerOptions.map(function map(option) { return option.value; });
    return allowed.includes(number) ? number : fallback;
  }

  return Object.freeze({
    normalizeTimerMultiplier
  });
})();
