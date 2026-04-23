window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.Map = (function () {
  'use strict';

  const TILE = 48;

  function encodeSvg(svg) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\n\s*/g, ' ').trim())}`;
  }

  const TILE_ASSETS = Object.freeze({
    forest_grass: encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#4caf50"/><path d="M6 44 L11 28 L16 44 M20 44 L25 27 L30 44 M34 44 L39 26 L44 44" stroke="#1f7a2f" stroke-width="2"/><path d="M0 8 L48 8 M0 24 L48 24 M0 40 L48 40" stroke="#ffffff22"/></svg>`),
    city_grass: encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#8fd694"/><circle cx="10" cy="10" r="2" fill="#5f9f67"/><circle cx="31" cy="14" r="2" fill="#5f9f67"/><circle cx="18" cy="32" r="2" fill="#5f9f67"/><circle cx="38" cy="36" r="2" fill="#5f9f67"/></svg>`),
    castle_grass: encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#d9a5cf"/><path d="M0 12 H48 M0 24 H48 M0 36 H48" stroke="#ffffff2b"/><circle cx="12" cy="14" r="2" fill="#bc6db9"/><circle cx="34" cy="34" r="2" fill="#bc6db9"/></svg>`),
    forest_path: encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#a9dc67"/><path d="M0 30 C12 24 36 40 48 31" stroke="#89c457" stroke-width="7"/></svg>`),
    city_path: encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#ffe38d"/><path d="M0 32 H48 M0 16 H48" stroke="#f0c65b" stroke-width="6"/><path d="M8 0 V48 M24 0 V48 M40 0 V48" stroke="#ffffff33"/></svg>`),
    castle_path: encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#d4bef6"/><path d="M0 0 L48 48 M48 0 L0 48" stroke="#b69be0"/><path d="M0 24 H48 M24 0 V48" stroke="#c3ade8"/></svg>`),
    portal: encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#9fd5ff"/><circle cx="24" cy="24" r="16" fill="none" stroke="#1864ab" stroke-width="4"/><circle cx="24" cy="24" r="8" fill="#1c7ed6"/><circle cx="24" cy="24" r="3" fill="#74c0fc"/></svg>`),
    shop: encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#ffe066"/><rect x="9" y="14" width="30" height="23" fill="#fff" stroke="#18212b" stroke-width="2"/><path d="M8 14 L24 3 L40 14" fill="#ff6b6b" stroke="#18212b" stroke-width="2"/></svg>`),
    forest_obstacle: encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#2b8a3e"/><path d="M24 8 L39 36 H9 Z" fill="#1f6f33"/><rect x="21" y="30" width="6" height="12" fill="#6f4e37"/></svg>`),
    city_obstacle: encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#adb5bd"/><rect x="10" y="9" width="28" height="30" rx="3" fill="#868e96"/><path d="M14 15 H34 M14 23 H34 M14 31 H34" stroke="#ced4da"/></svg>`),
    castle_obstacle: encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#7950f2"/><path d="M11 36 L18 10 H30 L37 36 Z" fill="#5f3dc4"/><path d="M20 20 H28" stroke="#d0bfff"/></svg>`)
  });

  function assetExists(key) {
    return !!TILE_ASSETS[key];
  }

  function tileAssetKey(theme, tile) {
    if (tile === '#') return `${theme}_obstacle`;
    if (tile === 'g') return `${theme}_grass`;
    if (tile === 'p') return 'portal';
    if (tile === 's') return 'shop';
    return `${theme}_path`;
  }

  function render(state) {
    const zone = Game.Data.Zones.get(state.world.currentZone);
    const width = zone.tiles[0].length * TILE;
    const height = zone.tiles.length * TILE;
    const shadows = [];
    const baseTiles = [];
    const foregroundProps = [];

    for (let y = 0; y < zone.tiles.length; y += 1) {
      for (let x = 0; x < zone.tiles[y].length; x += 1) {
        const rendered = renderTile(zone, zone.tiles[y][x], x, y);
        shadows.push(rendered.shadow);
        baseTiles.push(rendered.base);
        if (rendered.fg) foregroundProps.push(rendered.fg);
      }
    }

    const npcSvg = zone.npcs.map(renderNpc).join('');
    const px = state.world.position.x * TILE + 12;
    const py = state.world.position.y * TILE - 13;
    const centerX = width / 2;
    const centerY = height / 2;
    const playerX = state.world.position.x * TILE + TILE / 2;
    const playerY = state.world.position.y * TILE + TILE / 2;
    const bgParallaxX = ((centerX - playerX) / width) * 8;
    const bgParallaxY = ((centerY - playerY) / height) * 6;
    const fgParallaxX = ((playerX - centerX) / width) * 12;
    const fgParallaxY = ((playerY - centerY) / height) * 8;

    return `<div class="map-frame">
      <svg class="map-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="แผนที่ ${zone.name}">
        <defs>
          <linearGradient id="tileShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#000" stop-opacity="0"/>
            <stop offset="100%" stop-color="#000" stop-opacity="0.16"/>
          </linearGradient>
        </defs>
        <g transform="translate(${bgParallaxX.toFixed(2)} ${bgParallaxY.toFixed(2)})">
          ${baseTiles.join('')}
          ${shadows.join('')}
        </g>
        ${npcSvg}
        <g transform="translate(${px} ${py})">${Game.Render.Character.render(state.player, state.inventory, 0.9)}</g>
        <g transform="translate(${fgParallaxX.toFixed(2)} ${fgParallaxY.toFixed(2)})">
          ${foregroundProps.join('')}
        </g>
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

    const assetKey = tileAssetKey(zone.theme, tile);
    let fill = palette.floor;
    if (tile === 'g') fill = palette.grass;
    if (tile === 'p') fill = palette.portal;
    if (tile === 's') fill = palette.shop;
    if (tile === '#') fill = palette.obstacle;

    const base = assetExists(assetKey)
      ? `<image href="${TILE_ASSETS[assetKey]}" x="${xx}" y="${yy}" width="${TILE}" height="${TILE}" preserveAspectRatio="none"/>
        <rect x="${xx}" y="${yy}" width="${TILE}" height="${TILE}" fill="none" stroke="rgba(24,33,43,.2)" stroke-width="1"/>`
      : `<rect x="${xx}" y="${yy}" width="${TILE}" height="${TILE}" fill="${fill}" stroke="rgba(24,33,43,.18)" stroke-width="1"/>`;

    const shadow = `<rect x="${xx}" y="${yy + TILE - 11}" width="${TILE}" height="11" fill="url(#tileShade)"/>`;

    const overlay = `${tile === 'p' ? `<circle cx="${xx + 24}" cy="${yy + 24}" r="17" fill="none" stroke="#0b3d77" stroke-width="2.4"/><path d="M${xx + 13} ${yy + 24} H${xx + 35}" stroke="#d0ebff" stroke-width="2.5"/>` : ''}
      ${tile === 's' ? `<rect x="${xx + 8}" y="${yy + 8}" width="32" height="30" rx="2" fill="none" stroke="#18212b" stroke-width="2.5"/><text x="${xx + 24}" y="${yy + 31}" font-size="10" text-anchor="middle" fill="#18212b" font-weight="700">SHOP</text>` : ''}
      ${tile === '#' ? `<rect x="${xx + 2}" y="${yy + 2}" width="44" height="44" fill="none" stroke="#18212b" stroke-width="2"/>` : ''}`;

    const fg = tile === 'g' && (x + y) % 4 === 0
      ? `<g>
        <ellipse cx="${xx + 36}" cy="${yy + 43}" rx="8" ry="3" fill="#0000002a"/>
        <path d="M${xx + 31} ${yy + 43} L${xx + 34} ${yy + 30} L${xx + 37} ${yy + 43} M${xx + 34} ${yy + 43} L${xx + 38} ${yy + 27} L${xx + 42} ${yy + 43}" stroke="#1f7a2f" stroke-width="2.1" stroke-linecap="round"/>
      </g>`
      : '';

    return { base: `${base}${overlay}`, shadow, fg };
  }

  function renderNpc(npc) {
    const x = npc.x * TILE + 6;
    const y = npc.y * TILE + 2;
    return `<g transform="translate(${x} ${y})">${Game.Render.Character.renderNpc(npc, 0.76)}</g>`;
  }

  return Object.freeze({ render });
})();
