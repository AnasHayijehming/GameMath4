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

  function freshOverworldState(position) {
    const state = Game.Main.createDefaultState('เด็กเจอศัตรู', 'female');
    return Object.assign({}, state, {
      world: Object.assign({}, state.world, {
        currentZone: 'forest',
        position: position || { x: 2, y: 8 }
      }),
      ui: Object.assign({}, state.ui, { currentScene: 'overworld' })
    });
  }

  function withForestProbability(probability, fn) {
    const zone = Game.Data.Zones.get('forest');
    const previous = zone.quiz.encounterProbability;
    zone.quiz.encounterProbability = probability;
    try {
      fn();
    } finally {
      zone.quiz.encounterProbability = previous;
    }
  }

  function withEncounterHarness(position, fn) {
    const previousQuestionBoxes = Game.Systems.QuestionBoxes;
    const previousGoTo = Game.SceneManager.goTo;
    const previousCurrentId = Game.SceneManager.currentId;
    const calls = [];

    Game.Systems.QuestionBoxes = null;
    Game.SceneManager.currentId = function currentId() { return 'overworld'; };
    Game.SceneManager.goTo = function goTo(id, params) {
      calls.push({ id, params });
    };

    try {
      Game.Systems.Encounter.reset();
      Game.State.init(freshOverworldState(position));
      Game.Systems.Encounter.init();
      fn(calls);
    } finally {
      Game.Systems.QuestionBoxes = previousQuestionBoxes;
      Game.SceneManager.goTo = previousGoTo;
      Game.SceneManager.currentId = previousCurrentId;
    }
  }

  test('asset loader uses placeholder before manifest asset path is proven loadable', function () {
    const url = Game.Render.AssetLoader.titleBackground();
    assert(url.indexOf('data:image/svg+xml') === 0, 'title fallback should be inline svg data url');
    assert(url.includes('missing%20asset'), 'fallback should identify missing asset');
  });

  test('asset loader uses placeholder for unknown manifest keys', function () {
    const url = Game.Render.AssetLoader.getUrl('unknown_asset_key');
    assert(url.indexOf('data:image/svg+xml') === 0, 'unknown key should use placeholder');
    assert(url.includes('unknown_asset_key'), 'placeholder should include safe key label');
  });

  test('encounter does not start when zone probability is zero', function () {
    withForestProbability(0, function run() {
      withEncounterHarness({ x: 2, y: 8 }, function emitMove(calls) {
        Game.EventBus.emit('player:moved', { x: 2, y: 8 });
        assertEqual(calls.length, 0, 'zero probability should not start quiz');
      });
    });
  });

  test('encounter starts monster quiz when probability is one', function () {
    withForestProbability(1, function run() {
      withEncounterHarness({ x: 2, y: 8 }, function emitMove(calls) {
        Game.EventBus.emit('player:moved', { x: 2, y: 8 });
        assertEqual(calls.length, 1, 'encounter should start once');
        assertEqual(calls[0].id, 'quiz', 'encounter target scene');
        assertEqual(calls[0].params.source, 'monster', 'encounter source');
        assertEqual(calls[0].params.zoneId, 'forest', 'encounter zone');
      });
    });
  });

  test('encounter cooldown blocks immediate repeat encounters', function () {
    withForestProbability(1, function run() {
      withEncounterHarness({ x: 2, y: 8 }, function emitMove(calls) {
        Game.EventBus.emit('player:moved', { x: 2, y: 8 });
        Game.EventBus.emit('player:moved', { x: 2, y: 8 });
        assertEqual(calls.length, 1, 'cooldown should block second move');
      });
    });
  });

  test('encounter skips positions with adjacent interaction prompts', function () {
    withForestProbability(1, function run() {
      withEncounterHarness({ x: 7, y: 4 }, function emitMove(calls) {
        Game.EventBus.emit('player:moved', { x: 7, y: 4 });
        assertEqual(calls.length, 0, 'adjacent npc should suppress random encounter');
      });
    });
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
