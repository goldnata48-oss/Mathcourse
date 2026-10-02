/* Trainer statistics: records, accuracy, persistence, weak-topic sorting, review start. */
const vm = require("vm");
const lib = require("../tools/lib");

const app = lib.read("app.js");

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log("FAIL: " + m); } else console.log("ok: " + m); };

const store = {};
const ctx = {
  LEVEL_DEFS: [
    { id: "base", topics: [{ id: "t1" }, { id: "t2" }] },
    { id: "medium", topics: [{ id: "t3" }] },
  ],
  state: { trainerStats: {}, trainerReview: null, trainerScore: { correct: 0, total: 0 } },
  localStorage: { setItem(k, v) { store[k] = v; }, getItem(k) { return store[k] || null; } },
  renderCount: 0,
  render() { ctx.renderCount++; },
  UI: { ru: {}, ua: {} },
};
vm.createContext(ctx);
["saveTrainerStats", "trainerAcc", "recordTrainerResult", "allTrainerTopics", "findTrainerTopic", "trainerOverall", "weakTrainerTopics", "startTrainerReview"]
  .forEach(n => vm.runInContext(lib.extractFn(app, n), ctx));

ok(ctx.state.trainerStats && Object.keys(ctx.state.trainerStats).length === 0, "stats start empty");

ctx.recordTrainerResult("t1", true);
ctx.recordTrainerResult("t1", true);
ctx.recordTrainerResult("t1", true);
ctx.recordTrainerResult("t1", false);
const t1 = ctx.state.trainerStats.t1;
ok(t1.total === 4 && t1.correct === 3 && t1.wrong === 1, "t1 totals 4/3/1");
ok(t1.lastWrong > 0, "t1 lastWrong timestamp set");
ok(ctx.trainerAcc(t1) === 75, "t1 accuracy 75%");
ok(store.mc_trainer && JSON.parse(store.mc_trainer).t1.correct === 3, "persisted to mc_trainer");

ctx.recordTrainerResult("t2", false);
ctx.recordTrainerResult("t2", false);
ctx.recordTrainerResult("t3", true);

const overall = ctx.trainerOverall();
ok(overall.total === 7 && overall.correct === 4 && overall.acc === 57, "overall 4/7 = 57% (got " + JSON.stringify(overall) + ")");

const weak = ctx.weakTrainerTopics(10);
ok(weak.length === 2 && weak[0] === "t2" && weak[1] === "t1", "weak sorted by wrong desc: " + weak.join(","));

ctx.state.trainerStats.ghost = { total: 1, correct: 0, wrong: 1, lastWrong: Date.now() };
ok(ctx.weakTrainerTopics(10).indexOf("ghost") < 0, "unknown topic filtered from weak list");
delete ctx.state.trainerStats.ghost;

ok(ctx.weakTrainerTopics(1).length === 1, "limit respected");

ctx.recordTrainerResult("t1", false);
ok(ctx.weakTrainerTopics(10)[0] === "t1", "more recent wrong first on tie");

ok(ctx.findTrainerTopic("t3") && ctx.findTrainerTopic("t3").topic.id === "t3", "findTrainerTopic works");
ok(ctx.findTrainerTopic("nope") === null, "findTrainerTopic missing -> null");

ctx.startTrainerReview();
ok(ctx.state.trainerReview && ctx.state.trainerReview.ids.length === 2, "review started with 2 weak topics");
ok(ctx.state.trainerReview.idx === 0 && ctx.state.trainerReview.correct === 0 && ctx.state.trainerReview.total === 0, "review initial state");
ok(ctx.renderCount === 1, "review triggered render");

ctx.state.trainerStats = { t3: { total: 1, correct: 1, wrong: 0, lastWrong: 0 } };
ctx.state.trainerReview = null;
const before = ctx.renderCount;
ctx.startTrainerReview();
ok(ctx.state.trainerReview === null && ctx.renderCount === before, "no review when no mistakes");

console.log(fails === 0 ? "\nALL TRAINER-STATS TESTS PASSED" : "\n" + fails + " TEST(S) FAILED");
process.exit(fails === 0 ? 0 : 1);
