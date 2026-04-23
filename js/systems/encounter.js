window.Game = window.Game || {};
Game.Systems = Game.Systems || {};

Game.Systems.Encounter = (function () {
  'use strict';

  let cooldown = false;

  function init() {
    Game.EventBus.on('player:moved', function onMoved() {
      if (cooldown) return;
      if (!Game.SceneManager || Game.SceneManager.currentId() !== 'overworld') return;
      const state = Game.State.get();
      const tile = Game.Data.Zones.tileAt(state.world.currentZone, state.world.position.x, state.world.position.y);
      const zone = Game.Data.Zones.get(state.world.currentZone);
      if (tile !== 'g') return;
      if (!Game.Infra.RNG.chance(zone.quiz.encounterProbability)) return;
      cooldown = true;
      setTimeout(function release() { cooldown = false; }, 900);
      Game.EventBus.emit('encounter:monster', { zone: state.world.currentZone, monsterType: zone.theme });
      Game.EventBus.emit('scene:change', { to: 'quiz', params: { source: 'monster', zoneId: state.world.currentZone } });
    });
  }

  return Object.freeze({ init });
})();
