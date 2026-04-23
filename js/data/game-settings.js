window.Game = window.Game || {};
Game.Data = Game.Data || {};

Game.Data.GameSettings = (function () {
  'use strict';

  function defaults() {
    return {
      typingMode: Game.Config.settings.typingMode,
      soundEnabled: Game.Config.settings.soundEnabled,
      reducedMotion: !!Game.Config.settings.reducedMotion,
      timerMultiplier: Game.Config.quiz.defaultTimerMultiplier,
      lastSavedAt: Date.now()
    };
  }

  function allowedTimerMultipliers() {
    return Game.Config.quiz.timerOptions.map(function map(option) {
      return option.value;
    });
  }

  function normalize(rawSettings, fallbackSettings) {
    const settings = rawSettings && typeof rawSettings === 'object' ? rawSettings : {};
    const fallback = fallbackSettings && typeof fallbackSettings === 'object' ? fallbackSettings : defaults();

    return {
      typingMode: typeof settings.typingMode === 'boolean' ? settings.typingMode : fallback.typingMode,
      soundEnabled: typeof settings.soundEnabled === 'boolean' ? settings.soundEnabled : fallback.soundEnabled,
      reducedMotion: typeof settings.reducedMotion === 'boolean' ? settings.reducedMotion : fallback.reducedMotion,
      timerMultiplier: normalizeTimerMultiplier(settings.timerMultiplier, fallback.timerMultiplier),
      lastSavedAt: normalizeNonNegativeNumber(settings.lastSavedAt, fallback.lastSavedAt)
    };
  }

  function normalizeTimerMultiplier(value, fallback) {
    const number = Number(value);
    return allowedTimerMultipliers().includes(number) ? number : fallback;
  }

  function normalizeNonNegativeNumber(value, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(0, number);
  }

  return Object.freeze({
    defaults,
    allowedTimerMultipliers,
    normalize,
    normalizeTimerMultiplier
  });
})();
