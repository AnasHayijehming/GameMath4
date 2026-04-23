window.Game = window.Game || {};
Game.Systems = Game.Systems || {};

Game.Systems.Quiz = (function () {
  'use strict';

  let active = null;

  function start(context) {
    const state = Game.State.get();
    const zoneId = context.zoneId || state.world.currentZone;
    const zone = Game.Data.Zones.get(zoneId);
    const question = chooseQuestion(zone);
    active = {
      context: Object.assign({ zoneId }, context),
      question,
      startedAt: Date.now(),
      usedHint: false,
      disabledChoices: []
    };
    Game.EventBus.emit('quiz:started', { question, context: active.context });
    return active;
  }

  function current() {
    return active;
  }

  function useHint() {
    if (!active || active.usedHint) return false;
    const wrong = active.question.choices.filter(function filter(choice) {
      return !sameAnswer(choice, active.question.answer);
    });
    if (!wrong.length) return false;
    if (!Game.Systems.Economy.spend(Game.Config.economy.hintCost)) return false;
    if (wrong.length) {
      active.disabledChoices = [Game.Infra.RNG.pick(wrong)];
      active.usedHint = true;
      Game.State.update(function update(s) {
        return Object.assign({}, s, {
          stats: Object.assign({}, s.stats, { hintsUsed: s.stats.hintsUsed + 1 })
        });
      });
      Game.SceneManager.requestRender();
    }
    return true;
  }

  function submit(answer) {
    if (!active) return null;
    const state = Game.State.get();
    const q = active.question;
    const correct = sameAnswer(answer, q.answer);
    const zone = Game.Data.Zones.get(active.context.zoneId);
    const economy = Game.Config.economy;
    const multiplier = zone.multiplier;
    const modeMultiplier = state.settings.typingMode ? economy.typingCoinMultiplier : 1;
    const bonus = active.context.bonusMultiplier || 1;
    const reward = correct ? {
      coins: economy.baseCoinReward * multiplier * modeMultiplier * bonus,
      exp: economy.baseExpReward * multiplier * bonus
    } : { coins: 0, exp: 0 };
    updateStats(q.topic, correct);
    if (correct) {
      Game.Systems.Economy.grant(reward.coins);
      Game.Systems.Progression.grantExp(reward.exp);
      completeEncounter();
    }
    Game.EventBus.emit('quiz:answered', { correct, timeTaken: Date.now() - active.startedAt, usedHint: active.usedHint, topic: q.topic });
    Game.EventBus.emit('quiz:completed', { correct, reward, question: q, context: active.context });
    return { correct, reward, answer: q.answer };
  }

  function timeout() {
    return submit('__timeout__');
  }

  function clear() {
    active = null;
  }

  function chooseQuestion(zone) {
    const topic = weightedTopic(zone.quiz.topicWeights);
    if (topic === 'word_problem') return Game.Data.QuizBank.pick('word_problem', zone.quiz.difficulty, zone.id);
    if (topic === 'geometry') return Game.Data.QuizBank.pick('geometry', zone.quiz.difficulty, zone.id);
    return Game.Data.QuestionGenerators.generate(topic, zone.quiz.difficulty);
  }

  function weightedTopic(weights) {
    const entries = Object.keys(weights);
    const total = entries.reduce(function sum(acc, key) { return acc + weights[key]; }, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < entries.length; i += 1) {
      roll -= weights[entries[i]];
      if (roll <= 0) return entries[i];
    }
    return entries[0];
  }

  function updateStats(topic, correct) {
    Game.State.update(function update(s) {
      const row = s.stats.correctByTopic[topic] || { correct: 0, total: 0 };
      const nextByTopic = Object.assign({}, s.stats.correctByTopic, {
        [topic]: { correct: row.correct + (correct ? 1 : 0), total: row.total + 1 }
      });
      return Object.assign({}, s, {
        stats: Object.assign({}, s.stats, { correctByTopic: nextByTopic })
      });
    });
  }

  function completeEncounter() {
    if (!active.context.npcId) return;
    const npc = active.context.npcId;
    Game.State.update(function update(s) {
      const completed = s.npcsCompleted.includes(npc) ? s.npcsCompleted : s.npcsCompleted.concat(npc);
      const bosses = active.context.isBoss && !s.bossDefeated.includes(npc) ? s.bossDefeated.concat(npc) : s.bossDefeated;
      return Object.assign({}, s, { npcsCompleted: completed, bossDefeated: bosses });
    });
  }

  function sameAnswer(a, b) {
    const aa = String(a).trim();
    const bb = String(b).trim();
    if (aa === bb) return true;
    const na = Number(aa);
    const nb = Number(bb);
    return Number.isFinite(na) && Number.isFinite(nb) && Math.abs(na - nb) < 0.001;
  }

  function durationFor(difficulty) {
    return Game.Config.quiz.durationsByDifficulty[difficulty] || Game.Config.quiz.durationsByDifficulty.easy;
  }

  return Object.freeze({ start, current, useHint, submit, timeout, clear, durationFor });
})();
