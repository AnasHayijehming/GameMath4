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

  function freshState() {
    return Game.Main.createDefaultState('เด็กดี', 'female');
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

  test('Game.Data.GameSettings.uiFields exposes visible schema and config-backed options', function () {
    const fields = Game.Data.GameSettings.uiFields();
    const keys = fields.map(function map(field) { return field.key; });
    assertEqual(keys.join(','), 'typingMode,soundEnabled,reducedMotion,timerMultiplier', 'ui field keys');
    assert(!fields.some(function some(field) { return field.key === 'lastSavedAt'; }), 'internal field should stay out of UI');

    const timerField = fields[fields.length - 1];
    assertEqual(timerField.input, 'select', 'timer field renders as select');
    assertEqual(timerField.options.length, Game.Config.quiz.timerOptions.length, 'timer options count');
    assertEqual(timerField.options[1].value, Game.Config.quiz.timerOptions[1].value, 'timer option value');
    assertEqual(timerField.options[1].label, Game.Config.quiz.timerOptions[1].label, 'timer option label');
  });

  test('Game.Data.GameSettings.readForm preserves internal values and normalizes invalid input', function () {
    const host = document.createElement('div');
    const state = freshState();
    state.settings = Object.assign({}, state.settings, {
      typingMode: false,
      soundEnabled: true,
      reducedMotion: false,
      timerMultiplier: 1.5,
      lastSavedAt: 42
    });

    document.body.appendChild(host);
    try {
      Game.State.init(state);
      Game.Scenes.Settings.enter();
      host.innerHTML = Game.Scenes.Settings.render();

      const form = host.querySelector('[data-settings-form]');
      form.elements.typingMode.checked = true;
      form.elements.soundEnabled.checked = false;
      form.elements.reducedMotion.checked = true;
      form.elements.timerMultiplier.value = '999';

      const nextSettings = Game.Data.GameSettings.readForm(form, state.settings);
      assertEqual(nextSettings.typingMode, true, 'typingMode read from checkbox');
      assertEqual(nextSettings.soundEnabled, false, 'soundEnabled read from checkbox');
      assertEqual(nextSettings.reducedMotion, true, 'reducedMotion read from checkbox');
      assertEqual(nextSettings.timerMultiplier, 1.5, 'invalid timer falls back to previous value');
      assertEqual(nextSettings.lastSavedAt, 42, 'internal fields should be preserved');
    } finally {
      host.remove();
    }
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

  test('settings scene renders schema fields and saves submitted values', function () {
    const host = document.createElement('div');
    const state = freshState();
    state.settings = Object.assign({}, state.settings, {
      typingMode: false,
      soundEnabled: true,
      reducedMotion: false,
      timerMultiplier: 1.5,
      lastSavedAt: 123
    });

    document.body.appendChild(host);

    const originalRequestRender = Game.SceneManager.requestRender;
    let renderRequests = 0;

    try {
      Game.SceneManager.requestRender = function renderStub() {
        renderRequests += 1;
      };

      Game.Storage.clear();
      Game.State.init(state);
      Game.Scenes.Settings.enter();
      host.innerHTML = Game.Scenes.Settings.render();
      Game.Scenes.Settings.bind(host);

      const form = host.querySelector('[data-settings-form]');
      const controls = host.querySelectorAll('[data-settings-form] [name]');
      assertEqual(controls.length, 4, 'settings scene should render visible schema fields only');
      assert(host.textContent.includes('โหมดพิมพ์ตอบ'), 'typing label should render');
      assert(host.textContent.includes('เหรียญ x' + Game.Config.economy.typingCoinMultiplier), 'typing description should render');
      assertEqual(form.elements.timerMultiplier.options.length, Game.Config.quiz.timerOptions.length, 'timer options should render from config');
      assertEqual(form.elements.timerMultiplier.value, '1.5', 'existing timer selection should render');

      form.elements.typingMode.checked = true;
      form.elements.soundEnabled.checked = false;
      form.elements.reducedMotion.checked = true;
      form.elements.timerMultiplier.value = '2';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      assertEqual(Game.State.get().settings.typingMode, true, 'typingMode saved to state');
      assertEqual(Game.State.get().settings.soundEnabled, false, 'soundEnabled saved to state');
      assertEqual(Game.State.get().settings.reducedMotion, true, 'reducedMotion saved to state');
      assertEqual(Game.State.get().settings.timerMultiplier, 2, 'timerMultiplier saved to state');
      assertEqual(Game.State.get().settings.lastSavedAt, 123, 'lastSavedAt preserved after save');
      assert(Game.Storage.exists(), 'submit should persist a save');
      assertEqual(Game.Storage.load().settings.timerMultiplier, 2, 'saved state includes new timer');
      assertEqual(renderRequests, 1, 'submit should request rerender once');

      host.innerHTML = Game.Scenes.Settings.render();
      assert(host.textContent.includes('บันทึกแล้ว'), 'success message should render after save');
    } finally {
      Game.SceneManager.requestRender = originalRequestRender;
      Game.Storage.clear();
      host.remove();
    }
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
