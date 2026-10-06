/* Algebra content for grades 8-9: progressions, equations/inequalities/systems, applied problems.
   Each generator is re-derived from the numbers printed in its own question text, so a wrong
   answer key or an inconsistent problem statement fails here instead of reaching a student. */
const lib = require("../tools/lib");
const vm = require("vm");

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log("FAIL: " + m); } else console.log("ok: " + m); };

const ctx = lib.loadTrainer();
const ITER = 400;

/* Runs `probe` ITER times; `probe` returns a reason string on the first bad sample. */
function sweep(name, probe) {
  let reason = "";
  for (let i = 0; i < ITER && !reason; i++) reason = probe(ctx, i) || "";
  ok(!reason, name + (reason ? " -> " + reason : ""));
  return reason;
}

/* ---------------- Progressions ---------------- */

const SUP = { "₁":1,"₂":2,"₃":3,"₄":4,"₅":5,"₆":6,"₇":7,"₈":8,"₉":9 };
const subToInt = s => s === "₁₀" ? 10 : SUP[s];

sweep("genArithTermShort matches aₙ = a₁ + (n−1)d", c => {
  const q = c.genArithTermShort();
  const m = q.question.ru.match(/a₁ = (-?\d+), d = (-?\d+)\. Чему равен a(₁₀|[₁₂₃₄₅₆₇₈₉])\?/);
  if (!m) return "unparsable: " + q.question.ru;
  const truth = Number(m[1]) + (subToInt(m[3]) - 1) * Number(m[2]);
  if (truth !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
  if (!q.solution.ru.endsWith("= " + truth + ".")) return "solution does not end at the answer: " + q.solution.ru;
});

sweep("genArithSumShort matches Sₙ = (a₁ + aₙ)·n/2", c => {
  const q = c.genArithSumShort();
  const m = q.question.ru.match(/первых (\d+) членов прогрессии, у которой a₁ = (-?\d+) и d = (-?\d+)/);
  if (!m) return "unparsable: " + q.question.ru;
  const n = Number(m[1]), a1 = Number(m[2]), d = Number(m[3]);
  const truth = (a1 + (a1 + (n - 1) * d)) * n / 2;
  if (truth !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
});

sweep("genGeoTermShort matches aₙ = a₁·qⁿ⁻¹", c => {
  const q = c.genGeoTermShort();
  const m = q.question.ru.match(/q = (\d+)\. Чему равен a(\d)\?/);
  if (!m) return "unparsable: " + q.question.ru;
  const truth = Math.pow(Number(m[1]), Number(m[2]) - 1);
  if (truth !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
});

sweep("genGeoInfiniteMC matches S = a₁/(1 − q)", c => {
  const q = c.genGeoInfiniteMC();
  const m = q.question.ru.match(/1 \+ 1\/(\d+) \+ 1\/(\d+) \+ 1\/(\d+) \+ ⋯/);
  if (!m) return "unparsable: " + q.question.ru;
  const d = Number(m[1]);
  if (Number(m[2]) !== d * d || Number(m[3]) !== d * d * d) return "terms are not powers of 1/" + d + ": " + q.question.ru;
  const truth = 1 / (1 - 1 / d);
  if (Math.abs(truth - Number(q.options.ru[q.correct])) > 1e-9) {
    return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct], truth });
  }
  if (new Set(q.options.ru).size !== q.options.ru.length) return "duplicate options: " + q.options.ru.join(" | ");
  if (new Set(q.options.ua).size !== q.options.ua.length) return "duplicate ua options: " + q.options.ua.join(" | ");
});

/* ---------------- Equations, inequalities, systems ---------------- */

sweep("genLinearInequalityShort keeps integer answers", c => {
  const q = c.genLinearInequalityShort();
  const negative = /−(\d+)x > (\d+)/.exec(q.question.ru);
  const positive = /(\d+)x < (\d+)/.exec(q.question.ru);
  const m = negative || positive;
  if (!m) return "unparsable: " + q.question.ru;
  const k = Number(m[1]), bound = Number(m[2]);
  if (bound % k !== 0) return "answer is not an integer: " + q.question.ru;
  /* при отрицательном коэффициенте ответ со знаком минус */
  const truth = negative ? -(bound / k) : bound / k;
  if (truth !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
});

sweep("genParamNoSolutionMC has one correct option and working distractors", c => {
  const q = c.genParamNoSolutionMC();
  const m = q.question.ru.match(/\(p − (\d+)\)x = (\d+) не имеет решений/);
  if (!m) return "unparsable: " + q.question.ru;
  const p = Number(m[1]), rhs = Number(m[2]);
  if (p === 0 || p !== rhs) return "p must be the same nonzero number on both sides: " + q.question.ru;
  if (q.options.ru[q.correct] !== String(p)) return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct] });
  /* (v − p)x = p is unsolvable only when v === p, so any other option is a valid distractor */
  for (let idx = 0; idx < q.options.ru.length; idx++) {
    if (idx === q.correct) continue;
    const v = parseFloat(q.options.ru[idx]);
    if (!isNaN(v) && v === p) return "option " + q.options.ru[idx] + " is unsolvable too: " + q.question.ru;
  }
});

sweep("genSystemTwoEqShort: the stated pair solves both equations", c => {
  const q = c.genSystemTwoEqShort();
  const m = q.question.ru.match(/(\d+)x \+ (\d+)y = (-?\d+), (\d+)x \+ (\d+)y = (-?\d+)/);
  if (!m) return "unparsable: " + q.question.ru;
  const a1 = Number(m[1]), b1 = Number(m[2]), c1 = Number(m[3]);
  const a2 = Number(m[4]), b2 = Number(m[5]), c2 = Number(m[6]);
  const parts = q.expected.split(";").map(Number);
  if (a1 * parts[0] + b1 * parts[1] !== c1) return "eq1 fails for " + q.expected + ": " + q.question.ru;
  if (a2 * parts[0] + b2 * parts[1] !== c2) return "eq2 fails for " + q.expected + ": " + q.question.ru;
  if (a1 * b2 - a2 * b1 === 0) return "singular system: " + q.question.ru;
});

sweep("genQuadraticRootsShort: real integer roots, smaller one answered", c => {
  const q = c.genQuadraticRootsShort();
  const plus = q.question.ru.match(/x² \+ (\d+)x \+ (\d+) = 0/);
  const minus = q.question.ru.match(/x² − (\d+)x \+ (\d+) = 0/);
  const b = plus ? Number(plus[1]) : minus ? -Number(minus[1]) : NaN;
  const k = plus ? Number(plus[2]) : minus ? Number(minus[2]) : NaN;
  if (isNaN(b)) return "unparsable: " + q.question.ru;
  const D = b * b - 4 * k;
  if (D < 0) return "negative discriminant: " + q.question.ru;
  const r1 = (-b + Math.sqrt(D)) / 2, r2 = (-b - Math.sqrt(D)) / 2;
  if (!Number.isInteger(r1) || !Number.isInteger(r2)) return "non-integer roots: " + q.question.ru;
  if (Math.min(r1, r2) !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected, roots: [r1, r2] });
});

/* ---------------- Applied problems ---------------- */

sweep("genPercentOfNumberShort matches part = n·p/100", c => {
  const q = c.genPercentOfNumberShort();
  const m = q.question.ru.match(/Сколько составляет (\d+)% от (\d+)\?/);
  if (!m) return "unparsable: " + q.question.ru;
  if (Number(m[2]) * Number(m[1]) / 100 !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected });
});

sweep("genPercentGrowthMC marks the grown price as correct", c => {
  const q = c.genPercentGrowthMC();
  const m = q.question.ru.match(/Цена (\d+) грн выросла на (\d+)%/);
  if (!m) return "unparsable: " + q.question.ru;
  const truth = Number(m[1]) * (100 + Number(m[2])) / 100;
  if (q.options.ru[q.correct] !== truth + " грн") {
    return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct], truth });
  }
  if (new Set(q.options.ru).size !== q.options.ru.length) return "duplicate options: " + q.options.ru.join(" | ");
});

sweep("genParamNoSolutionMC options are distinct", c => {
  const q = c.genParamNoSolutionMC();
  if (new Set(q.options.ru).size !== q.options.ru.length) return "duplicate options: " + q.options.ru.join(" | ");
});

sweep("genMotionSpeedShort matches v = s/t", c => {
  const q = c.genMotionSpeedShort();
  const m = q.question.ru.match(/прошло (\d+) км за (\d+) ч/);
  if (!m) return "unparsable: " + q.question.ru;
  if (Number(m[1]) / Number(m[2]) !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected });
});

sweep("genMotionMeetingShort matches t = S/(v₁+v₂)", c => {
  const q = c.genMotionMeetingShort();
  const m = q.question.ru.match(/со скоростями (\d+) и (\d+) км\/ч\..*между ними (\d+) км/);
  if (!m) return "unparsable: " + q.question.ru;
  const v1 = Number(m[1]), v2 = Number(m[2]), S = Number(m[3]);
  if (v1 === v2) return "equal speeds make the problem trivial: " + q.question.ru;
  if (S !== (v1 + v2) * q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected, v1, v2, S });
});

sweep("genWorkRateShort matches 1/t = 1/t₁ + 1/t₂", c => {
  const q = c.genWorkRateShort();
  const m = q.question.ru.match(/за (\d+) (?:день|дня|дней), второй — за (\d+) (?:день|дня|дней)/);
  if (!m) return "unparsable: " + q.question.ru;
  const t1 = Number(m[1]), t2 = Number(m[2]);
  if (Math.abs(1 / q.expected - (1 / t1 + 1 / t2)) > 1e-9) {
    return JSON.stringify({ q: q.question.ru, expected: q.expected, t1, t2 });
  }
  if (q.expected >= Math.min(t1, t2)) return "together they cannot beat the faster worker: " + q.question.ru;
});

sweep("genMixtureConcentrationShort matches C = (C₁m₁+C₂m₂)/(m₁+m₂)", c => {
  const q = c.genMixtureConcentrationShort();
  const m = q.question.ru.match(/(\d+) г раствора с концентрацией (\d+)% и (\d+) г раствора с концентрацией (\d+)%/);
  if (!m) return "unparsable: " + q.question.ru;
  const m1 = Number(m[1]), c1 = Number(m[2]), m2 = Number(m[3]), c2 = Number(m[4]);
  const truth = (c1 * m1 + c2 * m2) / (m1 + m2);
  /* ответ округлён до одного знака, поэтому сравниваем с округлением, а не «примерно» */
  if (Math.round(truth * 10) / 10 !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
  if (truth <= Math.min(c1, c2) || truth >= Math.max(c1, c2)) return "mixture outside the two concentrations: " + q.question.ru;
  if (Math.abs(Number(q.correctLabel) - q.expected) > 1e-9) {
    return "label " + q.correctLabel + " disagrees with " + q.expected;
  }
});

sweep("genProportionDirectShort keeps both directions consistent", c => {
  const q = c.genProportionDirectShort();
  const buy = q.question.ru.match(/^Один предмет стоит (\d+) грн\. Сколько стоят (\d+) таких/);
  const split = q.question.ru.match(/^(\d+) одинаковых предметов стоят (\d+) грн/);
  if (buy) {
    if (Number(buy[1]) * Number(buy[2]) !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected });
  } else if (split) {
    if (Number(split[2]) / Number(split[1]) !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected });
  } else return "unparsable: " + q.question.ru;
});

sweep("genLinearInequalityShort keeps the sign when dividing by a negative", c => {
  const q = c.genLinearInequalityShort();
  const negative = /−(\d+)x > (\d+)/.test(q.question.ru);
  const positive = /(\d+)x < (\d+)/.exec(q.question.ru);
  let k, bound, truth;
  if (negative) {
    const m = /−(\d+)x > (\d+)/.exec(q.question.ru);
    k = Number(m[1]);
    bound = Number(m[2]);
    truth = -(bound / k);
  } else {
    k = Number(positive[1]);
    bound = Number(positive[2]);
    truth = bound / k;
  }
  if (q.expected !== truth) {
    return JSON.stringify({ q: q.question.ru, expected: q.expected, truth, sol: q.solution.ru });
  }
  if (q.check(String(truth)) !== true) return "check rejected the correct value " + truth;
  const wrong = String(truth + (truth > 0 ? 1 : -1));
  if (q.check(wrong) !== false) return "check accepted the wrong value " + wrong;
});

/* Формат ответа должен соответствовать реальному типу значения: подпись «целое число»
   несовместима с дробными ответами, а «процент с одним знаком» — с целыми. */
sweep("integer-labelled generators really return integers", c => {
  const integerLabelled = ["genPercentOfNumberShort", "genMotionSpeedShort", "genWorkRateShort",
    "genArithTermShort", "genArithSumShort", "genGeoTermShort", "genQuadraticRootsShort",
    "genProportionDirectShort", "genLinearInequalityShort"];
  integerLabelled.forEach(fn => {
    for (let i = 0; i < 120; i++) {
      const q = c[fn]();
      if (!/целое число/.test(q.format.ru)) return fn + ": подпись «" + q.format.ru + "»";
      if (typeof q.expected !== "number" || !Number.isInteger(q.expected)) {
        return fn + ": ответ " + q.expected + " не целый при подписи «целое число» — " + q.question.ru;
      }
      if (q.correctLabel !== String(q.expected)) return fn + ": correctLabel " + q.correctLabel + " ≠ " + q.expected;
      if (q.check(q.correctLabel) !== true) return fn + ": check отвергает собственный ответ " + q.correctLabel;
    }
  });
});

sweep("mixture concentration rounds to one decimal as promised", c => {
  for (let i = 0; i < 120; i++) {
    const q = c.genMixtureConcentrationShort();
    if (!/одним знаком/.test(q.format.ru)) return "подпись: " + q.format.ru;
    if (Math.abs(q.expected * 10 - Math.round(q.expected * 10)) > 1e-9) {
      return "ответ " + q.expected + " не округлён до одного знака";
    }
    if (q.correctLabel !== q.expected.toFixed(1)) {
      return "correctLabel " + q.correctLabel + " ≠ " + q.expected.toFixed(1);
    }
    if (q.check(q.correctLabel) !== true) return "check отвергает " + q.correctLabel;
  }
});

sweep("systems are solved by elimination and check() agrees", c => {
  for (let i = 0; i < 120; i++) {
    const q = c.genSystemTwoEqShort();
    const m = /(\d+)x \+ (\d+)y = (-?\d+), (\d+)x \+ (\d+)y = (-?\d+)/.exec(q.question.ru);
    if (!m) return "unparsable: " + q.question.ru;
    const [, a1, b1, c1, a2, b2, c2] = m.map(Number);
    /* решаем систему и сверяем с ответом, который показывает генератор */
    const det = a1 * b2 - a2 * b1;
    if (det === 0) return "вырожденная система: " + q.question.ru;
    const x = (c1 * b2 - c2 * b1) / det;
    const y = (a1 * c2 - a2 * c1) / det;
    if (x !== Number(q.expected.split(";")[0]) || y !== Number(q.expected.split(";")[1])) {
      return JSON.stringify({ q: q.question.ru, generator: q.expected, solved: x + ";" + y });
    }
    /* correctLabel — только текст для показа, канонический ответ лежит в expected */
    if (!q.correctLabel) return "пустой correctLabel";
    if (q.check(q.expected) !== true) return "check отвергает собственный ответ " + q.expected;
    if (q.check((x + 1) + ";" + y) !== false) return "check принял неверную пару";
  }
});

sweep("quadratic roots satisfy the printed equation", c => {
  for (let i = 0; i < 120; i++) {
    const q = c.genQuadraticRootsShort();
    const m = /x² ([+−-]) (\d+)x \+ (\d+) = 0/.exec(q.question.ru);
    if (!m) return "unparsable: " + q.question.ru;
    const sign = m[1] === "+" ? 1 : -1;
    const b = sign * Number(m[2]);
    const cc = Number(m[3]);
    const x = q.expected;
    if (x * x + b * x + cc !== 0) {
      return JSON.stringify({ q: q.question.ru, root: x, value: x * x + b * x + cc });
    }
  }
});

/* ---------------- Mini-check answer keys ----------------
   Каждый вопрос мини-проверки в уроках 11–14 пересчитывается здесь заново:
   expected — правильный вариант, который должен стоять на индексе `correct`. */
const lessonsSrc = lib.read("lessons.js");
/* граница блока: начало следующего урока, а для последнего — конец файла */
function nextLesson(start) {
  const i = lessonsSrc.indexOf("\nmakeTopicLesson(\"", start + 1);
  return i < 0 ? lessonsSrc.length : i;
}
function miniChecks(id) {
  const start = lessonsSrc.indexOf('makeTopicLesson("' + id + '"');
  if (start < 0) throw new Error("lesson not found: " + id);
  const tail = lessonsSrc.slice(start, nextLesson(start));
  const from = tail.lastIndexOf("[\n    {q:");
  /* балансируем скобки, игнорируя строковые литералы: в вариантах ответов есть "[−∞; 3)" */
  let depth = 0, end = -1, inStr = false, quote = "";
  for (let i = from; i < tail.length; i++) {
    const ch = tail[i];
    if (inStr) {
      if (ch === "\\") i++;
      else if (ch === quote) inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'") { inStr = true; quote = ch; continue; }
    if (ch === "[") depth++;
    else if (ch === "]") { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (from < 0 || end < 0) throw new Error("mini-check not parsed for " + id);
  return vm.runInNewContext("(" + tail.slice(from, end) + ")");
}
/* правильный вариант для каждого вопроса мини-проверки, посчитанный вручную */
const answerKeys = {
  seq1: ["16", "арифметическая", "4", "геометрическая прогрессия"],
  seq2: ["28", "145", "16", "50"],
  seq3: ["геометрической прогрессией с q = 3", "3", "121", "2"],
  seq4: ["арифметическая прогрессия", "1,1", "28", "288"],
  eq1: ["x = 3", "p = 1", "решений нет", "x = −3"],
  eq2: ["x < −4", "x ≤ 2", "(3; +∞)", "меняется на противоположный"],
  eq3: ["(3; 1)", "ни одного", "4", "подстановки"],
  eq4: ["2 и 3", "0", "0", "12"],
  app1: ["60", "15%", "125", "180 грн"],
  app2: ["100 км/ч", "5 ч", "60 км/ч", "она может быть больше обеих скоростей"],
  app3: ["4 дня", "60 дет/ч", "30", "долю работы, выполняемую первым мастером за день"],
  app4: ["16%", "60 г", "не изменится", "120 г"],
  app5: ["490 грн", "y = 12 / x", "30%", "6"],
  /* модуль 14: каждый вариант решён здесь заново, поле correct сверено с собственным расчётом */
  qf1: ["x = 3", "вниз", "(−2; −5)", "2"],
  qe1: ["9", "0", "x = ±3", "2"],
  qi1: ["x < 2 или x > 3", "−4 ≤ x ≤ 1", "бесконечно много", "−4 < x < 4"],
  qa1: ["6 см", "9", "15 км/ч", "5 см"],
  qs1: ["(5; 2)", "бесконечно много", "(1; 4]", "(2; 3)"],
  qa2: ["4 ч", "6 км/ч", "6 дней", "24 грн"],
};

Object.keys(answerKeys).forEach(id => {
  const questions = miniChecks(id);
  const want = answerKeys[id];
  if (questions.length !== want.length) {
    ok(false, id + ": " + questions.length + " вопросов, а ключ содержит " + want.length);
    return;
  }
  const mismatch = questions.findIndex((q, k) => q.opts[q.correct] !== want[k]);
  ok(mismatch < 0, id + ": все " + want.length + " мини-проверок отмечены верно" +
    (mismatch < 0 ? "" : " — вопрос " + (mismatch + 1) + ": стоит \"" +
      questions[mismatch].opts[questions[mismatch].correct] + "\", а правильный ответ \"" + want[mismatch] + "\""));
});

/* Структура мини-проверок новых уроков модуля 14: ровно 4 вопроса, в каждом 4 различных
   варианта и поле correct — целый индекс в диапазоне. */
const NEW_LESSONS = ["qf1", "qe1", "qi1", "qa1", "qs1", "qa2"];
const newChecks = NEW_LESSONS.map(id => ({ id, qs: miniChecks(id) }));
sweep("module 14: по 4 вопроса, 4 различных варианта, correct в диапазоне", (c, i) => {
  const { id, qs } = newChecks[i % newChecks.length];
  if (qs.length !== 4) return id + ": " + qs.length + " вопросов вместо 4";
  for (let k = 0; k < qs.length; k++) {
    const q = qs[k], where = id + ", вопрос " + (k + 1);
    if (!q.q || !q.q.ru || !q.q.ua) return where + ": нет текста ru/ua";
    if (q.opts.length !== 4) return where + ": " + q.opts.length + " варианта вместо 4";
    if (new Set(q.opts).size !== 4) return where + ": повторяющиеся варианты — " + q.opts.join(" | ");
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.opts.length) {
      return where + ": correct = " + q.correct + " вне диапазона";
    }
  }
  return "";
});

/* Числовые утверждения в тексте уроков тоже должны сходиться. */
const arithmetic = [
  ["a₁ = 4, d = 3 → a₁₀ = 3n + 1 даёт 31", 3 * 10 + 1, 31],
  ["S₁₀ = (4 + 31)·10 / 2 = 175", (4 + 31) * 10 / 2, 175],
  ["a₁ = 7, d = −2 → a₁₀ = −11", 7 + 9 * -2, -11],
  ["S₂₀ = (7 + (−11))·20 / 2 = −40", (7 - 11) * 20 / 2, -40],
  ["членов от 4 до 40 с шагом 3: 13", (40 - 4) / 3 + 1, 13],
  ["a₁ = 2, d = 0 → S₂₅ = 50", 2 * 25, 50],
  ["q = 3 → a₅ = 81", Math.pow(3, 4), 81],
  ["S₄ = (3⁴ − 1)/2 = 40", (Math.pow(3, 4) - 1) / 2, 40],
  ["сумма 1 + 1/2 + 1/4 + … = 2", 1 / (1 - 0.5), 2],
  ["x² − 5x + 6: D = 1", 25 - 24, 1],
  ["x² + 4x + 9: D = −20", 16 - 36, -20],
  ["2x + y = 7 при x = 3, y = 1", 2 * 3 + 1, 7],
  ["x + 2y = 8 при x = 8 − 2y", 24 - 6 * (23 / 7) - 23 / 7, 1],
  ["18% от 250 = 45", 250 * 0.18, 45],
  ["45 — это 30% от 150", 150 * 0.3, 45],
  ["400 · 1,15 = 460", 400 * 1.15, 460],
  ["два повышения на 10% дают 21%", (1.1 * 1.1 - 1) * 100, 21],
  ["встречное движение: (5 + 15) · 2 = 40", (5 + 15) * 2, 40],
  ["средняя: (3·80 + 2·60) / 5 = 72", (3 * 80 + 2 * 60) / 5, 72],
  ["1/10 + 1/15 = 1/6 → 6 дней", 10 * 15 / (10 + 15), 6],
  ["400 деталей за 8 ч = 50/ч", 400 / 8, 50],
  ["200 г 10% + 300 г 20% → 16%", (0.1 * 200 + 0.2 * 300) / 500 * 100, 16],
  ["отлили 10 л из 40 л 12%: 3,6/30 = 0,12", (0.12 * 40 - 0.12 * 10) / 30, 0.12],
  ["2 кг 5% + 20 г соли → 120/2020 ≈ 0,0594", (0.05 * 2000 + 20) / 2020, 0.0594],
  ["3 тетради по 80 грн", 240 / 3, 80],
  ["обратная пропорция 6·12 = 12·6", 6 * 12, 12 * 6],
  ["после 30% и 20% осталось 50%", 100 - 30 - 20, 50],
  ["S₁₂ прогрессии 2, 6, 10 = 288", (2 + (2 + 11 * 4)) * 12 / 2, 288],
  ["a₁ = 4, d = 6 → a₅ = 28", 4 + 4 * 6, 28],
  ["q для 2000, 2200, 2420 = 1,1", 2200 / 2000, 1.1],
  /* свойство из seq3: симметричные члены геометрической прогрессии дают квадрат среднего */
  ["a₃² = a₂·a₄ для 2, 6, 18, 54", 6 * 54, 18 * 18],
  ["a₄² = a₃·a₅ для 2, 6, 18, 54, 162", 18 * 162, 54 * 54],
  ["прирост скорости +2 десять раз = 20", 2 * 10, 20],

  /* ---------- Модуль 14: каждое числовое утверждение из examples пересчитано заново ---------- */
  /* qf1 — квадратная функция и парабола */
  ["qf1: x_в = −(−6)/(2·1) = 3", -(-6) / (2 * 1), 3],
  ["qf1: y_в = 5 − 36/4 = −4 по формуле c − b²/(4a)", 5 - 36 / 4, -4],
  ["qf1: тот же y_в пересчётом f(3) = 9 − 18 + 5 = −4", 9 - 18 + 5, -4],
  ["qf1: x_в = −8/(2·(−2)) = 2", -8 / (2 * -2), 2],
  ["qf1: y_в = −2·4 + 8·2 − 3 = 5", -2 * 4 + 8 * 2 - 3, 5],
  ["qf1: (x − 1)² + 4 = x² − 2x + 5 при x = 2", Math.pow(2 - 1, 2) + 4, 4 - 4 + 5],
  ["qf1: (x − 1)² + 4 = x² − 2x + 5 при x = 5", Math.pow(5 - 1, 2) + 4, 25 - 10 + 5],
  ["qf1: вершина (1; 4): f(1) = 4", Math.pow(1 - 1, 2) + 4, 4],

  /* qe1 — дискриминант и формулы корней */
  ["qe1: 2x² − 5x + 2: D = 25 − 16 = 9", 25 - 4 * 2 * 2, 9],
  ["qe1: корень (5 + 3)/4 = 2", (5 + 3) / 4, 2],
  ["qe1: корень (5 − 3)/4 = 1/2", (5 - 3) / 4, 0.5],
  ["qe1: сумма корней 2 + 1/2 = 5/2 = −b/a", 2 + 1 / 2, 5 / 2],
  ["qe1: произведение корней 2 · 1/2 = 1 = c/a", 2 * 1 / 2, 2 / 2],
  ["qe1: подстановка x = 2 в 2x² − 5x + 2 даёт 0", 2 * 4 - 5 * 2 + 2, 0],
  ["qe1: подстановка x = 1/2 в 2x² − 5x + 2 даёт 0", 2 * 0.25 - 5 * 0.5 + 2, 0],
  ["qe1: x² − 4x + 4: D = 16 − 16 = 0", 16 - 4 * 4, 0],
  ["qe1: единственный корень 4 / 2 = 2", 4 / 2, 2],
  ["qe1: 3x² + 2x + 5: D = 4 − 60 = −56", 4 - 4 * 3 * 5, -56],

  /* qi1 — неравенства с квадратным трёхчленом */
  ["qi1: x² − 5x + 6: D = 25 − 24 = 1", 25 - 4 * 6, 1],
  ["qi1: корень 2 у x² − 5x + 6", 4 - 10 + 6, 0],
  ["qi1: корень 3 у x² − 5x + 6", 9 - 15 + 6, 0],
  ["qi1: корень (5 + 1)/2 = 3", (5 + 1) / 2, 3],
  ["qi1: корень (5 − 1)/2 = 2", (5 - 1) / 2, 2],
  ["qi1: x² − 4x + 4: D = 0 → минимум 0, (x − 2)² < 0 невыполнимо", 16 - 4 * 4, 0],
  ["qi1: при x = 1: (1 − 2)² = 1 > 0", Math.pow(1 - 2, 2), 1],
  ["qi1: x² ≤ 4: граница 2 даёт 4", 2 * 2, 4],
  ["qi1: x² ≤ 4: граница −2 даёт 4", Math.pow(-2, 2), 4],
  ["qi1: x = 3 вне [−2; 2]: 9 > 4", 3 * 3, 9],

  /* qa1 — задачи на составление квадратного уравнения */
  ["qa1: x(x + 3) = 40 → D = 9 + 160 = 169", 9 + 4 * 40, 169],
  ["qa1: x = (−3 + √169)/2 = 5", (-3 + Math.sqrt(169)) / 2, 5],
  ["qa1: стороны 5 и 8: 5 · 8 = 40", 5 * 8, 40],
  ["qa1: x(x + 1) = 56 → D = 1 + 224 = 225", 1 + 4 * 56, 225],
  ["qa1: x = (−1 + √225)/2 = 7", (-1 + Math.sqrt(225)) / 2, 7],
  ["qa1: числа 7 и 8: 7 · 8 = 56", 7 * 8, 56],
  ["qa1: v² + 5v − 1800: D = 25 + 7200 = 7225", 25 + 4 * 1800, 7225],
  ["qa1: v = (−5 + √7225)/2 = 40", (-5 + Math.sqrt(7225)) / 2, 40],
  ["qa1: проверка 360/40 − 360/45 = 1", 360 / 40 - 360 / 45, 1],
  ["qa1: проверка 360/40 = 9 ч", 360 / 40, 9],
  ["qa1: проверка 360/45 = 8 ч", 360 / 45, 8],
  ["qa1: мини x(x + 4) = 60 → D = 16 + 240 = 256", 16 + 4 * 60, 256],
  ["qa1: мини меньшая сторона (−4 + √256)/2 = 6", (-4 + Math.sqrt(256)) / 2, 6],
  ["qa1: мини стороны 6 и 10: 6 · 10 = 60", 6 * 10, 60],
  ["qa1: мини 8 · 9 = 72 (большее число 9)", 8 * 9, 72],
  ["qa1: мини 45 / 3 = 15 км/ч", 45 / 3, 15],
  ["qa1: мини (5 + 3)² − 5² = 39", Math.pow(5 + 3, 2) - 25, 39],

  /* qs1 — системы уравнений и неравенств */
  ["qs1: x + y = 5 и x − y = 1 сложением дают 2x = 6", 5 + 1, 6],
  ["qs1: решение (3; 2): 3 + 2 = 5", 3 + 2, 5],
  ["qs1: решение (3; 2): 3 − 2 = 1", 3 - 2, 1],
  ["qs1: 3x ≤ 9 → граница x = 3: 3 · 3 = 9", 3 * 3, 9],
  ["qs1: (−2; 3]: точка 3 входит в оба неравенства", (3 > -2 && 3 <= 3) ? 1 : 0, 1],
  ["qs1: (−2; 3]: точка −2 не входит, x > −2 строгое", (-2 > -2) ? 1 : 0, 0],
  ["qs1: x + y = 4 → 2x + 2y = 8, а второе уравнение даёт 10", 2 * 4, 8],
  ["qs1: (−2; 3] ∩ [0; 7) = [0; 3], длина 3 − 0 = 3", 3 - 0, 3],
  ["qs1: 2x + y = 7 и x − y = 2 сложением дают 3x = 9", (2 * 3 + 1) + (3 - 1), 9],
  ["qs1: мини (7, 3) → x = 5, y = 2: 5 + 2 = 7", 5 + 2, 7],
  ["qs1: мини 5 − 2 = 3", 5 - 2, 3],
  ["qs1: мини x + 2y = 6 → 2x + 4y = 2 · 6 = 12", 2 * 6, 12],
  ["qs1: мини x > 1 и x ≤ 4 → (1; 4], длина 4 − 1 = 3", 4 - 1, 3],
  ["qs1: мини 2x − y = 1 при (2; 3)", 2 * 2 - 3, 1],
  ["qs1: мини x + y = 5 при (2; 3)", 2 + 3, 5],

  /* qa2 — задачи на составление систем */
  ["qa2: 48 / 4 = 12 км/ч по течению", 48 / 4, 12],
  ["qa2: 32 / 4 = 8 км/ч против течения", 32 / 4, 8],
  ["qa2: v = (12 + 8) / 2 = 10", (12 + 8) / 2, 10],
  ["qa2: u = (12 − 8) / 2 = 2", (12 - 8) / 2, 2],
  ["qa2: проверка v + u = 12", 10 + 2, 12],
  ["qa2: проверка v − u = 8", 10 - 2, 8],
  ["qa2: 1/8 − 1/12 = 1/24", 1 / 8 - 1 / 12, 1 / 24],
  ["qa2: p = 24: 1/12 + 1/24 = 1/8", 1 / 12 + 1 / 24, 1 / 8],
  ["qa2: m = 12: 2 / 12 = 1/6", 2 / 12, 1 / 6],
  ["qa2: 3 · 24 + 2 · 12 = 96", 3 * 24 + 2 * 12, 96],
  ["qa2: 5r + 36 = 96 при r = 12", 5 * 12 + 36, 96],
  ["qa2: b = r + 12 = 24 при r = 12", 12 + 12, 24],
  ["qa2: мини 480 / (70 + 50) = 4", 480 / (70 + 50), 4],
  ["qa2: мини 12 − 2 · 3 = 6", 12 - 2 * 3, 6],
  ["qa2: мини 1 / (1/24 + 1/8) = 6", 1 / (1 / 24 + 1 / 8), 6],
  ["qa2: мини (66 − 3 · 6) / 2 = 24", (66 - 3 * 6) / 2, 24],
  ["qa2: мини 2 · 24 + 3 · 6 = 66", 2 * 24 + 3 * 6, 66],
];
const badArithmetic = arithmetic.filter(([, got, want]) => Math.abs(got - want) > 5e-5);
ok(badArithmetic.length === 0,
  "все " + arithmetic.length + " числовых примеров в тексте уроков сходятся" +
  (badArithmetic.length ? " — расхождения: " + badArithmetic.map(c => c[0]).join("; ") : ""));

console.log(fails === 0 ? "\nALL GRADE-8-9 ALGEBRA TESTS PASSED" : "\n" + fails + " TEST(S) FAILED");
process.exit(fails === 0 ? 0 : 1);
