import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  addTodo,
  clearCompletedTodos,
  countRemainingTodos,
  deleteTodo,
  getDueState,
  getVisibleTodos,
  parseTodos,
  toggleTodo,
  updateTodo,
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
  assert.deepEqual(parseTodos(JSON.stringify(todos)), [{ ...todos[0], notes: '', priority: 'normal', dueDate: '', createdAt: '' }]);
  assert.deepEqual(parseTodos(null), []);
  assert.deepEqual(parseTodos('{broken'), []);
  assert.deepEqual(parseTodos('{"todo":"not a list"}'), []);
});

test('todos can be added, completed, filtered, counted, and deleted', () => {
  const initial = [{ id: 'first', title: 'Plan the week', completed: false }];
  const withSecond = addTodo(initial, '  Water the plants  ', { id: 'second', priority: 'high', dueDate: '2026-10-20', notes: 'Buy soil' });
  assert.deepEqual(withSecond[0], {
    id: 'second', title: 'Water the plants', completed: false, notes: 'Buy soil',
    priority: 'high', dueDate: '2026-10-20', createdAt: withSecond[0].createdAt,
  });
  assert.equal(addTodo(withSecond, '   ', 'empty'), withSecond);

  const completed = toggleTodo(withSecond, 'first');
  assert.equal(completed[1].completed, true);
  assert.deepEqual(getVisibleTodos(completed, 'All'), completed);
  assert.deepEqual(getVisibleTodos(completed, 'Active').map(({ id }) => id), ['second']);
  assert.deepEqual(getVisibleTodos(completed, 'Completed').map(({ id }) => id), ['first']);
  assert.deepEqual(getVisibleTodos(completed, 'All', { query: 'SOIL' }).map(({ id }) => id), ['second']);
  assert.deepEqual(getVisibleTodos(completed, 'All', { priority: 'High' }).map(({ id }) => id), ['second']);
  assert.equal(countRemainingTodos(completed), 1);
  assert.deepEqual(deleteTodo(completed, 'second').map(({ id }) => id), ['first']);
});

test('tasks support editing, due-date and priority sorting, and clearing completed items', () => {
  const todos = [
    { id: 'later', title: 'Later', completed: false, priority: 'low', dueDate: '2026-10-22' },
    { id: 'urgent', title: 'Urgent', completed: false, priority: 'high', dueDate: '2026-10-18' },
    { id: 'done', title: 'Finished', completed: true, priority: 'normal', dueDate: '' },
  ];
  assert.deepEqual(getVisibleTodos(todos, 'All', { sort: 'priority' }).map(({ id }) => id), ['urgent', 'done', 'later']);
  assert.deepEqual(getVisibleTodos(todos, 'All', { sort: 'dueDate' }).map(({ id }) => id), ['urgent', 'later', 'done']);
  assert.deepEqual(updateTodo(todos, 'urgent', { title: '  Call the team  ', notes: 'Before lunch' })[1], {
    ...todos[1], title: 'Call the team', notes: 'Before lunch',
  });
  assert.equal(getDueState('2026-10-15', false, '2026-10-16'), 'overdue');
  assert.equal(getDueState('2026-10-16', false, '2026-10-16'), 'today');
  assert.equal(getDueState('2026-10-20', false, '2026-10-16'), 'upcoming');
  assert.equal(getDueState('2026-10-15', true, '2026-10-16'), 'none');
  assert.deepEqual(clearCompletedTodos(todos).map(({ id }) => id), ['later', 'urgent']);
});
