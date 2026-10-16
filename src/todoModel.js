export const DEMO_EMAIL = 'student@example.com';
export const DEMO_PASSWORD = 'password123';
export const TODO_STORAGE_KEY = 'daylist.todos';
export const SESSION_STORAGE_KEY = 'daylist.signedIn';

export function validateCredentials(email, password) {
  const normalizedEmail = email.trim();
  if (!normalizedEmail || !password) return 'Please enter your email and password.';
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return 'Please enter a valid email address.';
  if (normalizedEmail.toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return 'That email and password do not match. Try the demo account below.';
  }
  return null;
}

export function parseTodos(serializedTodos) {
  try {
    const todos = JSON.parse(serializedTodos || '[]');
    return Array.isArray(todos) ? todos.filter((todo) => todo && typeof todo === 'object').map((todo) => ({
      id: todo.id || crypto.randomUUID(),
      title: typeof todo.title === 'string' ? todo.title : '',
      completed: Boolean(todo.completed),
      notes: typeof todo.notes === 'string' ? todo.notes : '',
      priority: ['low', 'normal', 'high'].includes(todo.priority) ? todo.priority : 'normal',
      dueDate: typeof todo.dueDate === 'string' ? todo.dueDate : '',
      createdAt: todo.createdAt || '',
    })).filter((todo) => todo.title.trim()) : [];
  } catch {
    return [];
  }
}

export function addTodo(todos, title, options = {}) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return todos;
  const settings = typeof options === 'string' ? { id: options } : options;
  return [{
    id: settings.id || crypto.randomUUID(),
    title: trimmedTitle,
    completed: false,
    notes: settings.notes?.trim() || '',
    priority: ['low', 'normal', 'high'].includes(settings.priority) ? settings.priority : 'normal',
    dueDate: settings.dueDate || '',
    createdAt: settings.createdAt || new Date().toISOString(),
  }, ...todos];
}

export function toggleTodo(todos, id) {
  return todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
}

export function deleteTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id);
}

export function updateTodo(todos, id, updates) {
  return todos.map((todo) => todo.id === id ? { ...todo, ...updates, title: (updates.title ?? todo.title).trim() } : todo);
}

export function clearCompletedTodos(todos) {
  return todos.filter((todo) => !todo.completed);
}

export function getVisibleTodos(todos, filter, { query = '', priority = 'All', sort = 'created' } = {}) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredTodos = todos.filter((todo) => {
    const matchesStatus = filter === 'Active' ? !todo.completed : filter === 'Completed' ? todo.completed : true;
    const matchesPriority = priority === 'All' || todo.priority === priority.toLocaleLowerCase();
    const searchableText = `${todo.title} ${todo.notes || ''}`.toLocaleLowerCase();
    return matchesStatus && matchesPriority && (!normalizedQuery || searchableText.includes(normalizedQuery));
  });

  if (sort === 'dueDate') {
    return filteredTodos.sort((a, b) => (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31'));
  }
  if (sort === 'priority') {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    return filteredTodos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
  return filteredTodos;
}

export function countRemainingTodos(todos) {
  return todos.filter((todo) => !todo.completed).length;
}

export function getDueState(dueDate, completed = false, today = getLocalDateKey()) {
  if (!dueDate || completed) return 'none';
  if (dueDate < today) return 'overdue';
  if (dueDate === today) return 'today';
  return 'upcoming';
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
