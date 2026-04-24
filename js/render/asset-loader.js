window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.AssetLoader = (function () {
  'use strict';

  const fallbackAssets = {
    title_bg: 'assets/ui/title-bg.png',
    ui_panel_texture: 'assets/ui/panel-texture.png',
    ui_button_texture: 'assets/ui/button-texture.png',
    zone_forest_bg: 'assets/zones/forest/background.png',
    zone_city_bg: 'assets/zones/city/background.png',
    zone_castle_bg: 'assets/zones/castle/background.png'
  };

  let assets = Object.assign({}, fallbackAssets);
  let loaded = false;
  const statusByKey = {};

  function loadManifest() {
    if (loaded) return Promise.resolve(assets);
    loaded = true;
    return fetch('assets/manifest.json')
      .then(function onResponse(response) {
        if (!response.ok) throw new Error('manifest unavailable');
        return response.json();
      })
      .then(function onJson(json) {
        if (json && json.assets && typeof json.assets === 'object') {
          assets = Object.assign({}, fallbackAssets, json.assets);
        }
        return assets;
      })
      .catch(function onError() {
        return assets;
      });
  }

  function getUrl(key) {
    const url = assets[key];
    if (!url) return placeholderDataUrl(key);
    if (isInlineUrl(url)) return url;
    const status = validateAsset(key, url);
    if (status === 'loaded') return url;
    return placeholderDataUrl(key);
  }

  function zoneBackground(zoneId) {
    return getUrl(`zone_${zoneId}_bg`);
  }

  function titleBackground() {
    return getUrl('title_bg');
  }

  function placeholderDataUrl(label) {
    const safe = (label || 'missing').replace(/[^a-z0-9_\-]/gi, '_');
    return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 320"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#1d3557"/><stop offset="1" stop-color="#457b9d"/></linearGradient></defs><rect width="512" height="320" fill="url(#g)"/><circle cx="64" cy="44" r="26" fill="#f1faee" opacity=".35"/><circle cx="462" cy="276" r="46" fill="#a8dadc" opacity=".25"/><text x="24" y="294" fill="#ffffff" font-size="20" font-family="Arial, sans-serif">missing asset: ${safe}</text></svg>`)}`;
  }

  function isInlineUrl(url) {
    return /^data:/i.test(String(url || ''));
  }

  function validateAsset(key, url) {
    const current = statusByKey[key];
    if (current && current.url === url) return current.status;

    statusByKey[key] = { url, status: 'pending' };
    if (typeof Image === 'undefined') {
      statusByKey[key].status = 'failed';
      return statusByKey[key].status;
    }

    const image = new Image();
    image.onload = function onLoad() {
      const latest = statusByKey[key];
      if (!latest || latest.url !== url) return;
      latest.status = 'loaded';
      requestRender();
    };
    image.onerror = function onError() {
      const latest = statusByKey[key];
      if (!latest || latest.url !== url) return;
      latest.status = 'failed';
      requestRender();
    };
    image.src = url;
    return statusByKey[key].status;
  }

  function requestRender() {
    if (Game.SceneManager && Game.SceneManager.requestRender) {
      Game.SceneManager.requestRender();
    }
  }

  function preloadCritical(zoneId) {
    ensurePreload('preload-title-bg', titleBackground());
    ensurePreload('preload-zone-bg', zoneBackground(zoneId || 'forest'));
  }

  function ensurePreload(id, href) {
    if (!document || !document.head) return;
    let node = document.getElementById(id);
    if (!node) {
      node = document.createElement('link');
      node.id = id;
      node.rel = 'preload';
      node.as = 'image';
      document.head.appendChild(node);
    }
    node.href = href;
  }

  return Object.freeze({
    loadManifest,
    getUrl,
    zoneBackground,
    titleBackground,
    preloadCritical,
    placeholderDataUrl
  });
})();
