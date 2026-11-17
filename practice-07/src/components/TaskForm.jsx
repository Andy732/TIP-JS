import { useState } from 'react';
import { validateTaskDraft } from '../domain/task-service.js';

export default function TaskForm({ categories, initialTask = null, onSave, onCancel }) {
  const blank = () => ({ title: '', priority: 'medium', categoryId: String(categories[0]?.id ?? '') });
  const [draft, setDraft] = useState(() => initialTask ? { title: initialTask.title, priority: initialTask.priority, categoryId: String(initialTask.categoryId) } : blank());
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const update = (key, value) => setDraft(previous => ({ ...previous, [key]: value }));
  function submit(event) {
    event.preventDefault();
    const result = validateTaskDraft(draft, categories);
    setErrors(result.errors);
    if (!result.valid) { setMessage(''); return; }
    if (!onSave(result.value)) { setMessage('Задачу не удалось сохранить.'); return; }
    setMessage('Задача сохранена.');
    if (!initialTask) setDraft(blank());
  }
  return <section aria-label="Форма задачи"><h2>{initialTask ? 'Редактировать задачу' : 'Новая задача'}</h2>
    <form noValidate onSubmit={submit}>
      <label htmlFor="task-title">Название</label>
      <input id="task-title" value={draft.title} onChange={event => update('title', event.target.value)} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-error' : undefined} />
      {errors.title && <p id="title-error" role="alert">{errors.title}</p>}
      <label htmlFor="task-priority">Приоритет</label>
      <select id="task-priority" value={draft.priority} onChange={event => update('priority', event.target.value)} aria-invalid={Boolean(errors.priority)} aria-describedby={errors.priority ? 'priority-error' : undefined}>
        <option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option>
      </select>
      {errors.priority && <p id="priority-error" role="alert">{errors.priority}</p>}
      <label htmlFor="task-category">Категория</label>
      <select id="task-category" value={draft.categoryId} onChange={event => update('categoryId', event.target.value)} aria-invalid={Boolean(errors.categoryId)} aria-describedby={errors.categoryId ? 'category-error' : undefined}>
        {categories.map(category => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
      </select>
      {errors.categoryId && <p id="category-error" role="alert">{errors.categoryId}</p>}
      <button type="submit">Сохранить</button>
      {initialTask && <button type="button" onClick={onCancel}>Отмена</button>}
      <p role="status">{message}</p>
    </form>
  </section>;
}
