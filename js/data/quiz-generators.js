window.Game = window.Game || {};
Game.Data = Game.Data || {};

Game.Data.QuestionGenerators = (function () {
  'use strict';

  const RNG = Game.Infra.RNG;
  const Util = Game.Infra.Util;

  function rangeFor(difficulty) {
    return {
      easy: [1, 20],
      medium: [10, 99],
      hard: [50, 999]
    }[difficulty] || [1, 20];
  }

  function numericChoices(answer) {
    const choices = new Set([answer]);
    const span = Math.max(4, Math.round(Math.abs(Number(answer)) * 0.2));
    while (choices.size < 4) {
      const offset = RNG.int(-span, span);
      const next = Number(answer) + (offset === 0 ? choices.size : offset);
      if (next >= 0) choices.add(Number.isInteger(answer) ? next : Number(next.toFixed(2)));
    }
    return Util.shuffle(Array.from(choices));
  }

  function gcd(a, b) {
    return b === 0 ? Math.abs(a) : gcd(b, a % b);
  }

  function fraction(n, d) {
    const div = gcd(n, d);
    const nn = n / div;
    const dd = d / div;
    return dd === 1 ? String(nn) : `${nn}/${dd}`;
  }

  function fractionChoices(answer) {
    const choices = new Set([answer]);
    while (choices.size < 4) {
      choices.add(fraction(RNG.int(1, 12), RNG.int(2, 12)));
    }
    return Util.shuffle(Array.from(choices));
  }

  const generators = {
    addition(difficulty) {
      const r = rangeFor(difficulty);
      const a = RNG.int(r[0], r[1]);
      const b = RNG.int(r[0], r[1]);
      const answer = a + b;
      return { topic: 'addition', question: `${a} + ${b} = ?`, answer, choices: numericChoices(answer), hint: 'บวกหลักหน่วยก่อน แล้วค่อยบวกหลักสิบหรือหลักร้อย' };
    },
    subtraction(difficulty) {
      const r = rangeFor(difficulty);
      let a = RNG.int(r[0], r[1]);
      let b = RNG.int(r[0], r[1]);
      if (b > a) {
        const t = a;
        a = b;
        b = t;
      }
      const answer = a - b;
      return { topic: 'subtraction', question: `${a} - ${b} = ?`, answer, choices: numericChoices(answer), hint: 'เอาจำนวนที่น้อยกว่าออกจากจำนวนที่มากกว่า' };
    },
    multiplication(difficulty) {
      const max = difficulty === 'hard' ? 24 : difficulty === 'medium' ? 12 : 9;
      const a = RNG.int(2, max);
      const b = RNG.int(2, max);
      const answer = a * b;
      return { topic: 'multiplication', question: `${a} × ${b} = ?`, answer, choices: numericChoices(answer), hint: 'คิดเป็นการบวกจำนวนเดิมซ้ำหลายครั้ง' };
    },
    division(difficulty) {
      const max = difficulty === 'hard' ? 20 : difficulty === 'medium' ? 12 : 9;
      const answer = RNG.int(2, max);
      const b = RNG.int(2, max);
      const a = answer * b;
      return { topic: 'division', question: `${a} ÷ ${b} = ?`, answer, choices: numericChoices(answer), hint: 'ลองคิดว่าเลขใดคูณกับตัวหารแล้วได้ตัวตั้ง' };
    },
    fraction_add(difficulty) {
      const den = difficulty === 'hard' ? RNG.int(5, 12) : RNG.int(2, 8);
      const a = RNG.int(1, den - 1);
      const b = RNG.int(1, den - 1);
      const answer = fraction(a + b, den);
      return { topic: 'fraction', question: `${a}/${den} + ${b}/${den} = ?`, answer, choices: fractionChoices(answer), hint: 'ตัวส่วนเท่ากัน ให้บวกเฉพาะตัวเศษ' };
    },
    fraction_subtract(difficulty) {
      const den = difficulty === 'hard' ? RNG.int(5, 12) : RNG.int(2, 8);
      const a = RNG.int(2, den);
      const b = RNG.int(1, a - 1);
      const answer = fraction(a - b, den);
      return { topic: 'fraction', question: `${a}/${den} - ${b}/${den} = ?`, answer, choices: fractionChoices(answer), hint: 'ตัวส่วนเท่ากัน ให้ลบเฉพาะตัวเศษ' };
    },
    decimal_add(difficulty) {
      const scale = difficulty === 'hard' ? 100 : 10;
      const a = RNG.int(1, 99) / scale;
      const b = RNG.int(1, 99) / scale;
      const answer = Number((a + b).toFixed(2));
      return { topic: 'decimal', question: `${a} + ${b} = ?`, answer, choices: numericChoices(answer), hint: 'จัดจุดทศนิยมให้ตรงกันก่อนบวก' };
    },
    decimal_multiply(difficulty) {
      const a = RNG.int(2, difficulty === 'hard' ? 30 : 12) / 10;
      const b = RNG.int(2, difficulty === 'hard' ? 20 : 10);
      const answer = Number((a * b).toFixed(2));
      return { topic: 'decimal', question: `${a} × ${b} = ?`, answer, choices: numericChoices(answer), hint: 'คูณเหมือนจำนวนเต็มก่อน แล้วนับตำแหน่งทศนิยม' };
    }
  };

  function generate(topic, difficulty) {
    const fn = generators[topic] || generators.addition;
    return Object.assign({ source: 'generated', difficulty }, fn(difficulty));
  }

  return Object.freeze({ generate, topics: Object.keys(generators) });
})();
