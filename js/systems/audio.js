window.Game = window.Game || {};
Game.Systems = Game.Systems || {};

Game.Systems.Audio = (function () {
  'use strict';

  let ctx = null;

  function init() {
    document.addEventListener('pointerdown', ensureCtx, { once: true });
    document.addEventListener('keydown', ensureCtx, { once: true });
    Game.EventBus.on('quiz:answered', function onAnswered(payload) {
      play(payload.correct ? 'correct' : 'wrong');
    });
    Game.EventBus.on('coins:changed', function onCoin(payload) {
      if (payload.delta > 0) play('coin');
    });
    Game.EventBus.on('level:up', function onLevel() { play('levelUp'); });
    Game.EventBus.on('encounter:monster', function onMonster() { play('monster'); });
    Game.EventBus.on('input:action', function onInput() { play('click'); });
  }

  function ensureCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  }

  function play(name) {
    const state = Game.State.get();
    if (!state || !state.settings.soundEnabled) return;
    ensureCtx();
    if (!ctx) return;
    const sfx = SFX[name];
    if (sfx) sfx();
  }

  function tone(freq, duration, type, delay, gainValue) {
    const start = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(gainValue || 0.18, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  const SFX = {
    correct() {
      tone(659.25, 0.1, 'sine', 0, 0.18);
      tone(783.99, 0.12, 'sine', 0.09, 0.18);
    },
    wrong() {
      tone(261.63, 0.12, 'square', 0, 0.12);
      tone(220.00, 0.2, 'square', 0.11, 0.1);
    },
    coin() { tone(987.77, 0.08, 'triangle', 0, 0.16); },
    levelUp() {
      [523.25, 659.25, 783.99, 1046.5].forEach(function each(freq, i) {
        tone(freq, 0.12, 'sine', i * 0.08, 0.16);
      });
    },
    monster() { tone(740, 0.09, 'sawtooth', 0, 0.12); tone(370, 0.16, 'sine', 0.08, 0.12); },
    click() { tone(520, 0.035, 'sine', 0, 0.045); }
  };

  return Object.freeze({ init, play });
})();
