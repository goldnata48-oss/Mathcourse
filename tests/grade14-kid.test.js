/* Grades 1-4 kid lessons: render, play pick/count/order games, persist and restore. */
const vm = require("vm");
const lib = require("../tools/lib");

const appSrc = lib.read("app.js");
const lessonsSrc = lib.readLessonsSource();

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
  const checkBlock = new El("div");
  checkBlock.classList.add("check-block");
  checkBlock.classList.add("kid");
  const h3 = new El("h3"); checkBlock.appendChild(h3);
  const container = new El("div"); checkBlock.appendChild(container);
  const lessonItem = new El("button");
  lessonItem.classList.add("lesson-item");
  lessonItem.dataset.lesson = "K1";
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
    state: { lessonId: "K1", lang: "ru", miniChecks: miniChecks || {} },
    UI: { ru: { miniCheckProgress: "Мини-проверка: {c}/{t}", kidProgress: "Игра: {c}/{t}" },
          ua: { miniCheckProgress: "Міні-перевірка: {c}/{t}", kidProgress: "Гра: {c}/{t}" } },
    document,
    localStorage: { setItem(k, v) { store[k] = v; }, getItem(k) { return store[k] || null; } }
  };
  ctx.mascotSay = () => {};
  ctx.setTimeout = (fn) => { fn(); return 0; };
  vm.createContext(ctx);
  const kidUi = lessonsSrc.match(/const KID_UI = (\{[\s\S]*?\n\});/);
  vm.runInContext("var KID_UI = " + kidUi[1] + ";", ctx);
  vm.runInContext(lib.extractFn(appSrc, "saveMiniChecks"), ctx);
  vm.runInContext(lib.extractFn(appSrc, "miniStat"), ctx);
  vm.runInContext(lib.extractFn(appSrc, "refreshMiniIndicators"), ctx);
  vm.runInContext(lib.extractFn(lessonsSrc, "renderKidCheck"), ctx);
  return { ctx, dom };
}

const activities = [
  { type: "pick", ask: { ru: "Выбери верное", ua: "Обери правильне" }, options: ["x", "y", "z"], correct: 2 },
  { type: "pick", ask: { ru: "Сколько?", ua: "Скільки?" },
    options: [{ e: "🍎", t: { ru: "один", ua: "один" } }, { e: "🍎🍎", t: { ru: "два", ua: "два" } }], correct: 1 },
  { type: "order", ask: { ru: "Нажми по порядку", ua: "Натисни по порядку" }, items: [1, 2, 3] }
];

let fails = 0;
const assert = (cond, msg) => { if (!cond) { fails++; console.log("FAIL: " + msg); } else console.log("ok: " + msg); };

let { ctx, dom } = makeContext({});
ctx.renderKidCheck(dom.container, "ru", activities);
assert(dom.container.children.length === 3, "renders 3 kid games");
assert(ctx.state.miniChecks.K1 && ctx.state.miniChecks.K1.choices.length === 3, "record created with 3 choices");
assert(ctx.state.miniChecks.K1.choices.every(c => c === null), "choices start null");

const g0 = dom.container.children[0];
assert(g0.children[1].children.length === 3, "pick game has 3 options");
g0.children[1].children[0].click();
assert(ctx.state.miniChecks.K1.choices[0] === null, "wrong pick does not solve");
g0.children[1].children[2].click();
assert(ctx.state.miniChecks.K1.choices[0] === 0, "correct pick solves");
assert(g0.classList.contains("kid-won") && !!g0.querySelector(".kid-note"), "solved game marked won with praise note");

const g1 = dom.container.children[1];
assert(g1.children[1].children[0].querySelector(".kid-opt-e").textContent === "🍎", "emoji option rendered");
g1.children[1].children[1].click();
assert(ctx.state.miniChecks.K1.choices[1] === 0, "emoji pick solves");

const g2opts = dom.container.children[2].children[1];
assert(g2opts.children.length === 3, "order game shows 3 numbers");
g2opts.children[2].click();
g2opts.children[1].click();
assert(ctx.state.miniChecks.K1.choices[2] === null, "order unsolved mid-way");
g2opts.children[0].click();
assert(ctx.state.miniChecks.K1.choices[2] === 0, "order solved by ascending taps");
assert(store.mc_mini && JSON.parse(store.mc_mini).K1.choices.join(",") === "0,0,0", "kid progress persisted to localStorage");

const badge = dom.h3.querySelector(".mini-check-badge");
assert(/3 из 3/.test(badge.textContent) && badge.classList.contains("done") && badge.classList.contains("visible"),
  "kid badge shows completion (got '" + badge.textContent + "')");
const ind = dom.lessonItem.querySelector(".mini-ind");
assert(ind && ind.textContent === "✓", "sidebar shows kid lesson done");

({ ctx, dom } = makeContext({ K1: { total: 3, correct: [0, 0, 0], choices: [0, 0, 0] } }));
ctx.renderKidCheck(dom.container, "ru", activities);
assert(dom.container.children[0].classList.contains("kid-won"), "restored: solved game stays won");
assert(dom.container.children[0].children[1].children[2].disabled === true, "restored: correct option disabled");
assert(dom.h3.querySelectorAll(".mini-check-badge").length === 1, "no duplicate badge on re-render");

({ ctx, dom } = makeContext({ K1: { total: 3, correct: [0, 0, 0], choices: [0, 0, 0] } }));
ctx.renderKidCheck(dom.container, "ru", activities.slice(0, 2));
assert(ctx.state.miniChecks.K1.choices.length === 2 && ctx.state.miniChecks.K1.choices.every(c => c === null),
  "changed activity count resets the record");

console.log(fails === 0 ? "\nALL KID-LESSON TESTS PASSED" : "\n" + fails + " TEST(S) FAILED");
process.exit(fails ? 1 : 0);
