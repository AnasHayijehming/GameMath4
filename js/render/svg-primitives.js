window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.SVG = (function () {
  'use strict';

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
    return `<svg viewBox="0 0 800 500" width="100%" height="100%" role="img" aria-label="แผนที่ผจญภัย">
      <rect width="800" height="500" fill="#95e1ff"/>
      <circle cx="660" cy="78" r="44" fill="#ffdd57"/>
      <path d="M0 350 C120 280 260 330 380 260 C520 180 650 270 800 205 L800 500 L0 500 Z" fill="#42b883"/>
      <path d="M0 420 C160 360 270 450 440 365 C600 300 710 395 800 350 L800 500 L0 500 Z" fill="#2f9e44"/>
      <rect x="505" y="196" width="48" height="100" fill="#f59f00" stroke="#18212b" stroke-width="5"/>
      <rect x="565" y="160" width="55" height="136" fill="#ffca3a" stroke="#18212b" stroke-width="5"/>
      <rect x="635" y="210" width="45" height="86" fill="#ffd43b" stroke="#18212b" stroke-width="5"/>
      <path d="M120 295 L162 210 L204 295 Z" fill="#196f3d" stroke="#18212b" stroke-width="5"/>
      <rect x="153" y="292" width="18" height="52" fill="#8d5524"/>
      <path d="M250 352 Q330 288 410 352 T570 352" fill="none" stroke="#7950f2" stroke-width="12" stroke-linecap="round" stroke-dasharray="18 16"/>
      <g transform="translate(290 245) scale(2.2)">${Game.Render.Character ? '' : ''}</g>
    </svg>`;
  }

  return Object.freeze({ monster, titleArt });
})();
