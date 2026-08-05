// LocalStorage To-do app (vanilla JS)
const STORAGE_KEY = 'todo-tasks:v1';

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const listEl = document.getElementById('task-list');
const countEl = document.getElementById('count');
const filters = document.querySelectorAll('.filter');
const clearBtn = document.getElementById('clear-completed');

let tasks = [];
let filter = 'all';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    tasks = [];
    console.error('Failed to parse tasks', e);
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  listEl.innerHTML = '';
  const visible = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  visible.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    const check = document.createElement('button');
    check.className = 'check';
    check.setAttribute('aria-label', task.completed ? 'Mark as active' : 'Mark as completed');
    check.innerHTML = task.completed ? '✓' : '';

    check.addEventListener('click', () => toggle(task.id));

    const text = document.createElement('div');
    text.className = 'text';
    text.textContent = task.text;
    text.title = 'Double-click to edit';

    text.addEventListener('dblclick', () => startEdit(task.id, text));

    const actions = document.createElement('div');
    actions.className = 'actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.innerText = 'Edit';
    editBtn.addEventListener('click', () => startEdit(task.id, text));

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn';
    delBtn.style.color = 'var(--danger)';
    delBtn.innerText = 'Delete';
    delBtn.addEventListener('click', () => removeTask(task.id));

    actions.append(editBtn, delBtn);
    li.append(check, text, actions);
    listEl.appendChild(li);
  });

  const remaining = tasks.filter(t => !t.completed).length;
  countEl.textContent = `${remaining} item${remaining !== 1 ? 's' : ''} left`;
}

function addTask(text) {
  const t = {
    id: Date.now().toString(),
    text: text.trim(),
    completed: false
  };
  if (!t.text) return;
  tasks.unshift(t); // newest on top
  save();
  render();
}

function toggle(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  save();
  render();
}

function removeTask(id) {
  tasks = tasks.filter(x => x.id !== id);
  save();
  render();
}

function startEdit(id, textEl) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;

  const input = document.createElement('input');
  input.className = 'edit-input';
  input.value = t.text;
  textEl.replaceWith(input);
  input.focus();
  input.select();

  function finish(saveEdit) {
    if (saveEdit) {
      const val = input.value.trim();
      if (val) t.text = val;
      else removeTask(id);
    }
    save();
    render();
  }

  input.addEventListener('blur', () => finish(true));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      input.blur();
    } else if (e.key === 'Escape') {
      finish(false);
    }
  });
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  save();
  render();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = input.value;
  if (val.trim()) {
    addTask(val);
    input.value = '';
  }
});

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filter = btn.dataset.filter;
    render();
  });
});

clearBtn.addEventListener('click', () => {
  clearCompleted();
});

// initialize
load();
render();