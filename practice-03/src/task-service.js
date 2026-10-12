const PRIORITIES = ["low", "medium", "high"];

function validateId(id) {
    if (!Number.isSafeInteger(id) || id <= 0) {
        return { ok: false, error: "id должен быть положительным целым числом" };
    }
    return { ok: true };
}

function validateTitle(title) {
    if (typeof title !== "string") {
        return { ok: false, error: "Название должно быть строкой" };
    }
    const cleaned = title.trim();
    if (cleaned.length < 1 || cleaned.length > 100) {
        return { ok: false, error: "Длина названия должна быть от 1 до 100 символов" };
    }
    return { ok: true, title: cleaned };
}

export function createTask(id, title, priority = "medium") {
    const idCheck = validateId(id);
    if (!idCheck.ok) return idCheck;

    const titleCheck = validateTitle(title);
    if (!titleCheck.ok) return titleCheck;

    if (!PRIORITIES.includes(priority)) {
        return { ok: false, error: "Приоритет должен быть low, medium или high" };
    }

    return {
        ok: true,
        task: { id, title: titleCheck.title, completed: false, priority },
    };
}

export function findTaskById(tasks, id) {
    return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
    return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
    return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
    const total = tasks.length;
    let completed = 0;
    for (const task of tasks) {
        if (task.completed === true) completed++;
    }
    const pending = total - completed;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, pending, progress };
}

export function addTask(tasks, id, title, priority = "medium") {
    const created = createTask(id, title, priority);
    if (!created.ok) return created;

    if (findTaskById(tasks, id) !== undefined) {
        return { ok: false, error: `Задача с id ${id} уже существует` };
    }
    return { ok: true, tasks: [...tasks, created.task] };
}

export function setTaskCompleted(tasks, id, completed) {
    const idCheck = validateId(id);
    if (!idCheck.ok) return idCheck;

    if (typeof completed !== "boolean") {
        return { ok: false, error: "completed должен быть true или false" };
    }
    if (findTaskById(tasks, id) === undefined) {
        return { ok: false, error: `Задача с id ${id} не найдена` };
    }
    return {
        ok: true,
        tasks: tasks.map((task) => (task.id === id ? { ...task, completed } : task)),
    };
}

export function renameTask(tasks, id, title) {
    const idCheck = validateId(id);
    if (!idCheck.ok) return idCheck;

    const titleCheck = validateTitle(title);
    if (!titleCheck.ok) return titleCheck;

    if (findTaskById(tasks, id) === undefined) {
        return { ok: false, error: `Задача с id ${id} не найдена` };
    }
    return {
        ok: true,
        tasks: tasks.map((task) =>
            task.id === id ? { ...task, title: titleCheck.title } : task
        ),
    };
}

export function removeTask(tasks, id) {
    const idCheck = validateId(id);
    if (!idCheck.ok) return idCheck;

    if (findTaskById(tasks, id) === undefined) {
        return { ok: false, error: `Задача с id ${id} не найдена` };
    }
    return { ok: true, tasks: tasks.filter((task) => task.id !== id) };
}