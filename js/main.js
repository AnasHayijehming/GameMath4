window.Game = window.Game || {};

Game.Main = (function () {
  'use strict';

  const TOPICS = ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'decimal', 'word_problem', 'geometry'];

  function config() {
    return Game.Config;
  }

  function boot() {
    const rawSaved = Game.Storage.load();
    const saved = hydrateSavedState(rawSaved);
    if (rawSaved && !saved) Game.Storage.clear();
    Game.State.init(saved || createDefaultState(config().player.defaultName, config().player.defaultGender));

    Game.Systems.Economy.init();
    Game.Systems.Progression.init();
    Game.Systems.Audio.init();
    Game.Render.HUD.init();
    Game.Render.FX.init();

    Game.SceneManager.init();
    [
      Game.Scenes.Title,
      Game.Scenes.Create,
      Game.Scenes.Overworld,
      Game.Scenes.Quiz,
      Game.Scenes.Shop,
      Game.Scenes.Inventory,
      Game.Scenes.Stats,
      Game.Scenes.Settings
    ].forEach(Game.SceneManager.register);

    Game.Systems.Encounter.init();
    Game.Render.AssetLoader.loadManifest().then(function onManifest() {
      const active = Game.State.get();
      const zoneId = active && active.world ? active.world.currentZone : 'forest';
      Game.Render.AssetLoader.preloadCritical(zoneId);
    });
    Game.EventBus.on('player:zone_changed', function onZoneChanged(payload) {
      Game.Render.AssetLoader.preloadCritical(payload && payload.toZone);
    });
    Game.Input.init();
    setupAutoSave();
    Game.State.subscribe(Game.SceneManager.requestRender);
    Game.Loop.start();

    Game.State.update(function update(s) {
      return Object.assign({}, s, {
        stats: Object.assign({}, s.stats, { sessionsPlayed: s.stats.sessionsPlayed + 1 })
      });
    });

    Game.SceneManager.goTo(saved ? 'overworld' : 'title');

    if (window.location.hash === '#debug') {
      window.__state = function state() { return Game.State.get(); };
    }
  }

  function createDefaultState(name, gender) {
    const cfg = config();
    const zone = Game.Data.Zones.get(cfg.world.startingZone);
    const nameValidation = validatePlayerName(name);
    const playerName = nameValidation.ok ? nameValidation.name : cfg.player.defaultName;
    const playerGender = gender === 'male' || gender === 'female' ? gender : cfg.player.defaultGender;
    return {
      version: cfg.storage.version,
      player: {
        name: playerName,
        gender: playerGender,
        level: cfg.player.startingLevel,
        exp: cfg.player.startingExp,
        coins: cfg.player.startingCoins
      },
      world: {
        currentZone: cfg.world.startingZone,
        position: Object.assign({}, zone.spawnPoint),
        unlockedZones: [cfg.world.startingZone],
        facing: cfg.world.defaultFacing
      },
      inventory: {
        owned: cfg.inventory.starterOwned.slice(),
        equipped: Object.assign({}, cfg.inventory.starterEquipped)
      },
      npcsCompleted: [],
      bossDefeated: [],
      stats: {
        totalPlayTimeMs: 0,
        correctByTopic: createTopicStats(),
        totalCoinsEarned: 0,
        totalCoinsSpent: 0,
        hintsUsed: 0,
        sessionsPlayed: 0
      },
      settings: Object.assign({}, Game.Data.GameSettings.defaults(), { lastSavedAt: Date.now() }),
      ui: {
        currentScene: 'title',
        overlayScene: null,
        sceneParams: null
      }
    };
  }

  function createTopicStats() {
    return TOPICS.reduce(function build(acc, topic) {
      acc[topic] = { correct: 0, total: 0 };
      return acc;
    }, {});
  }

  function setupAutoSave() {
    let saveTimer = null;
    ['quiz:completed', 'item:purchased', 'item:equipped', 'player:zone_changed'].forEach(function each(eventName) {
      Game.EventBus.on(eventName, function onEvent() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function save() {
          saveCurrentState();
        }, config().storage.autoSaveDelayMs);
      });
    });
    setInterval(function intervalSave() {
      saveCurrentState();
    }, config().storage.autoSaveIntervalMs);
    window.addEventListener('beforeunload', function onUnload() {
      const state = Game.State.get();
      if (isPersistableGameState(state)) Game.Storage.save(stampSavedAt(state));
    });
  }

  function saveCurrentState() {
    const current = Game.State.get();
    if (!isPersistableGameState(current)) return false;
    const state = stampSavedAt(current);
    Game.State.init(state);
    return Game.Storage.save(state);
  }

  function isPersistableGameState(state) {
    if (!state || !state.player || !state.world || !state.inventory || !state.stats || !state.settings) return false;
    const scene = Game.SceneManager && Game.SceneManager.currentId ? Game.SceneManager.currentId() : state.ui && state.ui.currentScene;
    return scene !== 'title' && scene !== 'create';
  }

  function stampSavedAt(state) {
    return Object.assign({}, state, {
      settings: Object.assign({}, state.settings, { lastSavedAt: Date.now() })
    });
  }

  function hydrateSavedState(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (!raw.player || !raw.world || !raw.inventory) return null;
    if (isUntouchedShellSave(raw)) return null;

    const nameValidation = validatePlayerName(raw.player.name);
    const fallback = createDefaultState(
      nameValidation.ok ? nameValidation.name : config().player.defaultName,
      raw.player.gender === 'male' || raw.player.gender === 'female' ? raw.player.gender : config().player.defaultGender
    );
    const currentZone = Game.Data.Zones.get(raw.world.currentZone) ? raw.world.currentZone : fallback.world.currentZone;
    const position = normalizePosition(raw.world.position, Game.Data.Zones.get(currentZone).spawnPoint);
    const unlockedZones = normalizeZoneList(raw.world.unlockedZones, fallback.world.unlockedZones);
    if (!unlockedZones.includes(currentZone)) unlockedZones.push(currentZone);
    const owned = normalizeStringArray(raw.inventory.owned, fallback.inventory.owned);
    config().inventory.starterOwned.forEach(function each(itemId) {
      if (!owned.includes(itemId)) owned.unshift(itemId);
    });

    return {
      version: raw.version || fallback.version,
      player: {
        name: fallback.player.name,
        gender: fallback.player.gender,
        level: normalizeNumber(raw.player.level, fallback.player.level, 1),
        exp: normalizeNumber(raw.player.exp, fallback.player.exp, 0),
        coins: normalizeNumber(raw.player.coins, fallback.player.coins, 0)
      },
      world: {
        currentZone,
        position,
        unlockedZones,
        facing: ['up', 'down', 'left', 'right'].includes(raw.world.facing) ? raw.world.facing : fallback.world.facing
      },
      inventory: {
        owned,
        equipped: normalizeEquipped(raw.inventory.equipped, owned, fallback.inventory.equipped)
      },
      npcsCompleted: normalizeStringArray(raw.npcsCompleted, fallback.npcsCompleted),
      bossDefeated: normalizeStringArray(raw.bossDefeated, fallback.bossDefeated),
      stats: normalizeStats(raw.stats, fallback.stats),
      settings: normalizeSettings(raw.settings, fallback.settings),
      ui: {
        currentScene: 'overworld',
        overlayScene: null,
        sceneParams: null
      }
    };
  }

  function isUntouchedShellSave(raw) {
    const cfg = config();
    const scene = raw.ui && raw.ui.currentScene;
    if (scene !== 'title' && scene !== 'create') return false;
    if (!raw.player
      || raw.player.name !== cfg.player.defaultName
      || Number(raw.player.level) !== cfg.player.startingLevel
      || Number(raw.player.exp) !== cfg.player.startingExp
      || Number(raw.player.coins) !== cfg.player.startingCoins) return false;
    const stats = raw.stats || {};
    const owned = raw.inventory && Array.isArray(raw.inventory.owned) ? raw.inventory.owned : [];
    const starterOwned = cfg.inventory.starterOwned;
    return Number(stats.totalCoinsEarned || 0) === 0
      && Number(stats.totalCoinsSpent || 0) === 0
      && Number(stats.hintsUsed || 0) === 0
      && (!Array.isArray(raw.npcsCompleted) || raw.npcsCompleted.length === 0)
      && (!Array.isArray(raw.bossDefeated) || raw.bossDefeated.length === 0)
      && (owned.length === 0 || (owned.length === starterOwned.length && starterOwned.every(function every(itemId) { return owned.includes(itemId); })));
  }

  function normalizePosition(value, fallback) {
    if (!value || typeof value !== 'object') return Object.assign({}, fallback);
    return {
      x: normalizeNumber(value.x, fallback.x, 0),
      y: normalizeNumber(value.y, fallback.y, 0)
    };
  }

  function normalizeZoneList(value, fallback) {
    const zones = normalizeStringArray(value, fallback).filter(function filter(zoneId) {
      return !!Game.Data.Zones.get(zoneId);
    });
    return zones.length ? zones : fallback.slice();
  }

  function normalizeStringArray(value, fallback) {
    if (!Array.isArray(value)) return fallback.slice();
    const seen = new Set();
    return value.filter(function filter(item) {
      if (typeof item !== 'string' || seen.has(item)) return false;
      seen.add(item);
      return true;
    });
  }

  function normalizeEquipped(value, owned, fallback) {
    const source = value && typeof value === 'object' ? value : {};
    const equipped = Object.assign({}, fallback);
    Object.keys(config().inventory.starterEquipped).forEach(function each(slot) {
      const itemId = source[slot];
      equipped[slot] = itemId && owned.includes(itemId) ? itemId : null;
    });
    if (!equipped.clothes) equipped.clothes = owned.includes(fallback.clothes) ? fallback.clothes : config().inventory.starterEquipped.clothes;
    return equipped;
  }

  function normalizeStats(value, fallback) {
    const stats = value && typeof value === 'object' ? value : {};
    const correctByTopic = Object.assign({}, fallback.correctByTopic);
    Object.keys(correctByTopic).forEach(function each(topic) {
      const row = stats.correctByTopic && stats.correctByTopic[topic] ? stats.correctByTopic[topic] : {};
      correctByTopic[topic] = {
        correct: normalizeNumber(row.correct, correctByTopic[topic].correct, 0),
        total: normalizeNumber(row.total, correctByTopic[topic].total, 0)
      };
    });
    return {
      totalPlayTimeMs: normalizeNumber(stats.totalPlayTimeMs, fallback.totalPlayTimeMs, 0),
      correctByTopic,
      totalCoinsEarned: normalizeNumber(stats.totalCoinsEarned, fallback.totalCoinsEarned, 0),
      totalCoinsSpent: normalizeNumber(stats.totalCoinsSpent, fallback.totalCoinsSpent, 0),
      hintsUsed: normalizeNumber(stats.hintsUsed, fallback.hintsUsed, 0),
      sessionsPlayed: normalizeNumber(stats.sessionsPlayed, fallback.sessionsPlayed, 0)
    };
  }

  function normalizeSettings(value, fallback) {
    return Game.Data.GameSettings.normalize(value, fallback);
  }

  function normalizeTimerMultiplier(value, fallback) {
    return Game.Data.GameSettings.normalizeTimerMultiplier(value, fallback);
  }

  function normalizePlayerName(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function validatePlayerName(value) {
    const cfg = config().player;
    const name = normalizePlayerName(value);
    if (name.length < cfg.nameMinLength) {
      return { ok: false, name, reason: 'too_short', message: `ชื่อควรมีอย่างน้อย ${cfg.nameMinLength} ตัวอักษร` };
    }
    if (name.length > cfg.nameMaxLength) {
      return { ok: false, name, reason: 'too_long', message: `ชื่อยาวได้ไม่เกิน ${cfg.nameMaxLength} ตัวอักษร` };
    }
    if (!cfg.allowedNamePattern.test(name)) {
      return { ok: false, name, reason: 'invalid_chars', message: 'ใช้ได้เฉพาะภาษาไทย ภาษาอังกฤษ ตัวเลข และช่องว่าง' };
    }
    return { ok: true, name, reason: null, message: '' };
  }

  function normalizeNumber(value, fallback, min) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return typeof min === 'number' ? Math.max(min, number) : number;
  }

  if (!window.__MATH_ADVENTURE_SKIP_BOOT__) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }

  return Object.freeze({
    createDefaultState,
    hydrateSavedState,
    normalizePlayerName,
    validatePlayerName,
    normalizeTimerMultiplier
  });
})();
