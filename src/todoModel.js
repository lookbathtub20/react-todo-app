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
    return Array.isArray(todos) ? todos : [];
  } catch {
    return [];
  }
}

export function addTodo(todos, title, id = crypto.randomUUID()) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return todos;
  return [{ id, title: trimmedTitle, completed: false }, ...todos];
}

export function toggleTodo(todos, id) {
  return todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
}

export function deleteTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id);
}

export function getVisibleTodos(todos, filter) {
  if (filter === 'Active') return todos.filter((todo) => !todo.completed);
  if (filter === 'Completed') return todos.filter((todo) => todo.completed);
  return todos;
}

export function countRemainingTodos(todos) {
  return todos.filter((todo) => !todo.completed).length;
}
