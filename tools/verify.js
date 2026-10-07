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

/* Правильные ответы шести вариантов НМТ, в порядке вопросов.
   Сверяются с содержимым lessons.js, чтобы смена формулировок
   или пронумерованного ответа не прошла молча. */
const FINAL_ANSWERS = {
  1:["6","2 и 3","200 грн","3/5","1","3/4","4","2","3","4","−8","20","12",
    "125","20π","36π","10","1/4","6","7"],
  2:["снизилась на 4%","1","30%","15/17","3/5","0","2","x < −1","13","4",
    "50","48","12","48","45π","48","56","2/15","5","6"],
  3:["96 грн","x ∈ (−∞; 2) ∪ (3; +∞)","x ∈ (−∞; −1) ∪ [3; +∞)","−7/25","3/4","24/25",
    "1","6,25%","13","log₂ 5","25π","2","84","36π","12π","π/6","300","4/9","14","4,1"],
  4:["корней нет","133","6","4","3","−3/2","(1 + √5)/2 и (1 − √5)/2","24200","5","10",
    "225","25/4","−3","128π","12","100π","31/45","48","7","19"],
  5:["6","14","−9/4","4/5","1/2","2π","3","5 лет","x = ±√14","4","7","−12","13","12",
    "300π","60","216","1/4","7","69"],
  6:["(5; 5) и (−5; −5)","10","0","0","1","3√2","2","x = 0 и x = 2","2","3/2",
    "45°","48","7/2","24π","80","32π/3","5","1/6","6,6","10"]
};

function checkRoadmap() {
  section("roadmap");
  const { lessons, roadmap, facultative, buildFinalQuestions } = loadLessons();
  const ids = lessons.map(l => l.id);
  const idSet = new Set(ids);
  report("lesson ids unique", idSet.size === ids.length);

  /* GRADES: урок и тема тренажёра должны быть привязаны к блоку классов */
  const { lessonGrades, lessonReadiness } = loadLessons();
  const gradeValues = ["junior", "middle", "preSenior", "senior"];
  const badGrades = ids.filter(id => !Array.isArray(lessonGrades[id]) || !lessonGrades[id].length ||
    lessonGrades[id].some(g => !gradeValues.includes(g)));
  report("every lesson has a grade block", badGrades.length === 0, badGrades.join(","));

  const gradeCounts = Object.fromEntries(gradeValues.map(grade =>
    [grade, ids.filter(id => lessonGrades[id].includes(grade)).length]));
  report("four grade blocks contain their assigned lessons (" +
    gradeValues.map(grade => grade + ": " + gradeCounts[grade]).join(" / ") + ")",
    gradeValues.slice(1).every(grade => gradeCounts[grade] > 0));
  const hasGrades = (id, expected) =>
    JSON.stringify(lessonGrades[id]) === JSON.stringify(expected);
  const grades57 = ["middle", "preSenior", "senior"];
  const grades89 = ["preSenior", "senior"];
  report("5-7 lesson map matches the plan",
    ["m1div","m1frac","m1dec","m1remain","m1power","m1expr","m1ineq","m1mono","m1short",
      "m1lineq","m1func","m1sys","m1sysTask","geo1","geoTriangles","geo2","geoAreas",
      "geoBasics","geoQuadArea","geoCircleBasics","stereoBox","appRatio"]
      .every(id => hasGrades(id, grades57)));
  report("8-9 lesson map matches the plan",
    ["intro1","intro2","intro3","intro4","intro5","intro6","geoPolygons","geo3","geoSimilarity","geoPythagor",
      "geoCircles","geoVectors","geoVectorTasks","geoAxiom","stereoIntro",
      "comb1","comb2","prob1","prob2","stat1",
      "qf1","qe1","qi1","qa1","qs1","qa2",
      "re1","re2","re3","re4"]
      .every(id => hasGrades(id, grades89)));
  report("10-11-only geometry remains in the senior block",
    ["geoSineCos","geoPerp","geoPrism","geoRevolve"].every(id => hasGrades(id, ["senior"])));
  const middleLessonIds = ids.filter(id => lessonGrades[id].includes("middle"));
  report("5-7 lessons all have a readiness label",
    middleLessonIds.length === 24 && middleLessonIds.every(id =>
      ["core","extension"].includes(lessonReadiness[id])));
  const topicsAll = loadTrainer().__L.flatMap(level => level.topics);
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(read("lessons.js") + "\n;var __TG = TOPIC_GRADES;", ctx);
  const topicGrades = id => ctx.__TG[id] || [];
  const badTopics = topicsAll.filter(t => {
    const g = topicGrades(t.id);
    return !Array.isArray(g) || !g.length || g.some(v => !gradeValues.includes(v));
  });
  report("every trainer topic has a grade (" + topicsAll.length + ")", badTopics.length === 0,
    badTopics.map(t => t.id).join(","));
  const topicHasGrades = (id, expected) =>
    JSON.stringify(topicGrades(id)) === JSON.stringify(expected);
  report("trainer topics match the 5-7 and 8-9 map",
    ["triangleFeatures","height","angleBisector","median","midline"]
      .every(id => topicHasGrades(id, grades57)) &&
    topicHasGrades("areaFigures", ["senior"]) &&
    ["regularPolygon","inscribedAngle","circleRadii","vectorsDot","vectorsAngle","vectorsCross"]
      .every(id => topicHasGrades(id, grades89)));
  report("module 14 trainer topics are 8-9",
    ["quadDiscriminant","quadVertexX","quadIneqInterval","quadYAtX","quadApplied","systemWord"]
      .every(id => topicHasGrades(id, grades89)));
  report("module 15 trainer topics are 8-9",
    ["ratSimplify","ratEquation","ratInequality","ratPowerExpr"]
      .every(id => topicHasGrades(id, grades89)));
  report("module 6 body topics are open for 8-9",
    ["prismVolume","sphereSurface","pyramidVolume","coneSurface"]
      .every(id => topicHasGrades(id, grades89)));
  report("module 6 section topics stay senior-only",
    ["cubeSection"].every(id => topicHasGrades(id, ["senior"])));

  /* Тема 10–11 не должна жить в модуле, где нет ни одного старшего урока */
  const moduleLessonsById = {};
  for (const [modId, mod] of Object.entries(roadmap)) {
    moduleLessonsById[modId] = mod.lessons.filter(item => typeof item === "string");
  }
  const crossBlock = topicsAll.filter(t => {
    const modLessons = moduleLessonsById[t.module];
    if (!modLessons || !modLessons.length) return false;
    const grades = topicGrades(t.id);
    /* каждая ступень темы должна опираться хотя бы на один урок этой ступени */
    return gradeValues.filter(g => grades.includes(g))
      .some(g => !modLessons.some(id => (lessonGrades[id] || []).includes(g)));
  });
  report("trainer topics agree with their module's block", crossBlock.length === 0,
    crossBlock.map(t => t.id).join(","));

  /* Видимый модуль может остаться без тем тренажёра в какой-то ступени:
     например, модуль 6 виден в 8–9 уроком об аксиомах, а его темы — 10–11.
     renderModuleTest обязан показывать пустое состояние, а не таймер. */
  const emptyTests = [];
  for (const grade of gradeValues) {
    for (const [modId, mod] of Object.entries(roadmap)) {
      const hasTest = mod.lessons.some(item => typeof item === "object" && item.test);
      const lessonVisible = mod.lessons.some(item => typeof item === "string" &&
        (lessonGrades[item] || []).includes(grade));
      if (!hasTest || !lessonVisible) continue;
      const topicCount = topicsAll.filter(t => String(t.module) === String(modId) &&
        topicGrades(t.id).includes(grade)).length;
      if (!topicCount) emptyTests.push(grade + "/модуль " + modId);
    }
  }
  report("modules without trainer topics are handled by the empty test state (" +
    (emptyTests.length ? emptyTests.join(", ") : "нет таких модулей") + ")",
    emptyTests.length === 0 || /testNoTopics/.test(read("app.js")) && /currentTest\.length/.test(read("app.js")));

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
  report("NMT-priority modules are 1-8 and 10-15", priorityModules.join(",") === "1,2,3,4,5,6,7,8,10,11,12,13,14,15");
  const orderMatch = read("app.js").match(/const MODULE_ORDER = \[([^\]]+)\]/);
  const displayOrder = orderMatch ? orderMatch[1].split(",").map(n => Number(n.trim())) : [];
  const roadmapIds = Object.keys(roadmap).map(Number).sort((a, b) => a - b);
  report("module display order lists every module and keeps NMT (10) last",
    displayOrder.length > 0 && displayOrder[displayOrder.length - 1] === 10 &&
    roadmapIds.length === displayOrder.length && roadmapIds.every(id => displayOrder.includes(id)),
    "order=[" + displayOrder.join(",") + "] vs roadmap=[" + roadmapIds.join(",") + "]");
  const advanced = roadmap[9];
  report("module 9 is marked advanced and optional", !!advanced && advanced.advanced === true &&
    advanced.comment && advanced.comment.ru === "Углублённый блок (необязательный для НМТ)" &&
    advanced.comment.ua === "Поглиблений блок (необов’язковий для НМТ)");
  const finalIds = roadmap[10] && roadmap[10].lessons.filter(item=>typeof item === "string");
  report("module 10 has six final practice lessons", !!finalIds &&
    finalIds.join(",") === "final1,final2,final3,final4,final5,final6");
  const guessHeavy = [];
  {
    const src = read("lessons.js");
    for (const stat of lib.lessonQuizStats(src, lessons)) {
      if (stat.corrects.length < 2) continue;
      const first = stat.corrects.filter(x => x === 0).length;
      if (first / stat.corrects.length >= 0.7)
        guessHeavy.push(stat.id + "[" + stat.corrects.join(",") + "]");
    }
  }
  report("no lesson puts 70% or more of correct answers on the first position",
    guessHeavy.length === 0, guessHeavy.join(", "));
  const finalProblems = [];
  for(let variant=1;variant<=6;variant++){
    const questions = buildFinalQuestions(variant);
    const moduleCounts = questions.reduce((counts,question)=>{
      counts[question.module]=(counts[question.module]||0)+1;
      return counts;
    },{});
    const expectedModuleCounts = {1:3,2:3,3:2,4:2,5:3,6:3,7:2,8:2};
    const expectedAnswers = FINAL_ANSWERS[variant] || [];
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
  /* A distractor must not be the same number as the correct answer in another form
     (e.g. "108π/3" vs "36π") — otherwise a right answer is graded as wrong. */
  const parseOption = text => {
    const m = /^(-?\d+(?:\.\d+)?)(π(?:\/(\d+(?:\.\d+)?))?)?$/.exec(String(text).replace(/\s/g, ""));
    if(!m) return null;
    const value = m[3] === undefined ? Number(m[1]) : Number(m[1]) / Number(m[3]);
    return { pi:!!m[2], value:Math.round(value * 1e6) / 1e6 };
  };
  const sameNumber = (a, b) => !!a && !!b && a.pi === b.pi && a.value === b.value;
  const equalDistractors = [];
  for(let variant=1;variant<=6;variant++){
    buildFinalQuestions(variant).forEach((question,index)=>{
      const correctValue = parseOption(question.opts[question.correct]);
      if(!correctValue) return;
      question.opts.forEach((opt,oi)=>{
        if(oi === question.correct) return;
        if(sameNumber(parseOption(opt), correctValue)) equalDistractors.push("v" + variant + " #" + (index+1) + ": " + opt);
      });
    });
  }
  report("no distractor equals the correct answer numerically", equalDistractors.length === 0, equalDistractors.join(", "));
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

/* Навигация и нумерация: меню ступени должно быть непрерывным 1..N,
   номера уроков — по позиции среди видимых, переход — сквозным без «дыр». */
function checkNav() {
  section("navigation and numbering");
  const { lessons, roadmap, lessonGrades } = loadLessons();
  const appSrc = read("app.js");
  const orderMatch = appSrc.match(/const MODULE_ORDER = \[([^\]]+)\]/);
  const MODULE_ORDER = orderMatch[1].split(",").map(n => Number(n.trim()));
  const grades = ["junior", "middle", "preSenior", "senior"];
  const inGrade = (id, g) => (lessonGrades[id] || []).includes(g);
  const unlocked = g => MODULE_ORDER.filter(m => roadmap[m] && (roadmap[m].lessons || [])
    .some(x => typeof x === "string" && inGrade(x, g)));

  const routes = Object.fromEntries(grades.map(g => [g, unlocked(g)]));
  report("route module sets match the grade table (5-7: 1,5,6,13; 8-9: 1,5,6,7,8,11,12,13,14,15)",
    JSON.stringify(routes.middle) === JSON.stringify([1, 5, 6, 13]) &&
    JSON.stringify(routes.preSenior) === JSON.stringify([1, 5, 6, 7, 8, 11, 12, 13, 14, 15]) &&
    routes.senior.length === MODULE_ORDER.filter(m => roadmap[m]).length &&
    routes.junior.length === 0,
    "middle=[" + routes.middle.join(",") + "] preSenior=[" + routes.preSenior.join(",") + "] senior=" + routes.senior.length + " junior=" + routes.junior.length);

  const realm = lib.makeRealm(
    ["moduleLessons", "lessonInGrade", "moduleInGrade", "moduleTitle", "visibleSections",
      "visibleLessonFlow", "courseNavigation", "lessonNumberInModule"],
    { ROADMAP: roadmap, LESSONS: lessons, MODULE_ORDER, lessonGrades: id => lessonGrades[id] || [],
      state: { grade: "" } });
  const menuNumbers = g => {
    realm.state.grade = g;
    return realm.visibleSections().map((s, i) => {
      const m = realm.moduleTitle(s.modId, "ru").match(/^Модуль (\d+)/);
      return m ? Number(m[1]) : i + 1;
    });
  };

  realm.state.grade = "junior";
  report("junior renders the empty state (all modules locked)",
    realm.visibleSections().every(s => s.locked));

  realm.state.grade = "middle";
  report("5-7 sidebar hides unavailable modules",
    JSON.stringify(realm.visibleSections().map(s => s.modId)) === JSON.stringify(routes.middle) &&
    realm.visibleSections().every(s => !s.locked));
  report("5-7 module labels hide the NMT-priority badge",
    /state\.grade !== "middle" && mod\.exam_priority/.test(appSrc));

  const preSeniorNums = menuNumbers("preSenior");
  const expected89 = Array.from({ length: routes.preSenior.length }, (_, i) => i + 1);
  report("8-9 sidebar module numbers are sequential 1.." + expected89.length,
    JSON.stringify(preSeniorNums) === JSON.stringify(expected89),
    "shown=[" + preSeniorNums.join(",") + "] expected 1.." + expected89.length);

  for (const g of ["middle", "senior"]) {
    const nums = menuNumbers(g);
    const unique = new Set(nums);
    report(g + " sidebar shows every module number exactly once",
      nums.length === unique.size && Math.min(...nums) === 1 && Math.max(...nums) === nums.length,
      "shown=[" + nums.join(",") + "]");
  }

  /* Номера уроков: по позиции среди видимых в модуле — всегда 1..k без пропусков. */
  const numberingIssues = [];
  for (const g of grades) {
    realm.state.grade = g;
    for (const m of routes[g]) {
      const ids = roadmap[m].lessons.filter(x => typeof x === "string" && inGrade(x, g));
      if (!ids.length) continue;
      const nums = ids.map(id => realm.lessonNumberInModule(id));
      const expected = Array.from({ length: ids.length }, (_, i) => i + 1);
      if (JSON.stringify(nums) !== JSON.stringify(expected))
        numberingIssues.push(g + "/модуль " + m + "=[" + nums.join(",") + "]");
    }
  }
  report("lesson numbers in each module are contiguous 1..k", numberingIssues.length === 0, numberingIssues.join(" | "));

  /* Сквозной переход: кнопки «дальше/назад» идут ровно по flow ступени,
     последний урок ступени — тупик по замыслу, скрытых прыжков нет. */
  const flowIssues = [];
  for (const g of grades) {
    if (!routes[g].length) continue;
    realm.state.grade = g;
    const flow = realm.visibleLessonFlow();
    const dupes = flow.length !== new Set(flow).size;
    const broken = flow.some((id, i) => i < flow.length - 1 && realm.courseNavigation(id).next !== flow[i + 1]);
    if (dupes || broken || realm.courseNavigation(flow[flow.length - 1]).next !== null)
      flowIssues.push(g + " (" + flow.length + " lessons)");
  }
  report("course navigation walks the grade flow without jumps or dead ends",
    flowIssues.length === 0, flowIssues.join(" | "));

  report("sidebar numbers lessons by visible position, not raw index",
    !/num\.textContent = idx|num\.textContent = idx\+1/.test(appSrc) && /visibleNumber/.test(appSrc));
  const navBlock = appSrc.slice(appSrc.indexOf("function courseNavigation"),
    appSrc.indexOf("function courseNavigation") + 700);
  report("course navigation is flow-based (no module-scoped next)",
    /visibleLessonFlow/.test(navBlock) && !/lessonGroup\(/.test(navBlock));

  /* Меню не должно падать на факультативе: у его блока нет номера модуля,
     поэтому заголовок ставится напрямую, минуя moduleTitle. */
  report("sidebar pushes the facultative block without a module id",
    /if\(facultyIds\.length\) sections\.push\(\{modId:null, mod:FACULTATIVE, faculty:true\}\)/.test(appSrc));
  report("sidebar titles the facultative block without moduleTitle",
    /faculty \? mod\[state\.lang\] : moduleTitle\(modId, state\.lang\)/.test(appSrc));
  report("facultative lessons carry a grade (block renders in 10-11)",
    (lessonGrades.geoCurved || []).includes("senior") && (lessonGrades.geoRose || []).includes("senior"));
  realm.state.grade = "senior";
  report("visibleSections stays module-only (facultative is appended by the sidebar)",
    !realm.visibleSections().some(s => s.modId === null));
  report("moduleTitle survives a null module id (facultative safety)",
    realm.moduleTitle(null, "ru") === "");
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
  checkNav();
  checkGenerators();
  checkMix();
  checkA11y();
  checkDist();
  if (withTests) runChild("tests", "tests/run.js");
  if (withLive) runChild("live deployment", "tools/check-live.js");
}

console.log("\n" + (failures === 0 ? "VERIFY PASSED" : "VERIFY FAILED") + ": " + passes + " passed, " + failures + " failed");
process.exit(failures === 0 ? 0 : 1);
