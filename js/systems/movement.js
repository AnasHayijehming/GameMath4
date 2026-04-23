window.Game = window.Game || {};
Game.Systems = Game.Systems || {};

Game.Systems.Movement = (function () {
  'use strict';

  const delta = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };

  function tryMove(direction) {
    const d = delta[direction];
    if (!d) return false;
    const state = Game.State.get();
    const zoneId = state.world.currentZone;
    const next = { x: state.world.position.x + d.x, y: state.world.position.y + d.y };
    if (!Game.Data.Zones.isWalkable(zoneId, next.x, next.y)) {
      face(direction);
      return false;
    }
    if (Game.Data.Zones.npcAt(zoneId, next.x, next.y)) {
      face(direction);
      return false;
    }
    Game.State.update(function update(s) {
      return Object.assign({}, s, {
        world: Object.assign({}, s.world, { position: next, facing: direction })
      });
    });
    Game.EventBus.emit('player:moved', next);
    return true;
  }

  function face(direction) {
    Game.State.update(function update(s) {
      return Object.assign({}, s, {
        world: Object.assign({}, s.world, { facing: direction })
      });
    });
  }

  function changeZone(targetZone) {
    const zone = Game.Data.Zones.get(targetZone);
    if (!zone) return false;
    const state = Game.State.get();
    if (!state.world.unlockedZones.includes(targetZone)) return false;
    const fromZone = state.world.currentZone;
    Game.State.update(function update(s) {
      return Object.assign({}, s, {
        world: Object.assign({}, s.world, {
          currentZone: targetZone,
          position: Object.assign({}, zone.spawnPoint),
          facing: 'down'
        })
      });
    });
    Game.EventBus.emit('player:zone_changed', { fromZone, toZone: targetZone });
    return true;
  }

  return Object.freeze({ tryMove, changeZone });
})();
