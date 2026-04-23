window.Game = window.Game || {};

Game.State = (function () {
  'use strict';

  let state = null;
  const listeners = new Set();

  function init(initialState) {
    state = initialState;
    notify(null);
  }

  function get() {
    return state;
  }

  function update(updater) {
    const previous = state;
    const next = updater(previous);
    if (!next || next === previous) return;
    state = next;
    notify(previous);
  }

  function subscribe(fn) {
    listeners.add(fn);
    return function unsubscribe() {
      listeners.delete(fn);
    };
  }

  function notify(previous) {
    listeners.forEach(function run(fn) {
      try {
        fn(state, previous);
      } catch (error) {
        console.error('[State] listener failed', error);
      }
    });
  }

  return Object.freeze({ init, get, update, subscribe });
})();
