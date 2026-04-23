window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.SVG = (function () {
  'use strict';

  function encodeSvg(svg) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\n\s*/g, ' ').trim())}`;
  }

  const assetManifest = Object.freeze({
    titleBackground: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#9be7ff"/>
            <stop offset="100%" stop-color="#d5f7ff"/>
          </linearGradient>
          <radialGradient id="sun" cx="0.82" cy="0.15" r="0.2">
            <stop offset="0%" stop-color="#fff5a1"/>
            <stop offset="100%" stop-color="#ffd43b"/>
          </radialGradient>
        </defs>
        <rect width="1600" height="1000" fill="url(#sky)"/>
        <circle cx="1300" cy="150" r="120" fill="url(#sun)" opacity="0.96"/>
        <path d="M0 670 C240 530 430 610 640 525 C840 450 1030 545 1300 470 C1460 430 1530 410 1600 390 L1600 1000 L0 1000 Z" fill="#77d17a"/>
        <path d="M0 760 C210 650 410 730 630 660 C920 575 1100 705 1330 640 C1460 604 1530 600 1600 560 L1600 1000 L0 1000 Z" fill="#4db86d"/>
        <path d="M0 840 C260 760 440 850 700 780 C980 700 1260 820 1600 730 L1600 1000 L0 1000 Z" fill="#2f9e56"/>
      </svg>
    `)
  });

  function getAsset(key) {
    return assetManifest[key] || null;
  }

  function hasAsset(key) {
    return !!getAsset(key);
  }

  function monster(theme) {
    const color = theme === 'castle' ? '#be4bdb' : theme === 'city' ? '#ff922b' : '#51cf66';
    return `<svg viewBox="0 0 90 90" width="90" height="90" aria-hidden="true">
      <circle cx="45" cy="48" r="28" fill="${color}" stroke="#18212b" stroke-width="4"/>
      <circle cx="34" cy="42" r="5" fill="#18212b"/><circle cx="56" cy="42" r="5" fill="#18212b"/>
      <path d="M30 59 Q45 70 60 59" fill="none" stroke="#18212b" stroke-width="4" stroke-linecap="round"/>
      <path d="M24 24 L34 35 M66 24 L56 35" stroke="#18212b" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
  }

  function titleArt() {
    const background = hasAsset('titleBackground')
      ? `<image href="${getAsset('titleBackground')}" x="0" y="0" width="800" height="500" preserveAspectRatio="xMidYMid slice"/>`
      : `<rect width="800" height="500" fill="#95e1ff"/>`;
    return `<svg viewBox="0 0 800 500" width="100%" height="100%" role="img" aria-label="แผนที่ผจญภัย">
      ${background}
      <g opacity="0.82" fill="#fff">
        <ellipse cx="110" cy="92" rx="46" ry="20"/><ellipse cx="145" cy="87" rx="38" ry="16"/><ellipse cx="173" cy="96" rx="32" ry="14"/>
        <ellipse cx="560" cy="118" rx="52" ry="22"/><ellipse cx="600" cy="112" rx="42" ry="18"/><ellipse cx="637" cy="124" rx="35" ry="15"/>
      </g>
      <g fill="#ffffff88">
        <circle cx="74" cy="54" r="2.3"/><circle cx="220" cy="70" r="1.7"/><circle cx="410" cy="56" r="2"/><circle cx="732" cy="62" r="1.8"/>
      </g>
      <g>
        <rect x="505" y="196" width="48" height="100" fill="#f59f00" stroke="#18212b" stroke-width="5"/>
        <rect x="565" y="160" width="55" height="136" fill="#ffca3a" stroke="#18212b" stroke-width="5"/>
        <rect x="635" y="210" width="45" height="86" fill="#ffd43b" stroke="#18212b" stroke-width="5"/>
      </g>
      <path d="M120 295 L162 210 L204 295 Z" fill="#196f3d" stroke="#18212b" stroke-width="5"/>
      <rect x="153" y="292" width="18" height="52" fill="#8d5524"/>
      <path d="M250 352 Q330 288 410 352 T570 352" fill="none" stroke="#7950f2" stroke-width="12" stroke-linecap="round" stroke-dasharray="18 16"/>
    </svg>`;
  }

  return Object.freeze({ monster, titleArt, getAsset, hasAsset });
})();
