const vm = require("vm");
const lib = require("../tools/lib");

const { lessons, lessonGrades } = lib.loadLessons();
const quizzes = lib.lessonQuizStats(lib.readLessonsSource(), lessons, true);
const sharedUnits = new Set(["см", "мм", "дм", "км", "м", "грн", "кг", "г", "л"]);
const failures = [];

function hasUnlocalizedWords(option) {
  if (option && typeof option === "object") {
    if (option.t && typeof option.t === "object" && option.t.ru && option.t.ua) return false;
    return hasUnlocalizedWords(option.t || option.e || "");
  }
  const text = String(option);
  const words = text.match(/[\u0400-\u04ff]+/g) || [];
  return words.some(word => word.length > 1 && !sharedUnits.has(word.toLowerCase())) ||
    /(?:^|[\s/])ч(?=$|[\s/.,])/i.test(text);
}

for (const quiz of quizzes) {
  if (!quiz.quizSource || !(lessonGrades[quiz.id] || []).includes("preSenior")) continue;
  const questions = vm.runInNewContext("(" + quiz.quizSource + ")");
  questions.forEach((question, index) => {
    const options = question.opts;
    if (Array.isArray(options)) {
      if (options.some(hasUnlocalizedWords)) {
        failures.push(quiz.id + " question " + (index + 1) + " has non-localized answer text");
      }
      return;
    }
    if (!options || !Array.isArray(options.ru) || !Array.isArray(options.ua) ||
      options.ru.length !== options.ua.length) {
      failures.push(quiz.id + " question " + (index + 1) + " needs matching ru/ua answer lists");
    }
  });
}

if (failures.length) {
  failures.forEach(failure => console.log("FAIL: " + failure));
  process.exit(1);
}

console.log("All 8–9 mini-check answer choices are localized.");
