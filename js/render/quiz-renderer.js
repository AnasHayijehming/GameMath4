window.Game = window.Game || {};
Game.Render = Game.Render || {};

Game.Render.Quiz = (function () {
  'use strict';

  function render(active, secondsLeft, result, viewState) {
    const view = viewState || {};
    const q = active.question;
    const state = Game.State.get();
    const title = active.context.source === 'monster'
      ? 'มอนสเตอร์ปรากฏ!'
      : active.context.isBoss ? 'ศึกหัวหน้าปราสาท' : active.context.npcName || 'คำถาม';
    const typingMultiplier = Game.Config.economy.typingCoinMultiplier;
    const hintCost = Game.Config.economy.hintCost;
    const body = state.settings.typingMode ? renderTyping(result, view.draftAnswer || '') : renderChoices(active, result, view);
    const hintText = active.usedHint && q.hint ? q.hint : view.feedback || '';
    return `<div class="overlay">
      <section class="modal quiz-question" role="dialog" aria-modal="true">
        <h2>${Game.Infra.Util.escapeHtml(title)}</h2>
        ${active.context.source === 'monster' ? Game.Render.SVG.monster(Game.Data.Zones.get(active.context.zoneId).theme) : ''}
        ${q.svg || ''}
        <div class="question-card">${Game.Infra.Util.escapeHtml(q.question)}</div>
        <div>เวลา: ${Math.max(0, secondsLeft)} วินาที ${state.settings.typingMode ? `| โหมดพิมพ์ตอบ เหรียญ x${typingMultiplier}` : ''}</div>
        ${hintText ? `<div class="toast">${Game.Infra.Util.escapeHtml(hintText)}</div>` : ''}
        ${body}
        ${result ? `<div class="result">${result.correct ? 'ถูกต้อง!' : `ยังไม่ถูก คำตอบคือ ${Game.Infra.Util.escapeHtml(result.answer)}`} ${result.reward.coins ? `ได้ ${result.reward.coins} เหรียญ และ ${result.reward.exp} EXP` : ''}</div>` : ''}
        <div class="button-row">
          ${!result ? `<button class="blue" data-quiz-hint ${active.usedHint ? 'disabled' : ''}>Hint (-${hintCost})</button>
          <button data-action="cancel">B หนี</button>` : `<button class="primary" data-action="confirm">กลับแผนที่</button>`}
        </div>
      </section>
    </div>`;
  }

  function renderChoices(active, result, view) {
    const selectedChoice = view.selectedChoice;
    const answered = !!result;
    return `<div class="choices">${active.question.choices.map(function map(choice) {
      const disabled = result || active.disabledChoices.some(function some(c) { return String(c) === String(choice); });
      const isSelected = selectedChoice !== null && selectedChoice !== undefined && String(selectedChoice) === String(choice);
      const isCorrect = answered && String(choice) === String(result.answer);
      const selectedWrong = answered && isSelected && !result.correct;
      const stateClass = isCorrect ? 'is-correct' : (selectedWrong ? 'is-incorrect' : (isSelected ? 'is-selected' : ''));
      const icon = isCorrect ? '<span class="choice-icon" aria-hidden="true">✓</span>' : (selectedWrong ? '<span class="choice-icon" aria-hidden="true">✕</span>' : '');
      return `<button class="choice ${stateClass}" data-quiz-choice="${Game.Infra.Util.escapeHtml(choice)}" ${disabled ? 'disabled' : ''}>${icon}<span>${Game.Infra.Util.escapeHtml(choice)}</span></button>`;
    }).join('')}</div>`;
  }

  function renderTyping(result, draftAnswer) {
    return `<form class="form-grid" data-quiz-form>
      <label>คำตอบ <input name="answer" inputmode="decimal" autocomplete="off" value="${Game.Infra.Util.escapeHtml(draftAnswer)}" ${result ? 'disabled' : ''}></label>
      <button class="primary" type="submit" ${result ? 'disabled' : ''}>ส่งคำตอบ</button>
    </form>`;
  }

  return Object.freeze({ render });
})();
