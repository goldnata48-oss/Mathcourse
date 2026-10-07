/* Trainer generators for grades 5-7: angles, perimeter/area, circle π formulas,
   box volume, ratios, and the module-1 algebra base (divisibility, fractions,
   decimals, remainders, powers, expressions, inequalities, like terms, ФСУ,
   linear equations/functions, systems). Each generator is re-derived from the
   numbers printed in its own question text, so a wrong key or inconsistent
   statement fails here instead of reaching a student. */
const lib = require("../tools/lib");

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log("FAIL: " + m); } else console.log("ok: " + m); };

const ctx = lib.loadTrainer();
const ITER = 400;

function sweep(name, probe) {
  let reason = "";
  for (let i = 0; i < ITER && !reason; i++) reason = probe(ctx, i) || "";
  ok(!reason, name + (reason ? " -> " + reason : ""));
  return reason;
}

const angleClass = d => d < 90 ? "acute" : d === 90 ? "right" : d < 180 ? "obtuse" : "straight";
const RU_WORD = { acute: "острый", right: "прямой", obtuse: "тупой", straight: "развёрнутый" };
const RU_MEASURE = { acute: "острым", right: "прямым", obtuse: "тупым", straight: "развёрнутым" };

sweep("genAngleTypesMC: вид угла и градусная мера согласованы", c => {
  const q = c.genAngleTypesMC();
  const m = q.question.ru.match(/Угол α = (\d+)° является:/);
  if (m) {
    const cls = angleClass(Number(m[1]));
    if (q.options.ru[q.correct] !== RU_MEASURE[cls]) {
      return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct], want: RU_MEASURE[cls] });
    }
  } else {
    const t = q.question.ru.match(/Какой из углов — (острый|прямой|тупой|развёрнутый)\?/);
    if (!t) return "unparsable: " + q.question.ru;
    const wanted = Object.keys(RU_WORD).find(k => RU_WORD[k] === t[1]);
    const chosen = Number(q.options.ru[q.correct].replace("°", ""));
    if (angleClass(chosen) !== wanted) {
      return JSON.stringify({ q: q.question.ru, wanted: RU_WORD[wanted], chosen: q.options.ru[q.correct] });
    }
  }
  if (new Set(q.options.ru).size !== q.options.ru.length) return "duplicate ru options: " + q.options.ru.join(" | ");
  if (new Set(q.options.ua).size !== q.options.ua.length) return "duplicate ua options: " + q.options.ua.join(" | ");
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= 4) return "correct out of range: " + q.correct;
});

sweep("genPerimeterAreaShort matches P = 2(a+b), P = 4a, S = ab, S = a²", c => {
  const q = c.genPerimeterAreaShort();
  let a, b, truth;
  const mP = q.question.ru.match(/Найдите периметр квадрата со стороной (\d+) см\./);
  const mS = q.question.ru.match(/Найдите площадь квадрата со стороной (\d+) см\./);
  const mPr = q.question.ru.match(/Найдите периметр прямоугольника со сторонами (\d+) см и (\d+) см\./);
  const mSr = q.question.ru.match(/Найдите площадь прямоугольника со сторонами (\d+) см и (\d+) см\./);
  if (mP) { a = Number(mP[1]); truth = 4 * a; }
  else if (mS) { a = Number(mS[1]); truth = a * a; }
  else if (mPr) { a = Number(mPr[1]); b = Number(mPr[2]); truth = 2 * (a + b); }
  else if (mSr) { a = Number(mSr[1]); b = Number(mSr[2]); truth = a * b; }
  else return "unparsable: " + q.question.ru;
  if (truth !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
  if (q.correctLabel !== String(truth)) return "correctLabel " + q.correctLabel + " ≠ " + truth;
  if (q.check(String(truth)) !== true) return "check rejects its own answer " + truth;
  if (q.check(String(truth + 1)) !== false) return "check accepts a wrong answer " + (truth + 1);
});

sweep("genCircleBasicsShort matches C = 2πR = πd and S = πR² (через π)", c => {
  const q = c.genCircleBasicsShort();
  let r, d, coef;
  const m = q.question.ru.match(/Найдите (длину окружности|площадь круга), если (?:его|её) (радиус|диаметр) равен (\d+)\./);
  if (!m) return "unparsable: " + q.question.ru;
  const what = m[1], which = m[2], val = Number(m[3]);
  if (what === "длину окружности") coef = which === "радиус" ? 2 * val : val;
  else { r = which === "радиус" ? val : val / 2; coef = r * r; }
  if (q.correctLabel !== coef + "π") return JSON.stringify({ q: q.question.ru, correctLabel: q.correctLabel, want: coef + "π" });
  if (q.check(coef + "π") !== true) return "check rejects " + coef + "π";
  if (q.check(coef + "pi") !== true) return "check rejects latin " + coef + "pi";
  if (Math.abs(q.expected - coef * Math.PI) > 1e-9) return "expected ≠ " + coef + "π: " + q.expected;
  const wrong = coef === 0 ? 0 : coef + 1;
  if (q.check(String(wrong)) !== false) return "check accepts a wrong number " + wrong;
});

sweep("genBoxVolumeShort matches V = a³ and V = a·b·c as integers", c => {
  const q = c.genBoxVolumeShort();
  let truth, a, b, cc;
  const mCube = q.question.ru.match(/Куб: ребро a = (\d+) см\./);
  const mBox = q.question.ru.match(/Прямоугольный параллелепипед: a = (\d+), b = (\d+), c = (\d+) см\./);
  if (mCube) { a = Number(mCube[1]); truth = a * a * a; }
  else if (mBox) { a = Number(mBox[1]); b = Number(mBox[2]); cc = Number(mBox[3]); truth = a * b * cc; }
  else return "unparsable: " + q.question.ru;
  if (!Number.isInteger(truth)) return "non-integer answer: " + q.question.ru;
  if (truth !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
  if (q.correctLabel !== String(truth)) return "correctLabel " + q.correctLabel + " ≠ " + truth;
  if (q.check(String(truth)) !== true) return "check rejects its own answer " + truth;
  if (q.check(String(truth + 1)) !== false) return "check accepts a wrong answer " + (truth + 1);
  if (/параллелепіпед/.test(JSON.stringify(q))) return "UA typo: параллелепіпед → паралелепіпед";
});

sweep("genRatioProportionShort: неизвестный член по a·d = b·c верен", c => {
  const q = c.genRatioProportionShort();
  const m = q.question.ru.match(/Найдите неизвестный член пропорции: x \/ (\d+) = (\d+) \/ (\d+)\./);
  if (m) {
    const truth = Number(m[1]) * Number(m[2]) / Number(m[3]);
    if (!Number.isInteger(truth)) return "non-integer answer: " + q.question.ru;
    if (truth !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
    if (q.correctLabel !== String(truth)) return "correctLabel " + q.correctLabel + " ≠ " + truth;
    if (q.check(String(truth)) !== true) return "check rejects its own answer " + truth;
    return "";
  }
  const s = q.question.ru.match(/Сократите отношение (\d+) : (\d+) и запишите его в виде числа \(целое число\)\./);
  if (s) {
    const truth = Number(s[1]) / Number(s[2]);
    if (!Number.isInteger(truth)) return "non-integer ratio: " + q.question.ru;
    if (truth !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
    if (q.correctLabel !== String(truth)) return "correctLabel " + q.correctLabel + " ≠ " + truth;
    if (q.check(String(truth)) !== true) return "check rejects its own answer " + truth;
    return "";
  }
  return "unparsable: " + q.question.ru;
});

/* обе ветки genAngleTypesMC должны появляться */
{
  let sawMeasure = 0, sawType = 0;
  for (let i = 0; i < 200; i++) {
    const q = ctx.genAngleTypesMC();
    if (/Угол α =/.test(q.question.ru)) sawMeasure++;
    if (/Какой из углов/.test(q.question.ru)) sawType++;
  }
  ok(sawMeasure > 0 && sawType > 0, "genAngleTypesMC outputs both branches in 200 draws (" + sawMeasure + " / " + sawType + ")");
}

/* ================ Модуль 1: алгебраическая база (5-7) ================ */

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a; };
const reduced = (n, d) => { const g = gcd(n, d) || 1; return (d / g === 1) ? String(n / g) : (n / g) + "/" + (d / g); };
const fracVal = s => { const p = s.split("/"); return p.length === 2 ? Number(p[0]) / Number(p[1]) : Number(s); };
const SUP = { "⁰":0,"¹":1,"²":2,"³":3,"⁴":4,"⁵":5,"⁶":6,"⁷":7,"⁸":8,"⁹":9 };
const supToInt = s => s ? s.split("").reduce((a, d) => a * 10 + SUP[d], 0) : NaN;
const un = s => String(s).replace(/−/g, "-").replace(/\s/g, "");

sweep("genDivisibilityMC: правильный вариант кратен k, дистракторы нет", c => {
  const q = c.genDivisibilityMC();
  const m = q.question.ru.match(/Какое из чисел делится на (\d+) без остатка\?/);
  if (!m) return "unparsable: " + q.question.ru;
  const k = Number(m[1]);
  for (let i = 0; i < q.options.ru.length; i++) {
    const v = Number(q.options.ru[i]);
    const divisible = v % k === 0;
    if (i === q.correct && !divisible) return "правильный " + v + " не кратен " + k;
    if (i !== q.correct && divisible) return "дистрактор " + v + " тоже кратен " + k;
  }
  if (new Set(q.options.ru).size !== q.options.ru.length) return "duplicate options: " + q.options.ru.join(" | ");
});

sweep("genFractionMC: дроби в ответах верны и сокращены", c => {
  const q = c.genFractionMC();
  const m = /^(?:Сократите дробь (\d+)\/(\d+)\.|Сложите дроби: (\d+)\/(\d+) \+ (\d+)\/(\d+)\.|Умножьте дроби: (\d+)\/(\d+) и (\d+)\/(\d+)\.|Какая из дробей равна (\d+)\/(\d+)\?)$/.exec(q.question.ru);
  if (!m) return "unparsable: " + q.question.ru;
  let truth;
  if (m[1]) truth = reduced(Number(m[1]), Number(m[2]));
  else if (m[3]) truth = reduced(m[3] * m[6] + m[5] * m[4], m[4] * m[6]);
  else if (m[7]) truth = reduced(m[7] * m[9], m[8] * m[10]);
  else truth = reduced(Number(m[11]), Number(m[12]));
  if (q.options.ru[q.correct] !== truth) {
    return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct], truth });
  }
  if (fracVal(q.options.ru[q.correct]) !== fracVal(truth)) return "значение не совпало: " + q.question.ru;
  for (let i = 0; i < q.options.ru.length; i++) {
    if (i === q.correct) continue;
    if (fracVal(q.options.ru[i]) === fracVal(truth)) return "дистрактор равен правильному: " + q.options.ru[i];
    const g = gcd(...q.options.ru[i].split("/").map(Number));
    if (!isNaN(g) && g > 1) return "дистрактор не сокращён: " + q.options.ru[i];
  }
  if (new Set(q.options.ru).size !== q.options.ru.length) return "duplicate options: " + q.options.ru.join(" | ");
});

sweep("genDecimalShort: обыкновенная→десят. и сумма сходятся", c => {
  const q = c.genDecimalShort();
  let truth;
  const conv = q.question.ru.match(/Запишите дробь (\d+)\/(\d+) в виде десятичной дроби\./);
  const add = q.question.ru.match(/Найдите сумму: ([0-9,]+) \+ ([0-9,]+)\./);
  if (conv) truth = Number(conv[1]) / Number(conv[2]);
  else if (add) truth = Number(add[1].replace(",", ".")) + Number(add[2].replace(",", "."));
  else return "unparsable: " + q.question.ru;
  if (Math.abs(truth - q.expected) > 1e-9) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
  if (q.correctLabel !== String(truth).replace(".", ",")) return "correctLabel " + q.correctLabel + " ≠ " + truth;
  if (q.check(String(truth).replace(".", ",")) !== true) return "check rejects its own comma answer";
  const wrong = truth + 1 != truth ? truth + 1 : truth + 0.5;
  if (q.check(String(wrong).replace(".", ",")) !== false) return "check accepts wrong " + wrong;
});

sweep("genRemainderShort: остаток = a − b·[a/b]", c => {
  const q = c.genRemainderShort();
  const m = q.question.ru.match(/Найдите остаток при делении (\d+) на (\d+)\./);
  if (!m) return "unparsable: " + q.question.ru;
  const a = Number(m[1]), b = Number(m[2]);
  const truth = a % b;
  if (truth !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
  if (q.correctLabel !== String(truth)) return "correctLabel " + q.correctLabel;
  if (q.check(String(truth)) !== true) return "check rejects its own answer";
});

sweep("genPowerIntShort: степени пересчитаны по свойствам", c => {
  const q = c.genPowerIntShort();
  let truth, isFloat = false;
  const mul = /^Найдите значение: (\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) · (\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\.$/.exec(q.question.ru);
  const div = /^Найдите значение: (\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) : (\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\.$/.exec(q.question.ru);
  const pow = /^Найдите значение: \((\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\.$/.exec(q.question.ru);
  const zero = /^Найдите значение: (\d+)⁰\.$/.exec(q.question.ru);
  if (mul) {
    if (mul[1] !== mul[3]) return "разные основания: " + q.question.ru;
    truth = Math.pow(Number(mul[1]), supToInt(mul[2]) + supToInt(mul[4]));
  } else if (div) {
    if (div[1] !== div[3]) return "разные основания: " + q.question.ru;
    truth = Math.pow(Number(div[1]), supToInt(div[2]) - supToInt(div[4]));
  } else if (pow) {
    truth = Math.pow(Number(pow[1]), supToInt(pow[2]) * supToInt(pow[3]));
  } else if (zero) {
    truth = 1;
  } else {
    if (!/^Найдите значение: 10⁻²\.$/.test(q.question.ru)) return "unparsable: " + q.question.ru;
    truth = 0.01; isFloat = true;
  }
  const okVal = isFloat ? Math.abs(q.expected - 0.01) < 1e-9 : q.expected === truth;
  if (!okVal) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
  if (q.correctLabel !== (isFloat ? "0,01" : String(truth))) return "correctLabel " + q.correctLabel;
  if (q.check(q.correctLabel) !== true) return "check rejects its own label " + q.correctLabel;
});

sweep("genExprValueShort: значение пересчитано подстановкой", c => {
  const q = c.genExprValueShort();
  const m = q.question.ru.match(/Найдите значение выражения (.+) при x = (\d+)\./);
  if (!m) return "unparsable: " + q.question.ru;
  const n = Number(m[2]);
  const s = m[1].replace(/x²/g, "(" + n + "*" + n + ")")
    .replace(/(\d)x/g, "$1*x")
    .replace(/x/g, String(n))
    .replace(/−/g, "-")
    .replace(/(\d|\))\(/g, "$1*(");
  let truth; try { truth = Function("return (" + s + ")")(); } catch (e) { return "eval failed: " + s; }
  if (!Number.isInteger(truth) || truth !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
  if (q.correctLabel !== String(truth)) return "correctLabel " + q.correctLabel;
  if (q.check(String(truth)) !== true) return "check rejects its own answer";
});

sweep("genIneqCompareMC: сравнение, минимум и решение неравенства верны", c => {
  const q = c.genIneqCompareMC();
  const smallest = /^Какое из чисел наименьшее\?$/.test(q.question.ru);
  const compare = q.question.ru.match(/^Сравните: (-?\d+) и (-?\d+)\.$/);
  const solve = q.question.ru.match(/^Решите неравенство (.+)\.$/);
  const numline = q.question.ru.match(/^На координатной прямой какое число расположено левее: ([-−]?\d+) или ([-−]?\d+)\?$/);
  if (smallest) {
    const min = Math.min(...q.options.ru.map(s => Number(s.replace("−", "-"))));
    if (Number(q.options.ru[q.correct].replace("−", "-")) !== min) {
      return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct], min });
    }
  } else if (compare) {
    const a = Number(compare[1]), b = Number(compare[2]);
    const rel = a > b ? ">" : a < b ? "<" : "=";
    if (un(q.options.ru[q.correct]) !== un(a + " " + rel + " " + b)) {
      return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct], truth: a + " " + rel + " " + b });
    }
  } else if (solve) {
    const t = un(solve[1]);
    let truth;
    let m;
    if ((m = /^x\+(\d+)<(\d+)$/.exec(t))) truth = "x<" + (Number(m[2]) - Number(m[1]));
    else if ((m = /^x-(\d+)>(\d+)$/.exec(t))) truth = "x>" + (Number(m[2]) + Number(m[1]));
    else if ((m = /^(\d+)x>(\d+)$/.exec(t))) truth = "x>" + (Number(m[2]) / Number(m[1]));
    else if ((m = /^-x<(\d+)$/.exec(t))) truth = "x>" + (-Number(m[1]));
    else if ((m = /^x\/2≥(\d+)$/.exec(t))) truth = "x≥" + (2 * Number(m[1]));
    else return "unparsable inequality: " + t;
    if (un(q.options.ru[q.correct]) !== un(truth)) {
      return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct], truth });
    }
  } else if (numline) {
    const num = s => Number(s.replace("−", "-"));
    const min = Math.min(num(numline[1]), num(numline[2]));
    if (num(q.options.ru[q.correct]) !== min) {
      return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct], min });
    }
  } else return "unparsable: " + q.question.ru;
  if (new Set(q.options.ru).size !== q.options.ru.length) return "duplicate options: " + q.options.ru.join(" | ");
  if (new Set(q.options.ua).size !== q.options.ua.length) return "duplicate ua options: " + q.options.ua.join(" | ");
});

sweep("genLikeTermsMC: коэффициенты при одинаковых буквах сложены", c => {
  const q = c.genLikeTermsMC();
  const sum = q.question.ru.match(/^Приведите подобные слагаемые: (.+)\.$/);
  if (sum) {
    const t = sum[1].replace(/−/g, "-");
    const parts = [];
    let cur = "+";
    for (const tok of t.split(/([+-])/)) {
      if (tok === "+" || tok === "-") { cur = tok; continue; }
      if (!tok.trim()) continue;
      parts.push(cur + tok.trim());
    }
    const coef = {};
    const order = [];
    for (const p of parts) {
      const m = /^([+-]?)(\d*)([a-z])$/.exec(p);
      if (!m) return "терм не разобран: " + p + " (в " + t + ")";
      const letter = m[3];
      const c0 = (m[1] === "-" ? -1 : 1) * (m[2] === "" ? 1 : Number(m[2]));
      if (!(letter in coef)) { coef[letter] = 0; order.push(letter); }
      coef[letter] += c0;
    }
    const build = [];
    for (const letter of order) {
      const c0 = coef[letter];
      if (c0 === 0) continue;
      build.push(c0 === 1 ? letter : c0 === -1 ? "-" + letter : c0 + letter);
    }
    const truth = build.join(" + ").replace(/\+ -/g, "- ");
    if (q.options.ru[q.correct] !== truth) {
      return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct], truth });
    }
  } else if (/^Какое из выражений является одночленом\?$/.test(q.question.ru)) {
    const allow = ["3x²", "2x · 3y"];
    if (!allow.includes(q.options.ru[q.correct])) return "плохой одночлен: " + q.options.ru[q.correct];
  } else if (/^Какие из выражений являются подобными\?$/.test(q.question.ru)) {
    const m = /^(\d+)([a-z])(²)? и (\d+)([a-z])(²)?$/.exec(q.options.ru[q.correct]);
    if (!m || m[2] !== m[5] || (m[3] || "") !== (m[6] || "")) return "не подобные: " + q.options.ru[q.correct];
  } else return "unparsable: " + q.question.ru;
  if (new Set(q.options.ru).size !== q.options.ru.length) return "duplicate options: " + q.options.ru.join(" | ");
});

sweep("genSqrDiffMC: ФСУ раскрыты и свёрнуты верно", c => {
  const q = c.genSqrDiffMC();
  const sqsum = q.question.ru.match(/^Раскройте скобки: \(([a-z]) \+ (\d+)\)²\.$/);
  const sqdiff = q.question.ru.match(/^Раскройте скобки: \(([a-z]) − (\d+)\)²\.$/);
  const difsq = q.question.ru.match(/^Разложите: \(([a-z]) − (\d+)\)\(([a-z]) \+ (\d+)\)\.$/);
  const calc = q.question.ru.match(/^Вычислите: (\d+)²\.$/);
  let truth;
  if (sqsum && sqsum[1] && sqsum[2]) {
    const v = sqsum[1], n = Number(sqsum[2]);
    truth = v + "² + " + (2 * n) + v + " + " + n * n;
  } else if (sqdiff && sqdiff[1] && sqdiff[2]) {
    const v = sqdiff[1], n = Number(sqdiff[2]);
    truth = v + "² − " + (2 * n) + v + " + " + n * n;
  } else if (difsq && difsq[1] && difsq[2] && difsq[3] && difsq[4]) {
    const v = difsq[1], n = Number(difsq[2]);
    if (n !== Number(difsq[4]) || difsq[3] !== v) return "несимметричная пара скобок: " + q.question.ru;
    truth = v + "² − " + n * n;
  } else if (calc) {
    truth = String(Number(calc[1]) * Number(calc[1]));
  } else return "unparsable: " + q.question.ru;
  if (q.options.ru[q.correct] !== truth) {
    return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct], truth });
  }
  if (new Set(q.options.ru).size !== q.options.ru.length) return "duplicate options: " + q.options.ru.join(" | ");
  if (new Set(q.options.ua).size !== q.options.ua.length) return "duplicate ua options: " + q.options.ua.join(" | ");
});

sweep("genLinearEqShort: корень уравнения пересчитан", c => {
  const q = c.genLinearEqShort();
  const m = q.question.ru.match(/Решите уравнение (.+)\./);
  if (!m) return "unparsable: " + q.question.ru;
  const t = m[1].replace(/−/g, "-");
  let truth, mm;
  if ((mm = /^x \+ (-?\d+) = (-?\d+)$/.exec(t))) truth = Number(mm[2]) - Number(mm[1]);
  else if ((mm = /^x - (\d+) = (\d+)$/.exec(t))) truth = Number(mm[2]) + Number(mm[1]);
  else if ((mm = /^(-?\d+)x = (-?\d+)$/.exec(t))) truth = Number(mm[2]) / Number(mm[1]);
  else if ((mm = /^(-?\d+)x - (\d+) = (\d+)$/.exec(t))) truth = (Number(mm[3]) + Number(mm[2])) / Number(mm[1]);
  else if ((mm = /^(-?\d+)x \+ (\d+) = (\d+)$/.exec(t))) truth = (Number(mm[3]) - Number(mm[2])) / Number(mm[1]);
  else if ((mm = /^(\d+) - x = (\d+)$/.exec(t))) truth = Number(mm[1]) - Number(mm[2]);
  else if ((mm = /^x \/ (\d+) = (\d+)$/.exec(t))) truth = Number(mm[2]) * Number(mm[1]);
  else if ((mm = /^(\d+)\(x \+ (\d+)\) = (\d+)$/.exec(t))) truth = Number(mm[3]) / Number(mm[1]) - Number(mm[2]);
  else return "unparsable equation: " + t;
  if (!Number.isInteger(truth) || truth !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
  if (q.correctLabel !== String(truth)) return "correctLabel " + q.correctLabel;
  if (q.check(String(truth)) !== true) return "check rejects its own answer " + truth;
});

sweep("genLinearFuncShort: значение функции, Oy-пересечение, линейная?", c => {
  const q = c.genLinearFuncShort();
  const value = q.question.ru.match(/Найдите значение функции y = (.+) при x = (\d+)\./);
  const inter = q.question.ru.match(/В какой точке график функции y = (.+) пересекает ось Oy\?/);
  if (value) {
    const n = Number(value[2]);
    const s = value[1].replace(/(\d)x/g, "$1*x").replace(/x/g, String(n)).replace(/−/g, "-");
    const truth = Function("return (" + s + ")")();
    if (truth !== q.expected) return JSON.stringify({ q: q.question.ru, expected: q.expected, truth });
    if (q.correctLabel !== String(truth)) return "correctLabel " + q.correctLabel;
    if (q.check(String(truth)) !== true) return "check rejects its own answer";
  } else if (inter) {
    const f = inter[1];
    const neg = /[−-]\s*(\d+)\s*$/.exec(f);
    const pos = /\+?\s*(\d+)\s*$/.exec(f);
    const b = neg ? "−" + neg[1] : (pos ? pos[1] : "0");
    const truth = "(0; " + b + ")";
    if (q.options.ru[q.correct] !== truth) {
      const norm = s2 => s2.replace(/\s/g, "").replace(/−/g, "-");
      if (norm(q.options.ru[q.correct]) !== norm(truth)) {
        return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct], truth });
      }
    }
  } else if (/^Какая из функций является линейной\?$/.test(q.question.ru)) {
    const allow = ["y = 2x − 1", "y = x/2", "y = 0,5x + 3"];
    const norm = s2 => s2.replace(/\s/g, "").replace(/−/g, "-");
    if (!allow.map(norm).includes(norm(q.options.ru[q.correct]))) return "не линейная: " + q.options.ru[q.correct];
  } else return "unparsable: " + q.question.ru;
  if (q.options && new Set(q.options.ru).size !== q.options.ru.length) return "duplicate options: " + q.options.ru.join(" | ");
});

sweep("genSystemWordMC: сумма/разность пересчитаны", c => {
  const q = c.genSystemWordMC();
  let truth;
  const sum = q.question.ru.match(/^Сумма двух чисел равна (\d+), а разность равна (\d+)\. Найдите большее из них\.$/);
  const friends = q.question.ru.match(/^У двух друзей вместе (\d+) грн, причём у первого на (\d+) грн больше\. Сколько денег у первого\?$/);
  const father = q.question.ru.match(/^Отцу и сыну вместе (\d+) лет, отец старше сына на (\d+) года\. Сколько лет сыну\?$/);
  const classRow = q.question.ru.match(/^Девочек и мальчиков вместе (\d+), девочек на (\d+) больше\. Сколько мальчиков\?$/);
  const brothers = q.question.ru.match(/^У двух братьев вместе (\d+) марок, у старшего на (\d+) больше\. Сколько марок у старшего\?$/);
  if (sum || friends || brothers) {
    const S = Number((sum || friends || brothers)[1]), D = Number((sum || friends || brothers)[2]);
    if ((S + D) % 2 !== 0) return "нечётная сумма: " + q.question.ru;
    truth = (S + D) / 2;
  } else if (father || classRow) {
    const S = Number((father || classRow)[1]), D = Number((father || classRow)[2]);
    if ((S - D) % 2 !== 0) return "нечётная разность: " + q.question.ru;
    truth = (S - D) / 2;
  } else return "unparsable: " + q.question.ru;
  if (q.options.ru[q.correct] !== String(truth)) {
    return JSON.stringify({ q: q.question.ru, chosen: q.options.ru[q.correct], truth });
  }
  if (new Set(q.options.ru).size !== q.options.ru.length) return "duplicate options: " + q.options.ru.join(" | ");
});

/* все ветки новых генераторов с несколькими форматами должны появляться */
{
  const kinds = {
    genFractionMC: ["Сократите дробь", "Сложите дроби", "Умножьте дроби", "Какая из дробей"],
    genDecimalShort: ["Запишите дробь", "Найдите сумму"],
    genIneqCompareMC: ["Какое из чисел наименьшее?", "Сравните:", "Решите неравенство", "На координатной прямой"],
    genLikeTermsMC: ["Приведите подобные", "является одночленом", "являются подобными"],
    genSqrDiffMC: ["Раскройте скобки:", "+", "−", "Разложите:", "Вычислите:"],
    genPowerIntShort: [" · ", " : ", ")²", "⁰.", "10⁻²"],
    genLinearFuncShort: ["Найдите значение функции", "пересекает ось Oy", "является линейной"],
    genSystemWordMC: ["Сумма двух чисел", "друзей вместе", "Отцу и сыну", "Девочек и мальчиков", "братьев вместе"]
  };
  Object.keys(kinds).forEach(name => {
    const counters = {};
    for (let i = 0; i < 300; i++) {
      const q = ctx[name]();
      kinds[name].forEach(pat => { if (q.question.ru.includes(pat)) counters[pat] = (counters[pat] || 0) + 1; });
    }
    const missing = kinds[name].filter(pat => !counters[pat]);
    ok(missing.length === 0, name + " covers all formats in 300 draws (" +
      kinds[name].map(p => p + ":" + (counters[p] || 0)).join(", ") + ")");
  });
}

console.log(fails === 0 ? "\nALL 5-7 TRAINER TESTS PASSED" : "\n" + fails + " TEST(S) FAILED");
process.exit(fails === 0 ? 0 : 1);