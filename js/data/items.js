window.Game = window.Game || {};
Game.Data = Game.Data || {};

Game.Data.Items = (function () {
  'use strict';

  const slotLabels = Object.freeze({
    hat: 'หมวก',
    clothes: 'เสื้อผ้า',
    shoes: 'รองเท้า',
    accessory: 'อุปกรณ์',
    glasses: 'แว่นตา'
  });

  const slotOrder = Object.freeze(['hat', 'clothes', 'shoes', 'accessory', 'glasses']);

  const rarityTiers = Object.freeze([
    { id: 'starter', label: 'เริ่มต้น', min: 0, className: 'starter' },
    { id: 'common', label: 'ทั่วไป', min: 1, className: 'common' },
    { id: 'uncommon', label: 'พิเศษ', min: 20, className: 'uncommon' },
    { id: 'rare', label: 'หายาก', min: 50, className: 'rare' },
    { id: 'epic', label: 'ตำนาน', min: 90, className: 'epic' }
  ]);

  const catalog = [
    { id: 'clothes_basic', slot: 'clothes', name: 'เสื้อพื้นฐาน', price: 0, requiredLevel: 1, color: '#3da5ff' },
    { id: 'hat_beanie', slot: 'hat', name: 'หมวกไหมพรม', price: 2, requiredLevel: 1, color: '#ff6b6b' },
    { id: 'hat_straw', slot: 'hat', name: 'หมวกฟาง', price: 5, requiredLevel: 1, color: '#e4bf55' },
    { id: 'hat_cap_green', slot: 'hat', name: 'หมวกแก๊ปใบไม้', price: 8, requiredLevel: 2, color: '#42b883' },
    { id: 'hat_witch', slot: 'hat', name: 'หมวกแม่มด', price: 32, requiredLevel: 5, color: '#805ad5' },
    { id: 'hat_crown', slot: 'hat', name: 'มงกุฎทอง', price: 70, requiredLevel: 8, color: '#ffd43b' },
    { id: 'hat_knight', slot: 'hat', name: 'หมวกอัศวิน', price: 95, requiredLevel: 10, color: '#adb5bd' },
    { id: 'clothes_red', slot: 'clothes', name: 'เสื้อแดงกล้าหาญ', price: 4, requiredLevel: 1, color: '#ff6b6b' },
    { id: 'clothes_green', slot: 'clothes', name: 'เสื้อเขียวป่า', price: 4, requiredLevel: 1, color: '#51cf66' },
    { id: 'clothes_yellow', slot: 'clothes', name: 'เสื้อเหลืองเมือง', price: 10, requiredLevel: 4, color: '#ffd43b' },
    { id: 'clothes_pirate', slot: 'clothes', name: 'ชุดโจรสลัด', price: 36, requiredLevel: 6, color: '#343a40' },
    { id: 'clothes_knight', slot: 'clothes', name: 'ชุดอัศวิน', price: 60, requiredLevel: 9, color: '#ced4da' },
    { id: 'clothes_mage', slot: 'clothes', name: 'เสื้อคลุมเวท', price: 85, requiredLevel: 10, color: '#be4bdb' },
    { id: 'shoes_sneaker', slot: 'shoes', name: 'รองเท้าผ้าใบ', price: 3, requiredLevel: 1, color: '#495057' },
    { id: 'shoes_boots', slot: 'shoes', name: 'บูตเดินป่า', price: 12, requiredLevel: 3, color: '#8d5524' },
    { id: 'shoes_city', slot: 'shoes', name: 'รองเท้าเมือง', price: 22, requiredLevel: 5, color: '#1c7ed6' },
    { id: 'shoes_magic', slot: 'shoes', name: 'รองเท้าเวทมนตร์', price: 66, requiredLevel: 10, color: '#f06595' },
    { id: 'shoes_gold', slot: 'shoes', name: 'รองเท้าทอง', price: 120, requiredLevel: 12, color: '#fab005' },
    { id: 'accessory_sword', slot: 'accessory', name: 'ดาบไม้', price: 9, requiredLevel: 2, color: '#868e96' },
    { id: 'accessory_flower', slot: 'accessory', name: 'ดอกไม้', price: 4, requiredLevel: 1, color: '#f06595' },
    { id: 'accessory_umbrella', slot: 'accessory', name: 'ร่มสีฟ้า', price: 24, requiredLevel: 5, color: '#74c0fc' },
    { id: 'accessory_wand', slot: 'accessory', name: 'ไม้กายสิทธิ์', price: 54, requiredLevel: 8, color: '#7950f2' },
    { id: 'accessory_staff', slot: 'accessory', name: 'คทาปราสาท', price: 100, requiredLevel: 10, color: '#ffd43b' },
    { id: 'glasses_round', slot: 'glasses', name: 'แว่นกลม', price: 6, requiredLevel: 1, color: '#212529' },
    { id: 'glasses_sun', slot: 'glasses', name: 'แว่นดำ', price: 25, requiredLevel: 4, color: '#111' },
    { id: 'glasses_star', slot: 'glasses', name: 'แว่นดาว', price: 40, requiredLevel: 6, color: '#ffec99' },
    { id: 'glasses_mask', slot: 'glasses', name: 'หน้ากาก', price: 58, requiredLevel: 8, color: '#e03131' },
    { id: 'glasses_crystal', slot: 'glasses', name: 'แว่นคริสตัล', price: 90, requiredLevel: 10, color: '#91a7ff' },
    { id: 'hat_flame', slot: 'hat', name: 'มงกุฎเปลวไฟ', price: 110, requiredLevel: 11, color: '#ff7f11' },
    { id: 'accessory_shield', slot: 'accessory', name: 'โล่คณิต', price: 115, requiredLevel: 11, color: '#20c997' }
  ];

  const descriptions = Object.freeze({
    hat_beanie: 'หมวกนุ่ม ๆ สำหรับนักผจญภัยมือใหม่',
    hat_straw: 'เข้ากับป่าและทุ่งหญ้า ดูสบายตา',
    hat_cap_green: 'หมวกแก๊ปสีใบไม้สำหรับสายสำรวจ',
    hat_witch: 'หมวกทรงสูงที่ทำให้ลุคดูเป็นจอมเวท',
    hat_crown: 'มงกุฎทองสำหรับนักแก้โจทย์ระดับสูง',
    hat_knight: 'หมวกเหล็กของผู้กล้าในปราสาท',
    hat_flame: 'มงกุฎเปลวไฟสำหรับแชมป์คณิตศาสตร์',
    clothes_basic: 'ชุดพื้นฐาน ใส่ติดตัวเสมอ',
    clothes_red: 'เสื้อแดงสด เพิ่มความมั่นใจตอนตอบโจทย์',
    clothes_green: 'เสื้อสีป่า เหมาะกับการเรียนรู้ธรรมชาติ',
    clothes_yellow: 'เสื้อเมืองสว่าง ๆ เห็นเด่นบนแผนที่',
    clothes_pirate: 'ชุดโจรสลัดสำหรับภารกิจล่าสมบัติ',
    clothes_knight: 'เกราะอัศวินที่ดูแข็งแรงและสง่างาม',
    clothes_mage: 'เสื้อคลุมเวทสำหรับผู้เชี่ยวชาญโจทย์ยาก',
    shoes_sneaker: 'เดินคล่องตัวในทุกโซน',
    shoes_boots: 'บูตเดินป่าพร้อมลุยทางไกล',
    shoes_city: 'รองเท้าสีเมือง ดูเรียบร้อยและทันสมัย',
    shoes_magic: 'รองเท้าเวทมนตร์มีประกายตอนสวมใส่',
    shoes_gold: 'รองเท้าทองสำหรับนักสะสมตัวจริง',
    accessory_sword: 'ดาบไม้ปลอดภัยสำหรับนักผจญภัยเด็ก',
    accessory_flower: 'ดอกไม้สีสด เติมความเป็นมิตร',
    accessory_umbrella: 'ร่มสีฟ้าสำหรับวันที่ฝนตกในจินตนาการ',
    accessory_wand: 'ไม้กายสิทธิ์สำหรับเสกคำตอบที่ถูกต้อง',
    accessory_staff: 'คทาปราสาทสำหรับบทเรียนระดับสูง',
    accessory_shield: 'โล่คณิต ปกป้องความพยายามของผู้เล่น',
    glasses_round: 'แว่นกลมช่วยให้ดูตั้งใจเรียน',
    glasses_sun: 'แว่นดำเท่ ๆ สำหรับเดินเมือง',
    glasses_star: 'แว่นดาว สดใสและจำง่าย',
    glasses_mask: 'หน้ากากฮีโร่นักคิดเลข',
    glasses_crystal: 'แว่นคริสตัลประกายพิเศษ'
  });

  function rarityFor(item) {
    let selected = rarityTiers[0];
    rarityTiers.forEach(function each(tier) {
      if (item.price >= tier.min) selected = tier;
    });
    return selected;
  }

  function describe(item) {
    return descriptions[item.id] || `${slotLabels[item.slot] || 'ไอเทม'}สำหรับแต่งตัวละคร`;
  }

  function withMeta(item) {
    if (!item) return null;
    const rarity = rarityFor(item);
    return Object.assign({}, item, {
      slotLabel: slotLabels[item.slot] || item.slot,
      rarity,
      description: describe(item)
    });
  }

  function all() {
    return catalog.map(withMeta);
  }

  function get(id) {
    return withMeta(catalog.find(function find(item) { return item.id === id; }) || null);
  }

  function bySlot(slot) {
    return catalog.filter(function filter(item) { return item.slot === slot; }).map(withMeta);
  }

  function slots() {
    return slotOrder.map(function map(id) {
      return { id, label: slotLabels[id] };
    });
  }

  return Object.freeze({ all, get, bySlot, slots });
})();
