(function () {
  'use strict';

  const results = document.getElementById('results');
  const tests = [];

  function test(name, fn) {
    tests.push({ name, fn });
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'assertion failed');
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error((message || 'value mismatch') + ': expected ' + expected + ', got ' + actual);
    }
  }

  function renderResult(name, error) {
    const row = document.createElement('li');
    row.className = error ? 'fail' : 'pass';
    row.textContent = error ? name + ': ' + error.message : name + ': passed';
    results.appendChild(row);
  }

  test('Game.Data.GameSettings.defaults returns expected keys and config defaults', function () {
    const defaults = Game.Data.GameSettings.defaults();
    const keys = Object.keys(defaults).sort();
    assertEqual(keys.join(','), 'lastSavedAt,reducedMotion,soundEnabled,timerMultiplier,typingMode', 'default keys');
    assertEqual(defaults.typingMode, Game.Config.settings.typingMode, 'default typing mode');
    assertEqual(defaults.soundEnabled, Game.Config.settings.soundEnabled, 'default sound');
    assertEqual(defaults.reducedMotion, !!Game.Config.settings.reducedMotion, 'default motion');
    assertEqual(defaults.timerMultiplier, Game.Config.quiz.defaultTimerMultiplier, 'default timer multiplier');
    assertEqual(defaults.lastSavedAt, 0, 'default lastSavedAt');
  });

  test('Game.Data.GameSettings.normalizeTimerMultiplier accepts only configured options', function () {
    assertEqual(Game.Data.GameSettings.normalizeTimerMultiplier('1.5', 1), 1.5, 'configured option accepted');
    assertEqual(Game.Data.GameSettings.normalizeTimerMultiplier('2', 1), 2, 'configured option accepted by string');
    assertEqual(Game.Data.GameSettings.normalizeTimerMultiplier(999, 1), 1, 'invalid option falls back');
    assertEqual(Game.Data.GameSettings.normalizeTimerMultiplier('not-a-number', 1.5), 1.5, 'non-number falls back');
  });

  test('Game.Data.GameSettings.normalize falls back when values are invalid or missing', function () {
    const fallback = {
      typingMode: true,
      soundEnabled: false,
      reducedMotion: true,
      timerMultiplier: 1.5,
      lastSavedAt: 42
    };
    const normalized = Game.Data.GameSettings.normalize({
      typingMode: 'yes',
      soundEnabled: null,
      reducedMotion: undefined,
      timerMultiplier: 7,
      lastSavedAt: -100
    }, fallback);

    assertEqual(normalized.typingMode, true, 'invalid typingMode falls back');
    assertEqual(normalized.soundEnabled, false, 'invalid sound falls back');
    assertEqual(normalized.reducedMotion, true, 'invalid reducedMotion falls back');
    assertEqual(normalized.timerMultiplier, 1.5, 'invalid timer multiplier falls back');
    assertEqual(normalized.lastSavedAt, 0, 'negative lastSavedAt clamps to 0');
  });

  test('hydrateSavedState repairs old/partial save when settings are missing', function () {
    const raw = Game.Main.createDefaultState('เด็กดี', 'female');
    raw.ui.currentScene = 'overworld';
    delete raw.settings;

    const hydrated = Game.Main.hydrateSavedState(raw);
    assert(hydrated, 'expected hydrated state');
    assertEqual(hydrated.settings.typingMode, Game.Config.settings.typingMode, 'typingMode fallback');
    assertEqual(hydrated.settings.soundEnabled, Game.Config.settings.soundEnabled, 'soundEnabled fallback');
    assertEqual(hydrated.settings.timerMultiplier, Game.Config.quiz.defaultTimerMultiplier, 'timer fallback');
  });

  test('hydrateSavedState falls back for invalid timerMultiplier in save', function () {
    const raw = Game.Main.createDefaultState('เด็กดี', 'female');
    raw.ui.currentScene = 'overworld';
    raw.settings.timerMultiplier = 99;

    const hydrated = Game.Main.hydrateSavedState(raw);
    assert(hydrated, 'expected hydrated state');
    assertEqual(hydrated.settings.timerMultiplier, Game.Config.quiz.defaultTimerMultiplier, 'invalid timer repaired');
  });

  test('hydrateSavedState falls back for non-boolean soundEnabled and typingMode', function () {
    const raw = Game.Main.createDefaultState('เด็กดี', 'female');
    raw.ui.currentScene = 'overworld';
    raw.settings.soundEnabled = 'on';
    raw.settings.typingMode = 1;

    const hydrated = Game.Main.hydrateSavedState(raw);
    assert(hydrated, 'expected hydrated state');
    assertEqual(hydrated.settings.soundEnabled, Game.Config.settings.soundEnabled, 'invalid soundEnabled repaired');
    assertEqual(hydrated.settings.typingMode, Game.Config.settings.typingMode, 'invalid typingMode repaired');
  });

  tests.forEach(function each(entry) {
    try {
      entry.fn();
      renderResult(entry.name);
    } catch (error) {
      console.error(entry.name, error);
      renderResult(entry.name, error);
    }
  });
})();
