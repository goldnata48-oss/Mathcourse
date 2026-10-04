/*
 * Mathcourse — static verification of the source tree.
 *
 * Usage:
 *   node tools/verify.js                 run all source checks
 *   node tools/verify.js --generators    only the trainer generator contract
 *   node tools/verify.js --tests         also run tests/run.js
 *   node tools/verify.js --live          also run tools/check-live.js
 *   node tools/verify.js --iters=500     iterations per generator topic (default 200)
 */
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");
const lib = require("./lib");

const { ROOT, read, loadLessons, loadUI, loadTrainer } = lib;

const argv = process.argv.slice(2);
const onlyGenerators = argv.includes("--generators");
const withTests = argv.includes("--tests");
const withLive = argv.includes("--live");
const itersArg = argv.find(a => a.startsWith("--iters="));
const ITERS = itersArg ? Math.max(1, parseInt(itersArg.split("=")[1], 10) || 200) : 200;

let passes = 0;
let failures = 0;
function report(name, ok, detail) {
  if (ok) { passes++; console.log("  OK   " + name); }
  else { failures++; console.log("  FAIL " + name + (detail ? " — " + detail : "")); }
}
function section(title) { console.log("\n== " + title + " =="); }

function checkSyntax() {
  section("syntax");
  const files = [
    "i18n.js", "lessons.js", "trainer.js", "app.js", "build.js", "build-icons.js", "sw.js",
    "tools/lib.js", "tools/deploy.js", "tools/verify.js", "tools/check-live.js",
  ];
  const bad = [];
  for (const f of files) {
    try { new vm.Script(read(f), { filename: f }); }
    catch (e) { bad.push(f + ": " + e.message); }
  }
  report("source files (" + files.length + ")", bad.length === 0, bad.join(" | "));

  try {
    new vm.Script([read("i18n.js"), read("lessons.js"), read("trainer.js"), read("app.js")].join("\n"), { filename: "bundle.js" });
    report("concatenated bundle", true);
  } catch (e) { report("concatenated bundle", false, e.message); }
}

function checkI18n() {
  section("i18n");
  const ui = loadUI();
  const ru = new Set(Object.keys(ui.ru));
  const ua = new Set(Object.keys(ui.ua));
  const ruOnly = [...ru].filter(k => !ua.has(k));
  const uaOnly = [...ua].filter(k => !ru.has(k));
  report("ru/ua key symmetry (" + ru.size + " keys)", ruOnly.length === 0 && uaOnly.length === 0,
    (ruOnly.length ? "ru-only: " + ruOnly.join(",") : "") + (uaOnly.length ? " ua-only: " + uaOnly.join(",") : ""));

  const used = new Set();
  const appSrc = read("app.js");
  let m;
  const re1 = /\bL\.([A-Za-z_][A-Za-z0-9_]*)/g;
  while ((m = re1.exec(appSrc))) used.add(m[1]);
  for (const f of ["app.js", "lessons.js"]) {
    const src = read(f);
    const re2 = /UI\[state\.lang\]\.([A-Za-z_][A-Za-z0-9_]*)/g;
    while ((m = re2.exec(src))) used.add(m[1]);
  }
  const missing = [...used].filter(k => !ru.has(k) || !ua.has(k)).sort();
  report("referenced keys exist (" + used.size + ")", missing.length === 0, missing.join(", "));
}

function checkRoadmap() {
  section("roadmap");
  const { lessons, roadmap, facultative, buildFinalQuestions } = loadLessons();
  const ids = lessons.map(l => l.id);
  const idSet = new Set(ids);
  report("lesson ids unique", idSet.size === ids.length);

  const referenced = new Set();
  let soon = 0;
  const missing = [];
  for (const m of Object.keys(roadmap)) {
    for (const item of roadmap[m].lessons) {
      if (typeof item === "string") { referenced.add(item); if (!idSet.has(item)) missing.push(m + ":" + item); }
      else if (item && item.soon) soon++;
    }
  }
  const facultyIds = (facultative && Array.isArray(facultative.lessons)) ? facultative.lessons.filter(id => typeof id === "string") : [];
  facultyIds.forEach(id => referenced.add(id));
  const lessonModules = new Map(lessons.map(lesson => [lesson.id, lesson.module]));
  const wrongModules = [];
  for (const [moduleId, module] of Object.entries(roadmap)) {
    for (const id of module.lessons.filter(item => typeof item === "string")) {
      if (lessonModules.get(id) !== Number(moduleId)) wrongModules.push(id + ":" + lessonModules.get(id) + "!=" + moduleId);
    }
  }
  const topics = loadTrainer().__L.flatMap(level => level.topics);
  const invalidTopicModules = topics.filter(topic => !roadmap[topic.module]).map(topic => topic.id + ":" + topic.module);
  const emptyTestModules = Object.entries(roadmap)
    .filter(([, module]) => module.lessons.some(item => item && item.test))
    .filter(([moduleId]) => !topics.some(topic => topic.module === Number(moduleId)))
    .map(([moduleId]) => moduleId);
  report("roadmap references lessons", missing.length === 0, missing.join(", "));
  report("no placeholder (soon) lessons", soon === 0, soon + " found");
  const orphans = ids.filter(id => !referenced.has(id));
  report("no orphan lessons", orphans.length === 0, orphans.join(", "));
  report("lesson module matches roadmap", wrongModules.length === 0, wrongModules.join(", "));
  report("trainer topics use roadmap modules", invalidTopicModules.length === 0, invalidTopicModules.join(", "));
  report("module tests have topic generators", emptyTestModules.length === 0, emptyTestModules.join(", "));
  const nmtParameter = topics.find(topic => topic.id === "nmtParameter");
  report("NMT parameter topic is in the trigonometry module", !!nmtParameter && nmtParameter.module === 2);
  const priorityModules = Object.entries(roadmap).filter(([,module])=>module.exam_priority).map(([id])=>Number(id)).sort((a,b)=>a-b);
  report("NMT-priority modules are 1-8 and 10", priorityModules.join(",") === "1,2,3,4,5,6,7,8,10");
  const advanced = roadmap[9];
  report("module 9 is marked advanced and optional", !!advanced && advanced.advanced === true &&
    advanced.comment && advanced.comment.ru === "Углублённый блок (необязательный для НМТ)" &&
    advanced.comment.ua === "Поглиблений блок (необов’язковий для НМТ)");
  const finalIds = roadmap[10] && roadmap[10].lessons.filter(item=>typeof item === "string");
  report("module 10 has six final practice lessons", !!finalIds &&
    finalIds.join(",") === "final1,final2,final3,final4,final5,final6");
  const finalProblems = [];
  for(let variant=1;variant<=6;variant++){
    const questions = buildFinalQuestions(variant);
    const moduleCounts = questions.reduce((counts,question)=>{
      counts[question.module]=(counts[question.module]||0)+1;
      return counts;
    },{});
    const expectedModuleCounts = {1:3,2:3,3:2,4:2,5:3,6:3,7:2,8:2};
    const exponent = 2 + variant % 3;
    const expBase = [2,3,5][variant % 3];
    const logBase = variant % 2 ? 2 : 3;
    const logPower = 2 + variant % 2;
    const logValue = logBase ** logPower;
    const triangleBase = variant + 3;
    const triangleHeight = 2 * (variant + 1);
    const legScale = 1 + variant % 3;
    const cubeEdge = 2 + variant % 4;
    const triples = [{a:3,b:4,c:5},{a:5,b:12,c:13},{a:7,b:24,c:25},
      {a:8,b:15,c:17},{a:9,b:40,c:41}];
    const triple = triples[variant % triples.length];
    const angles = ["π/6","π/4","π/3","π/2","2π/3","3π/4"];
    const radius = variant + 2;
    const prismVolume = (variant + 2) * 3 * (2 + variant % 3);
    const favorable = 2 + variant % 4;
    const selected = 5 + variant % 3;
    const dataset = [variant+1,variant+2,variant+6,variant+7,variant+12];
    const mean = dataset.reduce((sum,value)=>sum+value,0)/dataset.length;
    const expectedAnswers = [
      String(variant+1),
      String(variant+2),
      `${variant} и ${variant+1}`,
      `${triple.a}/${triple.c}`,
      angles[(variant-1)%angles.length],
      "π/2 и 3π/2",
      String(exponent-1),
      `x > ${(exponent-1)/2}`,
      String(logValue),
      String(logValue+variant),
      String(triangleBase*triangleHeight/2),
      String(5*legScale),
      `${2*radius}π`,
      String(cubeEdge**3),
      String(prismVolume),
      `${4*radius**3}π/3`,
      `${favorable}/7`,
      String(selected*(selected-1)/2),
      String(mean),
      String(variant+6),
    ];
    const badModuleCounts = Object.keys(expectedModuleCounts).some(module =>
      moduleCounts[module] !== expectedModuleCounts[module]);
    if(questions.length !== 20 || badModuleCounts ||
      questions.some(question=>!question.explanation || !question.explanation.ru || !question.explanation.ua ||
        !question.q.ru || !question.q.ua || !Array.isArray(question.opts) || question.opts.length !== 4 ||
        new Set(question.opts).size !== question.opts.length || !Number.isInteger(question.correct) ||
        question.correct < 0 || question.correct >= question.opts.length) ||
      questions.some((question,index)=>question.opts[question.correct] !== expectedAnswers[index])){
      finalProblems.push("final" + variant);
    }
  }
  report("final variants cover modules 1-8 with bilingual explanations", finalProblems.length === 0, finalProblems.join(", "));
  const inRoadmap = facultyIds.filter(id => Object.values(roadmap)
    .some(module => module.lessons.some(item => item === id)));
  report("facultative section holds geoCurved and geoRose", facultyIds.join(",") === "geoCurved,geoRose", facultyIds.join(","));
  report("facultative lessons are bilingual and noted", !!facultative && !!facultative.ru && !!facultative.ua &&
    !!facultative.note && !!facultative.note.ru && !!facultative.note.ua);
  report("facultative lessons exist in LESSONS", facultyIds.every(id => idSet.has(id)));
  report("facultative lessons stay out of the modules", inRoadmap.length === 0, inRoadmap.join(", "));
  const ui = loadUI();
  report("facultative label is localized", !!(ui.ru && ui.ua && ui.ru.facultativeLabel && ui.ua.facultativeLabel));
  report("app.js renders the facultative section", /FACULTATIVE/.test(read("app.js")) && /facultativeLabel/.test(read("app.js")));
  report("lesson count", lessons.length > 0, lessons.length + " lessons");
}

function checkGenerators() {
  section("trainer generators (" + ITERS + " iterations each)");
  const ctx = loadTrainer();
  const LEVEL_DEFS = ctx.__L;
  const all = LEVEL_DEFS.flatMap(level => level.topics.map(topic => ({ level: level.id, topic })));
  const problems = new Map();
  const push = (id, msg) => { if (!problems.has(id)) problems.set(id, msg); };
  let mc = 0, short = 0;

  for (const { topic } of all) {
    for (let i = 0; i < ITERS; i++) {
      let q;
      try { q = topic.generate(); }
      catch (e) { push(topic.id, "threw: " + e.message); break; }

      const text = [q && q.question, q && q.hint, q && q.solution, q && q.topic, q && q.format];
      if (!q || !q.question || !q.question.ru || !q.question.ua) { push(topic.id, "bad question"); break; }
      if (!q.hint || !q.hint.ru || !q.hint.ua) push(topic.id, "missing hint");
      if (!q.topic || !q.topic.ru || !q.topic.ua) push(topic.id, "missing topic");
      if (!q.format || !q.format.ru || !q.format.ua) push(topic.id, "missing format");
      if (!q.solution || !q.solution.ru || !q.solution.ua) push(topic.id, "missing solution");
      for (const field of text) {
        if (field && typeof field.ru === "string" && /undefined|NaN/.test(field.ru)) push(topic.id, "undefined/NaN in ru text");
        if (field && typeof field.ua === "string" && /undefined|NaN/.test(field.ua)) push(topic.id, "undefined/NaN in ua text");
      }

      if (q.options) {
        mc++;
        if (!q.options.ru || !q.options.ua) { push(topic.id, "bad options"); break; }
        if (q.options.ru.length !== 4 || q.options.ua.length !== 4) push(topic.id, "not exactly 4 options (" + q.options.ru.length + ")");
        if (new Set(q.options.ru).size !== q.options.ru.length) push(topic.id, "duplicate ru options");
        if (new Set(q.options.ua).size !== q.options.ua.length) push(topic.id, "duplicate ua options");
        if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.ru.length) push(topic.id, "correct out of range");
        if (q.options.ru.some(o => typeof o !== "string" || !o.length)) push(topic.id, "empty ru option");
      } else {
        short++;
        if (typeof q.check !== "function") push(topic.id, "short answer without check()");
        else if (q.expected !== undefined && q.expected !== null) {
          const candidates = Array.isArray(q.expected) ? q.expected : [q.expected];
          let ok = false;
          for (const c of candidates) {
            try { if (q.check(String(c))) { ok = true; break; } } catch (_) { ok = false; }
          }
          if (!ok) push(topic.id, "check(expected) is false");
        }
        if (q.correctLabel === undefined) push(topic.id, "short answer without correctLabel");
      }
      if (problems.size > 40) break;
    }
    if (problems.size > 40) break;
  }

  report("all topics generate cleanly (" + all.length + " topics, " + mc + " MC / " + short + " short)", problems.size === 0,
    [...problems.entries()].slice(0, 12).map(([id, msg]) => id + ": " + msg).join(" | "));
}

function checkMix() {
  section("mixed Cyrillic/Latin tokens");
  const allow = /^S[\u0400-\u04FF]+$/; // math area notation: Sбок, Sполн, Sосн, Sбіч ...
  const cyr = /[\u0400-\u04FF]/;
  const lat = /[A-Za-z]/;
  const hits = [];
  for (const f of ["i18n.js", "lessons.js", "trainer.js", "app.js"]) {
    read(f).split(/\r?\n/).forEach((line, i) => {
      const toks = line.match(/[\u0400-\u04FFA-Za-z]{2,}/g) || [];
      for (const tok of toks) if (cyr.test(tok) && lat.test(tok) && !allow.test(tok)) hits.push(f + ":" + (i + 1) + " " + tok);
    });
  }
  report("no mixed-script tokens (" + hits.length + ")", hits.length === 0, hits.slice(0, 10).join(" | "));
}

function checkA11y() {
  section("a11y invariants");
  const html = read("index.html");
  const app = read("app.js");
  const css = read("styles.css") + "\n" + read("theme.css");
  report("html lang attribute", /<html lang="(ru|uk|ua)">/.test(html));
  report("icon-only buttons labelled", html.includes('id="btn-theme-toggle"') && /btn-theme-toggle[^>]*aria-label/.test(html));
  report("mobile menu aria-expanded/controls", html.includes('aria-expanded="false"') && html.includes('aria-controls="sidebar"'));
  report("live regions (search, mascot)", html.includes('id="search-results"') && html.includes('aria-live="polite"'));
  report("global :focus-visible outline", /:focus-visible\s*\{[^}]*outline\s*:/.test(css));
  report("toggle aria-pressed wired", (app.match(/aria-pressed/g) || []).length >= 4);
  report("decorative glyphs aria-hidden", app.includes('aria-hidden') || html.includes('aria-hidden'));
}

function checkDist() {
  section("dist freshness");
  try {
    const { computeBundle } = require(path.join(ROOT, "build.js"));
    const { cacheTag } = computeBundle();
    const sw = read("dist/sw.js");
    const m = sw.match(/mathcourse-([a-f0-9]{8})/);
    report("dist/sw.js cache tag matches sources", !!m && m[1] === cacheTag,
      "sources=" + cacheTag + " dist=" + (m ? m[1] : "none") + " (run `npm run build`)");
  } catch (e) {
    report("dist/sw.js cache tag matches sources", false, e.message);
  }
}

function runChild(label, file) {
  section(label);
  try {
    const out = execFileSync(process.execPath, [path.join(ROOT, file)], { cwd: ROOT, encoding: "utf8" });
    process.stdout.write(out.split("\n").map(l => "  " + l).join("\n") + "\n");
    report(label, true);
  } catch (e) {
    if (e.stdout) process.stdout.write(e.stdout.split("\n").map(l => "  " + l).join("\n") + "\n");
    report(label, false, e.message.split("\n")[0]);
  }
}

if (onlyGenerators) {
  checkGenerators();
} else {
  checkSyntax();
  checkI18n();
  checkRoadmap();
  checkGenerators();
  checkMix();
  checkA11y();
  checkDist();
  if (withTests) runChild("tests", "tests/run.js");
  if (withLive) runChild("live deployment", "tools/check-live.js");
}

console.log("\n" + (failures === 0 ? "VERIFY PASSED" : "VERIFY FAILED") + ": " + passes + " passed, " + failures + " failed");
process.exit(failures === 0 ? 0 : 1);
