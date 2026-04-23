window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.Inventory = (function () {
  'use strict';

  const slots = [
    ['hat', 'หมวก'],
    ['clothes', 'เสื้อผ้า'],
    ['shoes', 'รองเท้า'],
    ['accessory', 'อุปกรณ์'],
    ['glasses', 'แว่นตา']
  ];

  function render(message) {
    const state = Game.State.get();
    return `<div class="screen">
      <section class="modal">
        <h2>ตัวละครและไอเทม</h2>
        <div class="item-preview"><svg viewBox="-8 -12 64 86" width="96" height="129">${Game.Render.Character.render(state.player, state.inventory, 1)}</svg></div>
        <div class="toast">${Game.Infra.Util.escapeHtml(message || '')}</div>
        ${slots.map(renderSlot).join('')}
        <div class="button-row"><button data-action="cancel">กลับ</button></div>
      </section>
    </div>`;
  }

  function renderSlot(pair) {
    const state = Game.State.get();
    const slot = pair[0];
    const label = pair[1];
    const owned = state.inventory.owned.map(Game.Data.Items.get).filter(function filter(item) {
      return item && item.slot === slot;
    });
    return `<h3>${label}</h3><div class="grid-list">
      <article class="item-card">
        <strong>ไม่ใส่</strong>
        <button data-equip-slot="${slot}" data-equip="">ถอด</button>
      </article>
      ${owned.map(function map(item) {
        const active = state.inventory.equipped[slot] === item.id;
        return `<article class="item-card">
          <div class="item-preview">${Game.Render.Character.preview(item.id)}</div>
          <strong>${Game.Infra.Util.escapeHtml(item.name)}</strong>
          <button class="primary" data-equip-slot="${slot}" data-equip="${item.id}" ${active ? 'disabled' : ''}>${active ? 'ใส่อยู่' : 'ใส่'}</button>
        </article>`;
      }).join('')}</div>`;
  }

  return Object.freeze({ render });
})();
