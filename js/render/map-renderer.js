window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.Map = (function () {
  'use strict';

  const TILE = 48;

  function render(state) {
    const zone = Game.Data.Zones.get(state.world.currentZone);
    const width = zone.tiles[0].length * TILE;
    const height = zone.tiles.length * TILE;
    const tileSvg = [];
    for (let y = 0; y < zone.tiles.length; y += 1) {
      for (let x = 0; x < zone.tiles[y].length; x += 1) {
        tileSvg.push(renderTile(zone, zone.tiles[y][x], x, y));
      }
    }
    const npcSvg = zone.npcs.map(renderNpc).join('');
    const px = state.world.position.x * TILE + 12;
    const py = state.world.position.y * TILE - 13;
    return `<div class="map-frame">
      <svg class="map-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="แผนที่ ${zone.name}">
        ${tileSvg.join('')}
        ${npcSvg}
        <g transform="translate(${px} ${py})">${Game.Render.Character.render(state.player, state.inventory, 0.9)}</g>
      </svg>
    </div>`;
  }

  function renderTile(zone, tile, x, y) {
    const xx = x * TILE;
    const yy = y * TILE;
    const palette = {
      forest: { floor: '#94d82d', grass: '#2f9e44', obstacle: '#196f3d', portal: '#74c0fc', shop: '#ffd43b' },
      city: { floor: '#ffe066', grass: '#8ce99a', obstacle: '#adb5bd', portal: '#74c0fc', shop: '#ff922b' },
      castle: { floor: '#d0bfff', grass: '#f783ac', obstacle: '#6741d9', portal: '#74c0fc', shop: '#ffd43b' }
    }[zone.theme];
    if (tile === '#') return `<rect x="${xx}" y="${yy}" width="${TILE}" height="${TILE}" fill="${palette.obstacle}" stroke="#18212b" stroke-width="2"/>`;
    let fill = palette.floor;
    if (tile === 'g') fill = palette.grass;
    if (tile === 'p') fill = palette.portal;
    if (tile === 's') fill = palette.shop;
    return `<rect x="${xx}" y="${yy}" width="${TILE}" height="${TILE}" fill="${fill}" stroke="rgba(24,33,43,.18)" stroke-width="1"/>
      ${tile === 'g' ? `<path d="M${xx + 7} ${yy + 38} L${xx + 13} ${yy + 23} L${xx + 19} ${yy + 38} M${xx + 29} ${yy + 39} L${xx + 35} ${yy + 20} L${xx + 41} ${yy + 39}" stroke="#0b6623" stroke-width="3" stroke-linecap="round"/>` : ''}
      ${tile === 'p' ? `<circle cx="${xx + 24}" cy="${yy + 24}" r="16" fill="none" stroke="#1864ab" stroke-width="5"/><circle cx="${xx + 24}" cy="${yy + 24}" r="6" fill="#1864ab"/>` : ''}
      ${tile === 's' ? `<rect x="${xx + 9}" y="${yy + 12}" width="30" height="25" fill="#fff" stroke="#18212b" stroke-width="3"/><path d="M${xx + 8} ${yy + 12} L${xx + 24} ${yy + 2} L${xx + 40} ${yy + 12}" fill="#ff6b6b" stroke="#18212b" stroke-width="3"/>` : ''}`;
  }

  function renderNpc(npc) {
    const x = npc.x * TILE + 10;
    const y = npc.y * TILE + 7;
    const color = npc.type === 'boss' ? '#e03131' : npc.type === 'oneTime' ? '#ffd43b' : '#15aabf';
    return `<g transform="translate(${x} ${y})">
      <circle cx="14" cy="10" r="8" fill="#ffd8a8" stroke="#18212b" stroke-width="2"/>
      <rect x="6" y="19" width="16" height="18" rx="4" fill="${color}" stroke="#18212b" stroke-width="2"/>
      <circle cx="11" cy="9" r="1.4" fill="#18212b"/><circle cx="17" cy="9" r="1.4" fill="#18212b"/>
      ${npc.type === 'boss' ? '<path d="M4 -1 L10 -10 L14 -1 L19 -10 L25 -1 Z" fill="#ffd43b" stroke="#18212b" stroke-width="2"/>' : ''}
    </g>`;
  }

  return Object.freeze({ render });
})();
