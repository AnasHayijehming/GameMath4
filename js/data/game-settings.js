window.Game = window.Game || {};
Game.Data = Game.Data || {};

Game.Data.GameSettings = (function () {
  'use strict';

  function config() {
    return Game.Config;
  }

  function defaults() {
    const cfg = config();
    return {
      typingMode: cfg.settings.typingMode,
      soundEnabled: cfg.settings.soundEnabled,
      reducedMotion: !!cfg.settings.reducedMotion,
      timerMultiplier: cfg.quiz.defaultTimerMultiplier,
      lastSavedAt: 0
    };
  }

  function normalizeTimerMultiplier(value, fallback) {
    const number = Number(value);
    const allowed = config().quiz.timerOptions.map(function map(option) { return option.value; });
    return allowed.includes(number) ? number : fallback;
  }

  function normalize(value, fallback) {
    const source = value && typeof value === 'object' ? value : {};
    const fallbackSettings = fallback && typeof fallback === 'object' ? fallback : defaults();
    return {
      typingMode: typeof source.typingMode === 'boolean' ? source.typingMode : fallbackSettings.typingMode,
      soundEnabled: typeof source.soundEnabled === 'boolean' ? source.soundEnabled : fallbackSettings.soundEnabled,
      reducedMotion: typeof source.reducedMotion === 'boolean' ? source.reducedMotion : fallbackSettings.reducedMotion,
      timerMultiplier: normalizeTimerMultiplier(source.timerMultiplier, fallbackSettings.timerMultiplier),
      lastSavedAt: Number.isFinite(Number(source.lastSavedAt)) ? Math.max(0, Number(source.lastSavedAt)) : fallbackSettings.lastSavedAt
    };
  }

  return Object.freeze({
    defaults,
    normalizeTimerMultiplier,
    normalize
  });
})();
