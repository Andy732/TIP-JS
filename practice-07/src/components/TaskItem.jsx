export default function TaskItem({ task, categoryName, onToggle, onEdit, onDelete }) {
  const priorities = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };
  return <li className="task-card">
    <strong>{task.title}</strong>
    <p>{task.completed ? 'Выполнена' : 'В работе'} · {priorities[task.priority]} · {categoryName}</p>
    <button type="button" onClick={() => onToggle(task.id)}>{task.completed ? 'Вернуть в работу' : 'Завершить'}</button>
    <button type="button" onClick={() => onEdit(task.id)}>Редактировать</button>
    <button type="button" onClick={() => onDelete(task.id)}>Удалить</button>
  </li>;
}
