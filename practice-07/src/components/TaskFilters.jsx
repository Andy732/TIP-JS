export default function TaskFilters({ filters, categories, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });
  return <section aria-label="Фильтры"><h2>Фильтры</h2><div className="fields">
    <label>Поиск <input value={filters.q} onChange={event => update('q', event.target.value)} /></label>
    <label>Статус <select value={filters.completed} onChange={event => update('completed', event.target.value)}>
      <option value="">Все</option><option value="false">В работе</option><option value="true">Выполнены</option>
    </select></label>
    <label>Приоритет <select value={filters.priority} onChange={event => update('priority', event.target.value)}>
      <option value="">Любой</option><option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option>
    </select></label>
    <label>Категория <select value={filters.categoryId} onChange={event => update('categoryId', event.target.value)}>
      <option value="">Все</option>{categories.map(category => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
    </select></label>
    <button type="button" onClick={() => onChange({ q: '', completed: '', priority: '', categoryId: '' })}>Сбросить фильтры</button>
  </div></section>;
}
