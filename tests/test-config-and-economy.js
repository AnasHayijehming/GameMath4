(function () {
  'use strict';

  const results = document.getElementById('results');
  const tests = [];

  Game.SceneManager = {
    requestRender() {},
    currentId() { return 'overworld'; }
  };

  function test(name, fn) {
    tests.push({ name, fn });
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'assertion failed');
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message || 'value mismatch'}: expected ${expected}, got ${actual}`);
    }
  }

  function renderResult(name, error) {
    const row = document.createElement('li');
    row.className = error ? 'fail' : 'pass';
    row.textContent = error ? `${name}: ${error.message}` : `${name}: passed`;
    results.appendChild(row);
  }

  function freshState(overrides) {
    const state = Game.Main.createDefaultState('เด็ก เก่ง4', 'female');
    return Object.assign({}, state, overrides || {});
  }

  test('player name validation accepts Thai English numbers and collapses spaces', function () {
    const valid = Game.Main.validatePlayerName('  เด็ก   Pro 4  ');
    assert(valid.ok, 'expected valid name');
    assertEqual(valid.name, 'เด็ก Pro 4', 'normalized name');
    assert(!Game.Main.validatePlayerName('A').ok, 'single-character name should fail');
    assert(!Game.Main.validatePlayerName('เด็ก@@').ok, 'symbols should fail');
    assert(!Game.Main.validatePlayerName('เด็ก🙂').ok, 'emoji should fail');
  });

  test('default state reads player, inventory, settings, and storage values from config', function () {
    const state = Game.Main.createDefaultState('เด็กดี', 'male');
    assertEqual(state.version, Game.Config.storage.version, 'version');
    assertEqual(state.player.name, 'เด็กดี', 'player name');
    assertEqual(state.player.gender, 'male', 'gender');
    assertEqual(state.player.coins, Game.Config.player.startingCoins, 'starting coins');
    assertEqual(state.world.currentZone, Game.Config.world.startingZone, 'starting zone');
    assertEqual(state.inventory.owned[0], Game.Config.inventory.starterOwned[0], 'starter item');
    assertEqual(state.settings.timerMultiplier, Game.Config.quiz.defaultTimerMultiplier, 'timer multiplier');
  });

  test('settings timer multiplier normalizes only configured values', function () {
    assertEqual(Game.Main.normalizeTimerMultiplier('1.5', 1), 1.5, 'configured multiplier');
    assertEqual(Game.Main.normalizeTimerMultiplier('3', 1), 1, 'invalid multiplier fallback');
  });

  test('hydrate saved state repairs missing settings and rejects title shell save', function () {
    const raw = Game.Main.createDefaultState('เด็กดี', 'female');
    raw.ui.currentScene = 'overworld';
    delete raw.settings.timerMultiplier;
    const hydrated = Game.Main.hydrateSavedState(raw);
    assert(hydrated, 'expected hydrated state');
    assertEqual(hydrated.settings.timerMultiplier, Game.Config.quiz.defaultTimerMultiplier, 'repaired timer');

    const shell = Game.Main.createDefaultState(Game.Config.player.defaultName, Game.Config.player.defaultGender);
    shell.ui.currentScene = 'title';
    assertEqual(Game.Main.hydrateSavedState(shell), null, 'shell save should be ignored');
  });

  test('economy grant and spend reject invalid values and prevent negative coins', function () {
    Game.State.init(freshState());
    Game.Systems.Economy.grant(Number.POSITIVE_INFINITY);
    assertEqual(Game.State.get().player.coins, Game.Config.player.startingCoins, 'infinite grant ignored');
    assertEqual(Game.Systems.Economy.spend(Number.NaN), false, 'NaN spend rejected');
    assertEqual(Game.Systems.Economy.spend(Game.Config.player.startingCoins + 1), false, 'overspend rejected');
    assertEqual(Game.State.get().player.coins, Game.Config.player.startingCoins, 'coins unchanged after overspend');
    assertEqual(Game.Systems.Economy.spend(5), true, 'valid spend accepted');
    assertEqual(Game.State.get().player.coins, Game.Config.player.startingCoins - 5, 'coins spent');
  });

  test('shop purchase changes state only on successful purchase', function () {
    Game.State.init(freshState());
    const item = Game.Data.Items.get('hat_beanie');
    const outcome = Game.Systems.Economy.purchase(item.id);
    assert(outcome.ok, 'first purchase should pass');
    assert(Game.State.get().inventory.owned.includes(item.id), 'item should be owned');
    assertEqual(Game.State.get().player.coins, Game.Config.player.startingCoins - item.price, 'price deducted');

    const coinsAfterPurchase = Game.State.get().player.coins;
    const duplicate = Game.Systems.Economy.purchase(item.id);
    assert(!duplicate.ok, 'duplicate purchase should fail');
    assertEqual(Game.State.get().player.coins, coinsAfterPurchase, 'duplicate should not spend coins');
  });

  test('quiz hint cost and typing reward use config', function () {
    const state = freshState({
      settings: Object.assign({}, freshState().settings, { typingMode: true })
    });
    Game.State.init(state);
    const active = Game.Systems.Quiz.start({ zoneId: 'forest', bonusMultiplier: 2 });
    const usedHint = Game.Systems.Quiz.useHint();
    assert(usedHint, 'hint should be usable');
    assertEqual(Game.State.get().player.coins, Game.Config.player.startingCoins - Game.Config.economy.hintCost, 'hint cost deducted');

    const outcome = Game.Systems.Quiz.submit(active.question.answer);
    const expectedCoins = Game.Config.economy.baseCoinReward
      * Game.Data.Zones.get('forest').multiplier
      * Game.Config.economy.typingCoinMultiplier
      * 2;
    assert(outcome.correct, 'answer should be correct');
    assertEqual(outcome.reward.coins, expectedCoins, 'typing reward');
    assertEqual(Game.State.get().player.coins, Game.Config.player.startingCoins - Game.Config.economy.hintCost + expectedCoins, 'reward granted');
    Game.Systems.Quiz.clear();
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
