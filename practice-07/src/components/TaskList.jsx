import TaskItem from './TaskItem.jsx';
export default function TaskList({ tasks, categories, onToggle, onEdit, onDelete }) {
  return <section aria-label="Список задач"><h2>Задачи</h2><p>Найдено: {tasks.length}</p>
    {tasks.length === 0 ? <p>По выбранным условиям задач нет.</p> : <ul className="task-list">
      {tasks.map(task => <TaskItem key={task.id} task={task} categoryName={categories.find(c => c.id === task.categoryId)?.name ?? 'Неизвестная категория'} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />)}
    </ul>}
  </section>;
}
