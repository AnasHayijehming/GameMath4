window.Game = window.Game || {};
Game.Systems = Game.Systems || {};

Game.Systems.Progression = (function () {
  'use strict';

  function init() {}

  function expNeeded(level) {
    return level * 50;
  }

  function grantExp(amount) {
    if (amount <= 0) return { levelsGained: 0 };
    let levelsGained = 0;
    Game.State.update(function update(s) {
      let level = s.player.level;
      let exp = s.player.exp + amount;
      const unlocked = s.world.unlockedZones.slice();
      while (exp >= expNeeded(level)) {
        exp -= expNeeded(level);
        level += 1;
        levelsGained += 1;
      }
      if (level >= 5 && !unlocked.includes('city')) unlocked.push('city');
      if (level >= 10 && !unlocked.includes('castle')) unlocked.push('castle');
      return Object.assign({}, s, {
        player: Object.assign({}, s.player, { level, exp }),
        world: Object.assign({}, s.world, { unlockedZones: unlocked })
      });
    });
    Game.EventBus.emit('exp:gained', { delta: amount, total: Game.State.get().player.exp });
    if (levelsGained > 0) {
      const state = Game.State.get();
      Game.EventBus.emit('level:up', { newLevel: state.player.level });
      if (state.world.unlockedZones.includes('city')) Game.EventBus.emit('zone:unlocked', { zoneId: 'city' });
      if (state.world.unlockedZones.includes('castle')) Game.EventBus.emit('zone:unlocked', { zoneId: 'castle' });
    }
    return { levelsGained };
  }

  return Object.freeze({ init, grantExp, expNeeded });
})();
