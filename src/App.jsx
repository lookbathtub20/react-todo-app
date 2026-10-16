import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SESSION_STORAGE_KEY,
  TODO_STORAGE_KEY,
  addTodo as addTodoItem,
  countRemainingTodos,
  clearCompletedTodos,
  deleteTodo as deleteTodoItem,
  getDueState,
  getVisibleTodos,
  parseTodos,
  toggleTodo as toggleTodoItem,
  updateTodo,
  validateCredentials,
} from './todoModel.js';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateCredentials(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    onLogin();
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-heading">
        <a className="brand" href="#home" aria-label="Daylist home">
          <span className="brand-symbol" aria-hidden="true">d.</span> daylist
        </a>
        <div className="login-copy">
          <p className="eyebrow">A clearer kind of day</p>
          <h1 id="login-heading">Make space for<br /><span>what matters.</span></h1>
          <p className="login-intro">A quiet place for your to-dos, your plans, and everything you want to get done.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="username" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary login-button" type="submit">Sign in <span aria-hidden="true">&rarr;</span></button>
        </form>
        <div className="demo-note"><span className="demo-icon" aria-hidden="true">i</span><p><strong>Here to try it out?</strong><br />student@example.com <span className="demo-divider">/</span> password123</p></div>
        <p className="login-legal">A simple demo account, just for you.</p>
      </section>
      <aside className="login-art" aria-label="A calm illustration of a completed task list">
        <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
        <div className="sun-shape" />
        <div className="floating-card card-note"><span className="note-kicker">A note to self</span><strong>Slow is a<br />beautiful pace.</strong><span className="note-line" /></div>
        <div className="floating-card card-task"><span className="card-task-check">&#10003;</span><span>Take a deep breath</span><span className="card-task-star">&#10022;</span></div>
        <div className="art-caption"><span className="caption-dot" /> A softer way to stay on track</div>
      </aside>
    </main>
  );
}

function TaskRow({ todo, onToggle, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [notes, setNotes] = useState(todo.notes || '');
  const [priority, setPriority] = useState(todo.priority || 'normal');
  const [dueDate, setDueDate] = useState(todo.dueDate || '');
  const dueState = getDueState(todo.dueDate, todo.completed);

  function saveEdit(event) {
    event.preventDefault();
    if (!title.trim()) return;
    onUpdate(todo.id, { title, notes, priority, dueDate });
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <form className="task-edit-form" onSubmit={saveEdit}>
        <label className="sr-only" htmlFor={`edit-title-${todo.id}`}>Task title</label>
        <input id={`edit-title-${todo.id}`} value={title} onChange={(event) => setTitle(event.target.value)} required />
        <label className="sr-only" htmlFor={`edit-notes-${todo.id}`}>Notes</label>
        <textarea id={`edit-notes-${todo.id}`} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add a note..." rows="2" />
        <div className="edit-fields">
          <label>Priority <select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select></label>
          <label>Due date <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
        </div>
        <div className="edit-actions"><button className="button button-primary" type="submit">Save changes</button><button className="text-button" type="button" onClick={() => setIsEditing(false)}>Cancel</button></div>
      </form>
    );
  }

  return (
    <article className={todo.completed ? 'todo-item completed' : 'todo-item'}>
      <button className="checkbox-button" onClick={() => onToggle(todo.id)} aria-label={todo.completed ? `Mark ${todo.title} active` : `Mark ${todo.title} completed`} aria-pressed={todo.completed}>
        {todo.completed && <span aria-hidden="true">&#10003;</span>}
      </button>
      <div className="todo-copy">
        <span className="todo-title">{todo.title}</span>
        {todo.notes && <span className="todo-notes">{todo.notes}</span>}
        <span className="task-metadata">
          <span className={`priority-tag priority-${todo.priority || 'normal'}`}>{todo.priority || 'normal'} priority</span>
          {todo.dueDate && <span className={`due-tag due-${dueState}`}>{dueState === 'overdue' ? 'Overdue' : dueState === 'today' ? 'Due today' : `Due ${formatDueDate(todo.dueDate)}`}</span>}
        </span>
      </div>
      <div className="task-actions">
        <button className="edit-button" onClick={() => setIsEditing(true)} aria-label={`Edit ${todo.title}`} title="Edit task">&#9998;</button>
        <button className="delete-button" onClick={() => onDelete(todo.id)} aria-label={`Delete ${todo.title}`} title="Delete task">&times;</button>
      </div>
    </article>
  );
}

function formatDueDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

function TodoPage({ onLogout }) {
  const [todos, setTodos] = useState(() => parseTodos(localStorage.getItem(TODO_STORAGE_KEY)));
  const [newTodo, setNewTodo] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPriority, setNewPriority] = useState('normal');
  const [newDueDate, setNewDueDate] = useState('');
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sort, setSort] = useState('created');
  const searchRef = useRef(null);
  const remainingCount = countRemainingTodos(todos);
  const completedCount = todos.length - remainingCount;
  const overdueCount = todos.filter((todo) => getDueState(todo.dueDate, todo.completed) === 'overdue').length;
  const visibleTodos = useMemo(
    () => getVisibleTodos(todos, filter, { query, priority: priorityFilter, sort }),
    [todos, filter, query, priorityFilter, sort],
  );

  useEffect(() => {
    function handleKeyboardShortcuts(event) {
      const targetTag = event.target?.tagName?.toLowerCase();
      const isTyping = ['input', 'textarea', 'select'].includes(targetTag) || event.target?.isContentEditable;
      if ((event.key === '/' && !isTyping) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape' && document.activeElement === searchRef.current) {
        setQuery('');
        searchRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, []);

  useEffect(() => {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  function handleAddTodo(event) {
    event.preventDefault();
    if (!newTodo.trim()) return;
    setTodos((currentTodos) => addTodoItem(currentTodos, newTodo, {
      notes: newNotes,
      priority: newPriority,
      dueDate: newDueDate,
    }));
    setNewTodo('');
    setNewNotes('');
    setNewPriority('normal');
    setNewDueDate('');
  }

  function handleUpdateTodo(id, updates) {
    setTodos((currentTodos) => updateTodo(currentTodos, id, updates));
  }

  const today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <main className="workspace">
      <aside className="sidebar">
        <a className="brand sidebar-brand" href="#home"><span className="brand-symbol" aria-hidden="true">d.</span> daylist</a>
        <div className="sidebar-label">YOUR SPACE</div>
        <div className="sidebar-nav-item active"><span className="nav-icon" aria-hidden="true">&#9634;</span> My day <span className="nav-count">{todos.length}</span></div>
        {overdueCount > 0 && <div className="overdue-summary">{overdueCount} overdue {overdueCount === 1 ? 'task' : 'tasks'} need attention</div>}
        <div className="sidebar-bottom">
          <div className="sidebar-progress"><span className="progress-ring" aria-hidden="true"><span /></span><div><strong>{completedCount} of {todos.length}</strong><small>tasks completed</small></div></div>
          <div className="sidebar-quote">"You don't have to see the whole staircase, just take the first step."<small>— Martin Luther King Jr.</small></div>
          <button className="logout-button" onClick={onLogout}><span aria-hidden="true">&#8599;</span> Log out</button>
        </div>
      </aside>
      <section className="main-panel" aria-labelledby="todo-heading">
        <header className="workspace-topbar"><div className="mobile-brand"><span className="brand-symbol" aria-hidden="true">d.</span> daylist</div><span className="topbar-date">{today}</span><button className="mobile-logout" onClick={onLogout}>Log out</button></header>
        <div className="todo-content">
          <div className="welcome-line"><span className="welcome-sparkle" aria-hidden="true">&#10022;</span> A FRESH START, EVERY DAY</div>
          <div className="heading-row"><div><p className="eyebrow">Keep it simple. Keep it moving.</p><h1 id="todo-heading">My day<span>.</span></h1><p className="today-date">{today}</p></div><div className="remaining-card"><span className="remaining-count">{remainingCount}</span><span className="remaining-label">{remainingCount === 1 ? 'task' : 'tasks'}<br />to go</span></div></div>
          <form className="add-form" onSubmit={handleAddTodo}>
            <span className="add-icon" aria-hidden="true">+</span>
            <input aria-label="New todo" placeholder="What would you like to get done?" value={newTodo} onChange={(event) => setNewTodo(event.target.value)} />
            <button className="button button-primary add-button" type="submit">Add task <span aria-hidden="true">&rarr;</span></button>
          </form>
          <details className="task-options">
            <summary>Add a note, priority or due date</summary>
            <div className="task-option-fields">
              <label>Note <input value={newNotes} onChange={(event) => setNewNotes(event.target.value)} placeholder="A helpful detail (optional)" /></label>
              <label>Priority <select value={newPriority} onChange={(event) => setNewPriority(event.target.value)}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select></label>
              <label>Due date <input type="date" value={newDueDate} onChange={(event) => setNewDueDate(event.target.value)} /></label>
            </div>
          </details>
          <div className="search-row">
            <label className="search-box">
              <span className="search-icon" aria-hidden="true">&#9906;</span>
              <span className="sr-only">Search tasks</span>
              <input ref={searchRef} type="search" placeholder="Search tasks or notes..." value={query} onChange={(event) => setQuery(event.target.value)} />
              {!query && <kbd>/</kbd>}
              {query && <button type="button" className="clear-search" aria-label="Clear search" onClick={() => setQuery('')}>&times;</button>}
            </label>
            <label className="select-filter"><span className="sr-only">Filter by priority</span><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option value="All">All priorities</option><option value="high">High priority</option><option value="normal">Normal priority</option><option value="low">Low priority</option></select></label>
            <label className="select-filter sort-filter"><span className="sr-only">Sort tasks</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="created">Recently added</option><option value="dueDate">Due date</option><option value="priority">Priority</option></select></label>
          </div>
          <div className="list-toolbar">
            <div className="list-heading"><h2>Your list</h2><span>{visibleTodos.length} of {todos.length}</span></div>
            <div className="list-actions">
              {completedCount > 0 && <button className="text-button clear-completed" onClick={() => setTodos((currentTodos) => clearCompletedTodos(currentTodos))}>Clear completed ({completedCount})</button>}
              <div className="filters" role="group" aria-label="Filter todos">
                {['All', 'Active', 'Completed'].map((option) => <button key={option} className={filter === option ? 'filter-button selected' : 'filter-button'} onClick={() => setFilter(option)} aria-pressed={filter === option}>{option}</button>)}
              </div>
            </div>
          </div>
          <div className="todo-list" aria-live="polite">
            {visibleTodos.length > 0 ? visibleTodos.map((todo) => (
              <TaskRow key={todo.id} todo={todo}
                onToggle={(id) => setTodos((currentTodos) => toggleTodoItem(currentTodos, id))}
                onDelete={(id) => setTodos((currentTodos) => deleteTodoItem(currentTodos, id))}
                onUpdate={handleUpdateTodo}
              />
            )) : (
              <div className="empty-state">
                <span className="empty-icon" aria-hidden="true">&#10022;</span>
                <strong>{query ? 'No matching tasks.' : filter === 'All' ? 'A clear slate.' : `No ${filter.toLowerCase()} tasks.`}</strong>
                <p>{query ? 'Try a different search or clear your filters.' : 'Add a task above and take it one step at a time.'}</p>
              </div>
            )}
          </div>
          <footer className="list-footer"><span><span className="footer-sparkle" aria-hidden="true">&#10022;</span> Small steps add up.</span><span>{remainingCount} {remainingCount === 1 ? 'task' : 'tasks'} remaining</span></footer>
        </div>
        <footer className="page-footer">Make today a little lighter <span aria-hidden="true">&#10022;</span></footer>
      </section>
    </main>
  );
}

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(() => localStorage.getItem(SESSION_STORAGE_KEY) === 'true');

  function handleLogin() {
    localStorage.setItem(SESSION_STORAGE_KEY, 'true');
    setIsSignedIn(true);
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setIsSignedIn(false);
  }

  return isSignedIn ? <TodoPage onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />;
}
