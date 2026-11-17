import { useState } from 'react';
import { tasks as initialTasks, categories } from './data.js';
import { createInitialFilters } from './variant.js';
import TaskForm from './components/TaskForm.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskList from './components/TaskList.jsx';
import TaskStats from './components/TaskStats.jsx';
import { addTask, updateTask, toggleTask, removeTask, selectTasks, getTaskStats } from './domain/task-service.js';

export default function App() {
  const [tasks, setTasks] = useState(() => initialTasks.map(task => ({ ...task })));
  const [filters, setFilters] = useState(createInitialFilters);
  const [editingId, setEditingId] = useState(null);
  const visibleTasks = selectTasks(tasks, filters);
  const stats = getTaskStats(tasks);
  const editingTask = tasks.find(task => task.id === editingId) ?? null;
  const [notice, setNotice] = useState('');
  function save(value) {
    if (editingId !== null) {
      if (!editingTask) return false;
      setTasks(previous => updateTask(previous, editingId, value));
      setEditingId(null);
    } else {
      setTasks(previous => addTask(previous, value, Math.max(0, ...previous.map(task => task.id)) + 1));
    }
    setNotice('Задача сохранена.');
    return true;
  }
  function remove(id) {
    const task = tasks.find(item => item.id === id);
    if (!task || !window.confirm(`Удалить «${task.title}»?`)) return;
    setTasks(previous => removeTask(previous, id));
    if (editingId === id) setEditingId(null);
    setNotice('Задача удалена.');
  }
  function toggle(id) {
    setTasks(previous => toggleTask(previous, id));
    setNotice('Статус задачи изменён.');
  }
  return (
    <main>
      <h1>Задачи на React</h1>
      <p>ПР7: данные в памяти. Обновление страницы восстанавливает исходный набор.</p>
      <p role="status">{notice}</p>
      <TaskStats stats={stats} />
      <TaskFilters filters={filters} categories={categories} onChange={setFilters} />
      <TaskForm key={editingId ?? 'new'} categories={categories} initialTask={editingTask} onSave={save} onCancel={() => setEditingId(null)} />
      <TaskList tasks={visibleTasks} categories={categories} onToggle={toggle} onEdit={setEditingId} onDelete={remove} />
    </main>
  );
}
