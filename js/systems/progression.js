window.Game = window.Game || {};
Game.Systems = Game.Systems || {};

Game.Systems.Progression = (function () {
  'use strict';

  function init() {}

  function expNeeded(level) {
    return level * 50;
  }

  function unlockableZones() {
    return Game.Data.Zones.all().filter(function filter(zone) {
      return zone.id !== Game.Config.world.startingZone;
    });
  }

  function grantExp(amount) {
    if (amount <= 0) return { levelsGained: 0 };
    let levelsGained = 0;
    let newlyUnlocked = [];
    Game.State.update(function update(s) {
      let level = s.player.level;
      let exp = s.player.exp + amount;
      const unlocked = s.world.unlockedZones.slice();
      while (exp >= expNeeded(level)) {
        exp -= expNeeded(level);
        level += 1;
        levelsGained += 1;
      }
      newlyUnlocked = unlockableZones().filter(function filter(zone) {
        return level >= zone.requiredLevel && !unlocked.includes(zone.id);
      }).map(function map(zone) {
        unlocked.push(zone.id);
        return zone.id;
      });
      return Object.assign({}, s, {
        player: Object.assign({}, s.player, { level, exp }),
        world: Object.assign({}, s.world, { unlockedZones: unlocked })
      });
    });
    Game.EventBus.emit('exp:gained', { delta: amount, total: Game.State.get().player.exp });
    if (levelsGained > 0) {
      const state = Game.State.get();
      Game.EventBus.emit('level:up', { newLevel: state.player.level });
      newlyUnlocked.forEach(function each(zoneId) {
        if (state.world.unlockedZones.includes(zoneId)) {
          Game.EventBus.emit('zone:unlocked', { zoneId });
        }
      });
    }
    return { levelsGained };
  }

  return Object.freeze({ init, grantExp, expNeeded });
})();
