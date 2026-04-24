window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.Character = (function () {
  'use strict';

  function encodeSvg(svg) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\n\s*/g, ' ').trim())}`;
  }

  const SPRITES = Object.freeze({
    playerSheet: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 72">
        <rect x="0" y="0" width="48" height="72" fill="#00000000"/>
        <circle cx="24" cy="16" r="10" fill="#f3c489" stroke="#1d2832" stroke-width="2"/>
        <path d="M14 11 Q24 1 34 11 L33 18 Q24 14 15 18 Z" fill="#423232" stroke="#1d2832" stroke-width="2"/>
        <rect x="14" y="28" width="20" height="24" rx="5" fill="#9cc8ff" stroke="#1d2832" stroke-width="2"/>
        <path d="M14 32 L5 44 M34 32 L43 44 M18 52 L15 66 M30 52 L33 66" stroke="#1d2832" stroke-width="4" stroke-linecap="round"/>

        <rect x="48" y="0" width="48" height="72" fill="#00000000"/>
        <circle cx="72" cy="16" r="10" fill="#ffd9b3" stroke="#1d2832" stroke-width="2"/>
        <path d="M62 15 Q72 1 82 15 L82 29 Q72 22 62 29 Z" fill="#5f3dc4" stroke="#1d2832" stroke-width="2"/>
        <rect x="62" y="28" width="20" height="24" rx="5" fill="#c8daff" stroke="#1d2832" stroke-width="2"/>
        <path d="M62 32 L53 44 M82 32 L91 44 M66 52 L63 66 M78 52 L81 66" stroke="#1d2832" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `),
    npcSheet: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 48">
        <g transform="translate(0 0)"><circle cx="24" cy="12" r="8" fill="#ffd8a8" stroke="#18212b" stroke-width="2"/><rect x="16" y="21" width="16" height="18" rx="4" fill="#15aabf" stroke="#18212b" stroke-width="2"/></g>
        <g transform="translate(48 0)"><circle cx="24" cy="12" r="8" fill="#ffd8a8" stroke="#18212b" stroke-width="2"/><rect x="16" y="21" width="16" height="18" rx="4" fill="#ffd43b" stroke="#18212b" stroke-width="2"/></g>
      </svg>
    `)
  });

  function assetExists(key) {
    return !!SPRITES[key];
  }

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
    const useSprite = assetExists('playerSheet');

    return `<g class="player-sprite" transform="scale(${s})">
      ${useSprite ? renderPlayerSprite(player) : renderPlayerVector(skin, hair, clothes.color)}
      ${renderEyesAndMouth()}
      ${renderClothesTint(clothes.color)}
      ${renderClothesDetails(clothes)}
      ${renderHat(hat)}
      ${renderShoes(shoes)}
      ${renderAccessory(accessory)}
      ${renderGlasses(glasses)}
    </g>`;
  }

  function renderPlayerSprite(player) {
    const frameX = player.gender === 'female' ? 48 : 0;
    return `<svg x="0" y="0" width="48" height="72" viewBox="${frameX} 0 48 72" preserveAspectRatio="none"><image href="${SPRITES.playerSheet}" x="0" y="0" width="96" height="72"/></svg>`;
  }

  function renderPlayerVector(skin, hair, clothesColor) {
    return `<circle cx="24" cy="16" r="10" fill="${skin}" stroke="#18212b" stroke-width="2"/>
      <path d="M15 10 Q24 2 33 10 L32 16 Q24 12 16 16 Z" fill="${hair}" stroke="#18212b" stroke-width="2"/>
      <rect x="14" y="28" width="20" height="24" rx="5" fill="${clothesColor}" stroke="#18212b" stroke-width="2"/>
      <path d="M14 32 L5 44 M34 32 L43 44" stroke="#18212b" stroke-width="4" stroke-linecap="round"/>
      <path d="M18 52 L15 66 M30 52 L33 66" stroke="#18212b" stroke-width="4" stroke-linecap="round"/>`;
  }

  function renderEyesAndMouth() {
    return `<circle cx="20" cy="16" r="1.8" fill="#18212b"/><circle cx="28" cy="16" r="1.8" fill="#18212b"/>
      <path d="M20 22 Q24 25 28 22" fill="none" stroke="#18212b" stroke-width="2" stroke-linecap="round"/>`;
  }

  function renderClothesTint(color) {
    return `<rect x="14" y="28" width="20" height="24" rx="5" fill="${color}" fill-opacity="0.55" stroke="#18212b" stroke-opacity="0.35" stroke-width="1"/>`;
  }

  function renderClothesDetails(item) {
    if (!item) return '';
    const collar = '<path d="M18 29 L24 35 L30 29" fill="#ffffff99" stroke="#18212b" stroke-width="1" stroke-linejoin="round"/>';
    if (item.id === 'clothes_pirate') return `${collar}<path d="M15 34 H33" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><path d="M20 30 L28 52" stroke="#ffd43b" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="41" r="2" fill="#ffd43b" stroke="#18212b" stroke-width="1"/>`;
    if (item.id === 'clothes_knight') return `<path d="M15 30 H33 V52 H15 Z" fill="#f1f3f5" fill-opacity="0.35"/><path d="M16 32 H32 M16 39 H32 M16 46 H32" stroke="#6c757d" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="39" r="5.5" fill="#f8f9fa" stroke="#495057" stroke-width="1.5"/><path d="M24 35 V43 M20 39 H28" stroke="#adb5bd" stroke-width="1.5" stroke-linecap="round"/>`;
    if (item.id === 'clothes_mage') return `<path d="M14 30 Q24 37 34 30 V52 H14 Z" fill="${item.color}" fill-opacity="0.62"/><path d="M17 33 Q24 38 31 33" fill="none" stroke="#eebefa" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="38" r="3.2" fill="#ffec99" stroke="#18212b" stroke-width="1"/><circle cx="24" cy="38" r="1.2" fill="#ffffff"/>`;
    if (item.id === 'clothes_yellow') return `${collar}<path d="M18 34 H30 M18 40 H30" stroke="#fff3bf" stroke-width="2" stroke-linecap="round"/><path d="M17 50 H31" stroke="#f08c00" stroke-width="1.5" stroke-linecap="round"/>`;
    if (item.id === 'clothes_green') return `${collar}<path d="M24 31 C18 35 18 43 24 49 C30 43 30 35 24 31 Z" fill="#d8f5a2" stroke="#2b8a3e" stroke-width="1.2"/><path d="M24 34 V47" stroke="#2b8a3e" stroke-width="1" stroke-linecap="round"/>`;
    if (item.id === 'clothes_red') return `${collar}<path d="M17 34 L24 47 L31 34" fill="none" stroke="#ffe3e3" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 50 H31" stroke="#ffc9c9" stroke-width="1.5" stroke-linecap="round"/>`;
    return collar;
  }

  function renderNpc(npc, scale) {
    const s = scale || 1;
    const useSprite = assetExists('npcSheet');
    const frameX = npc.type === 'oneTime' ? 48 : 0;
    const bodyColor = npc.type === 'boss' ? '#e03131' : npc.type === 'oneTime' ? '#ffd43b' : '#15aabf';

    return `<g transform="scale(${s})">
      ${useSprite
    ? `<svg x="0" y="0" width="48" height="48" viewBox="${frameX} 0 48 48" preserveAspectRatio="none"><image href="${SPRITES.npcSheet}" x="0" y="0" width="96" height="48"/></svg>`
    : `<circle cx="14" cy="10" r="8" fill="#ffd8a8" stroke="#18212b" stroke-width="2"/><rect x="6" y="19" width="16" height="18" rx="4" fill="${bodyColor}" stroke="#18212b" stroke-width="2"/>`}
      <rect x="4" y="1" width="20" height="36" rx="5" fill="none" stroke="#18212b" stroke-width="1.5"/>
      ${npc.type === 'boss' ? '<path d="M4 -1 L10 -10 L14 -1 L19 -10 L25 -1 Z" fill="#ffd43b" stroke="#18212b" stroke-width="2"/><circle cx="24" cy="28" r="6" fill="#ffffffcc" stroke="#7f1d1d" stroke-width="2"/><text x="24" y="31" text-anchor="middle" font-size="7" font-weight="700" fill="#7f1d1d">BOSS</text>' : ''}
      ${npc.type === 'oneTime' ? '<circle cx="24" cy="28" r="6" fill="#ffffffcc" stroke="#8a5a00" stroke-width="2"/><text x="24" y="31" text-anchor="middle" font-size="7" font-weight="700" fill="#8a5a00">NPC</text>' : ''}
      ${npc.type === 'repeatable' ? '<circle cx="24" cy="28" r="6" fill="#ffffffcc" stroke="#0b7285" stroke-width="2"/><text x="24" y="31" text-anchor="middle" font-size="7" font-weight="700" fill="#0b7285">Q</text>' : ''}
    </g>`;
  }

  function renderHat(item) {
    if (!item) return '';
    if (item.id === 'hat_witch') return `<path d="M12 9 L24 -18 L36 9 Z" fill="${item.color}" stroke="#18212b" stroke-width="2" stroke-linejoin="round"/><path d="M19 3 L24 -11 L30 3" fill="#9775fa" opacity="0.65"/><rect x="10" y="7" width="28" height="5" rx="2" fill="#18212b"/><circle cx="24" cy="-4" r="3" fill="#ffec99" stroke="#18212b" stroke-width="1"/>`;
    if (item.id === 'hat_flame') return `<path d="M12 8 C16 -4 20 4 24 -9 C28 4 33 -3 36 8 Z" fill="${item.color}" stroke="#18212b" stroke-width="2" stroke-linejoin="round"/><path d="M20 7 C22 1 24 3 25 -4 C28 2 31 3 32 8 Z" fill="#ffd43b"/><path d="M15 8 H36" stroke="#862e09" stroke-width="1.5" stroke-linecap="round"/>`;
    if (item.id === 'hat_crown') return `<path d="M12 8 L17 -5 L24 7 L31 -5 L36 8 Z" fill="${item.color}" stroke="#18212b" stroke-width="2" stroke-linejoin="round"/><path d="M15 6 H33" stroke="#fff3bf" stroke-width="2" stroke-linecap="round"/><circle cx="17" cy="-5" r="2.3" fill="#fff3bf" stroke="#18212b" stroke-width="1"/><circle cx="31" cy="-5" r="2.3" fill="#fff3bf" stroke="#18212b" stroke-width="1"/>`;
    if (item.id === 'hat_straw') return `<ellipse cx="24" cy="9" rx="18" ry="5" fill="${item.color}" stroke="#18212b" stroke-width="2"/><rect x="15" y="0" width="18" height="9" rx="4" fill="${item.color}" stroke="#18212b" stroke-width="2"/><path d="M14 8 H34 M17 3 H31" stroke="#fff3bf" stroke-width="1.5" stroke-linecap="round"/><path d="M16 5 H32" stroke="#b0892f" stroke-width="1.5" stroke-linecap="round"/>`;
    if (item.id === 'hat_knight') return `<path d="M13 9 Q24 -7 35 9 V16 H13 Z" fill="${item.color}" stroke="#18212b" stroke-width="2"/><path d="M24 -4 V16" stroke="#6c757d" stroke-width="2"/><path d="M16 8 Q24 1 32 8" fill="none" stroke="#f8f9fa" stroke-width="2" stroke-linecap="round"/><rect x="17" y="9" width="14" height="5" rx="1" fill="#f8f9fa" stroke="#18212b" stroke-width="1"/><path d="M19 11 H29" stroke="#adb5bd" stroke-width="1"/>`;
    if (item.id === 'hat_cap_green') return `<path d="M13 8 Q23 -3 34 8 Z" fill="${item.color}" stroke="#18212b" stroke-width="2"/><path d="M17 6 Q24 0 31 6" fill="none" stroke="#b2f2bb" stroke-width="2" stroke-linecap="round"/><path d="M31 8 Q40 8 43 12" fill="none" stroke="#18212b" stroke-width="3" stroke-linecap="round"/><path d="M32 8 Q38 9 41 12" fill="none" stroke="#b2f2bb" stroke-width="1.5" stroke-linecap="round"/>`;
    return `<path d="M13 8 Q24 -5 35 8 Z" fill="${item.color}" stroke="#18212b" stroke-width="2"/><path d="M17 6 Q24 0 31 6" fill="none" stroke="#ffffff99" stroke-width="1.5" stroke-linecap="round"/>`;
  }

  function renderShoes(item) {
    if (!item) return '';
    if (item.id === 'shoes_boots') {
      return `${renderShoe(13, 63, item.color, 'boot')}${renderShoe(33, 63, item.color, 'boot')}`;
    }
    if (item.id === 'shoes_city') {
      return `${renderShoe(13, 65, item.color, 'city')}${renderShoe(33, 65, item.color, 'city')}`;
    }
    if (item.id === 'shoes_magic') {
      return `<circle cx="8" cy="61" r="1.8" fill="#ffec99"/><circle cx="40" cy="60" r="1.8" fill="#ffec99"/><path d="M9 57 L11 60 L14 61 L11 63 L10 66 L8 63 L5 62 L8 60 Z" fill="#fff3bf" opacity="0.85"/>${renderShoe(13, 65, item.color, 'magic')}${renderShoe(33, 65, item.color, 'magic')}`;
    }
    if (item.id === 'shoes_gold') {
      return `${renderShoe(13, 65, item.color, 'gold')}${renderShoe(33, 65, item.color, 'gold')}`;
    }
    return `${renderShoe(13, 65, item.color, 'sneaker')}${renderShoe(33, 65, item.color, 'sneaker')}`;
  }

  function renderShoe(x, y, color, variant) {
    const upperY = variant === 'boot' ? y - 5 : y - 2;
    const upper = variant === 'boot'
      ? `<path d="M${x - 4} ${y - 7} H${x + 3} Q${x + 5} ${y - 3} ${x + 6} ${y} L${x - 5} ${y} Q${x - 6} ${y - 4} ${x - 4} ${y - 7} Z" fill="${color}" stroke="#18212b" stroke-width="1.8" stroke-linejoin="round"/>`
      : `<path d="M${x - 6} ${y - 2} Q${x - 3} ${upperY} ${x + 2} ${upperY} H${x + 6} Q${x + 9} ${upperY + 1} ${x + 10} ${y + 2} L${x - 6} ${y + 2} Z" fill="${color}" stroke="#18212b" stroke-width="1.8" stroke-linejoin="round"/>`;
    const soleColor = variant === 'gold' ? '#5c3c00' : variant === 'boot' ? '#3d2412' : '#ffffff';
    const accent = variant === 'sneaker'
      ? `<path d="M${x - 1} ${y - 1} L${x + 3} ${y + 1} M${x + 1} ${y - 1} L${x + 5} ${y + 1}" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round"/>`
      : variant === 'boot'
        ? `<path d="M${x - 4} ${y - 3} H${x + 4}" stroke="#d8a05f" stroke-width="1.2" stroke-linecap="round"/>`
        : variant === 'city'
          ? `<path d="M${x - 3} ${y - 1} H${x + 7}" stroke="#d0ebff" stroke-width="1.5" stroke-linecap="round"/>`
          : variant === 'magic'
            ? `<path d="M${x - 2} ${y - 2} Q${x + 2} ${y + 1} ${x + 7} ${y - 1}" fill="none" stroke="#ffd6e7" stroke-width="1.4" stroke-linecap="round"/>`
            : `<path d="M${x - 4} ${y - 1} H${x + 6}" stroke="#fff3bf" stroke-width="1.3" stroke-linecap="round"/>`;
    return `<g>${upper}<path d="M${x - 7} ${y + 2} H${x + 11}" stroke="#18212b" stroke-width="2.5" stroke-linecap="round"/><path d="M${x - 6} ${y + 1} H${x + 9}" stroke="${soleColor}" stroke-width="2" stroke-linecap="round"/>${accent}<path d="M${x - 4} ${upperY + 1} H${x + 2}" stroke="#ffffff99" stroke-width="1.2" stroke-linecap="round"/></g>`;
  }

  function renderAccessory(item) {
    if (!item) return '';
    if (item.id.includes('sword')) return `<path d="M45 43 L59 24" stroke="#f8f9fa" stroke-width="5" stroke-linecap="round"/><path d="M45 43 L59 24" stroke="${item.color}" stroke-width="3" stroke-linecap="round"/><path d="M48 38 L54 44" stroke="#18212b" stroke-width="3" stroke-linecap="round"/><circle cx="46" cy="45" r="2" fill="#ffd43b" stroke="#18212b" stroke-width="1"/>`;
    if (item.id.includes('flower')) return `<path d="M44 45 L40 54" stroke="#2f9e44" stroke-width="2.3" stroke-linecap="round"/><circle cx="48" cy="41" r="3" fill="#ffec99" stroke="#18212b" stroke-width="1"/><circle cx="48" cy="36" r="3.2" fill="${item.color}" stroke="#18212b" stroke-width="1"/><circle cx="53" cy="41" r="3.2" fill="${item.color}" stroke="#18212b" stroke-width="1"/><circle cx="48" cy="46" r="3.2" fill="${item.color}" stroke="#18212b" stroke-width="1"/><circle cx="43" cy="41" r="3.2" fill="${item.color}" stroke="#18212b" stroke-width="1"/>`;
    if (item.id.includes('shield')) return `<path d="M45 35 L57 39 L55 54 L45 62 L35 54 L33 39 Z" fill="${item.color}" stroke="#18212b" stroke-width="2" stroke-linejoin="round"/><path d="M45 38 V58 M38 43 H52" stroke="#d3f9d8" stroke-width="2" stroke-linecap="round"/><path d="M37 40 L45 37 L53 40" fill="none" stroke="#ffffff99" stroke-width="1.3" stroke-linecap="round"/>`;
    if (item.id.includes('umbrella')) return `<path d="M38 34 Q49 18 60 34 Z" fill="${item.color}" stroke="#18212b" stroke-width="2" stroke-linejoin="round"/><path d="M41 33 Q49 25 57 33" fill="none" stroke="#d0ebff" stroke-width="2" stroke-linecap="round"/><path d="M49 34 V55 Q49 61 43 57" fill="none" stroke="#18212b" stroke-width="3" stroke-linecap="round"/><path d="M49 34 V54" stroke="#ffffff99" stroke-width="1.2" stroke-linecap="round"/>`;
    if (item.id.includes('staff')) return `<path d="M47 58 L57 22" stroke="#8d5524" stroke-width="4" stroke-linecap="round"/><path d="M49 54 L56 27" stroke="#ffe8cc" stroke-width="1.3" stroke-linecap="round"/><path d="M53 20 L59 16 L64 22 L58 29 L51 27 Z" fill="${item.color}" stroke="#18212b" stroke-width="2" stroke-linejoin="round"/><circle cx="58" cy="23" r="2" fill="#fff3bf"/>`;
    if (item.id.includes('wand')) return `<path d="M45 47 L59 29" stroke="#18212b" stroke-width="5" stroke-linecap="round"/><path d="M45 47 L59 29" stroke="${item.color}" stroke-width="3" stroke-linecap="round"/><path d="M60 24 L62 29 L67 30 L63 33 L64 38 L60 35 L55 38 L57 33 L53 30 L58 29 Z" fill="#ffec99" stroke="#18212b" stroke-width="1.5" stroke-linejoin="round"/><circle cx="63" cy="24" r="1.5" fill="#fff9db"/>`;
    return `<path d="M45 45 L58 20" stroke="${item.color}" stroke-width="4" stroke-linecap="round"/><circle cx="59" cy="18" r="4" fill="#ffec99" stroke="#18212b" stroke-width="2"/><circle cx="60" cy="17" r="1.2" fill="#ffffff"/>`;
  }

  function renderGlasses(item) {
    if (!item) return '';
    if (item.id === 'glasses_mask') return `<rect x="14" y="12" width="20" height="8" rx="4" fill="${item.color}" stroke="#18212b" stroke-width="2"/><path d="M17 15 H31" stroke="#ffc9c9" stroke-width="1.4" stroke-linecap="round"/><circle cx="20" cy="16" r="1.2" fill="#18212b"/><circle cx="28" cy="16" r="1.2" fill="#18212b"/>`;
    if (item.id === 'glasses_sun') return `<path d="M15 13 H33 L29 21 H19 Z" fill="${item.color}" stroke="#18212b" stroke-width="2" stroke-linejoin="round"/><path d="M18 15 H23 M27 15 H31" stroke="#ffffff55" stroke-width="1.3" stroke-linecap="round"/><path d="M24 15 L24 17" stroke="#18212b" stroke-width="2"/>`;
    if (item.id === 'glasses_star') return `<path d="M20 10 L22 14 L26 14 L23 17 L24 21 L20 19 L16 21 L17 17 L14 14 L18 14 Z" fill="${item.color}" stroke="#18212b" stroke-width="1.5" stroke-linejoin="round"/><path d="M29 10 L31 14 L35 14 L32 17 L33 21 L29 19 L25 21 L26 17 L23 14 L27 14 Z" fill="${item.color}" stroke="#18212b" stroke-width="1.5" stroke-linejoin="round"/><path d="M23 16 H26" stroke="#18212b" stroke-width="1.2"/>`;
    if (item.id === 'glasses_crystal') return `<path d="M14 16 L20 10 L26 16 L20 22 Z" fill="${item.color}" fill-opacity="0.72" stroke="#364fc7" stroke-width="1.5" stroke-linejoin="round"/><path d="M22 16 L28 10 L34 16 L28 22 Z" fill="${item.color}" fill-opacity="0.72" stroke="#364fc7" stroke-width="1.5" stroke-linejoin="round"/><path d="M18 14 L21 17 M26 14 L29 17" stroke="#ffffffaa" stroke-width="1.1" stroke-linecap="round"/><path d="M25 16 H23" stroke="#364fc7" stroke-width="1.2"/>`;
    return `<circle cx="20" cy="16" r="5" fill="#ffffff22" stroke="${item.color}" stroke-width="2"/><circle cx="28" cy="16" r="5" fill="#ffffff22" stroke="${item.color}" stroke-width="2"/><path d="M25 16 L23 16" stroke="${item.color}" stroke-width="2"/><path d="M17 14 H20 M26 14 H29" stroke="#ffffff99" stroke-width="1" stroke-linecap="round"/>`;
  }

  function preview(itemId) {
    const state = Game.State.get();
    const inventory = Game.Infra.Util.clone(state.inventory);
    const item = Game.Data.Items.get(itemId);
    if (item) inventory.equipped[item.slot] = item.id;
    return `<svg viewBox="-8 -12 64 86" width="64" height="86" aria-hidden="true">${render(state.player, inventory, 1)}</svg>`;
  }

  return Object.freeze({ render, renderNpc, preview });
})();
