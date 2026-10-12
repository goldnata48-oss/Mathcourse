/* Review trainers for the 8-11 base (module 1, lessons intro1-6):
   powers/roots, expression transformation, rational reduction, systems and the
   linear function. Every answer is re-derived from the numbers printed in the
   generator's own question, so a wrong key or inconsistent statement fails here
   instead of reaching a student. */
const lib = require("../tools/lib");

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log("FAIL: " + m); } else console.log("ok: " + m); };

const ctx = lib.loadTrainer();
const ITER = 400;

function sweep(name, probe) {
  let reason = "";
  for (let i = 0; i < ITER && !reason; i++) reason = probe(ctx, i) || "";
  ok(!reason, name + (reason ? " -> " + reason : ""));
}

const mcOptions = q => {
  if (!q.options || !q.options.ru || !q.options.ua) return "no options";
  if (q.options.ru.length !== 4 || q.options.ua.length !== 4) return "not 4 options";
  if (new Set(q.options.ru).size !== q.options.ru.length) return "duplicate ru: " + q.options.ru.join("|");
  if (new Set(q.options.ua).size !== q.options.ua.length) return "duplicate ua: " + q.options.ua.join("|");
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= 4) return "correct out of range: " + q.correct;
  return "";
};

sweep("genRevPowerRootMC: √n и a^k пересчитаны", c => {
  const q = c.genRevPowerRootMC();
  const bad = mcOptions(q);
  if (bad) return bad;
  const root = q.question.ru.match(/√(\d+)\./);
  const power = q.question.ru.match(/(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\./);
  const supMap = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };
  let truth;
  if (root) {
    const n = Number(root[1]);
    const r = Math.round(Math.sqrt(n));
    if (r * r !== n) return "неполный квадрат: " + n;
    truth = r;
  } else if (power) {
    const exp = Number(power[2].split("").map(d => supMap[d]).join(""));
    truth = Math.pow(Number(power[1]), exp);
  } else return "unparsable: " + q.question.ru;
  if (q.options.ru[q.correct] !== String(truth)) {
    return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct], truth });
  }
});

sweep("genRevExprShort: приведение подобных и подстановка", c => {
  const q = c.genRevExprShort();
  const m = q.question.ru.match(/(\d+)x \+ (\d+)x − (\d+)x при x = (\d+)\./);
  if (!m) return "unparsable: " + q.question.ru;
  const a = +m[1], b = +m[2], cc = +m[3], x0 = +m[4];
  const truth = (a + b - cc) * x0;
  if (!Number.isInteger(truth) || truth <= 0) return "неположительный ответ: " + truth;
  if (q.expected !== truth) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
  if (!q.check(String(truth))) return "check rejects truth";
  if (q.correctLabel !== String(truth)) return "correctLabel mismatch: " + q.correctLabel;
});

sweep("genRevRatMC: (x² − a²)/(x + a) = x − a", c => {
  const q = c.genRevRatMC();
  const bad = mcOptions(q);
  if (bad) return bad;
  const m = q.question.ru.match(/\(x² − (\d+)\) \/ \(x \+ (\d+)\)/);
  if (!m) return "unparsable: " + q.question.ru;
  if (Number(m[1]) !== Number(m[2]) ** 2) return "числитель не a²: " + q.question.ru;
  const a = Number(m[2]);
  if (q.options.ru[q.correct] !== "x − " + a) {
    return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct], truth: "x − " + a });
  }
});

sweep("genRevSysShort: система по сумме и разности", c => {
  const q = c.genRevSysShort();
  const m = q.question.ru.match(/x \+ y = (\d+), x − y = (\d+)/);
  if (!m) return "unparsable: " + q.question.ru;
  const s = +m[1], d = +m[2];
  const x = (s + d) / 2, y = (s - d) / 2;
  if (!Number.isInteger(x) || !Number.isInteger(y) || y <= 0) return "не целые/некорректные: " + q.question.ru;
  if (!q.check(`${x};${y}`)) return "check rejects truth: " + q.question.ru;
  if (!q.check(`${x}, ${y}`)) return "check rejects comma form";
  if (q.check(`${x + 1};${y}`)) return "check accepts wrong x";
  if (q.check(`${x};${y + 1}`)) return "check accepts wrong y";
  if (q.correctLabel !== `x = ${x}; y = ${y}`) return "correctLabel mismatch: " + q.correctLabel;
});

sweep("genRevFuncMC: значение y = kx + b", c => {
  const q = c.genRevFuncMC();
  const bad = mcOptions(q);
  if (bad) return bad;
  const m = q.question.ru.match(/y = (\d+)x ([+−]) (\d+)\. Найдите y при x = (\d+)\./);
  if (!m) return "unparsable: " + q.question.ru;
  const k = +m[1];
  const b = (m[2] === "+" ? 1 : -1) * Number(m[3]);
  const x0 = +m[4];
  const truth = k * x0 + b;
  if (q.options.ru[q.correct] !== String(truth)) {
    return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct], truth });
  }
});

if (fails) process.exit(1);
console.log("INTRO REVIEW TESTS PASSED");
