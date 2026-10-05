import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
    findTaskById,
    getPendingTasks,
    getTaskTitles,
    getTaskStats,
    addTask,
    setTaskCompleted,
    renameTask,
    removeTask,
} from "./task-service.js";

function printStats(label, tasks) {
    const { total, completed, pending, progress } = getTaskStats(tasks);
    console.log(`${label}: всего ${total}, выполнено ${completed}, осталось ${pending}`);
    if (total === 0) {
        console.log("Задач пока нет");
    } else {
        console.log(`Прогресс: ${progress.toFixed(1)}%`);
    }
}

console.log("=== Общий сценарий (demoTasks) ===");

let currentTasks = demoTasks;

console.log("Исходные задачи:");
console.table(currentTasks);
console.log("Названия:", getTaskTitles(currentTasks));
console.log("Невыполненные id:", getPendingTasks(currentTasks).map((task) => task.id));
printStats("Исходный набор", currentTasks);

const added = addTask(currentTasks, 20, "Добавить проверку", "high");
if (added.ok) {
    currentTasks = added.tasks;
} else {
    console.error(`Ошибка: ${added.error}`);
}
printStats("После добавления id = 20", currentTasks);

const completedResult = setTaskCompleted(currentTasks, 4, true);
if (completedResult.ok) {
    currentTasks = completedResult.tasks;
} else {
    console.error(`Ошибка: ${completedResult.error}`);
}
printStats("После выполнения id = 4", currentTasks);

const renamed = renameTask(currentTasks, 10, "Подготовить инструкцию запуска");
if (renamed.ok) {
    currentTasks = renamed.tasks;
} else {
    console.error(`Ошибка: ${renamed.error}`);
}
printStats("После переименования id = 10", currentTasks);

const removed = removeTask(currentTasks, 7);
if (removed.ok) {
    currentTasks = removed.tasks;
} else {
    console.error(`Ошибка: ${removed.error}`);
}
printStats("После удаления id = 7", currentTasks);

console.log("Итоговые id:", currentTasks.map((task) => task.id));
console.log("Невыполненная задача:", getPendingTasks(currentTasks));

console.log("--- Обработка отказа ---");
const duplicate = addTask(currentTasks, 4, "Повторная задача");
if (duplicate.ok) {
    currentTasks = duplicate.tasks;
} else {
    console.error(`Ошибка: ${duplicate.error}`);
}
printStats("После неудачного добавления", currentTasks);

console.log("--- Исходный demoTasks не изменился ---");
console.table(demoTasks);
console.log("Задача id = 4 в исходном наборе:", findTaskById(demoTasks, 4));

console.log("");
console.log(`=== Сценарий варианта ${variantNumber} (variantTasks) ===`);

function applyResult(state, result) {
    if (result.ok) {
        return result.tasks;
    }
    console.error(`Ошибка: ${result.error}`);
    return state;
}

const variantSnapshot = JSON.stringify(variantTasks);
let variantState = variantTasks;

console.log("Исходные данные варианта:");
console.table(variantState);
printStats("Исходный набор варианта", variantState);

variantState = applyResult(
    variantState,
    addTask(variantState, 80, "Провести итоговую проверку проекта", "high")
);
printStats("После добавления id = 80", variantState);

variantState = applyResult(variantState, setTaskCompleted(variantState, 11, true));
printStats("После выполнения id = 11", variantState);

variantState = applyResult(
    variantState,
    renameTask(variantState, 23, "Согласовать план работы с преподавателем")
);
printStats("После переименования id = 23", variantState);

variantState = applyResult(variantState, removeTask(variantState, 37));
printStats("После удаления id = 37", variantState);

console.log("--- Повторное добавление id = 80 ---");
variantState = applyResult(
    variantState,
    addTask(variantState, 80, "Другое название", "low")
);
printStats("После отказа", variantState);

console.log("Итоговые задачи варианта:");
console.table(variantState);
printStats("Итог варианта", variantState);

console.log(
    "variantTasks не изменился:",
    JSON.stringify(variantTasks) === variantSnapshot
);