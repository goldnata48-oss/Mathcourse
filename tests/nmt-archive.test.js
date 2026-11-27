/* NMT yearly archive renderer: navigation, answer tracking, and hidden solutions. */
const vm = require("vm");
const fs = require("fs");
const path = require("path");
const lib = require("../tools/lib");

class ClassList {
  constructor() { this.values = new Set(); }
  add(...values) { values.forEach(value => this.values.add(value)); }
  remove(...values) { values.forEach(value => this.values.delete(value)); }
  toggle(value, force) {
    const enabled = force === undefined ? !this.values.has(value) : !!force;
    if (enabled) this.values.add(value);
    else this.values.delete(value);
    return enabled;
  }
  contains(value) { return this.values.has(value); }
}

class Element {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.parent = null;
    this.classList = new ClassList();
    this.attributes = {};
    this.listeners = {};
    this.style = {};
    this.value = "";
    this.hidden = false;
    this.disabled = false;
    this.textContent = "";
  }
  set className(value) {
    this.classList = new ClassList();
    String(value).split(/\s+/).filter(Boolean).forEach(name => this.classList.add(name));
  }
  get className() { return [...this.classList.values].join(" "); }
  set innerHTML(value) {
    this._innerHTML = value;
    if (value === "") this.children = [];
  }
  get innerHTML() { return this._innerHTML || ""; }
  append(...elements) { elements.forEach(element => this.appendChild(element)); }
  appendChild(element) {
    element.parent = this;
    this.children.push(element);
    return element;
  }
  addEventListener(type, listener) {
    (this.listeners[type] = this.listeners[type] || []).push(listener);
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  click() { this.dispatch("click"); }
  dispatch(type) {
    const event = { preventDefault() { this.defaultPrevented = true; } };
    (this.listeners[type] || []).forEach(listener => listener(event));
    return event;
  }
  findAll(selector, results) {
    const found = results || [];
    this.children.forEach(child => {
      if (selector[0] === "." ? child.classList.contains(selector.slice(1)) :
        child.tagName === selector.toUpperCase()) found.push(child);
      child.findAll(selector, found);
    });
    return found;
  }
  querySelector(selector) { return this.findAll(selector)[0] || null; }
  querySelectorAll(selector) { return this.findAll(selector); }
}

let saveCount = 0;
const ctx = {
  state: { miniChecks: {} },
  document: { createElement: tag => new Element(tag) },
  saveMiniChecks() { saveCount++; },
  refreshMiniIndicators() {}
};
vm.createContext(ctx);
const source = lib.read("lessons.js");
vm.runInContext(lib.extractFn(source, "nmtNormalizeAnswer"), ctx);
vm.runInContext(lib.extractFn(source, "renderNmtVariant"), ctx);

const questions = [
  {
    kind: "choice",
    topic: { ru: "Тема", ua: "Тема" },
    prompt: { ru: "Выберите ответ", ua: "Оберіть відповідь" },
    image: { src: "/diagram.png", alt: { ru: "Diagram", ua: "Діаграма" } },
    options: [{ key: "А", ru: "10", ua: "10" }, { key: "Б", ru: "20", ua: "20" }],
    correct: "Б",
    answer: { ru: "Б (20)", ua: "Б (20)" },
    solution: { ru: "Разбор", ua: "Розбір" }
  },
  {
    kind: "short",
    topic: { ru: "Тема", ua: "Тема" },
    prompt: { ru: "Введите число", ua: "Введіть число" },
    correct: "-35",
    answer: { ru: "−35", ua: "−35" },
    solution: { ru: "Разбор", ua: "Розбір" }
  }
];
const container = new Element("div");
ctx.renderNmtVariant(container, "ua", questions, "nmt2026");

const assert = (condition, message) => {
  if (!condition) {
    console.error("FAIL: " + message);
    process.exitCode = 1;
  } else console.log("ok: " + message);
};
const findByText = (root, selector, text) =>
  root.querySelectorAll(selector).find(element => element.textContent === text);

assert(container.querySelector(".nmt-counter").textContent.includes("0/2"),
  "starts with zero answered");
assert(container.querySelector(".nmt-question-figure").querySelector("img").alt === "Діаграма",
  "question diagram renders with localized alternative text");
assert(container.querySelector(".nmt-review").hidden,
  "solution is hidden initially");
findByText(container, ".nmt-option", "А) 10").click();
assert(container.querySelector(".nmt-counter").textContent.includes("Відповіли: 1/2") &&
  container.querySelector(".nmt-counter").textContent.includes("Правильно: 0/2"),
  "wrong choice counts as answered but not correct");
findByText(container, ".nmt-option", "Б) 20").click();
assert(container.querySelector(".nmt-counter").textContent.includes("1/2") &&
  container.querySelector(".nmt-counter").textContent.includes("Правильно: 1/2"),
  "correct choice updates answered and correct counts");
assert(ctx.state.miniChecks.nmt2026.choices[0] === "Б" && saveCount > 0,
  "answer is persisted under the annual lesson id");
container.querySelector(".nmt-review-toggle").click();
assert(!container.querySelector(".nmt-review").hidden,
  "solution opens on demand");
container.querySelector(".nmt-step-buttons").children[1].click();
assert(container.querySelector(".nmt-question-title").textContent.includes("2"),
  "Step forward navigates to the next task");
const input = container.querySelector("input");
input.value = " −35 ";
container.querySelector("form").dispatch("submit");
assert(container.querySelector(".nmt-counter").textContent.includes("2/2") &&
  ctx.state.miniChecks.nmt2026.choices[1] === "-35",
  "short numeric answer normalizes and updates progress");
container.querySelector(".nmt-step-buttons").children[0].click();
assert(container.querySelector(".nmt-question-title").textContent.includes("1"),
  "Step back returns to the previous task");
container.querySelector(".nmt-question-nav").children[1].click();
assert(container.querySelector(".nmt-question-title").textContent.includes("2"),
  "numbered navigation opens a selected task");

const loadedLessons = lib.loadLessons();
const nmtQuestions = loadedLessons.nmtQuestions;
const nmt2022Questions = loadedLessons.nmt2022Questions;
const nmt2023Questions = loadedLessons.nmt2023Questions;
const nmt2024Questions = loadedLessons.nmt2024Questions;
const nmt2025Questions = loadedLessons.nmt2025Questions;
const nmt2022Kinds = nmt2022Questions.reduce((counts, question) => {
  counts[question.kind] = (counts[question.kind] || 0) + 1;
  return counts;
}, {});
assert(nmt2022Questions.length === 20 &&
  nmt2022Kinds.choice === 14 && nmt2022Kinds.matching === 3 && nmt2022Kinds.short === 3 &&
  nmt2022Questions.every(question => question.prompt.ru && question.prompt.ua &&
    question.solution.ru && question.solution.ua && question.answer.ru && question.answer.ua) &&
  nmt2022Questions[18].topic.ru === "Арифметическая прогрессия" &&
  nmt2022Questions[19].topic.ru === "Правильная четырёхугольная пирамида",
  "2022 author-created training set has 20 bilingual tasks, including requested topics");
const nmt2022Lesson = loadedLessons.lessons.find(lesson => lesson.id === "nmt2022");
assert(nmt2022Lesson.html("ua").includes("НМТ-2022: 20 завдань") &&
  nmt2022Lesson.html("ua").includes("не офіційний варіант НМТ-2022"),
  "2022 archive entry identifies the original practice set and opens the trainer");
const nmt2023Kinds = nmt2023Questions.reduce((counts, question) => {
  counts[question.kind] = (counts[question.kind] || 0) + 1;
  return counts;
}, {});
assert(nmt2023Questions.length === 22 &&
  nmt2023Kinds.choice === 15 && nmt2023Kinds.matching === 3 && nmt2023Kinds.short === 4 &&
  nmt2023Questions.every(question => question.prompt.ru && question.prompt.ua &&
    question.solution.ru && question.solution.ua && question.answer.ru && question.answer.ua),
  "2023 author-created training set has 22 bilingual tasks and complete solutions");
const nmt2023Lesson = loadedLessons.lessons.find(lesson => lesson.id === "nmt2023");
assert(nmt2023Lesson.html("ua").includes("НМТ-2023: 22 завдань") &&
  nmt2023Lesson.html("ua").includes("не офіційний варіант НМТ-2023"),
  "2023 archive entry identifies the original practice set and opens the trainer");
const answer2024 = ["А","Г","Б","В","Г","А","Б","В","Д","Д","Б","Г","Д","Д","А"];
assert(nmt2024Questions.length === 22 &&
  nmt2024Questions.slice(0, 15).every((question, index) => question.correct === answer2024[index]) &&
  nmt2024Questions.slice(15, 18).map(question => question.correct).join(",") === "Б|Г|Д,Д|Г|В,Г|Д|А" &&
  nmt2024Questions.slice(18).map(question => question.correct).join(",") === "91,12,-111,-3.5",
  "2024 question count and answer key match the source");
const nmt2024Lesson = loadedLessons.lessons.find(lesson => lesson.id === "nmt2024");
assert(nmt2024Lesson.html("ua").includes("НМТ-2024: 22 завдань") &&
  !nmt2024Lesson.html("ru").includes("Место в архиве подготовлено"),
  "2024 archive entry exposes the interactive exam");
const expected2024Diagrams = new Map([
  [3, "question-03.png"], [5, "question-05.png"], [7, "question-07.png"],
  [14, "question-14.png"], [18, "question-18.png"], [19, "question-19.png"]
]);
expected2024Diagrams.forEach((filename, number) => {
  const imagePath = "/assets/nmt-2024/" + filename;
  assert(nmt2024Questions[number - 1].image &&
    nmt2024Questions[number - 1].image.src === imagePath,
    "2024 question " + number + " references its source diagram");
  assert(fs.existsSync(path.join(lib.ROOT, imagePath.replace(/^\/+/, ""))),
    "2024 question " + number + " diagram asset exists");
});
const answer2025 = ["Г","А","В","Г","В","Б","Б","Д","Д","Б","Д","Б","Б","Б","В"];
assert(nmt2025Questions.length === 22 &&
  nmt2025Questions.slice(0, 15).every((question, index) => question.correct === answer2025[index]) &&
  nmt2025Questions.slice(15, 18).map(question => question.correct).join(",") === "Г|А|Б,В|Г|Б,В|А|Г" &&
  nmt2025Questions.slice(18).map(question => question.correct).join(",") === "2.8,42,900,-2.4",
  "2025 question count and derived answer key match the verified solutions");
const nmt2025Lesson = loadedLessons.lessons.find(lesson => lesson.id === "nmt2025");
assert(nmt2025Lesson.html("ua").includes("НМТ-2025: 22 завдань") &&
  !nmt2025Lesson.html("ru").includes("Место в архиве подготовлено"),
  "2025 archive entry exposes the interactive exam");
const expected2025Diagrams = new Map([
  [1, "question-01.png"], [2, "question-02.png"], [5, "question-05.png"],
  [8, "question-08.png"], [15, "question-15.png"], [18, "question-18.png"],
  [20, "question-20.png"]
]);
expected2025Diagrams.forEach((filename, number) => {
  const imagePath = "/assets/nmt-2025/" + filename;
  assert(nmt2025Questions[number - 1].image &&
    nmt2025Questions[number - 1].image.src === imagePath,
    "2025 question " + number + " references its source diagram");
  assert(fs.existsSync(path.join(lib.ROOT, imagePath.replace(/^\/+/, ""))),
    "2025 question " + number + " diagram asset exists");
});
const expectedDiagrams = new Map([
  [1, "question-01.png"], [2, "question-02.png"], [6, "question-06.png"],
  [10, "question-10.png"], [12, "question-12.png"], [15, "question-15.png"],
  [18, "question-18.png"]
]);
expectedDiagrams.forEach((filename, number) => {
  const imagePath = "/assets/nmt-2026/" + filename;
  const question = nmtQuestions[number - 1];
  assert(question.image && question.image.src === imagePath,
    "question " + number + " references its extracted diagram");
  assert(fs.existsSync(path.join(lib.ROOT, imagePath.replace(/^\/+/, ""))),
    "question " + number + " diagram asset exists");
});
assert(nmtQuestions[1].prompt.ru.includes("162°") &&
  nmtQuestions[11].options.some(option => option.ru.includes("2ˣ")),
  "diagram-dependent questions use the source angle and exponential function");
