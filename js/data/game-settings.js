window.Game = window.Game || {};
Game.Data = Game.Data || {};

Game.Data.GameSettings = (function () {
  'use strict';

  function config() {
    return Game.Config;
  }

  function timerOptions() {
    return config().quiz.timerOptions.map(function map(option) {
      return {
        value: Number(option.value),
        label: option.label
      };
    });
  }

  function normalizeBoolean(value, fallback) {
    return typeof value === 'boolean' ? value : fallback;
  }

  function normalizeNonNegativeNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, number) : fallback;
  }

  function defaults() {
    return fieldDefinitions().reduce(function build(result, definition) {
      result[definition.key] = definition.defaultValue();
      return result;
    }, {});
  }

  function normalizeTimerMultiplier(value, fallback) {
    const number = Number(value);
    const allowed = timerOptions().map(function map(option) { return option.value; });
    return allowed.includes(number) ? number : fallback;
  }

  // A single schema drives defaults, normalization, and settings UI metadata.
  function fieldDefinitions() {
    return [
      {
        key: 'typingMode',
        type: 'boolean',
        input: 'checkbox',
        label: 'โหมดพิมพ์ตอบ',
        description() {
          return `เหรียญ x${config().economy.typingCoinMultiplier}`;
        },
        defaultValue() {
          return !!config().settings.typingMode;
        },
        normalize(value, fallback) {
          return normalizeBoolean(value, fallback);
        }
      },
      {
        key: 'soundEnabled',
        type: 'boolean',
        input: 'checkbox',
        label: 'เปิดเสียง',
        description: '',
        defaultValue() {
          return !!config().settings.soundEnabled;
        },
        normalize(value, fallback) {
          return normalizeBoolean(value, fallback);
        }
      },
      {
        key: 'reducedMotion',
        type: 'boolean',
        input: 'checkbox',
        label: 'ลดการเคลื่อนไหว',
        description: '',
        defaultValue() {
          return !!config().settings.reducedMotion;
        },
        normalize(value, fallback) {
          return normalizeBoolean(value, fallback);
        }
      },
      {
        key: 'timerMultiplier',
        type: 'number',
        input: 'select',
        label: 'เวลาเพิ่มเติม',
        description: '',
        options() {
          return timerOptions();
        },
        defaultValue() {
          return Number(config().quiz.defaultTimerMultiplier);
        },
        normalize(value, fallback) {
          return normalizeTimerMultiplier(value, fallback);
        }
      },
      {
        key: 'lastSavedAt',
        type: 'number',
        input: 'hidden',
        label: '',
        description: '',
        ui: false,
        defaultValue() {
          return 0;
        },
        normalize(value, fallback) {
          return normalizeNonNegativeNumber(value, fallback);
        }
      }
    ];
  }

  function resolvedDefinition(definition) {
    const result = {
      key: definition.key,
      type: definition.type,
      input: definition.input,
      label: definition.label,
      description: typeof definition.description === 'function'
        ? definition.description()
        : (definition.description || ''),
      defaultValue: definition.defaultValue(),
      ui: definition.ui !== false
    };
    if (typeof definition.options === 'function') {
      result.options = definition.options().map(function map(option) {
        return {
          value: option.value,
          label: option.label
        };
      });
    }
    return result;
  }

  function definitions() {
    return fieldDefinitions().map(resolvedDefinition);
  }

  function uiFields() {
    return definitions().filter(function filter(definition) {
      return definition.ui;
    });
  }

  function normalizeFallback(fallback) {
    const source = fallback && typeof fallback === 'object' ? fallback : {};
    return fieldDefinitions().reduce(function build(result, definition) {
      const defaultValue = definition.defaultValue();
      result[definition.key] = definition.normalize(source[definition.key], defaultValue);
      return result;
    }, {});
  }

  function normalize(value, fallback) {
    const source = value && typeof value === 'object' ? value : {};
    const fallbackSettings = normalizeFallback(fallback);
    return fieldDefinitions().reduce(function build(result, definition) {
      result[definition.key] = definition.normalize(source[definition.key], fallbackSettings[definition.key]);
      return result;
    }, {});
  }

  function readForm(form, previousSettings) {
    const fallbackSettings = normalizeFallback(previousSettings);
    const source = {};
    uiFields().forEach(function each(field) {
      const element = form && form.elements ? form.elements[field.key] : null;
      if (!element) return;
      if (field.input === 'checkbox') {
        source[field.key] = !!element.checked;
        return;
      }
      source[field.key] = element.value;
    });
    return normalize(source, fallbackSettings);
  }

  return Object.freeze({
    defaults,
    definitions,
    uiFields,
    readForm,
    normalizeTimerMultiplier,
    normalize
  });
})();
