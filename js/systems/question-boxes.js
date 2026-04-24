window.Game = window.Game || {};
Game.Systems = Game.Systems || {};

Game.Systems.QuestionBoxes = (function () {
  'use strict';

  const BOX_COUNT = 5;
  const boxesByZone = {};
  let nextId = 0;

  function ensure(zoneId) {
    const zone = Game.Data.Zones.get(zoneId);
    if (!zone) return [];
    const boxes = boxesByZone[zoneId] || [];
    boxesByZone[zoneId] = boxes;
    while (boxes.length < BOX_COUNT) {
      const next = createBox(zone, boxes);
      if (!next) break;
      boxes.push(next);
    }
    return boxes.slice();
  }

  function all(zoneId) {
    return ensure(zoneId);
  }

  function boxAt(zoneId, x, y) {
    return ensure(zoneId).find(function find(box) {
      return box.x === x && box.y === y;
    }) || null;
  }

  function nearbyBox(zoneId, pos) {
    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];
    for (let i = 0; i < dirs.length; i += 1) {
      const found = boxAt(zoneId, pos.x + dirs[i].x, pos.y + dirs[i].y);
      if (found) return found;
    }
    return null;
  }

  function consume(zoneId, boxId) {
    const boxes = boxesByZone[zoneId];
    if (!boxes) return false;
    const index = boxes.findIndex(function find(box) { return box.id === boxId; });
    if (index === -1) return false;
    boxes.splice(index, 1);
    ensure(zoneId);
    return true;
  }

  function createBox(zone, existingBoxes) {
    const candidates = [];
    for (let y = 0; y < zone.tiles.length; y += 1) {
      for (let x = 0; x < zone.tiles[y].length; x += 1) {
        if (isAvailable(zone, x, y, existingBoxes)) candidates.push({ x, y });
      }
    }
    if (!candidates.length) return null;
    const pos = Game.Infra.RNG.pick(candidates);
    return {
      id: `${zone.id}_box_${nextId += 1}`,
      x: pos.x,
      y: pos.y
    };
  }

  function isAvailable(zone, x, y, existingBoxes) {
    if (!Game.Data.Zones.isWalkable(zone.id, x, y)) return false;
    if (zone.spawnPoint && zone.spawnPoint.x === x && zone.spawnPoint.y === y) return false;
    if (zone.shop && zone.shop.x === x && zone.shop.y === y) return false;
    if (Game.Data.Zones.npcAt(zone.id, x, y)) return false;
    if (Game.Data.Zones.portalAt(zone.id, x, y)) return false;
    if (existingBoxes.some(function some(box) { return box.x === x && box.y === y; })) return false;
    const state = Game.State.get && Game.State.get();
    if (state && state.world && state.world.currentZone === zone.id) {
      const pos = state.world.position;
      if (pos && pos.x === x && pos.y === y) return false;
    }
    return true;
  }

  function reset() {
    Object.keys(boxesByZone).forEach(function each(zoneId) {
      delete boxesByZone[zoneId];
    });
    nextId = 0;
  }

  return Object.freeze({ ensure, all, boxAt, nearbyBox, consume, reset });
})();
