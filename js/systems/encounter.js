window.Game = window.Game || {};
Game.Systems = Game.Systems || {};

Game.Systems.Encounter = (function () {
  'use strict';

  const COOLDOWN_MOVES = 2;

  let initialized = false;
  let cooldownMoves = 0;

  function init() {
    if (initialized) return true;
    initialized = true;
    Game.EventBus.on('player:moved', onPlayerMoved);
    Game.EventBus.on('quiz:completed', function onQuizCompleted() {
      cooldownMoves = COOLDOWN_MOVES;
    });
    Game.EventBus.on('player:zone_changed', function onZoneChanged() {
      cooldownMoves = 1;
    });
    return true;
  }

  function onPlayerMoved() {
    const state = Game.State.get();
    if (!canRollEncounter(state)) return;

    if (cooldownMoves > 0) {
      cooldownMoves -= 1;
      return;
    }

    const zone = Game.Data.Zones.get(state.world.currentZone);
    const probability = Number(zone.quiz && zone.quiz.encounterProbability);
    if (!Number.isFinite(probability) || probability <= 0) return;
    if (!Game.Infra.RNG.chance(Math.min(1, probability))) return;

    cooldownMoves = COOLDOWN_MOVES;
    Game.EventBus.emit('encounter:monster', { zoneId: zone.id });
    if (Game.SceneManager && Game.SceneManager.goTo) {
      Game.SceneManager.goTo('quiz', { source: 'monster', zoneId: zone.id });
    }
  }

  function canRollEncounter(state) {
    if (!state || !state.world || !state.ui) return false;
    const sceneId = Game.SceneManager && Game.SceneManager.currentId
      ? Game.SceneManager.currentId()
      : state.ui.currentScene;
    if (sceneId !== 'overworld' || state.ui.currentScene !== 'overworld') return false;
    const zone = Game.Data.Zones.get(state.world.currentZone);
    if (!zone || !zone.quiz) return false;
    return !isInteractionPosition(zone, state.world.position);
  }

  function isInteractionPosition(zone, pos) {
    if (!pos) return true;
    if (zone.shop && zone.shop.x === pos.x && zone.shop.y === pos.y) return true;
    if (Game.Data.Zones.portalAt(zone.id, pos.x, pos.y)) return true;
    return hasAdjacentNpc(zone.id, pos) || hasAdjacentQuestionBox(zone.id, pos);
  }

  function hasAdjacentNpc(zoneId, pos) {
    return adjacentPositions(pos).some(function some(next) {
      return !!Game.Data.Zones.npcAt(zoneId, next.x, next.y);
    });
  }

  function hasAdjacentQuestionBox(zoneId, pos) {
    return !!(Game.Systems.QuestionBoxes
      && Game.Systems.QuestionBoxes.nearbyBox
      && Game.Systems.QuestionBoxes.nearbyBox(zoneId, pos));
  }

  function adjacentPositions(pos) {
    return [
      { x: pos.x, y: pos.y - 1 },
      { x: pos.x, y: pos.y + 1 },
      { x: pos.x - 1, y: pos.y },
      { x: pos.x + 1, y: pos.y }
    ];
  }

  function reset() {
    cooldownMoves = 0;
  }

  return Object.freeze({ init, reset });
})();
