window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.Shop = (function () {
  'use strict';

  function render(message) {
    const state = Game.State.get();
    const items = Game.Data.Items.all().filter(function filter(item) {
      return item.price > 0;
    });
    return `<div class="screen screen--city">
      <section class="modal">
        <h2>ร้านค้าแต่งตัว</h2>
        <p>เหรียญของคุณ: ${state.player.coins}</p>
        <div class="toast">${Game.Infra.Util.escapeHtml(message || '')}</div>
        <div class="grid-list">${items.map(function map(item) {
          const owned = state.inventory.owned.includes(item.id);
          const locked = state.player.level < item.requiredLevel;
          return `<article class="item-card">
            <div class="item-preview">${Game.Render.Character.preview(item.id)}</div>
            <strong>${Game.Infra.Util.escapeHtml(item.name)}</strong>
            <span>${item.price} เหรียญ | Lv ${item.requiredLevel}</span>
            <button class="primary" data-buy="${item.id}" ${owned || locked ? 'disabled' : ''}>${owned ? 'มีแล้ว' : locked ? 'ยังล็อก' : 'ซื้อ'}</button>
          </article>`;
        }).join('')}</div>
        <div class="button-row"><button data-action="cancel">กลับ</button></div>
      </section>
    </div>`;
  }

  return Object.freeze({ render });
})();
