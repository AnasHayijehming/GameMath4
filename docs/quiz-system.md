# ระบบโจทย์ (Quiz System) — เอกสารอ้างอิง

## ภาพรวม

ระบบโจทย์ทำงานผ่านไฟล์หลัก 4 ไฟล์:

| ไฟล์ | หน้าที่ |
|------|--------|
| `js/data/game-config.js` | ค่า config ส่วนกลาง (reward, timer, mode) |
| `js/data/zones.js` | config ของแต่ละแผนที่ (difficulty, topics, constraints) |
| `js/data/quiz-bank.js` | คลังโจทย์ปัญหาสำเร็จรูป (word_problem, geometry) |
| `js/data/quiz-generators.js` | สร้างโจทย์ตัวเลขแบบ procedural |
| `js/systems/quiz.js` | logic หลัก: เลือกโจทย์, ตรวจคำตอบ, คำนวณรางวัล |

---

## โหมดระดับโจทย์ (Question Level Mode)

ตั้งค่าได้ใน Settings → ส่งผลกับช่วงตัวเลขของโจทย์ที่สร้างสด (Generated เท่านั้น)

| โหมด | ช่วงตัวเลข | ตัวเลข | Reward Bonus |
|------|-----------|--------|-------------|
| **เริ่มต้น** (beginner) | 1 – 99 | 1–2 หลัก | +0 เหรียญ/EXP |
| **เก่ง** (skilled) | 10 – 999 | 2–3 หลัก | +2 เหรียญ/EXP |
| **เชี่ยวชาญ** (expert) | 100 – 9,999 | 3–4 หลัก | +4 เหรียญ/EXP |

> **หมายเหตุ:** โจทย์ปัญหา (word_problem) และเรขาคณิต (geometry) จากคลังสำเร็จรูปไม่เปลี่ยนแปลงตามโหมด

---

## แผนที่และโจทย์ (Zones)

### ป่ามหัศจรรย์ (Forest)

| รายการ | ค่า |
|--------|-----|
| Difficulty | `easy` |
| วิชา (กล่อง) | บวก, ลบ |
| Timer | 20 วินาที |
| Zone Multiplier | 1× |
| เปิดที่ Level | 1 |
| Constraints | ไม่มี |

### เมืองตัวเลข (City)

| รายการ | ค่า |
|--------|-----|
| Difficulty | `medium` |
| วิชา (กล่อง) | คูณ, หาร |
| Timer | 30 วินาที |
| Zone Multiplier | 2× |
| เปิดที่ Level | 3 |
| Constraints | ตัวคูณ/ตัวหาร ≤ 9 (1 หลัก) |

**ตัวอย่างโจทย์ City (expert mode):**
- `4,823 × 7 = ?` — ตัวคูณ 1 หลัก
- `9,156 ÷ 3 = ?` — ตัวหาร 1 หลัก

### ถ้ำปราสาท (Castle)

| รายการ | ค่า |
|--------|-----|
| Difficulty | `hard` |
| วิชา (กล่อง) | บวก, ลบ, คูณ, หาร, เศษส่วน (+/−), ทศนิยม (+/×) |
| Timer | 45 วินาที |
| Zone Multiplier | 3× |
| เปิดที่ Level | 5 |
| Constraints | ตัวคูณ/ตัวหาร ≤ 9 (1 หลัก) |

**เหตุผล Design:** Castle มี 8 topics ครอบคลุมทุกรูปแบบ แต่ยังจำกัดตัวคูณ/หารที่ ≤ 99 เพราะการคูณเลข 3–4 หลักสองตัวเกินขอบเขตการคำนวณในใจที่เหมาะสม

---

## รูปแบบโจทย์ (Question Types)

### แหล่ง A — คลังสำเร็จรูป (`quiz-bank.js`)

ใช้เมื่อ: **NPC พูดคุย**

| ประเภท | จำนวน | Zone | Difficulty |
|--------|-------|------|-----------|
| word_problem | 30 ข้อ | forest (8), city (14), castle (8) | easy/medium/hard |
| geometry | 20 ข้อ | castle (20) | medium/hard |

**โครงสร้าง Object:**
```javascript
{
  id: 'wp_forest_001',
  topic: 'word_problem',
  difficulty: 'easy',
  zone: 'forest',
  question: 'มีแอปเปิล 7 ผล เก็บเพิ่มอีก 5 ผล รวมมีกี่ผล?',
  answer: 12,
  choices: [10, 11, 12, 13],
  hint: 'บวก 7 กับ 5',
  svg: undefined  // มีเฉพาะ geometry
}
```

### แหล่ง B — Generator (`quiz-generators.js`)

ใช้เมื่อ: **กล่องคำถาม (Question Box)**

| Topic key | รูปแบบ | ตัวอย่าง |
|-----------|--------|---------|
| `addition` | `a + b = ?` | `523 + 41 = ?` |
| `subtraction` | `a - b = ?` | `780 - 134 = ?` |
| `multiplication` | `a × b = ?` | `4823 × 7 = ?` |
| `division` | `dividend ÷ b = ?` | `9156 ÷ 12 = ?` |
| `fraction_add` | `a/d + b/d = ?` | `3/8 + 4/8 = ?` |
| `fraction_subtract` | `a/d - b/d = ?` | `7/10 - 3/10 = ?` |
| `decimal_add` | `x.xx + y.xx = ?` | `0.35 + 0.47 = ?` |
| `decimal_multiply` | `x.x × b = ?` | `1.4 × 6 = ?` |

**โครงสร้าง Object:**
```javascript
{
  source: 'generated',
  topic: 'multiplication',
  difficulty: 'hard',
  question: '4823 × 7 = ?',
  answer: 33761,
  choices: [33700, 33761, 33800, 33820],
  hint: 'คิดเป็นการบวกจำนวนเดิมซ้ำหลายครั้ง'
}
```

---

## การเลือกโจทย์ (`quiz.js:chooseQuestion`)

```
NPC    → QuizBank.pick('word_problem', zone.difficulty, zone.id)
กล่อง  → weightedTopic(zone.topicWeights) → Generator.generate(topic, difficulty, constraints)
```

**Topic Weights ต่อ Zone:**

| Zone | Weights |
|------|---------|
| Forest | addition:1, subtraction:1 → 50/50 |
| City | multiplication:1, division:1 → 50/50 |
| Castle | +−×÷ fraction_add/sub decimal_add/mul → แต่ละ 1/8 |

---

## Generator Constraints

กำหนดใน `zones.js` ที่ `zone.quiz.generatorConstraints`:

| Field | ความหมาย | Zone ที่ใช้ |
|-------|---------|-----------|
| `maxSecondOperand` | จำกัดตัวคูณ/ตัวหาร ≤ ค่านี้ | city (9), castle (9) |

ส่งผ่าน `quiz.js:chooseGeneratedQuestion()` → `Generator.generate(topic, difficulty, constraints)`

---

## การคำนวณรางวัล

### สูตร

```
coins = baseCoin × zoneMulti × typingMulti × npcBonus + levelBonus + npcSrc
exp   = baseExp  × zoneMulti × npcBonus              + levelBonus + npcSrc
```

### ค่าแต่ละตัวแปร

| ตัวแปร | ค่า | ที่มา |
|--------|-----|------|
| `baseCoin` | 1 | `game-config.js:economy.baseCoinReward` |
| `baseExp` | 10 | `game-config.js:economy.baseExpReward` |
| `zoneMulti` | 1/2/3 | `zone.multiplier` (forest/city/castle) |
| `typingMulti` | 1 หรือ 2 | เปิด Typing Mode → 2× coins เท่านั้น |
| `npcBonus` | 1–5 | `npc.bonusMultiplier` (boss = 5) |
| `levelBonus` | 0/2/4 | mode: beginner/skilled/expert |
| `npcSrc` | 0 หรือ 1 | source === 'npc' → +1 (ทั้ง coins และ exp) |

### ตัวอย่างรางวัล (ตอบถูก)

| สถานการณ์ | coins | exp |
|-----------|-------|-----|
| Forest กล่อง, beginner | 1×1×1×1 +0 +0 = **1** | 10×1×1 +0 +0 = **10** |
| Forest NPC, beginner | 1×1×1×2 +0 +1 = **3** | 10×1×2 +0 +1 = **21** |
| City กล่อง, skilled | 1×2×1×1 +2 +0 = **4** | 10×2×1 +2 +0 = **22** |
| City NPC, skilled | 1×2×1×2 +2 +1 = **7** | 10×2×2 +2 +1 = **43** |
| Castle Boss, expert | 1×3×1×5 +4 +1 = **20** | 10×3×5 +4 +1 = **155** |
| Castle Boss, expert + Typing | 1×3×2×5 +4 +1 = **35** | 10×3×5 +4 +1 = **155** |

> NPC ได้รางวัลมากกว่ากล่อง +1 เหรียญและ +1 EXP เสมอ (ผ่าน `npcSrc`)

---

## Timer

```
ระยะเวลา = durationsByDifficulty[difficulty] × timerMultiplier
```

| Difficulty | เวลาฐาน | ×1 (ปกติ) | ×1.5 (นานขึ้น) | ×2 (นานมาก) |
|-----------|--------|----------|--------------|------------|
| easy | 20 วิ | 20 วิ | 30 วิ | 40 วิ |
| medium | 30 วิ | 30 วิ | 45 วิ | 60 วิ |
| hard | 45 วิ | 45 วิ | 67 วิ | 90 วิ |

---

## ระบบ Hint

- ราคา: 10 เหรียญ (`game-config.js:economy.hintCost`)
- ใช้ได้ 1 ครั้งต่อโจทย์
- ผล: ปิดใช้งานตัวเลือกผิด 1 ข้อแบบสุ่ม
- แสดงข้อความ `question.hint` บนหน้าจอ

---

## การตรวจคำตอบ (`quiz.js:sameAnswer`)

| กรณี | ตัวอย่าง | ผล |
|------|---------|-----|
| String ตรงกัน | `"12" === "12"` | ✓ |
| ตัวเลขตรงกัน | `12 === 12` | ✓ |
| ทศนิยม ±0.001 | `\|12.001 − 12.000\| < 0.001` | ✓ |
| เศษส่วน | `"5/8" === "5/8"` | ✓ |
| Timeout | `answer === '__timeout__'` | ✗ (ถือว่าผิด) |

---

## NPC ต่อ Zone

| Zone | NPC | ประเภท | bonusMultiplier |
|------|-----|--------|----------------|
| Forest | ครูต้นไม้ | oneTime | 2× |
| Forest | กระต่ายนักคูณ | repeatable | 1× |
| City | พ่อค้าเศษส่วน | oneTime | 2× |
| City | วิศวกรทศนิยม | repeatable | 1× |
| Castle | นักวัดมุม | repeatable | 1× |
| Castle | ราชาเงาคณิต | boss | 5× |

- **oneTime**: ทำได้ครั้งเดียว บันทึกใน `state.npcsCompleted[]`
- **repeatable**: ทำซ้ำได้ไม่จำกัด
- **boss**: ทำได้ครั้งเดียว บันทึกใน `state.bossDefeated[]`

---

## การปลดล็อก Zone

```
forest → Level 1 (เริ่มต้น)
city   → Level 3
castle → Level 5
```

EXP ที่ต้องการ: `level × 50` (เช่น Level 2 ต้องการ 100 EXP)
