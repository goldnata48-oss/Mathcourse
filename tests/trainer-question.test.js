/* Trainer question core: option rendering, grading, callback wiring, short answers. */
const vm = require("vm");
const lib = require("../tools/lib");

const app = lib.read("app.js");

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log("FAIL: " + m); } else console.log("ok: " + m); };

class ClassList {
  constructor() { this.set = new Set(); }
  add(...c) { c.forEach(x => this.set.add(x)); }
  remove(...c) { c.forEach(x => this.set.delete(x)); }
  contains(c) { return this.set.has(c); }
}
class El {
  constructor(tag) { this.tagName = tag; this.classList = new ClassList(); this.textContent = ""; this.innerHTML = ""; this.disabled = false; this.children = []; this.style = {}; this._l = {}; }
  appendChild(c) { this.children.push(c); return c; }
  addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); }
  click() { (this._l.click || []).slice().forEach(f => f()); }
  focus() {}
}

function makeMain() {
  const m = new El("main");
  const stubs = {};
  m.querySelector = (sel) => { if (!stubs[sel]) stubs[sel] = new El(sel); return stubs[sel]; };
  m._stubs = stubs;
  return m;
}

const store = {};
const main = makeMain();
let onNext = 0, onGraded = null;
const topic = {
  id: "t1",
  title: { ru: "T1", ua: "T1" },
  generate() {
    return {
      question: { ru: "Q?", ua: "Q?" },
      hint: { ru: "hint", ua: "hint" },
      options: { ru: ["a", "b", "c", "d"], ua: ["a", "b", "c", "d"] },
      correct: 2,
      topic: { ru: "topic", ua: "topic" },
      format: { ru: "fmt", ua: "fmt" },
      solution: { ru: "sol", ua: "sol" },
    };
  },
};
const L = {
  trainerScore: "Score {c}/{t}", showHint: "hint", trainerPlaceholder: "ph", trainerCheck: "check",
  trainerCorrect: "right", trainerWrongPrefix: "wrong: ", trainerNext: "next", trainerMetaTitle: "meta",
  trainerMetaTopic: "topic", trainerMetaFormat: "fmt", trainerMetaAnswer: "ans", trainerMetaSolution: "sol",
};

const ctx = {
  document: { getElementById: () => main, createElement: (t) => new El(t) },
  state: { lang: "ru", trainerStats: {}, trainerScore: { correct: 0, total: 0 } },
  UI: { ru: L, ua: L },
  localStorage: { setItem(k, v) { store[k] = v; }, getItem(k) { return store[k] || null; } },
  trainerCurrent: null,
  mascotSay() {},
};
vm.createContext(ctx);
["saveTrainerStats", "recordTrainerResult", "renderTrainerQuestion"].forEach(n => vm.runInContext(lib.extractFn(app, n), ctx));

ctx.renderTrainerQuestion({
  kicker: "KICKER", topic, backLabel: "BACK", progress: "PROG 1/3",
  onBack: () => {}, onGraded: (good) => { onGraded = good; }, onNext: () => { onNext++; },
});

ok(main.innerHTML.indexOf("KICKER") >= 0, "kicker rendered");
ok(main.innerHTML.indexOf("PROG 1/3") >= 0, "progress rendered");
ok(main.innerHTML.indexOf("Q?") >= 0, "question rendered");

const mc = main._stubs["#trainer-mc"];
ok(mc && mc.children.length === 4, "4 MC options rendered");

mc.children[0].click();
ok(ctx.state.trainerScore.total === 1 && ctx.state.trainerScore.correct === 0, "score counted wrong");
ok(ctx.state.trainerStats.t1 && ctx.state.trainerStats.t1.wrong === 1, "wrong recorded in stats");
ok(onGraded === false, "onGraded(false) called");
ok(mc.children[0].classList.contains("wrong"), "wrong option marked");
ok(mc.children[2].classList.contains("correct"), "correct option revealed");
ok(store.mc_trainer && JSON.parse(store.mc_trainer).t1.wrong === 1, "stats persisted");

const run = main._stubs[".trainer-run"];
const nextBtn = run.children[run.children.length - 1];
nextBtn.click();
ok(onNext === 1, "onNext wired to next button");

ctx.trainerCurrent = null;
ctx.renderTrainerQuestion({ kicker: "K", topic, backLabel: "B", onBack: () => {}, onNext: () => {} });
main._stubs["#trainer-mc"].children[2].click();
ok(ctx.state.trainerStats.t1.total === 2 && ctx.state.trainerStats.t1.correct === 1, "correct recorded (2 attempts)");

const shortTopic = {
  id: "t2", title: { ru: "T2", ua: "T2" },
  generate() { return { question: { ru: "S?", ua: "S?" }, hint: { ru: "h", ua: "h" }, expected: "5", correctLabel: "5", check: (v) => v.trim() === "5" }; },
};
ctx.trainerCurrent = null;
ctx.renderTrainerQuestion({ kicker: "K", topic: shortTopic, backLabel: "B", onBack: () => {}, onNext: () => {} });
ok(main.innerHTML.indexOf("trainer-input") >= 0, "short-answer input rendered");
const checkBtn = main._stubs["#trainer-check-btn"];
main._stubs["#trainer-input"].value = "5";
checkBtn.click();
ok(ctx.state.trainerStats.t2 && ctx.state.trainerStats.t2.correct === 1, "short answer recorded correct");
ok(checkBtn.textContent === "next", "check button becomes next");

console.log(fails === 0 ? "\nALL TRAINER-QUESTION TESTS PASSED" : "\n" + fails + " TEST(S) FAILED");
process.exit(fails === 0 ? 0 : 1);
