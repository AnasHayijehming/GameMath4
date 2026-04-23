window.Game = window.Game || {};

Game.Input = (function () {
  'use strict';

  const keyMap = {
    ArrowUp: 'up',
    w: 'up',
    W: 'up',
    ArrowDown: 'down',
    s: 'down',
    S: 'down',
    ArrowLeft: 'left',
    a: 'left',
    A: 'left',
    ArrowRight: 'right',
    d: 'right',
    D: 'right',
    Enter: 'confirm',
    z: 'confirm',
    Z: 'confirm',
    Escape: 'cancel',
    x: 'cancel',
    X: 'cancel',
    m: 'menu',
    M: 'menu'
  };

  function init() {
    document.addEventListener('keydown', function onKeydown(event) {
      if (event.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) {
        if (event.key !== 'Enter' && event.key !== 'Escape') return;
      }
      const action = keyMap[event.key];
      if (!action) return;
      event.preventDefault();
      emit(action);
    });

    document.addEventListener('click', function onClick(event) {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const action = button.getAttribute('data-action');
      flash(button);
      emit(action);
    });
  }

  function emit(action) {
    Game.EventBus.emit('input:action', { action });
  }

  function flash(button) {
    button.classList.add('is-pressed');
    setTimeout(function clear() {
      button.classList.remove('is-pressed');
    }, 120);
  }

  return Object.freeze({ init });
})();
