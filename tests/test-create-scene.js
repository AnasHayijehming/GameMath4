(function () {
  'use strict';

  const results = document.getElementById('results');
  const tests = [];

  function test(name, fn) {
    tests.push({ name, fn });
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'assertion failed');
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error((message || 'value mismatch') + ': expected ' + expected + ', got ' + actual);
    }
  }

  function renderResult(name, error) {
    const row = document.createElement('li');
    row.className = error ? 'fail' : 'pass';
    row.textContent = error ? name + ': ' + error.message : name + ': passed';
    results.appendChild(row);
  }

  test('create scene keeps drafted name and gender after rerender', function () {
    const host = document.createElement('div');
    document.body.appendChild(host);

    Game.Scenes.Create.enter();
    host.innerHTML = Game.Scenes.Create.render();
    Game.Scenes.Create.bind(host);

    const form = host.querySelector('[data-create-form]');
    form.elements.playerName.value = 'เด็กทดสอบ 01';
    form.elements.playerName.dispatchEvent(new Event('input', { bubbles: true }));
    form.elements.gender.value = 'male';
    form.elements.gender.dispatchEvent(new Event('change', { bubbles: true }));

    host.innerHTML = Game.Scenes.Create.render();
    Game.Scenes.Create.bind(host);

    assertEqual(host.querySelector('[name="playerName"]').value, 'เด็กทดสอบ 01', 'draft name should survive rerender');
    assertEqual(host.querySelector('[name="gender"]').value, 'male', 'draft gender should survive rerender');
    assert(host.querySelector('.item-preview svg'), 'preview should still render');

    host.remove();
  });

  tests.forEach(function each(entry) {
    try {
      entry.fn();
      renderResult(entry.name);
    } catch (error) {
      console.error(entry.name, error);
      renderResult(entry.name, error);
    }
  });
})();
