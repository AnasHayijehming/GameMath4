window.Game = window.Game || {};

Game.Storage = (function () {
  'use strict';

  let memorySave = null;
  let available = null;

  function config() {
    return Game.Config && Game.Config.storage ? Game.Config.storage : {
      key: 'math_adventure_save',
      version: '1.0'
    };
  }

  function isAvailable() {
    if (available !== null) return available;
    try {
      localStorage.setItem('__math_adventure_test__', '1');
      localStorage.removeItem('__math_adventure_test__');
      available = true;
    } catch (error) {
      available = false;
    }
    return available;
  }

  function save(state) {
    const payload = {
      version: config().version,
      savedAt: Date.now(),
      data: state
    };
    try {
      if (isAvailable()) {
        localStorage.setItem(config().key, JSON.stringify(payload));
      } else {
        memorySave = payload;
      }
      Game.EventBus.emit('save:completed', { timestamp: payload.savedAt });
      return true;
    } catch (error) {
      console.error('[Storage] save failed', error);
      Game.EventBus.emit('save:failed', { error: String(error) });
      return false;
    }
  }

  function load() {
    try {
      const raw = isAvailable() ? localStorage.getItem(config().key) : null;
      const payload = raw ? JSON.parse(raw) : memorySave;
      if (!payload) return null;
      return payload.data || payload;
    } catch (error) {
      console.error('[Storage] load failed', error);
      return null;
    }
  }

  function clear() {
    memorySave = null;
    if (isAvailable()) localStorage.removeItem(config().key);
  }

  function exists() {
    if (memorySave) return true;
    return isAvailable() && localStorage.getItem(config().key) !== null;
  }

  return Object.freeze({ save, load, clear, exists, isAvailable });
})();
