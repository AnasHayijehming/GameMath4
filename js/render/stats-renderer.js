window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.Stats = (function () {
  'use strict';

  const labels = {
    addition: 'บวก',
    subtraction: 'ลบ',
    multiplication: 'คูณ',
    division: 'หาร',
    fraction: 'เศษส่วน',
    decimal: 'ทศนิยม',
    word_problem: 'โจทย์ปัญหา',
    geometry: 'เรขาคณิต'
  };

  function render() {
    const state = Game.State.get();
    const totals = Object.keys(labels).reduce(function sum(acc, topic) {
      const row = state.stats.correctByTopic[topic] || { correct: 0, total: 0 };
      acc.correct += row.correct;
      acc.total += row.total;
      return acc;
    }, { correct: 0, total: 0 });
    const ownedCount = state.inventory.owned.length;
    const itemCount = Game.Data.Items.all().length;
    return `<div class="screen">
      <section class="modal">
        <h2>สถิติของ ${Game.Infra.Util.escapeHtml(state.player.name)}</h2>
        <p>เวลาเล่นรวม: ${Game.Infra.Util.formatTime(state.stats.totalPlayTimeMs)}</p>
        <p>ตอบถูกทั้งหมด: ${totals.correct}/${totals.total} ข้อ (${percent(totals.correct, totals.total)}%)</p>
        <div class="stat-bars">${Object.keys(labels).map(function map(topic) {
          const row = state.stats.correctByTopic[topic] || { correct: 0, total: 0 };
          const pct = percent(row.correct, row.total);
          return `<div class="stat-row"><strong>${labels[topic]}</strong><div class="bar"><span style="width:${pct}%"></span></div><span>${pct}%</span></div>`;
        }).join('')}</div>
        <p>Boss ที่ชนะแล้ว: ${state.bossDefeated.length}</p>
        <p>เหรียญสะสมรวม: ${state.stats.totalCoinsEarned} | ใช้ไป: ${state.stats.totalCoinsSpent}</p>
        <p>ไอเทมที่มี: ${ownedCount}/${itemCount}</p>
        <div class="button-row"><button data-action="cancel">กลับ</button></div>
      </section>
    </div>`;
  }

  function percent(correct, total) {
    return total ? Math.round((correct / total) * 1000) / 10 : 0;
  }

  return Object.freeze({ render });
})();
