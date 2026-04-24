window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.Shop = (function () {
  'use strict';

  function render(message) {
    const state = Game.State.get();
    const groups = Game.Data.Items.slots().map(function map(slot) {
      return {
        slot,
        items: Game.Data.Items.bySlot(slot.id).filter(function filter(item) {
          return item.price > 0;
        }).sort(sortForShop)
      };
    }).filter(function filter(group) { return group.items.length > 0; });

    return `<div class="screen screen--scroll screen--city">
      <section class="modal modal--scroll">
        <h2>ร้านค้าแต่งตัว</h2>
        <p>เหรียญของคุณ: ${state.player.coins} | เลเวล ${state.player.level}</p>
        <div class="toast">${Game.Infra.Util.escapeHtml(message || '')}</div>
        <div class="shop-summary">${renderSummary(state)}</div>
        ${groups.map(function map(group) {
          return `<section class="item-section">
            <h3>${Game.Infra.Util.escapeHtml(group.slot.label)}</h3>
            <div class="grid-list">${group.items.map(function mapItem(item) {
              return renderItemCard(item, state);
            }).join('')}</div>
          </section>`;
        }).join('')}
        <div class="button-row"><button data-action="cancel">กลับ</button></div>
      </section>
    </div>`;
  }

  function sortForShop(a, b) {
    return a.requiredLevel - b.requiredLevel || a.price - b.price || a.name.localeCompare(b.name, 'th');
  }

  function renderSummary(state) {
    const all = Game.Data.Items.all().filter(function filter(item) { return item.price > 0; });
    const owned = all.filter(function filter(item) { return state.inventory.owned.includes(item.id); }).length;
    const unlocked = all.filter(function filter(item) { return state.player.level >= item.requiredLevel; }).length;
    return `<span>มีแล้ว ${owned}/${all.length}</span><span>ปลดล็อกแล้ว ${unlocked}/${all.length}</span>`;
  }

  function renderItemCard(item, state) {
    const owned = state.inventory.owned.includes(item.id);
    const locked = state.player.level < item.requiredLevel;
    const affordable = state.player.coins >= item.price;
    const disabled = owned || locked || !affordable;
    const buttonLabel = owned ? 'มีแล้ว' : locked ? `ต้อง Lv ${item.requiredLevel}` : affordable ? 'ซื้อ' : 'เหรียญไม่พอ';
    const statusClass = owned ? 'owned' : locked ? 'locked' : affordable ? 'ready' : 'short';
    return `<article class="item-card item-card--${statusClass}">
      <div class="item-preview">${Game.Render.Character.preview(item.id)}</div>
      <div class="item-card__title">
        <strong>${Game.Infra.Util.escapeHtml(item.name)}</strong>
        <span class="item-badge item-badge--${item.rarity.className}">${Game.Infra.Util.escapeHtml(item.rarity.label)}</span>
      </div>
      <p>${Game.Infra.Util.escapeHtml(item.description)}</p>
      <span>${item.price} เหรียญ | Lv ${item.requiredLevel}</span>
      <button class="primary" data-buy="${item.id}" ${disabled ? 'disabled' : ''}>${buttonLabel}</button>
    </article>`;
  }

  return Object.freeze({ render });
})();
