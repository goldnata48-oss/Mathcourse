/* Mathcourse audit — analysis of the two exam courses (grades 8-9 and 10-11).
   Verifies what tools/verify.js does NOT: per-lesson mini-check presence and
   guess-heaviness over ALL lessons, coverage matrices, machine-unverified
   numeric claims, final-bank shape, and known UX debts. Read-only. */

const lib = require("./lib");

const src = lib.read("lesson-data.js");
const testSrc = lib.read("tests/grade89-algebra.test.js");
const data = lib.loadLessons();
const trainer = lib.loadTrainer();
const { lessons, roadmap, topicGrades, buildFinalQuestions, lessonGrades } = data;

/* ------------- band routes (mirror of tools/verify.js) ------------- */
const ROUTE = {
  junior: [16],
  middle: [1, 5, 6, 13],
  preSenior: [1, 5, 6, 7, 8, 11, 12, 13, 14, 15],
  senior: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
};
ROUTE.junior = Object.keys(roadmap).map(Number).filter(m =>
  (roadmap[m].lessons || []).some(x => typeof x === "string" && (lessonGrades[x] || []).includes("junior")))
  .sort((a, b) => a - b);

const inBand = (band, l) => ROUTE[band].includes(l.module);
const testCount = mods => mods.reduce((a, m) =>
  a + (roadmap[m].lessons || []).filter(x => typeof x === "object" && x.test).length, 0);

/* ------------- per-lesson source spans (only for `custom`/`hasRenderMini`) ------------- */
const spans = [];
{
  let prev = 0;
  for (const l of lessons) {
    const esc = l.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = /^final\d$/.test(l.id)
      ? new RegExp("makeFinalLesson\\(" + l.id.slice(5) + "\\)")
      : new RegExp("(makeIntroLesson\\(\\\"|makeTopicLesson\\(\\\"|makeKidLesson\\(\\\"|id\\:\\s*\\\"|id\\:\\s*\\`)(" + esc + ")(\\\"|\\`)");
    const hit = src.slice(prev).search(re) + prev;
    spans.push([prev, hit]);
    prev = hit;
  }
  spans.push([prev, src.length]);
}
const quiz = lib.lessonQuizStats(src, lessons);
const stat = quiz.map((q, i) => {
  const s = src.slice(spans[i][1], spans[i + 1][1]);
  const fc = q.corrects.filter(x => x === 0).length;
  return {
    id: q.id, module: q.module,
    titleRu: (lessons[i].title && lessons[i].title.ru || "").trim(),
    titleUa: (lessons[i].title && lessons[i].title.ua || "").trim(),
    custom: !/^(makeIntroLesson|makeTopicLesson|makeKidLesson)\(/m.test(s),
    miniQ: q.qCount,
    hasRenderMini: s.includes("renderMiniCheck("),
    corrects: q.corrects,
    firstPosShare: q.corrects.length ? Math.round(100 * fc / q.corrects.length) : null
  };
});

/* ------------- word problems detector for the final bank ------------- */
const WORD_RE = /грн|деталей|литров|литры|килограмм|кг |учеников|ученик|бактерий|раствора|товар|смешали|куп(ил|ила)|скорость|циферблат|шар|коробке|доске|монет/;

/* ================================================================ */
const out = [];

out.push("== S0. Инвентаризация курсов по ступеням ==");
for (const band of Object.keys(ROUTE)) {
  const inB = lessons.filter(l => inBand(band, l));
  const qTotal = stat.filter(s => inBand(band, s)).reduce((a, s) => a + s.miniQ, 0);
  out.push(`${band}: уроков ${inB.length}, тестов ${testCount(ROUTE[band])}, мини-вопросов ${qTotal}, ` +
    `модулей ${ROUTE[band].length}`);
  const perModule = ROUTE[band].map(m => ({
    m,
    lessons: inB.filter(l => l.module === m).length,
    tests: (roadmap[m].lessons || []).filter(x => typeof x === "object" && x.test).length
  }));
  out.push("   " + perModule.map(p => `м${p.m}:${p.lessons}ур/${p.tests}т`).join("  "));
}

out.push("");
out.push("== S1. Мини-проверки: наличие и угадываемость по ВСЕМ урокам ==");
const flags = [];
for (const s of stat) {
  if (s.module === 10) continue; // final lessons are data-driven
  if (s.miniQ === 0 && !s.hasRenderMini) {
    flags.push(`НЕТ мини-проверки: ${s.id} (м${s.module}, ${s.custom ? "custom" : "factory"})`);
  }
}
const heavy = stat
  .filter(s => s.module !== 10 && s.corrects.length >= 2 && s.firstPosShare !== null)
  .sort((a, b) => b.firstPosShare - a.firstPosShare || b.corrects.length - a.corrects.length)
  .slice(0, 14);
out.push(flags.length ? "ФЛАГ: " + flags.join("; ") : "все уроки (кроме finals) имеют мини-вопросы");
out.push("распределение correct-индексов по РЕАЛЬНЫМ мини-проверкам (топ по доле позиции 0, урок – кол-во – доля0 – индексы):");
for (const s of heavy) out.push(`  ${s.id} м${s.module} n=${s.corrects.length} 0доля=${s.firstPosShare}% idx=${[...new Set(s.corrects)].sort().join(",")}`);

out.push("");
out.push("== S2. Финальный банк (6 вариантов НМТ) ==");
const bankMods = {};
const wordAll = [];
for (let v = 1; v <= 6; v++) {
  const qs = buildFinalQuestions(v);
  const mods = [...new Set(qs.map(x => x.module))].sort((a, b) => a - b);
  const words = qs.filter(x => WORD_RE.test(x.q.ru)).length;
  const noExpl = qs.filter(x => !(x.explanation && x.explanation.ru && x.explanation.ua)).length;
  qs.forEach(x => bankMods[x.module] = (bankMods[x.module] || 0) + 1);
  for (const x of qs) if (WORD_RE.test(x.q.ru)) wordAll.push(x.q.ru);
  out.push(`вариант ${v}: ${qs.length} вопросов, модули ${mods.join(",")}, ` +
    `прикладных ${words}, без пояснений ${noExpl}`);
}
out.push("всего вопросов в банке: " + Object.keys(bankMods).reduce((a, k) => a + bankMods[k], 0));
out.push("распределение по модулям: " + Object.keys(bankMods).map(Number).sort((a, b) => a - b)
  .map(m => `м${m}:${bankMods[m]}`).join("  "));

out.push("");
out.push("== S3. Тренажёр: охват по модулям и уровням ==");
const perBand = { preSenior: 0, senior: 0 };
const groups = trainer.__L.map(g => ({ level: g.id, topics: g.topics }));
out.push("уровни: " + groups.map(g => g.level).join(", "));
for (const g of groups) {
  const byMod = {};
  for (const t of g.topics) (byMod[t.module] = byMod[t.module] || []).push(t.id);
  out.push(`[${g.level}] ` + Object.keys(byMod).map(Number).sort((a, b) => a - b)
    .map(m => `м${m}:${byMod[m].length}`).join("  "));
}
const bandTopicCount = band => groups.flatMap(g => g.topics)
  .filter(t => (topicGrades[t.id] || []).includes(band)).length;
out.push(`тем в 8-9: ${bandTopicCount("preSenior")}; тем в 10-11: ${bandTopicCount("senior")}`);

out.push("");
out.push("== S4. Числовые утверждения: какие уроки машино-проверяемы ==");
const machineChecked = new Set(lessons.filter(l => testSrc.includes(l.id)).map(l => l.id));
const notChecked = stat.filter(s => ROUTE.preSenior.includes(s.module) && !machineChecked.has(s.id) && !s.custom)
  .map(s => `${s.id}(м${s.module})`);
out.push(`машино-проверяемы (пересчёт чисел в grade89): ${[...machineChecked].length} уроков`);
out.push(`в 8-9 factory-уроки БЕЗ машинной проверки чисел: ${notChecked.length}: ${notChecked.join(", ")}`);

out.push("");
out.push("== S5. Долги UX (статус-факт) ==");
out.push("язык переживает перезагрузку? mc_lang в app.js: " +
  (lib.read("app.js").includes("mc_lang") ? "да" : "НЕТ (подтверждённый долг)"));
out.push("mini-explanation в уроках: " +
  (src.match(/(exp:|explanation:|mini-explanation)/g) || []).length + " вхождений (поддержка есть, наполнение нет)");
out.push("ступень 1-4: " +
  lessons.filter(l => ROUTE.junior.includes(l.module)).length + " уроков (" +
  ROUTE.junior.map(m => "м" + m).join(", ") + "); 5-7: " +
  lessons.filter(l => ROUTE.middle.includes(l.module)).length + " уроков (" +
  ROUTE.middle.map(m => "м" + m).join(", ") + ")");

out.push("");
out.push("== S6. Дубли и аномалии ==");
const dupes = lessons.filter((l, i) => lessons.findIndex(x => x.id === l.id) !== i).map(l => l.id);
out.push(dupes.length ? "дубликаты id: " + dupes.join(",") : "дубликатов id нет");
const orphanFlow = Object.values(roadmap)
  .flatMap(m => m.lessons || [])
  .filter(b => typeof b === "string" && !lessons.some(l => l.id === b));
out.push(orphanFlow.length ? "в ROADMAP ссылки без урока: " + orphanFlow.join(",") : "все ссылки в ROADMAP имеют урок");

/* ---------- assembled findings ---------- */
const findings = [];
const inCourse = s => ROUTE.preSenior.includes(s.module) || ROUTE.senior.includes(s.module);
const heavyPct = stat.filter(s => s.module !== 10 && s.corrects.length >= 2 && s.firstPosShare !== null);
for (const s of heavyPct) {
  if (s.firstPosShare >= 70)
    findings.push(`[high] ${s.id} (м${s.module}): ${s.firstPosShare}% правильных ответов на первой позиции` +
      (inCourse(s) ? " — входит в курс" : "") + (s.custom ? " [custom]" : ""));
}
for (const s of heavyPct.filter(x => x.firstPosShare >= 50 && x.firstPosShare < 70))
  findings.push(`[info] ${s.id} (м${s.module}): ${s.firstPosShare}% — порог 70% не нарушен, но распределение слабое`);
findings.push(`[info] машинно не проверены числа ${notChecked.length} уроков 8-9: ${notChecked.join(", ")}`);
findings.push(notChecked.length
  ? "[info] рекомендовано добавить пересчёт числовых примеров intro1-6, eq1-4, app2-5 в grade89-algebra"
  : "");
out.push("");
out.push("== НАХОДКИ ==");
for (const f of flags) findings.push("[high] " + f);
for (const f of findings) out.push("  " + f);

console.log(out.join("\n"));