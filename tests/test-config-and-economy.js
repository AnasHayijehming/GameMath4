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

  function expToReachLevel(targetLevel) {
    let total = 0;
    for (let level = Game.Config.player.startingLevel; level < targetLevel; level += 1) {
      total += Game.Systems.Progression.expNeeded(level);
    }
    return total;
  }

  function positionKey(pos) {
    return pos.x + ',' + pos.y;
  }

  function assertQuestionBoxPositions(zoneId, boxes) {
    const zone = Game.Data.Zones.get(zoneId);
    const seen = new Set();
    boxes.forEach(function each(box) {
      assert(Game.Data.Zones.isWalkable(zoneId, box.x, box.y), 'box should be on walkable tile');
      assert(!Game.Data.Zones.npcAt(zoneId, box.x, box.y), 'box should not overlap npc');
      assert(!Game.Data.Zones.portalAt(zoneId, box.x, box.y), 'box should not overlap portal');
      assert(!(zone.shop && zone.shop.x === box.x && zone.shop.y === box.y), 'box should not overlap shop');
      assert(!(zone.spawnPoint.x === box.x && zone.spawnPoint.y === box.y), 'box should not overlap spawn');
      assert(!seen.has(positionKey(box)), 'box positions should be unique');
      seen.add(positionKey(box));
    });
  }

  function adjacentMoveIntoBox(zoneId, box) {
    const options = [
      { pos: { x: box.x, y: box.y - 1 }, direction: 'down' },
      { pos: { x: box.x, y: box.y + 1 }, direction: 'up' },
      { pos: { x: box.x - 1, y: box.y }, direction: 'right' },
      { pos: { x: box.x + 1, y: box.y }, direction: 'left' }
    ];
    return options.find(function find(option) {
      return Game.Data.Zones.isWalkable(zoneId, option.pos.x, option.pos.y)
        && !Game.Data.Zones.npcAt(zoneId, option.pos.x, option.pos.y)
        && !Game.Data.Zones.portalAt(zoneId, option.pos.x, option.pos.y)
        && !Game.Systems.QuestionBoxes.boxAt(zoneId, option.pos.x, option.pos.y);
    });
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

  test('item catalog exposes display metadata for character and shop UI', function () {
    const item = Game.Data.Items.get('accessory_shield');
    assertEqual(item.slotLabel, 'อุปกรณ์', 'slot label');
    assertEqual(item.rarity.id, 'epic', 'rarity tier');
    assert(item.description.length > 0, 'description should be present');
    assertEqual(Game.Data.Items.slots().length, 5, 'slot count');
    assert(Game.Data.Items.bySlot('hat').every(function every(hat) {
      return hat.slot === 'hat' && hat.slotLabel === 'หมวก';
    }), 'slot lookup should include metadata');
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

  test('question boxes spawn five visible non-overlapping boxes per zone', function () {
    Game.Systems.QuestionBoxes.reset();
    Game.State.init(freshState());
    ['forest', 'city', 'castle'].forEach(function each(zoneId) {
      const boxes = Game.Systems.QuestionBoxes.ensure(zoneId);
      assertEqual(boxes.length, 5, zoneId + ' should have five boxes');
      assertQuestionBoxPositions(zoneId, boxes);
    });
  });

  test('movement blocks walking onto question boxes', function () {
    const state = freshState();
    Game.State.init(state);
    Game.Systems.QuestionBoxes.reset();
    const zoneId = state.world.currentZone;
    const box = Game.Systems.QuestionBoxes.ensure(zoneId)[0];
    const move = adjacentMoveIntoBox(zoneId, box);
    assert(move, 'expected a walkable adjacent tile near a question box');

    Game.State.init(Object.assign({}, state, {
      world: Object.assign({}, state.world, { position: move.pos })
    }));

    const moved = Game.Systems.Movement.tryMove(move.direction);
    assertEqual(moved, false, 'movement into question box should fail');
    assertEqual(Game.State.get().world.position.x, move.pos.x, 'x should stay');
    assertEqual(Game.State.get().world.position.y, move.pos.y, 'y should stay');
  });

  test('question box quiz uses generated numeric questions and respawns after submitted answer', function () {
    const state = freshState();
    Game.State.init(state);
    Game.Systems.QuestionBoxes.reset();
    const zoneId = state.world.currentZone;
    const box = Game.Systems.QuestionBoxes.ensure(zoneId)[0];
    const active = Game.Systems.Quiz.start({ source: 'questionBox', zoneId, boxId: box.id });

    assertEqual(active.question.source, 'generated', 'box question should come from generator');
    assert(active.question.topic !== 'word_problem', 'box question should not be word problem');

    Game.Systems.Quiz.submit(active.question.answer);
    const boxes = Game.Systems.QuestionBoxes.all(zoneId);
    assertEqual(boxes.length, 5, 'box count should return to five');
    assert(!boxes.some(function some(candidate) { return candidate.id === box.id; }), 'answered box should be replaced');
    assertQuestionBoxPositions(zoneId, boxes);
    Game.Systems.Quiz.clear();
  });

  test('npc quiz always uses word problems, including forest', function () {
    Game.State.init(freshState());
    const active = Game.Systems.Quiz.start({ source: 'npc', zoneId: 'forest', npcId: 'forest_npc_01' });
    assertEqual(active.question.topic, 'word_problem', 'npc question topic');
    assertEqual(active.question.difficulty, 'easy', 'forest npc should use easy word problem');
    assertEqual(active.question.zone, 'forest', 'forest npc should use forest word problem');
    Game.Systems.Quiz.clear();
  });

  test('zone unlock requirements read from config and portal targets stay in sync', function () {
    const zoneUnlockLevels = Game.Config.world.zoneUnlockLevels;
    assertEqual(Game.Data.Zones.get('forest').requiredLevel, zoneUnlockLevels.forest, 'forest required level');
    assertEqual(Game.Data.Zones.get('city').requiredLevel, zoneUnlockLevels.city, 'city required level');
    assertEqual(Game.Data.Zones.get('castle').requiredLevel, zoneUnlockLevels.castle, 'castle required level');
    assertEqual(Game.Data.Zones.portalAt('forest', 13, 5).requiredLevel, zoneUnlockLevels.city, 'forest portal uses city unlock level');
    assertEqual(Game.Data.Zones.portalAt('city', 12, 7).requiredLevel, zoneUnlockLevels.castle, 'city portal uses castle unlock level');
    assertEqual(Game.Data.Zones.portalAt('castle', 1, 7).requiredLevel, zoneUnlockLevels.city, 'castle return portal uses city unlock level');
  });

  test('progression unlocks zones according to configured zone levels', function () {
    const zoneUnlockLevels = Game.Config.world.zoneUnlockLevels;

    Game.State.init(freshState());
    Game.Systems.Progression.grantExp(expToReachLevel(zoneUnlockLevels.city));
    assertEqual(Game.State.get().player.level, zoneUnlockLevels.city, 'player reaches city level');
    assert(Game.State.get().world.unlockedZones.includes('city'), 'city should unlock at configured level');
    assert(!Game.State.get().world.unlockedZones.includes('castle'), 'castle should stay locked before its configured level');

    Game.State.init(freshState());
    Game.Systems.Progression.grantExp(expToReachLevel(zoneUnlockLevels.castle));
    assertEqual(Game.State.get().player.level, zoneUnlockLevels.castle, 'player reaches castle level');
    assert(Game.State.get().world.unlockedZones.includes('city'), 'lower unlocked zone should still be included');
    assert(Game.State.get().world.unlockedZones.includes('castle'), 'castle should unlock at configured level');
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
