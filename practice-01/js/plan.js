"use strict";

const totalTasks = 12;
const completedTasks = 5;
const dailyLimit = 3;

if (
    !Number.isInteger(totalTasks) ||
    !Number.isInteger(completedTasks) ||
    totalTasks < 0 ||
    totalTasks > 1000 ||
    completedTasks < 0 ||
    completedTasks > totalTasks
) {
    console.log("Ошибка: некорректное количество задач");
} else if (
    !Number.isInteger(dailyLimit) ||
    dailyLimit < 1 ||
    dailyLimit > 1000
) {
    console.log("Ошибка: некорректная дневная норма");
} else {
    let remainingTasks = totalTasks - completedTasks;
    let day = 0;

    console.log(`Осталось задач: ${remainingTasks}`);

    if (remainingTasks === 0) {
        console.log("Все задачи уже выполнены");
        console.log("Потребуется дней: 0");
    } else {
        while (remainingTasks > 0) {
            day++;

            const completedToday = Math.min(dailyLimit, remainingTasks);
            remainingTasks -= completedToday;

            console.log(
                `День ${day}: выполнено ${completedToday}, осталось ${remainingTasks}`
            );
        }

        console.log(`Потребуется дней: ${day}`);
    }
}