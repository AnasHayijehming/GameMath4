window.Game = window.Game || {};
Game.Scenes = Game.Scenes || {};

Game.Scenes.Overworld = (function () {
  'use strict';

  let message = '';
  let menuOpen = false;

  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 }
  ];

  const scene = {
    id: 'overworld',
    enter(params) {
      message = params && params.message ? params.message : '';
      menuOpen = false;
    },
    exit() {},
    render() {
      const state = Game.State.get();
      const zone = Game.Data.Zones.get(state.world.currentZone);
      const bgUrl = Game.Render.AssetLoader.zoneBackground(zone.id);
      return `<div class="game-shell screen--${zone.theme}" style="background-image:linear-gradient(rgba(24,33,43,.18), rgba(24,33,43,.18)), url('${bgUrl}'); background-size:cover; background-position:center;">
        ${Game.Render.HUD.render(state, message)}
        <section class="world-wrap">${Game.Render.Map.render(state)}</section>
        ${Game.Scenes.Base.controls()}
        ${menuOpen ? renderMenu() : ''}
      </div>`;
    },
    bind(root) {
      root.querySelectorAll('[data-menu-scene]').forEach(function each(button) {
        button.addEventListener('click', function onClick() {
          Game.SceneManager.goTo(button.getAttribute('data-menu-scene'));
        });
      });
    },
    handleInput(action) {
      if (menuOpen) {
        if (action === 'cancel' || action === 'menu') {
          menuOpen = false;
          Game.SceneManager.requestRender();
        }
        return;
      }
      if (['up', 'down', 'left', 'right'].includes(action)) {
        Game.Systems.Movement.tryMove(action);
        return;
      }
      if (action === 'confirm') interact();
      if (action === 'menu') {
        menuOpen = true;
        Game.SceneManager.requestRender();
      }
      if (action === 'cancel') {
        Game.SceneManager.goTo('settings');
      }
    }
  };

  function renderMenu() {
    return `<div class="overlay">
      <section class="modal">
        <h2>เมนู</h2>
        <div class="button-row">
          <button data-menu-scene="inventory">ตัวละคร</button>
          <button data-menu-scene="stats">สถิติ</button>
          <button data-menu-scene="settings">ตั้งค่า</button>
          <button data-action="cancel">ปิด</button>
        </div>
      </section>
    </div>`;
  }

  function interact() {
    const state = Game.State.get();
    const zone = Game.Data.Zones.get(state.world.currentZone);
    const pos = state.world.position;
    const shop = zone.shop;
    if (shop && shop.x === pos.x && shop.y === pos.y) {
      Game.SceneManager.goTo('shop');
      return;
    }
    const portal = Game.Data.Zones.portalAt(zone.id, pos.x, pos.y);
    if (portal) {
      if (state.player.level < portal.requiredLevel) {
        message = `ต้องถึงเลเวล ${portal.requiredLevel} ก่อน`;
        Game.SceneManager.requestRender();
        return;
      }
      if (!Game.Systems.Movement.changeZone(portal.targetZone)) {
        message = 'ยังไปโซนนั้นไม่ได้';
        Game.SceneManager.requestRender();
        return;
      }
      message = `เดินทางสู่ ${Game.Data.Zones.get(portal.targetZone).name}`;
      Game.SceneManager.requestRender();
      return;
    }
    const npc = findNearbyNpc(zone.id, pos);
    if (npc) {
      if (npc.type === 'boss' && state.bossDefeated.includes(npc.id)) {
        message = 'คุณชนะหัวหน้าปราสาทไปแล้ว';
        Game.SceneManager.requestRender();
        return;
      }
      if (npc.type === 'oneTime' && state.npcsCompleted.includes(npc.id)) {
        message = `${npc.name}: เคยช่วยแล้ว ลองสำรวจต่อได้เลย`;
        Game.SceneManager.requestRender();
        return;
      }
      Game.SceneManager.goTo('quiz', {
        source: 'npc',
        zoneId: zone.id,
        npcId: npc.id,
        npcName: npc.name,
        bonusMultiplier: npc.bonusMultiplier || 1,
        isBoss: npc.type === 'boss',
        greeting: npc.greeting
      });
      return;
    }
    message = 'ไม่มีอะไรให้ใช้ A ตรงนี้';
    Game.SceneManager.requestRender();
  }

  function findNearbyNpc(zoneId, pos) {
    for (let i = 0; i < dirs.length; i += 1) {
      const npc = Game.Data.Zones.npcAt(zoneId, pos.x + dirs[i].x, pos.y + dirs[i].y);
      if (npc) return npc;
    }
    return null;
  }

  return scene;
})();
