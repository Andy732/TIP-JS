import { getTaskStats } from "./task-service.js";

// Здесь создаётся DOM, но не изменяется состояние приложения.
// Контракт карточки, селекторы и тексты описаны в методичке.

const PRIORITY_LABELS = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
};

function createActionButton(action, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = action;

    const labelElement = document.createElement("span");
    labelElement.className = "action-label";
    labelElement.textContent = label;

    button.append(labelElement);
    return button;
}

export function createTaskElement(task) {
    const item = document.createElement("li");
    item.className = "task-card";
    item.dataset.taskId = String(task.id);
    item.classList.toggle("is-completed", task.completed);

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title;

    const status = document.createElement("p");
    status.className = "task-status";
    status.textContent = task.completed ? "Выполнена" : "В работе";

    const priority = document.createElement("p");
    priority.className = "task-priority";
    priority.textContent = PRIORITY_LABELS[task.priority];

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const toggleButton = createActionButton("toggle", "Выполнена");
    toggleButton.setAttribute("aria-pressed", String(task.completed));

    const deleteButton = createActionButton("delete", "Удалить");

    actions.append(toggleButton, deleteButton);
    item.append(title, status, priority, actions);
    return item;
}

export function renderTaskList(listElement, tasks) {
    const items = tasks.map((task) => createTaskElement(task));
    listElement.replaceChildren(...items);
}

export function renderSummary(summaryElement, tasks, visibleCount) {
    const { total, completed, pending, progress } = getTaskStats(tasks);
    const values = {
        total,
        completed,
        pending,
        progress: `${progress.toFixed(1)}%`,
        visible: visibleCount,
    };

    for (const [name, value] of Object.entries(values)) {
        const element = summaryElement.querySelector(`[data-stat="${name}"]`);
        if (element !== null) {
            element.textContent = String(value);
        }
    }
}

export function renderEmptyState(messageElement, total, visibleCount) {
    if (visibleCount > 0) {
        messageElement.textContent = "";
        messageElement.hidden = true;
        return;
    }

    messageElement.textContent =
        total === 0 ? "Список задач пуст." : "Нет задач по выбранному фильтру.";
    messageElement.hidden = false;
}
