// Общий контрольный набор. Для своего варианта ниже предусмотрен отдельный массив.
// Идентификатор задачи не совпадает с её индексом в массиве.
export const demoTasks = [
    { id: 1, title: "Изучить функции", completed: true, priority: "medium" },
    { id: 4, title: "Подготовить модель задач", completed: false, priority: "high" },
    { id: 7, title: "Проверить методы массивов", completed: false, priority: "low" },
    { id: 10, title: "Оформить README", completed: true, priority: "medium" },
];

// Вариант 1: подготовка учебного проекта. Выполнено изначально 0 задач (K = 0).
export const variantNumber = 1;
export const variantTasks = [
    { id: 11, title: "Выбрать тему учебного проекта", completed: false, priority: "high" },
    { id: 23, title: "Составить план работы", completed: false, priority: "medium" },
    { id: 37, title: "Собрать требования к проекту", completed: false, priority: "medium" },
    { id: 41, title: "Подготовить структуру репозитория", completed: false, priority: "low" },
    { id: 58, title: "Написать документацию проекта", completed: false, priority: "medium" },
    { id: 64, title: "Подготовить презентацию результатов", completed: false, priority: "high" },
];