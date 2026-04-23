window.Game = window.Game || {};
Game.Data = Game.Data || {};

Game.Data.Items = (function () {
  'use strict';

  const catalog = [
    { id: 'clothes_basic', slot: 'clothes', name: 'เสื้อพื้นฐาน', price: 0, requiredLevel: 1, color: '#3da5ff' },
    { id: 'hat_beanie', slot: 'hat', name: 'หมวกไหมพรม', price: 20, requiredLevel: 1, color: '#ff6b6b' },
    { id: 'hat_straw', slot: 'hat', name: 'หมวกฟาง', price: 45, requiredLevel: 1, color: '#e4bf55' },
    { id: 'hat_cap_green', slot: 'hat', name: 'หมวกแก๊ปใบไม้', price: 55, requiredLevel: 2, color: '#42b883' },
    { id: 'hat_witch', slot: 'hat', name: 'หมวกแม่มด', price: 160, requiredLevel: 5, color: '#805ad5' },
    { id: 'hat_crown', slot: 'hat', name: 'มงกุฎทอง', price: 300, requiredLevel: 8, color: '#ffd43b' },
    { id: 'hat_knight', slot: 'hat', name: 'หมวกอัศวิน', price: 420, requiredLevel: 10, color: '#adb5bd' },
    { id: 'clothes_red', slot: 'clothes', name: 'เสื้อแดงกล้าหาญ', price: 35, requiredLevel: 1, color: '#ff6b6b' },
    { id: 'clothes_green', slot: 'clothes', name: 'เสื้อเขียวป่า', price: 35, requiredLevel: 1, color: '#51cf66' },
    { id: 'clothes_yellow', slot: 'clothes', name: 'เสื้อเหลืองเมือง', price: 60, requiredLevel: 4, color: '#ffd43b' },
    { id: 'clothes_pirate', slot: 'clothes', name: 'ชุดโจรสลัด', price: 180, requiredLevel: 6, color: '#343a40' },
    { id: 'clothes_knight', slot: 'clothes', name: 'ชุดอัศวิน', price: 260, requiredLevel: 9, color: '#ced4da' },
    { id: 'clothes_mage', slot: 'clothes', name: 'เสื้อคลุมเวท', price: 360, requiredLevel: 10, color: '#be4bdb' },
    { id: 'shoes_sneaker', slot: 'shoes', name: 'รองเท้าผ้าใบ', price: 30, requiredLevel: 1, color: '#495057' },
    { id: 'shoes_boots', slot: 'shoes', name: 'บูตเดินป่า', price: 75, requiredLevel: 3, color: '#8d5524' },
    { id: 'shoes_city', slot: 'shoes', name: 'รองเท้าเมือง', price: 100, requiredLevel: 5, color: '#1c7ed6' },
    { id: 'shoes_magic', slot: 'shoes', name: 'รองเท้าเวทมนตร์', price: 280, requiredLevel: 10, color: '#f06595' },
    { id: 'shoes_gold', slot: 'shoes', name: 'รองเท้าทอง', price: 500, requiredLevel: 12, color: '#fab005' },
    { id: 'accessory_sword', slot: 'accessory', name: 'ดาบไม้', price: 70, requiredLevel: 2, color: '#868e96' },
    { id: 'accessory_flower', slot: 'accessory', name: 'ดอกไม้', price: 40, requiredLevel: 1, color: '#f06595' },
    { id: 'accessory_umbrella', slot: 'accessory', name: 'ร่มสีฟ้า', price: 110, requiredLevel: 5, color: '#74c0fc' },
    { id: 'accessory_wand', slot: 'accessory', name: 'ไม้กายสิทธิ์', price: 230, requiredLevel: 8, color: '#7950f2' },
    { id: 'accessory_staff', slot: 'accessory', name: 'คทาปราสาท', price: 430, requiredLevel: 10, color: '#ffd43b' },
    { id: 'glasses_round', slot: 'glasses', name: 'แว่นกลม', price: 55, requiredLevel: 1, color: '#212529' },
    { id: 'glasses_sun', slot: 'glasses', name: 'แว่นดำ', price: 120, requiredLevel: 4, color: '#111' },
    { id: 'glasses_star', slot: 'glasses', name: 'แว่นดาว', price: 190, requiredLevel: 6, color: '#ffec99' },
    { id: 'glasses_mask', slot: 'glasses', name: 'หน้ากาก', price: 260, requiredLevel: 8, color: '#e03131' },
    { id: 'glasses_crystal', slot: 'glasses', name: 'แว่นคริสตัล', price: 390, requiredLevel: 10, color: '#91a7ff' },
    { id: 'hat_flame', slot: 'hat', name: 'มงกุฎเปลวไฟ', price: 470, requiredLevel: 11, color: '#ff7f11' },
    { id: 'accessory_shield', slot: 'accessory', name: 'โล่คณิต', price: 490, requiredLevel: 11, color: '#20c997' }
  ];

  function all() {
    return catalog.slice();
  }

  function get(id) {
    return catalog.find(function find(item) { return item.id === id; }) || null;
  }

  function bySlot(slot) {
    return catalog.filter(function filter(item) { return item.slot === slot; });
  }

  return Object.freeze({ all, get, bySlot });
})();
