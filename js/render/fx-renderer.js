window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.FX = (function () {
  'use strict';

  const TOAST_MS = 1700;
  let initialized = false;
  let layer = null;
  let toastLayer = null;

  function init() {
    if (initialized) return;
    initialized = true;
    ensureLayers();

    Game.EventBus.on('quiz:completed', function onQuizCompleted(payload) {
      if (!payload || payload.fled) return;
      if (payload.correct) {
        coinBurst();
        correctAnswerGlow();
        toast('ตอบถูก! ได้รางวัลแล้ว', 'success');
      } else {
        toast('ยังไม่ถูก ลองใหม่อีกครั้ง', 'error');
      }
    });

    Game.EventBus.on('item:purchased', function onPurchase(payload) {
      const item = payload && payload.itemId ? Game.Data.Items.get(payload.itemId) : null;
      toast(item ? `ซื้อ ${item.name} สำเร็จ` : 'ซื้อไอเทมสำเร็จ', 'success');
      coinBurst();
    });

    Game.EventBus.on('item:equipped', function onEquip() {
      toast('เปลี่ยนอุปกรณ์แล้ว', 'info');
      levelUpPulse();
    });

    Game.EventBus.on('player:zone_changed', function onZoneChanged(payload) {
      const zone = payload && payload.toZone ? Game.Data.Zones.get(payload.toZone) : null;
      toast(zone ? `เดินทางถึง ${zone.name}` : 'เปลี่ยนโซนแล้ว', 'info');
      portalTransition();
    });

    Game.EventBus.on('level:up', function onLevelUp(payload) {
      toast(`เลเวลอัป! Lv ${payload.newLevel}`, 'success');
      levelUpPulse();
    });

    Game.EventBus.on('player:blocked', function onBlocked(payload) {
      toast(payload && payload.reason === 'npc' ? 'กด A เพื่อคุย' : 'เดินทางนี้ไม่ได้', 'info');
    });
  }

  function coinBurst(origin) {
    return origin;
  }

  function correctAnswerGlow() {
    return;
  }

  function levelUpPulse() {
    return;
  }

  function portalTransition() {
    return;
  }

  function toast(text, variant) {
    ensureLayers();
    const node = document.createElement('div');
    node.className = `fx-toast fx-toast--${variant || 'info'}`;
    node.setAttribute('role', 'status');
    node.textContent = String(text || '');
    toastLayer.appendChild(node);
    cleanup(node, TOAST_MS);
  }

  function addPulse(className, lifetime) {
    return { className, lifetime };
  }

  function ensureLayers() {
    if (layer && toastLayer) return;
    if (!document.body) return;
    layer = document.querySelector('[data-fx-layer]');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'fx-layer';
      layer.setAttribute('data-fx-layer', '');
      document.body.appendChild(layer);
    }
    toastLayer = document.querySelector('[data-fx-toasts]');
    if (!toastLayer) {
      toastLayer = document.createElement('div');
      toastLayer.className = 'fx-toast-stack';
      toastLayer.setAttribute('data-fx-toasts', '');
      document.body.appendChild(toastLayer);
    }
  }

  function isMotionEnabled() {
    const state = Game.State.get();
    const reducedBySetting = !!(state && state.settings && state.settings.reducedMotion);
    const reducedBySystem = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !(reducedBySetting || reducedBySystem);
  }

  function cleanup(node, delayMs) {
    window.setTimeout(function removeNode() {
      if (node && node.parentNode) node.parentNode.removeChild(node);
    }, delayMs);
  }

  return Object.freeze({ init, coinBurst, correctAnswerGlow, levelUpPulse, portalTransition, toast, isMotionEnabled });
})();
