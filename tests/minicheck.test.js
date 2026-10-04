/* Mini-check persistence: records, restore, badge, sidebar indicator, reset on change. */
const vm = require("vm");
const lib = require("../tools/lib");

const appSrc = lib.read("app.js");
const lessonsSrc = lib.read("lessons.js");

class ClassList {
  constructor(el) { this.el = el; this.set = new Set(); }
  add(...c) { c.forEach(x => this.set.add(x)); }
  remove(...c) { c.forEach(x => this.set.delete(x)); }
  toggle(c, force) { const on = force === undefined ? !this.set.has(c) : !!force; if (on) this.set.add(c); else this.set.delete(c); return on; }
  contains(c) { return this.set.has(c); }
  toString() { return [...this.set].join(" "); }
}

class El {
  constructor(tag) {
    this.tagName = (tag || "div").toUpperCase();
    this.children = [];
    this.parent = null;
    this.classList = new ClassList(this);
    this.textContent = "";
    this.disabled = false;
    this.hidden = false;
    this._listeners = {};
    this._attrs = {};
    this.dataset = {};
  }
  appendChild(c) { c.parent = this; this.children.push(c); return c; }
  remove() { if (this.parent) { this.parent.children = this.parent.children.filter(x => x !== this); this.parent = null; } }
  addEventListener(t, f) { (this._listeners[t] = this._listeners[t] || []).push(f); }
  click() { (this._listeners.click || []).slice().forEach(f => f()); }
  _all(acc) { this.children.forEach(c => { acc.push(c); c._all(acc); }); return acc; }
  _matches(sel) { if (sel.startsWith(".")) return this.classList.contains(sel.slice(1)); return this.tagName === sel.toUpperCase(); }
  querySelector(sel) { return this._all([]).find(e => e._matches(sel)) || null; }
  querySelectorAll(sel) { return this._all([]).filter(e => e._matches(sel)); }
  closest(sel) {
    const cls = sel.replace(/^\./, "");
    let n = this;
    while (n) { if (n.classList.contains(cls)) return n; n = n.parent; }
    return null;
  }
  setAttribute(k, v) { this._attrs[k] = v; }
  removeAttribute(k) { delete this._attrs[k]; }
  get className() { return [...this.classList.set].join(" "); }
  set className(v) { this.classList = new ClassList(this); String(v).split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c)); }
}

function makeDom() {
  const checkBlock = new El("div"); checkBlock.classList.add("check-block");
  const h3 = new El("h3"); checkBlock.appendChild(h3);
  const container = new El("div"); checkBlock.appendChild(container);
  const lessonItem = new El("button"); lessonItem.classList.add("lesson-item"); lessonItem.dataset.lesson = "L1";
  return { checkBlock, h3, container, lessonItem };
}

const store = {};
function makeContext(miniChecks) {
  const dom = makeDom();
  const document = {
    createElement(tag) { return new El(tag); },
    querySelectorAll(sel) { if (sel === ".lesson-item[data-lesson]") return [dom.lessonItem]; return []; }
  };
  const ctx = {
    state: { lessonId: "L1", lang: "ru", miniChecks: miniChecks || {} },
    UI: { ru: { miniCheck: "Мини-проверка", miniCheckProgress: "Мини-проверка: {c}/{t}" },
          ua: { miniCheck: "Міні-перевірка", miniCheckProgress: "Міні-перевірка: {c}/{t}" } },
    document,
    localStorage: { setItem(k, v) { store[k] = v; }, getItem(k) { return store[k] || null; } },
  };
  ctx.mascotSay = () => {};
  vm.createContext(ctx);
  vm.runInContext(lib.extractFn(appSrc, "saveMiniChecks"), ctx);
  vm.runInContext(lib.extractFn(appSrc, "miniStat"), ctx);
  vm.runInContext(lib.extractFn(appSrc, "refreshMiniIndicators"), ctx);
  vm.runInContext(lib.extractFn(lessonsSrc, "renderMiniCheck"), ctx);
  return { ctx, dom };
}

const questions = [
  { q: { ru: "Q1", ua: "Q1" }, opts: { ru: ["a", "b", "c", "d"], ua: ["a", "b", "c", "d"] }, correct: 0 },
  { q: { ru: "Q2", ua: "Q2" }, opts: ["w", "x", "y", "z"], correct: 2 },
  { q: { ru: "Q3", ua: "Q3" }, opts: ["m", "n", "o", "p"], correct: 1 },
];

let fails = 0;
const assert = (cond, msg) => { if (!cond) { fails++; console.log("FAIL: " + msg); } else console.log("ok: " + msg); };

let { ctx, dom } = makeContext({});
ctx.renderMiniCheck(dom.container, "ru", questions);
assert(dom.container.children.length === 3, "renders 3 questions");
assert(ctx.state.miniChecks.L1 && ctx.state.miniChecks.L1.choices.length === 3, "record created with 3 choices");

const q1opts = dom.container.children[0].children[1];
assert(q1opts.children.length === 4, "q1 has 4 options");
q1opts.children[0].click();
dom.container.children[1].children[1].children[2].click();
dom.container.children[2].children[1].children[0].click();

assert(ctx.state.miniChecks.L1.choices.join(",") === "0,2,0", "choices persisted 0,2,0");
assert(store.mc_mini && JSON.parse(store.mc_mini).L1.choices.join(",") === "0,2,0", "localStorage mc_mini written");
const badge = dom.h3.querySelector(".mini-check-badge");
assert(badge.textContent === "Мини-проверка: 2/3 ✓", "badge shows 2/3 ✓ (got '" + badge.textContent + "')");
assert(badge.classList.contains("visible") && badge.classList.contains("done"), "badge visible+done");
const ind = dom.lessonItem.querySelector(".mini-ind");
assert(ind && ind.textContent === "✓", "sidebar indicator shows ✓ (got '" + (ind && ind.textContent) + "')");

({ ctx, dom } = makeContext(JSON.parse(store.mc_mini)));
ctx.renderMiniCheck(dom.container, "ru", questions);
const c1 = dom.container.children[0].children[1].children[0];
assert(c1.disabled === true && c1.classList.contains("correct"), "restored: q1 correct disabled");
const c2wrong = dom.container.children[2].children[1].children[0];
const c2correct = dom.container.children[2].children[1].children[1];
assert(c2wrong.classList.contains("wrong") && c2wrong.disabled, "restored: q3 wrong choice marked");
assert(c2correct.classList.contains("correct"), "restored: q3 correct answer marked");
const badge2 = dom.h3.querySelector(".mini-check-badge");
assert(badge2.textContent === "Мини-проверка: 2/3 ✓", "restored badge 2/3 ✓ (got '" + badge2.textContent + "')");
assert(dom.h3.querySelectorAll(".mini-check-badge").length === 1, "no duplicate badge on re-render");

({ ctx, dom } = makeContext(JSON.parse(store.mc_mini)));
ctx.renderMiniCheck(dom.container, "ru", questions.slice(0, 2));
assert(ctx.state.miniChecks.L1.choices.length === 2 && ctx.state.miniChecks.L1.choices.every(c => c === null), "mismatch resets record");

({ ctx, dom } = makeContext({}));
ctx.renderMiniCheck(dom.container, "ru", questions);
dom.container.children[0].children[1].children[0].click();
dom.container.children[1].children[1].children[2].click();
dom.container.children[2].children[1].children[1].click();
assert(dom.h3.querySelector(".mini-check-badge").textContent === "Мини-проверка: 3/3 ✓", "perfect badge 3/3 ✓");
assert(dom.container.children[0].children[1].children[1].disabled === true, "after settle other options disabled");

const explainedQuestions = [{
  q: { ru: "Solve", ua: "Розв’яжіть" },
  opts: ["wrong", "correct", "other", "last"],
  correct: 1,
  explanation: { ru: "RU steps", ua: "Кроки українською" },
}];
({ ctx, dom } = makeContext({}));
ctx.renderMiniCheck(dom.container, "ru", explainedQuestions);
let explanation = dom.container.children[0].children[2];
assert(explanation.hidden === true, "step-by-step explanation starts hidden");
dom.container.children[0].children[1].children[0].click();
assert(explanation.hidden === false && explanation.textContent === "RU steps", "explanation appears after answering in Russian");
({ ctx, dom } = makeContext(JSON.parse(store.mc_mini)));
ctx.state.lang = "ua";
ctx.renderMiniCheck(dom.container, "ua", explainedQuestions);
explanation = dom.container.children[0].children[2];
assert(explanation.hidden === false && explanation.textContent === "Кроки українською", "saved answer restores localized explanation");

console.log(fails === 0 ? "\nALL MINI-CHECK TESTS PASSED" : "\n" + fails + " TEST(S) FAILED");
process.exit(fails === 0 ? 0 : 1);
