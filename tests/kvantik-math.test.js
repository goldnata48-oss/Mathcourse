const { solve } = require("../kvantik-math.js");

let fails = 0;
const assert = (condition, name) => {
  if (!condition) {
    fails++;
    console.log("FAIL: " + name);
  } else {
    console.log("ok: " + name);
  }
};

const linear = solve("Реши 2x + 5 = 9", "ru");
assert(linear && /x = 2/.test(linear) && /Проверка/.test(linear), "solves a linear equation with steps and check");

const parentheses = solve("3(x - 2) = 12", "ru");
assert(parentheses && /x = 6/.test(parentheses), "supports parentheses and implicit multiplication");

const bothSides = solve("2x - 3 = x + 4", "ua");
assert(bothSides && /x = 7/.test(bothSides) && /Перевірка/.test(bothSides), "solves equations with x on both sides in Ukrainian");

const arithmetic = solve("Вычисли 2 + 3 * 4", "ru");
assert(arithmetic && /Ответ: 14/.test(arithmetic), "evaluates arithmetic with operator precedence");

const percent = solve("Сколько будет 20% от 150?", "ru");
assert(percent && /Ответ: 30/.test(percent), "solves percent-of-number questions");

const pythagorean = solve("Найди гипотенузу, если катеты 3 и 4", "ru");
assert(pythagorean && /Ответ: гипотенуза равна 5/.test(pythagorean), "solves a numeric Pythagorean problem");

assert(solve("x^2 = 9", "ru") === null, "does not guess at nonlinear equations");
assert(solve("привет", "ru") === null, "does not answer non-math chat as a calculation");
assert(solve("2 3 + 4", "ru") === null, "does not merge separate numbers into a false result");

console.log(fails === 0 ? "\nALL KVANTIK MATH TESTS PASSED" : "\n" + fails + " TEST(S) FAILED");
process.exit(fails ? 1 : 0);
