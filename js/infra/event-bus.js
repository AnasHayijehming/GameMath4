window.Game = window.Game || {};

Game.EventBus = (function () {
  'use strict';

  const handlers = new Map();

  function on(event, fn) {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event).add(fn);
    return function unsubscribe() {
      const set = handlers.get(event);
      if (set) set.delete(fn);
    };
  }

  function emit(event, payload) {
    const set = handlers.get(event);
    if (!set) return;
    set.forEach(function run(fn) {
      try {
        fn(payload || {});
      } catch (error) {
        console.error('[EventBus]', event, error);
      }
    });
  }

  function clear() {
    handlers.clear();
  }

  return Object.freeze({ on, emit, clear });
})();
