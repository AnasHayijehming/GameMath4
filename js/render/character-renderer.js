window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.Character = (function () {
  'use strict';

  function render(player, inventory, scale) {
    const equipped = inventory.equipped || {};
    const clothes = Game.Data.Items.get(equipped.clothes || 'clothes_basic') || { color: '#3da5ff' };
    const hat = Game.Data.Items.get(equipped.hat);
    const shoes = Game.Data.Items.get(equipped.shoes);
    const accessory = Game.Data.Items.get(equipped.accessory);
    const glasses = Game.Data.Items.get(equipped.glasses);
    const skin = player.gender === 'female' ? '#ffd8a8' : '#f1c27d';
    const hair = player.gender === 'female' ? '#5f3dc4' : '#3b2f2f';
    const s = scale || 1;

    return `<g class="player-sprite" transform="scale(${s})">
      <circle cx="24" cy="16" r="10" fill="${skin}" stroke="#18212b" stroke-width="2"/>
      ${player.gender === 'female'
        ? `<path d="M14 15 Q24 1 34 15 L34 29 Q24 22 14 29 Z" fill="${hair}" stroke="#18212b" stroke-width="2"/>`
        : `<path d="M15 10 Q24 2 33 10 L32 16 Q24 12 16 16 Z" fill="${hair}" stroke="#18212b" stroke-width="2"/>`}
      <circle cx="20" cy="16" r="1.8" fill="#18212b"/><circle cx="28" cy="16" r="1.8" fill="#18212b"/>
      <path d="M20 22 Q24 25 28 22" fill="none" stroke="#18212b" stroke-width="2" stroke-linecap="round"/>
      <rect x="14" y="28" width="20" height="24" rx="5" fill="${clothes.color}" stroke="#18212b" stroke-width="2"/>
      <path d="M14 32 L5 44 M34 32 L43 44" stroke="#18212b" stroke-width="4" stroke-linecap="round"/>
      <path d="M18 52 L15 66 M30 52 L33 66" stroke="#18212b" stroke-width="4" stroke-linecap="round"/>
      ${renderHat(hat)}
      ${renderShoes(shoes)}
      ${renderAccessory(accessory)}
      ${renderGlasses(glasses)}
    </g>`;
  }

  function renderHat(item) {
    if (!item) return '';
    if (item.id === 'hat_witch') return `<path d="M12 9 L24 -18 L36 9 Z" fill="${item.color}" stroke="#18212b" stroke-width="2"/><rect x="11" y="7" width="26" height="5" fill="#18212b"/>`;
    if (item.id === 'hat_crown' || item.id === 'hat_flame') return `<path d="M12 8 L17 -5 L24 7 L31 -5 L36 8 Z" fill="${item.color}" stroke="#18212b" stroke-width="2"/>`;
    if (item.id === 'hat_straw') return `<ellipse cx="24" cy="9" rx="18" ry="5" fill="${item.color}" stroke="#18212b" stroke-width="2"/><rect x="15" y="0" width="18" height="9" rx="4" fill="${item.color}" stroke="#18212b" stroke-width="2"/>`;
    return `<path d="M13 8 Q24 -5 35 8 Z" fill="${item.color}" stroke="#18212b" stroke-width="2"/>`;
  }

  function renderShoes(item) {
    if (!item) return '';
    return `<ellipse cx="14" cy="67" rx="7" ry="4" fill="${item.color}" stroke="#18212b" stroke-width="2"/>
      <ellipse cx="34" cy="67" rx="7" ry="4" fill="${item.color}" stroke="#18212b" stroke-width="2"/>`;
  }

  function renderAccessory(item) {
    if (!item) return '';
    if (item.id.includes('sword')) return `<path d="M45 42 L58 24" stroke="${item.color}" stroke-width="4" stroke-linecap="round"/><path d="M48 38 L53 43" stroke="#18212b" stroke-width="3"/>`;
    if (item.id.includes('flower')) return `<circle cx="48" cy="41" r="4" fill="${item.color}" stroke="#18212b" stroke-width="1"/><path d="M44 45 L40 54" stroke="#2f9e44" stroke-width="2"/>`;
    if (item.id.includes('shield')) return `<path d="M45 35 L56 39 L54 54 L45 61 L36 54 L34 39 Z" fill="${item.color}" stroke="#18212b" stroke-width="2"/>`;
    return `<path d="M45 45 L58 20" stroke="${item.color}" stroke-width="4" stroke-linecap="round"/><circle cx="59" cy="18" r="4" fill="#ffec99" stroke="#18212b" stroke-width="2"/>`;
  }

  function renderGlasses(item) {
    if (!item) return '';
    if (item.id === 'glasses_mask') return `<rect x="15" y="12" width="18" height="8" rx="4" fill="${item.color}" stroke="#18212b" stroke-width="2"/>`;
    return `<circle cx="20" cy="16" r="5" fill="none" stroke="${item.color}" stroke-width="2"/><circle cx="28" cy="16" r="5" fill="none" stroke="${item.color}" stroke-width="2"/><path d="M25 16 L23 16" stroke="${item.color}" stroke-width="2"/>`;
  }

  function preview(itemId) {
    const state = Game.State.get();
    const inventory = Game.Infra.Util.clone(state.inventory);
    const item = Game.Data.Items.get(itemId);
    if (item) inventory.equipped[item.slot] = item.id;
    return `<svg viewBox="-8 -12 64 86" width="64" height="86" aria-hidden="true">${render(state.player, inventory, 1)}</svg>`;
  }

  return Object.freeze({ render, preview });
})();
