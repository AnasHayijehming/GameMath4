window.Game = window.Game || {};
Game.Scenes = Game.Scenes || {};

Game.Scenes.Quiz = (function () {
  'use strict';

  let result = null;
  let secondsLeft = 0;
  let timerId = null;
  let draftAnswer = '';
  let feedback = '';

  const scene = {
    id: 'quiz',
    enter(params) {
      result = null;
      draftAnswer = '';
      feedback = '';
      const active = Game.Systems.Quiz.start(params || {});
      const zone = Game.Data.Zones.get(active.context.zoneId);
      const multiplier = Game.State.get().settings.timerMultiplier || 1;
      secondsLeft = Math.ceil(Game.Systems.Quiz.durationFor(zone.quiz.difficulty) * multiplier);
      timerId = setInterval(function tick() {
        if (result) return;
        secondsLeft -= 1;
        if (secondsLeft <= 0) {
          finish(Game.Systems.Quiz.timeout());
        } else {
          Game.SceneManager.requestRender();
        }
      }, 1000);
    },
    exit() {
      clearInterval(timerId);
      timerId = null;
      draftAnswer = '';
      feedback = '';
      Game.Systems.Quiz.clear();
    },
    render() {
      return Game.Render.Quiz.render(Game.Systems.Quiz.current(), secondsLeft, result, { draftAnswer, feedback });
    },
    bind(root) {
      root.querySelectorAll('[data-quiz-choice]').forEach(function each(button) {
        button.addEventListener('click', function onChoice() {
          if (result) return;
          finish(Game.Systems.Quiz.submit(button.getAttribute('data-quiz-choice')));
        });
      });
      const hint = root.querySelector('[data-quiz-hint]');
      if (hint) hint.addEventListener('click', function onHint() {
        const used = Game.Systems.Quiz.useHint();
        const active = Game.Systems.Quiz.current();
        feedback = used
          ? active.question.hint || 'ลองแยกโจทย์เป็นขั้นตอนเล็กๆ'
          : 'เหรียญไม่พอสำหรับ Hint';
        Game.SceneManager.requestRender();
      });
      const form = root.querySelector('[data-quiz-form]');
      if (form) {
        const answer = form.elements.answer;
        answer.addEventListener('input', function onInput() {
          draftAnswer = answer.value;
        });
        form.addEventListener('submit', function onSubmit(event) {
          event.preventDefault();
          if (result) return;
          draftAnswer = form.answer.value;
          finish(Game.Systems.Quiz.submit(draftAnswer));
        });
        if (!result && Game.State.get().settings.typingMode) {
          answer.focus();
          answer.setSelectionRange(answer.value.length, answer.value.length);
        }
      }
    },
    handleInput(action) {
      if (action === 'confirm' && result) {
        Game.SceneManager.goTo('overworld');
      }
      if (action === 'cancel' && !result) {
        Game.EventBus.emit('quiz:completed', { correct: false, reward: { coins: 0, exp: 0 }, fled: true });
        Game.SceneManager.goTo('overworld', { message: 'หนีจากการต่อสู้แล้ว' });
      }
    }
  };

  function finish(outcome) {
    result = outcome;
    feedback = '';
    clearInterval(timerId);
    timerId = null;
    Game.Storage.save(Game.State.get());
    Game.SceneManager.requestRender();
  }

  return scene;
})();
