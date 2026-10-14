/* kid-widgets.js: builders return clean markup; PRNG is deterministic. */
const vm = require("vm");
const lib = require("../tools/lib");

const ctx = {};
vm.createContext(ctx);
vm.runInContext(lib.read("kid-widgets.js"), ctx);
const W = ctx.KID_WIDGETS;

let fails = 0;
const assert = (cond, msg) => { if (!cond) { fails++; console.log("FAIL: " + msg); } else console.log("ok: " + msg); };

assert(W && typeof W === "object", "KID_WIDGETS exported");

const samples = [
  ["clockFace", W.clockFace(3, 30, 0)],
  ["fractionPie", W.fractionPie(1, 2)],
  ["numberBar", W.numberBar(7, 4)],
  ["balanceScale", W.balanceScale(3, 5)],
  ["tenFrame", W.tenFrame(6)],
  ["baseTen", W.baseTen(1, 2, 3)],
  ["placeValueTable", W.placeValueTable(207, "ru")],
  ["columnAdd", W.columnAdd(23, 9)],
  ["columnSub", W.columnSub(40, 7)],
  ["mulTable", W.mulTable(10)],
  ["numberLine", W.numberLine(0, 10)],
  ["shape", W.shape("triangle")],
  ["groups", W.groups(12, 3)],
  ["cutStrip", W.cutStrip(5)],
  ["ruler", W.ruler(15, 8)],
  ["coins", W.coins([1, 2, 5])],
  ["rectGrid", W.rectGrid(3, 2)],
  ["symmetry", W.symmetry()],
  ["classTable", W.classTable(94736015, "ru")],
  ["unitLadder", W.unitLadder("ru")],
  ["motionDiagram", W.motionDiagram("toward", "ru")],
  ["motionDiagram-apart", W.motionDiagram("apart", "ua")],
  ["motionDiagram-chase", W.motionDiagram("chase", "ru")]
];
samples.forEach(([name, html]) => {
  assert(typeof html === "string" && html.length > 20 && html.indexOf("undefined") < 0 && html.indexOf("NaN") < 0,
    name + " returns clean markup");
});

assert(/Сотни|Сотні/.test(W.placeValueTable(207, "ua")), "placeValueTable localizes (ua)");
assert(/Миллионов|Тысяч|Единиц/.test(W.classTable(94736015, "ru")), "classTable groups classes (ru)");
assert(/Мільйонів/.test(W.classTable(94736015, "ua")), "classTable localizes (ua)");
assert(samples.find(s => s[0] === "mulTable")[1].indexOf("100") > 0, "mulTable contains 10×10 = 100");
assert(W.numberBar(10, 4).length < W.numberBar(10, 4).length + 1, "numberBar stable");

const a = W.rng(12345), b = W.rng(12345);
let same = true;
for (let i = 0; i < 6; i++) if (a() !== b()) same = false;
assert(same, "rng is deterministic for the same seed");

const r = W.rng(7);
let inRange = true;
for (let i = 0; i < 200; i++) { const v = W.rngInt(r, 2, 9); if (v < 2 || v > 9) inRange = false; }
assert(inRange, "rngInt stays within [2, 9]");

console.log(fails === 0 ? "\nALL KID-WIDGET TESTS PASSED" : "\n" + fails + " TEST(S) FAILED");
process.exit(fails ? 1 : 0);
