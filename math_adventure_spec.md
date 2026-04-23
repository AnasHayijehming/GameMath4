# Spec Prompt: Math Adventure — เกมคณิตศาสตร์ผจญภัย ป.4

> ใช้ prompt นี้ส่งต่อให้ AI coding assistant (เช่น Claude Code) เพื่อสร้างเกมทั้งโปรเจกต์

---

## 1. Project Overview

สร้าง **web-based static game** สำหรับเด็กนักเรียนชั้นประถมศึกษาปีที่ 4 (อายุ ~9-10 ปี) แนวผจญภัยแบบ Pokémon เพื่อฝึกคณิตศาสตร์ผ่านการเดินสำรวจโลก เจอคำถาม ตอบถูกสะสมเหรียญและ EXP แล้วนำไปปลดล็อกไอเทมแต่งตัวและโซนใหม่

**กลุ่มเป้าหมาย:** เด็ก ป.4 ไทย (ภาษา UI ทั้งหมดเป็นภาษาไทย)

---

## 2. Tech Stack Constraints (สำคัญ)

- **ต้องเป็น static web เท่านั้น:** HTML + CSS + JavaScript (vanilla)
- **ไม่ใช้ framework** ใดๆ (ไม่มี React, Vue, jQuery, Three.js ฯลฯ)
- **ไม่มี build step** — เปิดไฟล์ `index.html` แล้วเล่นได้ทันที
- **ไม่มี external dependencies** ทุกไฟล์ต้อง self-contained
- **ไม่มีไฟล์ asset ภายนอก** (ไม่ใช้รูป .png, .jpg, ไม่มีไฟล์เสียง)
  - ภาพทั้งหมดสร้างด้วย SVG inline / รูปทรงเรขาคณิต
  - เสียงทั้งหมด synthesize ผ่าน **Web Audio API**
- **Storage:** ใช้ `localStorage` อย่างเดียว
- **Deploy ได้ทุกที่:** GitHub Pages, Netlify static, หรือเปิดไฟล์ตรงๆ จาก filesystem

### Project Structure ที่แนะนำ
```
/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── game.js              (game loop, state)
│   ├── world.js             (map, movement, zones)
│   ├── encounters.js        (NPCs, random encounters)
│   ├── quiz.js              (question engine)
│   ├── quiz-generators.js   (procedural questions)
│   ├── quiz-bank.js         (JSON word problems & geometry)
│   ├── inventory.js         (items, shop)
│   ├── character.js         (player, customization)
│   ├── audio.js             (Web Audio SFX)
│   ├── storage.js           (localStorage wrapper)
│   └── ui.js                (screens, menus)
└── data/
    └── items.js             (shop items catalog as JS const)
```

---

## 3. Visual Design

- **สไตล์:** SVG / รูปทรงเรขาคณิต (วงกลม สี่เหลี่ยม สามเหลี่ยม) สีสันสดใส
- **Palette:** สีสดใสเหมาะกับเด็ก — เขียวสดใส (ป่า), ฟ้า/เหลือง (เมือง), ม่วง/แดงอมส้ม (ถ้ำ)
- **ตัวละคร:** SVG คน stick figure + รูปทรงง่ายๆ สวมไอเทมที่แต่งได้
- **Animation:** ใช้ CSS transitions / SVG `<animate>` เท่าที่จำเป็น เช่น hover, การเดิน bob up-down
- **Font:** web-safe font หรือ system font (ไม่โหลด web fonts)
- **Responsive:** รองรับทั้ง desktop (keyboard) และ tablet/mobile (touch) บนหน้าจอเดียว

---

## 4. Game World Structure

### 4.1 ภาพรวม 3 โซน

| โซน | ธีม | หัวข้อคณิต | ตัวคูณเหรียญ | ปลดล็อกที่ |
|---|---|---|---|---|
| **ป่ามหัศจรรย์** (Forest) | ต้นไม้ สัตว์ป่า | บวก ลบ คูณ หาร (เลขหลัก) | ×1 | เริ่มต้น |
| **เมืองตัวเลข** (City) | ตึก ถนน ร้านค้า | เศษส่วน + ทศนิยม + โจทย์ปัญหาง่าย | ×2 | Level 5 |
| **ถ้ำปราสาท** (Castle) | หิน ปราสาท ภูตผี | เรขาคณิต + โจทย์ปัญหายาก + ผสม | ×3 | Level 10 |

### 4.2 Map & Movement

- แต่ละโซนเป็น **tile-based grid map** ขนาด ~15×10 tiles
- ผู้เล่นเดิน 4 ทิศทาง (บน ล่าง ซ้าย ขวา) ทีละ tile
- มี tiles ประเภทต่างๆ:
  - `floor` เดินผ่านได้
  - `obstacle` ต้นไม้ หิน กำแพง (เดินผ่านไม่ได้)
  - `npc_spot` จุดที่มี NPC ยืนอยู่
  - `portal` จุดเปลี่ยนโซน (ต้องปลดล็อก level ก่อน)
  - `shop` จุดไปร้านค้าแต่งตัว (โซนเมือง)
- มี **grass/encounter tiles** (เช่น หญ้าสูงในป่า) ที่เดินแล้วมีโอกาสสุ่มเจอมอนสเตอร์ (probability ~15% ต่อก้าว)

### 4.3 Zone Progression

- เริ่มต้นปลดล็อกเฉพาะโซนป่า
- ต้องถึง **Level 5** เพื่อปลดล็อกเมือง
- ต้องถึง **Level 10** เพื่อปลดล็อกถ้ำ
- ผู้เล่นเดินทางข้ามโซนผ่าน portal tile
- โหลดฉากใหม่ด้วย SVG แตกต่างกันต่อโซน

---

## 5. Characters & Customization

### 5.1 Player Character

- ตอนเริ่มเกม: กรอกชื่อ + เลือกเพศ (ชาย/หญิง)
- ตัวละครเป็น SVG ประกอบจาก layer หลายชั้น (body → clothes → hat → glasses → hand accessory → shoes)
- เพศต่างกันแค่รูปทรง body เริ่มต้นเท่านั้น (ทรงผม/สี)

### 5.2 Customization Slots (5 ช่อง)

| Slot | ตัวอย่างไอเทม (แต่ละอันเป็น SVG shape) |
|---|---|
| หมวก (hat) | ไม่มี, หมวกไหมพรม, หมวกแม่มด, มงกุฎ, หมวกฟาง |
| เสื้อผ้า (clothes) | เสื้อยืดสีต่างๆ, ชุดอัศวิน, ชุดโจรสลัด |
| รองเท้า (shoes) | ไม่มี, รองเท้าผ้าใบ, บูต, รองเท้าเวทมนตร์ |
| แขนข้าง (accessory) | ไม่มี, ดาบ, ไม้กายสิทธิ์, ร่ม, ดอกไม้ |
| แว่นตา (glasses) | ไม่มี, แว่นกลม, แว่นดำ, หน้ากาก |

- แต่ละ slot มี ~5-8 ตัวเลือก รวมทั้งเกม **≈ 25-30 items**
- ไอเทมเริ่มต้น: ไม่มีอะไรเลย (naked body + เสื้อพื้นฐาน 1 ตัว)
- ราคาไอเทมอยู่ระหว่าง **20-500 เหรียญ** (ง่าย → หายาก)
- ไอเทมบางชิ้นล็อกจนกว่าจะปลดล็อกโซนที่กำหนด
- ซื้อที่ **ร้านค้า** ในโซนเมืองเท่านั้น (กดปุ่ม A บน shop tile)

---

## 6. Math Content Engine

### 6.1 สองแบบผสมกัน

**A) Procedural generation** (ใช้กับ: บวก ลบ คูณ หาร เศษส่วน ทศนิยม)

เขียนเป็น function factory:
```js
// ตัวอย่าง
function genAddition(difficulty) {
  // difficulty: 'easy' | 'medium' | 'hard'
  const range = { easy: [1, 20], medium: [10, 99], hard: [50, 999] }[difficulty];
  const a = randInt(...range);
  const b = randInt(...range);
  return {
    topic: 'addition',
    question: `${a} + ${b} = ?`,
    answer: a + b,
    choices: generateChoices(a + b) // สร้างตัวเลือกผิด 3 ตัว
  };
}
```

ต้องมี generator แยกสำหรับ: `addition`, `subtraction`, `multiplication`, `division`, `fraction_add`, `fraction_subtract`, `decimal_add`, `decimal_multiply` (อย่างน้อย 8 generators)

**B) JSON question bank** (ใช้กับ: โจทย์ปัญหา + เรขาคณิต)

เก็บใน `js/quiz-bank.js` เป็น array of objects:
```js
const wordProblemBank = [
  {
    id: 'wp001',
    topic: 'word_problem',
    difficulty: 'medium',
    zone: 'city',
    question: 'แม่ซื้อส้ม 24 ผล แจกลูก 3 คนเท่าๆ กัน ลูกแต่ละคนได้กี่ผล?',
    answer: 8,
    choices: [6, 7, 8, 9],
    hint: 'ลองใช้การหาร'
  },
  // ... อีกอย่างน้อย 30 ข้อ
];

const geometryBank = [
  {
    id: 'geo001',
    topic: 'geometry',
    difficulty: 'medium',
    zone: 'castle',
    question: 'สี่เหลี่ยมผืนผ้ามีด้านกว้าง 5 ซม. ยาว 8 ซม. มีพื้นที่กี่ตารางเซนติเมตร?',
    answer: 40,
    choices: [13, 26, 40, 48],
    hint: 'พื้นที่สี่เหลี่ยม = กว้าง × ยาว',
    svg: '<svg>...optional shape illustration...</svg>'
  },
  // ... อีกอย่างน้อย 20 ข้อ
];
```

ควรมีอย่างน้อย **50 ข้อ** ใน bank รวม

### 6.2 การกระจายโจทย์ตามโซน

| โซน | generators ที่ใช้ | difficulty |
|---|---|---|
| ป่า | addition, subtraction (easy-medium), multiplication, division basic | easy |
| เมือง | fraction_*, decimal_*, word_problem (medium) | medium |
| ถ้ำ | geometry, word_problem (hard), mixed (คละทุกประเภท) | hard |

---

## 7. Gameplay Loop

### 7.1 การเจอคำถาม (2 แบบ)

**A) NPC fixed encounter**
- NPC ยืนที่จุดประจำบน map (SVG ตัวเล็กๆ สีต่างจากผู้เล่น)
- ผู้เล่นเดินชิดแล้วกดปุ่ม A (ปุ่ม confirm)
- เปิด dialog → แสดงคำถาม
- NPC บางตัว "one-time" ให้เหรียญ bonus ครั้งเดียว
- NPC บางตัว "repeatable" ตอบได้เรื่อยๆ แต่เหรียญน้อยกว่า

**B) Random monster encounter**
- เดินบน grass/encounter tile → trigger ~15% probability
- แสดง "มอนสเตอร์ปรากฏ!" พร้อม SVG มอนสเตอร์ (รูปทรงน่ารัก)
- แสดงคำถาม 1 ข้อ
- ตอบถูก → มอนสเตอร์หายไป + ได้เหรียญ + EXP
- ตอบผิด → มอนสเตอร์หายไป + ไม่ได้อะไร (ไม่มีบทลงโทษ HP)
- ผู้เล่น "หนี" ได้ด้วยปุ่ม B แต่ไม่ได้รางวัล

### 7.2 Quiz Flow (UI)

```
┌──────────────────────────────┐
│  📖 คำถาม (ธีมตามโซน)         │
│                              │
│   25 + 17 = ?                │
│                              │
│  ⏱ เวลา: 20 วินาที            │
│                              │
│  [ 32 ] [ 42 ] [ 38 ] [ 44 ] │  ← 4 ตัวเลือก
│                              │
│  💡 ใช้ Hint (-10 เหรียญ)    │  ← ตัดตัวเลือกผิดออก 1
└──────────────────────────────┘
```

- มีปุ่มโหมด "พิมพ์ตอบ" (typing mode) บน settings screen: ปิด multiple choice → แสดง input box แทน → ได้เหรียญ ×2
- **Timer:** ตามความยาก (easy: 20s, medium: 30s, hard: 45s); เวลาหมด = ถือว่าตอบผิด
- **Hint:** กดใช้ hint = -10 เหรียญ → ตัวเลือกผิด 1 ตัวถูก disable

### 7.3 รางวัลต่อข้อ

```
coins_reward = base_coin × zone_multiplier × mode_multiplier
  base_coin = 1
  zone_multiplier = { forest: 1, city: 2, castle: 3 }
  mode_multiplier = typing_mode ? 2 : 1

exp_reward = zone_multiplier × 10
```

Boss (NPC พิเศษท้ายโซนถ้ำ) ให้รางวัลใหญ่กว่าปกติ 5 เท่า

---

## 8. Progression System

- **Level curve:** EXP ที่ต้องใช้สำหรับ level ถัดไป = `level × 50`
  - Level 1 → 2: 50 EXP
  - Level 5 → 6: 250 EXP
  - Level 10 → 11: 500 EXP
- ปลดล็อกโซน: ถึง Level 5 → เมือง, Level 10 → ถ้ำ
- ปลดล็อกไอเทมในร้าน: บางชิ้นต้อง Level กำหนดก่อนจึงซื้อได้
- แสดง level-up animation + SFX

---

## 9. Controls & UI Layout

### 9.1 Input ที่รองรับ (ทั้งสองพร้อมกัน เสมอ)

| การกระทำ | Keyboard | On-screen |
|---|---|---|
| เดินขึ้น | ↑ หรือ W | ปุ่ม ⬆ |
| เดินลง | ↓ หรือ S | ปุ่ม ⬇ |
| เดินซ้าย | ← หรือ A | ปุ่ม ⬅ |
| เดินขวา | → หรือ D | ปุ่ม ➡ |
| ยืนยัน / คุย / เลือก | Enter หรือ Z | ปุ่ม A |
| ยกเลิก / หนี / เมนู | Escape หรือ X | ปุ่ม B |
| เปิดเมนู/inventory | M | ปุ่ม Menu |

### 9.2 Layout (Responsive)

**Desktop (≥768px):**
```
┌─────────────────────────────────────┐
│   [HUD: Lv 5 | EXP: 120/250 | 💰245]│
│                                     │
│                                     │
│          [ MAP AREA ]               │
│         (SVG เต็มจอกลาง)            │
│                                     │
│                                     │
│ [⬅ ⬆ ⬇ ➡]         [Menu] [B] [A]  │
└─────────────────────────────────────┘
```

**Mobile (<768px):**
```
┌─────────────────┐
│ Lv5 EXP 💰 245 │
│                 │
│   [ MAP AREA ]  │
│                 │
│                 │
│                 │
│ ⬆          [A] │
│⬅ ⬇➡  [Menu][B] │
└─────────────────┘
```

- ปุ่มหน้าจอควร "เปล่งแสง" หรือ animate เวลากด เพื่อ feedback
- ป้องกัน double-tap zoom บน mobile (`touch-action: manipulation`)

### 9.3 Screens หลัก

1. **Title screen** — ปุ่ม "เริ่มเกม" / "โหลดเกม" (ถ้ามี save)
2. **Character creation** — ใส่ชื่อ + เลือกเพศ (แสดงแค่ครั้งแรก)
3. **Map/Overworld** — หน้าเดินสำรวจหลัก
4. **Dialog/Quiz** — overlay เมื่อเจอ NPC หรือมอนสเตอร์
5. **Inventory/Character** — ดู+ใส่ไอเทมที่มี
6. **Shop** — เข้าได้จาก shop tile เท่านั้น
7. **Stats Dashboard** — ดูสถิติ (เปิดจากเมนู)
8. **Settings** — เปิด/ปิด typing mode, เสียง, reset save

---

## 10. Stats Dashboard

แสดงข้อมูลที่สะสมตั้งแต่เริ่มเล่น:

```
📊 สถิติของ [ชื่อผู้เล่น]

⏱ เวลาเล่นรวม:        4 ชั่วโมง 23 นาที
🎯 ตอบถูกทั้งหมด:      234 / 280 ข้อ (83.6%)

แยกตามหัวข้อ:
  ➕ บวก/ลบ:           92%  (46/50)
  ✖  คูณ/หาร:          88%  (35/40)
  ½ เศษส่วน:           75%  (30/40)
  0.5 ทศนิยม:          80%  (24/30)
  💭 โจทย์ปัญหา:        70%  (28/40)
  📐 เรขาคณิต:          78%  (31/40)

🏆 boss ที่เอาชนะแล้ว:   1
💰 เหรียญสะสมรวม:       485
💰 เหรียญที่ใช้ไป:       240
🎨 ไอเทมที่มี:          8 / 28
```

- แสดงเป็น bar chart แบบ SVG พื้นฐาน (bar สีต่างๆ)
- ใช้ข้อมูลจาก `save.stats` ที่ track ตั้งแต่เล่นครั้งแรก

---

## 11. Audio (Web Audio API)

**ไม่มีไฟล์เสียง** — ใช้ OscillatorNode + GainNode สังเคราะห์เอง

SFX ที่ต้องมี:
| Event | เสียง |
|---|---|
| ตอบถูก | เสียงสูงขึ้น 2 โน้ต (E5 → G5, sine wave 100ms) |
| ตอบผิด | เสียงต่ำลง (C4 → A3, square wave 200ms) |
| เก็บเหรียญ | เสียงกริ๊ง (B5 decay short) |
| level up | arpeggio 3-4 โน้ต (C major) |
| เจอมอนสเตอร์ | เสียงตกใจ (sine sweep down) |
| เปิดเมนู/คลิก | เสียงแคล็ก (sine pulse 50ms) |
| เดิน | เสียงเบา (noise burst 30ms) - optional |

มีปุ่ม mute/unmute ใน settings

---

## 12. Data Models (localStorage)

ใช้ key เดียว: `math_adventure_save`

```js
{
  version: "1.0",
  player: {
    name: "น้องแอน",
    gender: "female",
    level: 5,
    exp: 120,
    coins: 245
  },
  world: {
    currentZone: "forest",
    position: { x: 7, y: 4 },
    unlockedZones: ["forest", "city"]
  },
  inventory: {
    owned: ["hat_straw", "shoes_sneaker", "clothes_tshirt_red"],
    equipped: {
      hat: "hat_straw",
      clothes: "clothes_tshirt_red",
      shoes: "shoes_sneaker",
      accessory: null,
      glasses: null
    }
  },
  npcsCompleted: ["forest_npc_01", "forest_npc_02"], // one-time NPCs
  bossDefeated: [],
  stats: {
    totalPlayTimeMs: 15780000,
    correctByTopic: {
      addition: { correct: 46, total: 50 },
      subtraction: { correct: 40, total: 45 },
      multiplication: { correct: 22, total: 25 },
      division: { correct: 13, total: 15 },
      fraction: { correct: 30, total: 40 },
      decimal: { correct: 24, total: 30 },
      word_problem: { correct: 28, total: 40 },
      geometry: { correct: 31, total: 40 }
    },
    totalCoinsEarned: 485,
    totalCoinsSpent: 240,
    hintsUsed: 12,
    sessionsPlayed: 8
  },
  settings: {
    typingMode: false,
    soundEnabled: true,
    lastSavedAt: 1729800000000
  }
}
```

**Auto-save triggers:**
- หลังตอบคำถามทุกครั้ง
- หลังซื้อ/ใส่ไอเทม
- หลังเปลี่ยนโซน
- ทุก 30 วินาทีตอนเดิน (throttle)

มีปุ่ม "Reset ข้อมูล" ใน settings (ต้อง confirm)

---

## 13. Non-Functional Requirements

- **Performance:** 60fps บน tablet ระดับกลาง — ไม่ใช้ heavy SVG filter/gradient ที่ไม่จำเป็น
- **Accessibility:**
  - ปุ่มมีขนาดขั้นต่ำ 44×44px (touch-friendly)
  - สีมี contrast เพียงพอ
  - ใช้ semantic HTML
- **Safety (สำหรับเด็ก):**
  - ไม่มี external link
  - ไม่มี social sharing
  - ไม่เก็บข้อมูลไปที่ไหน (localStorage ล้วน)
- **Error handling:** ถ้า localStorage เต็มหรือถูกปิด แสดง message แนะนำให้เปลี่ยน browser mode
- **Browser support:** Chrome/Safari/Firefox รุ่นไม่เกิน 2 ปี

---

## 14. Development Approach (คำแนะนำสำหรับ AI agent)

ให้สร้างเกมเป็น **iterative milestones** แทนที่จะสร้างครั้งเดียว:

**Milestone 1: Foundation (MVP เดินได้)**
- index.html + CSS base + โครงไฟล์ JS
- Title + character creation screen
- Forest zone map (1 zone) + movement (keyboard + on-screen)
- Save/load localStorage

**Milestone 2: Quiz Engine**
- Procedural generators (+, −, ×, ÷)
- Random encounter + quiz UI
- Timer + multiple choice
- Coins + EXP + level up

**Milestone 3: NPCs + Shop**
- NPC fixed encounters
- Shop UI + ไอเทม 5-10 ชิ้น
- Character SVG composition (layer ไอเทม)

**Milestone 4: Expansion**
- City zone + Castle zone
- Fraction/decimal generators
- Word problem + geometry JSON banks
- Zone unlock gating

**Milestone 5: Polish**
- Stats dashboard
- Web Audio SFX
- Animations
- Typing mode toggle
- Boss encounters

แต่ละ milestone ต้อง **playable** ก่อนไป milestone ถัดไป

---

## 15. Definition of Done

เกมจะถือว่าเสร็จเมื่อ:

- [ ] เปิด `index.html` แล้วเล่นได้บน Chrome/Safari/Firefox
- [ ] ครบ 3 โซน + boss
- [ ] มีอย่างน้อย 8 procedural generators + 50 questions ใน bank
- [ ] มีไอเทมอย่างน้อย 25 ชิ้น
- [ ] Save/load ทำงานถูกต้อง (รวมถึงหลังปิด browser)
- [ ] ทำงานทั้ง keyboard และ touch บนอุปกรณ์จริง
- [ ] Stats dashboard แสดงข้อมูลครบทุกหัวข้อ
- [ ] ไม่มี console error ตอนเล่น
- [ ] ไม่มีการเรียก external resource ใดๆ

---

## Prompt สำหรับส่งต่อให้ AI coding assistant

> คุณคือ senior web developer ช่วยผมสร้างเกมตาม spec ด้านบนนี้ ด้วย vanilla HTML/CSS/JavaScript โดยไม่ใช้ framework หรือ external library ใดๆ ทุกอย่างต้องเป็น static web ที่เปิดไฟล์แล้วเล่นได้ทันที เริ่มจาก Milestone 1 ก่อน และให้ผมเล่นทดสอบได้ก่อนจะไป Milestone ถัดไป โครงสร้างโปรเจกต์ให้เป็นไปตาม spec ที่กำหนด ถ้ามีจุดไหนที่ spec ไม่ชัดให้ถามก่อนจะ implement
