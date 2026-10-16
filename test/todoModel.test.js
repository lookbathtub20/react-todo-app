import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  addTodo,
  countRemainingTodos,
  deleteTodo,
  getVisibleTodos,
  parseTodos,
  toggleTodo,
  validateCredentials,
} from '../src/todoModel.js';

test('login accepts the demo user and rejects missing, malformed, or incorrect credentials', () => {
  assert.equal(validateCredentials(DEMO_EMAIL, DEMO_PASSWORD), null);
  assert.equal(validateCredentials(` ${DEMO_EMAIL} `, DEMO_PASSWORD), null);
  assert.match(validateCredentials('', ''), /enter your email and password/i);
  assert.match(validateCredentials('not-an-email', 'anything'), /valid email/i);
  assert.match(validateCredentials(DEMO_EMAIL, 'wrong'), /do not match/i);
});

test('todo storage parsing handles valid, empty, malformed, and non-array data', () => {
  const todos = [{ id: 'one', title: 'Read', completed: false }];
  assert.deepEqual(parseTodos(JSON.stringify(todos)), todos);
  assert.deepEqual(parseTodos(null), []);
  assert.deepEqual(parseTodos('{broken'), []);
  assert.deepEqual(parseTodos('{"todo":"not a list"}'), []);
});

test('todos can be added, completed, filtered, counted, and deleted', () => {
  const initial = [{ id: 'first', title: 'Plan the week', completed: false }];
  const withSecond = addTodo(initial, '  Water the plants  ', 'second');
  assert.deepEqual(withSecond[0], { id: 'second', title: 'Water the plants', completed: false });
  assert.equal(addTodo(withSecond, '   ', 'empty'), withSecond);

  const completed = toggleTodo(withSecond, 'first');
  assert.equal(completed[1].completed, true);
  assert.deepEqual(getVisibleTodos(completed, 'All'), completed);
  assert.deepEqual(getVisibleTodos(completed, 'Active').map(({ id }) => id), ['second']);
  assert.deepEqual(getVisibleTodos(completed, 'Completed').map(({ id }) => id), ['first']);
  assert.equal(countRemainingTodos(completed), 1);
  assert.deepEqual(deleteTodo(completed, 'second').map(({ id }) => id), ['first']);
});
