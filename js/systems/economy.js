window.Game = window.Game || {};
Game.Systems = Game.Systems || {};

Game.Systems.Economy = (function () {
  'use strict';

  function init() {}

  function grant(amount) {
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return;
    const value = Number(amount);
    Game.State.update(function update(s) {
      return Object.assign({}, s, {
        player: Object.assign({}, s.player, { coins: s.player.coins + value }),
        stats: Object.assign({}, s.stats, { totalCoinsEarned: s.stats.totalCoinsEarned + value })
      });
    });
    Game.EventBus.emit('coins:changed', { delta: value, total: Game.State.get().player.coins });
  }

  function spend(amount) {
    if (!Number.isFinite(Number(amount)) || Number(amount) < 0) return false;
    const value = Number(amount);
    const state = Game.State.get();
    if (value === 0) return true;
    if (state.player.coins < value) return false;
    Game.State.update(function update(s) {
      return Object.assign({}, s, {
        player: Object.assign({}, s.player, { coins: s.player.coins - value }),
        stats: Object.assign({}, s.stats, { totalCoinsSpent: s.stats.totalCoinsSpent + value })
      });
    });
    Game.EventBus.emit('coins:changed', { delta: -value, total: Game.State.get().player.coins });
    return true;
  }

  function purchase(itemId) {
    const item = Game.Data.Items.get(itemId);
    const state = Game.State.get();
    if (!item) return { ok: false, message: 'ไม่พบไอเทม' };
    if (state.inventory.owned.includes(itemId)) return { ok: false, message: 'มีไอเทมนี้แล้ว' };
    if (state.player.level < item.requiredLevel) return { ok: false, message: `ต้องถึงเลเวล ${item.requiredLevel}` };
    if (!spend(item.price)) return { ok: false, message: 'เหรียญไม่พอ' };
    Game.State.update(function update(s) {
      return Object.assign({}, s, {
        inventory: Object.assign({}, s.inventory, { owned: s.inventory.owned.concat(itemId) })
      });
    });
    Game.EventBus.emit('item:purchased', { itemId, price: item.price });
    return { ok: true, message: `ซื้อ ${item.name} แล้ว` };
  }

  return Object.freeze({ init, grant, spend, purchase });
})();
