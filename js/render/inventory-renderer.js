window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.Inventory = (function () {
  'use strict';

  function render(message) {
    const state = Game.State.get();
    return `<div class="screen screen--scroll">
      <section class="modal modal--scroll">
        <h2>ตัวละครและไอเทม</h2>
        <div class="character-loadout">
          <div class="item-preview item-preview--hero"><svg viewBox="-8 -12 64 86" width="96" height="129">${Game.Render.Character.render(state.player, state.inventory, 1)}</svg></div>
          <div>
            <strong>${Game.Infra.Util.escapeHtml(state.player.name)}</strong>
            <p>${renderEquippedSummary(state)}</p>
          </div>
        </div>
        <div class="toast">${Game.Infra.Util.escapeHtml(message || '')}</div>
        ${Game.Data.Items.slots().map(renderSlot).join('')}
        <div class="button-row"><button data-action="cancel">กลับ</button></div>
      </section>
    </div>`;
  }

  function renderEquippedSummary(state) {
    return Game.Data.Items.slots().map(function map(slot) {
      const itemId = state.inventory.equipped[slot.id];
      const item = itemId ? Game.Data.Items.get(itemId) : null;
      return `${slot.label}: ${item ? Game.Infra.Util.escapeHtml(item.name) : 'ไม่ใส่'}`;
    }).join(' | ');
  }

  function renderSlot(slotInfo) {
    const state = Game.State.get();
    const slot = slotInfo.id;
    const label = slotInfo.label;
    const owned = state.inventory.owned.map(Game.Data.Items.get).filter(function filter(item) {
      return item && item.slot === slot;
    }).sort(function sort(a, b) {
      return a.requiredLevel - b.requiredLevel || a.price - b.price || a.name.localeCompare(b.name, 'th');
    });
    const canRemove = slot !== 'clothes' && !!state.inventory.equipped[slot];
    return `<h3>${label}</h3><div class="grid-list">
      <article class="item-card">
        <strong>ไม่ใส่</strong>
        <p>${slot === 'clothes' ? 'ต้องใส่เสื้ออย่างน้อย 1 ตัว' : 'ถอดไอเทมในช่องนี้'}</p>
        <button data-equip-slot="${slot}" data-equip="" ${canRemove ? '' : 'disabled'}>ถอด</button>
      </article>
      ${owned.length === 0 ? '<article class="item-card"><strong>ยังไม่มีไอเทมช่องนี้</strong><p>ซื้อเพิ่มได้ที่ร้านค้าในเมือง</p></article>' : ''}
      ${owned.map(function map(item) {
        const active = state.inventory.equipped[slot] === item.id;
        return `<article class="item-card">
          <div class="item-preview">${Game.Render.Character.preview(item.id)}</div>
          <div class="item-card__title">
            <strong>${Game.Infra.Util.escapeHtml(item.name)}</strong>
            <span class="item-badge item-badge--${item.rarity.className}">${Game.Infra.Util.escapeHtml(item.rarity.label)}</span>
          </div>
          <p>${Game.Infra.Util.escapeHtml(item.description)}</p>
          <button class="primary" data-equip-slot="${slot}" data-equip="${item.id}" ${active ? 'disabled' : ''}>${active ? 'ใส่อยู่' : 'ใส่'}</button>
        </article>`;
      }).join('')}</div>`;
  }

  return Object.freeze({ render });
})();
