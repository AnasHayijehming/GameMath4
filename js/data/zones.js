window.Game = window.Game || {};
Game.Data = Game.Data || {};

Game.Data.Zones = (function () {
  'use strict';

  const unlockLevels = Game.Config.world.zoneUnlockLevels;

  const zones = {
    forest: {
      id: 'forest',
      name: 'ป่ามหัศจรรย์',
      theme: 'forest',
      multiplier: 1,
      requiredLevel: unlockLevels.forest,
      spawnPoint: { x: 2, y: 8 },
      tiles: [
        '###############',
        '#.....gggg....#',
        '#.###.....###.#',
        '#...g..n..g...#',
        '#...#######...#',
        '#...g.....g..p#',
        '#.....ggg.....#',
        '#.###.....###.#',
        '#.............#',
        '###############'
      ],
      portals: [
        { x: 13, y: 5, targetZone: 'city', requiredLevel: unlockLevels.city }
      ],
      npcs: [
        { id: 'forest_npc_01', name: 'ครูต้นไม้', x: 7, y: 3, type: 'oneTime', bonusMultiplier: 2, greeting: 'ช่วยแก้โจทย์บวกให้ครูต้นไม้หน่อย' },
        { id: 'forest_npc_02', name: 'กระต่ายนักคูณ', x: 10, y: 7, type: 'repeatable', bonusMultiplier: 1, greeting: 'ลองคูณเลขเร็วกันไหม' }
      ],
      quiz: {
        difficulty: 'easy',
        encounterProbability: 0.15,
        topicWeights: { addition: 3, subtraction: 3, multiplication: 2, division: 2 }
      }
    },
    city: {
      id: 'city',
      name: 'เมืองตัวเลข',
      theme: 'city',
      multiplier: 2,
      requiredLevel: unlockLevels.city,
      spawnPoint: { x: 6, y: 1 },
      tiles: [
        '###############',
        '#.....p.......#',
        '#..###...###..#',
        '#..s....n.....#',
        '#.....###.....#',
        '#....ggggg....#',
        '#...n....###..#',
        '#...........p.#',
        '#.............#',
        '###############'
      ],
      portals: [
        { x: 6, y: 1, targetZone: 'forest', requiredLevel: unlockLevels.forest },
        { x: 12, y: 7, targetZone: 'castle', requiredLevel: unlockLevels.castle }
      ],
      shop: { x: 3, y: 3 },
      npcs: [
        { id: 'city_npc_01', name: 'พ่อค้าเศษส่วน', x: 8, y: 3, type: 'oneTime', bonusMultiplier: 2, greeting: 'เมืองนี้ใช้เศษส่วนซื้อของกัน' },
        { id: 'city_npc_02', name: 'วิศวกรทศนิยม', x: 4, y: 6, type: 'repeatable', bonusMultiplier: 1, greeting: 'ลองโจทย์ทศนิยมก่อนเข้าถ้ำ' }
      ],
      quiz: {
        difficulty: 'medium',
        encounterProbability: 0.12,
        topicWeights: { fraction_add: 2, fraction_subtract: 2, decimal_add: 2, decimal_multiply: 2, word_problem: 3 }
      }
    },
    castle: {
      id: 'castle',
      name: 'ถ้ำปราสาท',
      theme: 'castle',
      multiplier: 3,
      requiredLevel: unlockLevels.castle,
      spawnPoint: { x: 2, y: 7 },
      tiles: [
        '###############',
        '#.....#####...#',
        '#..g..#...#...#',
        '#..g..#n..#...#',
        '#.....#...#...#',
        '#..###.....##.#',
        '#..g....b.....#',
        '#p............#',
        '#.....gggg....#',
        '###############'
      ],
      portals: [
        { x: 1, y: 7, targetZone: 'city', requiredLevel: unlockLevels.city }
      ],
      npcs: [
        { id: 'castle_npc_01', name: 'นักวัดมุม', x: 7, y: 3, type: 'repeatable', bonusMultiplier: 1, greeting: 'เรขาคณิตคือกุญแจของปราสาท' },
        { id: 'castle_boss_01', name: 'ราชาเงาคณิต', x: 7, y: 6, type: 'boss', bonusMultiplier: 5, greeting: 'ถ้าตอบได้ เจ้าจะชนะปราสาทนี้' }
      ],
      quiz: {
        difficulty: 'hard',
        encounterProbability: 0.13,
        topicWeights: { geometry: 4, word_problem: 3, addition: 1, subtraction: 1, multiplication: 1, division: 1, decimal_multiply: 1 }
      }
    }
  };

  function get(id) {
    return zones[id];
  }

  function all() {
    return Object.keys(zones).map(function map(id) { return zones[id]; });
  }

  function tileAt(zoneId, x, y) {
    const zone = get(zoneId);
    if (!zone || y < 0 || y >= zone.tiles.length || x < 0 || x >= zone.tiles[y].length) return '#';
    return zone.tiles[y][x];
  }

  function isWalkable(zoneId, x, y) {
    const tile = tileAt(zoneId, x, y);
    return tile !== '#';
  }

  function npcAt(zoneId, x, y) {
    const zone = get(zoneId);
    return zone.npcs.find(function find(npc) { return npc.x === x && npc.y === y; }) || null;
  }

  function portalAt(zoneId, x, y) {
    const zone = get(zoneId);
    return zone.portals.find(function find(portal) { return portal.x === x && portal.y === y; }) || null;
  }

  return Object.freeze({ get, all, tileAt, isWalkable, npcAt, portalAt });
})();
