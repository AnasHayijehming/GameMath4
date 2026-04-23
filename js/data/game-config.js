window.Game = window.Game || {};

Game.Config = (function () {
  'use strict';

  const config = {
    storage: {
      key: 'math_adventure_save',
      version: '1.0',
      autoSaveDelayMs: 500,
      autoSaveIntervalMs: 30000
    },
    player: {
      defaultName: 'นักผจญภัย',
      defaultGender: 'female',
      nameMinLength: 2,
      nameMaxLength: 18,
      allowedNamePattern: /^[\u0E00-\u0E7Fa-zA-Z0-9 ]+$/,
      startingLevel: 1,
      startingExp: 0,
      startingCoins: 20
    },
    world: {
      startingZone: 'forest',
      defaultFacing: 'down'
    },
    inventory: {
      starterOwned: ['clothes_basic'],
      starterEquipped: {
        hat: null,
        clothes: 'clothes_basic',
        shoes: null,
        accessory: null,
        glasses: null
      }
    },
    economy: {
      hintCost: 10,
      baseCoinReward: 1,
      baseExpReward: 10,
      typingCoinMultiplier: 2
    },
    quiz: {
      durationsByDifficulty: {
        easy: 20,
        medium: 30,
        hard: 45
      },
      timerOptions: [
        { value: 1, label: 'ปกติ' },
        { value: 1.5, label: 'นานขึ้น' },
        { value: 2, label: 'นานมาก' }
      ],
      defaultTimerMultiplier: 1
    },
    settings: {
      typingMode: false,
      soundEnabled: true
    }
  };

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function each(key) {
      deepFreeze(value[key]);
    });
    return Object.freeze(value);
  }

  return deepFreeze(config);
})();
