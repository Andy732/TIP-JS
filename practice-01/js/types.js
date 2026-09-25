"use strict";

console.log("1:", "8" + 2);
console.log("Тип:", typeof ("8" + 2));

console.log("2:", "8" - 2);
console.log("Тип:", typeof ("8" - 2));

console.log("3:", Number("8") + 2);
console.log("Тип:", typeof (Number("8") + 2));

console.log("4:", "12" > "3");
console.log("Тип:", typeof ("12" > "3"));

console.log("5:", 12 === "12");
console.log("Тип:", typeof (12 === "12"));

console.log("6:", Number(""));
console.log("Тип:", typeof Number(""));

console.log("7:", Number("text"));
console.log("Тип:", typeof Number("text"));

console.log("8:", Boolean("false"));
console.log("Тип:", typeof Boolean("false"));

console.log("9:", typeof null);
console.log("Тип:", typeof (typeof null));

console.log("10:", typeof NaN);
console.log("Тип:", typeof (typeof NaN));