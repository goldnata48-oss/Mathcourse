/* Grade split: lesson/topic maps, UI labels, and legacy preference migration. */
const vm = require("vm");
const lib = require("../tools/lib");

let failures = 0;
const assert = (condition, message) => {
  if (condition) console.log("ok: " + message);
  else { failures++; console.log("FAIL: " + message); }
};

const { lessonGrades, roadmap, lessons, facultative, lessonReadiness } = lib.loadLessons();
const grade57 = ["middle", "preSenior", "senior"];
const grade89 = ["preSenior", "senior"];
assert(
  ["m1div","m1frac","m1dec","m1remain","m1power","m1expr","m1ineq","m1mono","m1short",
    "m1lineq","m1func","m1sys","m1sysTask","geo1","geoTriangles","geo2","geoAreas",
    "geoBasics","geoQuadArea","geoCircleBasics","stereoBox","appRatio"]
    .every(id => JSON.stringify(lessonGrades[id]) === JSON.stringify(grade57)),
  "5-7 lesson set follows the status map"
);
assert(
  ["intro1","intro2","intro3","intro4","intro5","intro6","geoPolygons","geo3","geoSimilarity","geoPythagor",
    "geoCircles","geoVectors","geoVectorTasks","geoAxiom","stereoIntro",
    "comb1","comb2","prob1","prob2","stat1",
    "qf1","qe1","qi1","qa1","qs1","qa2",
    "re1","re2","re3","re4"]
    .every(id => JSON.stringify(lessonGrades[id]) === JSON.stringify(grade89)),
  "8-9 lesson set follows the status map"
);
assert(
  ["geoSineCos","geoPerp","geoPrism","geoRevolve"]
    .every(id => JSON.stringify(lessonGrades[id]) === JSON.stringify(["senior"])),
  "senior-only geometry remains in 10-11"
);

/* Модули 11-14 закрывают пробелы 8-9: прогрессии, уравнения, прикладные задачи
   и квадратная функция. */
assert(
  ["seq1","seq2","seq3","seq4","eq1","eq2","eq3","eq4",
    "app2","app3","app4"].every(id => JSON.stringify(lessonGrades[id]) === JSON.stringify(grade89)),
  "progressions, equations and applied problems are marked as 8-9"
);
assert(
  ["app1","app5"].every(id => JSON.stringify(lessonGrades[id]) === JSON.stringify(grade57)),
  "percentages and proportions start in the 5-7 band and stay visible in 8-9"
);
const middleLessons = Object.keys(lessonGrades).filter(id => lessonGrades[id].includes("middle"));
assert(
  middleLessons.length === 24 &&
  middleLessons.every(id => ["core","extension"].includes(lessonReadiness[id])) &&
  ["m1mono","m1short","m1sys","m1sysTask","geoTriangles","geoAreas"].every(id => lessonReadiness[id] === "extension"),
  "every 5-7 lesson has a readiness label and advanced content is marked for extension"
);
assert(
  [11, 12, 13, 14, 15].every(id => roadmap[id] && roadmap[id].exam_priority === true),
  "modules 11-15 are registered as exam-priority"
);
const routeCtx = {
  ROADMAP: roadmap,
  MODULE_ORDER: [1,2,3,4,5,6,7,8,9,11,12,13,14,15,10],
  state: {grade:"preSenior"},
  lessonGrades: id => lessonGrades[id] || []
};
vm.createContext(routeCtx);
["moduleLessons","lessonInGrade","moduleInGrade","visibleSections",
  "visibleLessonFlow","courseNavigation","moduleTitle"].forEach(name => {
  vm.runInContext(lib.extractFn(lib.read("app.js"), name), routeCtx);
});
const preSeniorModules = routeCtx.visibleSections().map(section => section.modId);
assert(
  JSON.stringify(preSeniorModules) === JSON.stringify([1,5,6,7,8,11,12,13,14,15]),
  "8-9 route hides empty modules and continues directly after module 8"
);
assert(
  routeCtx.moduleTitle(1, "ru").startsWith("Модуль 1.") &&
  routeCtx.moduleTitle(11, "ru").startsWith("Модуль 6.") &&
  routeCtx.moduleTitle(12, "ru").startsWith("Модуль 7.") &&
  routeCtx.moduleTitle(13, "ru").startsWith("Модуль 8.") &&
  routeCtx.moduleTitle(14, "ru").startsWith("Модуль 9.") &&
  routeCtx.moduleTitle(15, "ru").startsWith("Модуль 10."),
  "8-9 modules are displayed as modules 1-10 with no gaps"
);
routeCtx.state.grade = "middle";
const middleModules = routeCtx.visibleSections();
assert(
  JSON.stringify(middleModules.map(section => section.modId)) === JSON.stringify([1,5,6,13]) &&
  middleModules.every(section => !section.locked),
  "5-7 route hides unrelated modules and keeps only available sections"
);
assert(
  middleModules.map(section => routeCtx.moduleTitle(section.modId, "ru").match(/^Модуль (\d+)/)[1]).join(",") === "1,2,3,4",
  "5-7 visible modules are numbered sequentially"
);
routeCtx.state.grade = "preSenior";
assert(
  routeCtx.courseNavigation("stat1").next === "seq1" &&
  routeCtx.courseNavigation("seq4").next === "eq1" &&
  routeCtx.courseNavigation("qa2").next === "re1",
  "8-9 lesson navigation continues from module 8 into displayed modules 9, 10 and 11"
);
routeCtx.state.grade = "senior";
assert(
  routeCtx.moduleTitle(9, "ru").startsWith("Модуль 9.") &&
  routeCtx.moduleTitle(10, "ru").startsWith("Модуль 10.") &&
  routeCtx.moduleTitle(11, "ru").startsWith("Модуль 11."),
  "10-11 module numbering remains unchanged"
);
assert(
  ["seq1","eq1","app1"].every(id =>
    lessons.some(lesson => lesson.id === id && lesson.module >= 11 && lesson.module <= 13)),
  "new lessons live in the modules they are registered under"
);
/* каждый урок обязан попадать хотя бы в одну ступень, иначе он не виден нигде */
const unmapped = lessons
  .map(lesson => lesson.id)
  .filter(id => !(lessonGrades[id] || []).length);
assert(unmapped.length === 0, "every lesson belongs to at least one grade band" +
  (unmapped.length ? " — unmapped: " + unmapped.join(", ") : ""));

/* урок вне ROADMAP и вне FACULTATIVE невозможно открыть из интерфейса */
const facultyIds = facultative.lessons;
assert(
  facultyIds.every(id => lessons.some(lesson => lesson.id === id)),
  "facultative lessons all exist"
);
const reachable = new Set(Object.keys(roadmap)
  .flatMap(m => roadmap[m].lessons.filter(item => typeof item === "string"))
  .concat(facultyIds));
const unreachable = lessons.map(lesson => lesson.id).filter(id => !reachable.has(id));
assert(unreachable.length === 0, "no lesson is stranded outside ROADMAP and FACULTATIVE" +
  (unreachable.length ? " — unreachable: " + unreachable.join(", ") : ""));
/* факультатив не должен дублировать основной маршрут */
assert(
  facultyIds.every(id => !reachable.has(id) || !Object.keys(roadmap)
    .some(m => roadmap[m].lessons.includes(id))),
  "facultative lessons are not listed twice"
);
/* у каждого содержательного модуля есть итоговый тест; у сводного НМТ (10)
   его нет by design */
[1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15].forEach(m => {
  const tests = roadmap[m].lessons.filter(item => typeof item === "object" && item.test);
  assert(tests.length === 1, "module " + m + " has exactly one module test");
});

/* темы тренажёра модуля 14 живут в той же ступени, что и его уроки */
const topicGradesCtx = {};
vm.createContext(topicGradesCtx);
vm.runInContext(lib.readLessonsSource() + "\n;var __TG = TOPIC_GRADES;", topicGradesCtx);
const topicGrades = id => topicGradesCtx.__TG[id] || [];
assert(
  ["quadDiscriminant","quadVertexX","quadIneqInterval","quadYAtX","quadApplied","systemWord"]
    .every(id => JSON.stringify(topicGrades(id)) === JSON.stringify(grade89)),
  "module 14 trainer topics follow the 8-9 status map"
);
assert(
  ["ratSimplify","ratEquation","ratInequality","ratPowerExpr"]
    .every(id => JSON.stringify(topicGrades(id)) === JSON.stringify(grade89)),
  "module 15 trainer topics follow the 8-9 status map"
);
assert(
  ["prismVolume","sphereSurface","pyramidVolume","coneSurface"]
    .every(id => JSON.stringify(topicGrades(id)) === JSON.stringify(grade89)),
  "module 6 body topics (prism, sphere, pyramid, cone) are open for 8-9"
);
assert(
JSON.stringify(topicGrades("areaFigures")) === JSON.stringify(["senior"]),
"the sine-based area topic is restricted to 10-11"
);

const trainerLevels = lib.loadTrainer().__L;
const testState = { grade: "middle" };
const moduleTests = lib.makeRealm(["moduleTestTopicCount","moduleTestAvailable"], {
LEVEL_DEFS: trainerLevels,
state: testState,
topicInGrade: id => topicGrades(id).includes(testState.grade)
});
assert(moduleTests.moduleTestTopicCount(6) === 1 && !moduleTests.moduleTestAvailable(6),
"5-7 module 6 has no underpowered one-topic final test");
assert(moduleTests.moduleTestTopicCount(13) >= 3 && moduleTests.moduleTestAvailable(13),
"5-7 module 13 retains its test with at least three topics");
assert(moduleTests.moduleTestTopicCount(1) >= 3 && moduleTests.moduleTestAvailable(1),
"5-7 module 1 gains an algebra-base test with at least three topics");
testState.grade = "senior";
assert(moduleTests.moduleTestAvailable(6),
"module 6 test remains available to 10-11");

const ui = lib.loadUI();
assert(ui.ru.gradeTitles.middle === "Математика 5–7" &&
  ui.ru.gradeTitles.preSenior === "Математика 8–9" &&
  ui.ua.gradeTitles.middle === "Математика 5–7" &&
  ui.ua.gradeTitles.preSenior === "Математика 8–9",
"grade names are localized in Russian and Ukrainian");
assert(["readinessCore","readinessCoreHint","readinessExtension","readinessExtensionHint","testNotEnoughTopics"]
  .every(key => ui.ru[key] && ui.ua[key]),
"readiness and limited-test messages are localized");

function migrate(savedGrade, version) {
  const values = {};
  if (savedGrade !== null) values.mc_grade = savedGrade;
  if (version !== null) values.mc_grade_version = version;
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null; },
    setItem(key, value) { values[key] = String(value); }
  };
  const ctx = {
    GRADE_LEVELS: ["junior", "middle", "preSenior", "senior"],
    GRADE_STORAGE_VERSION: "2",
    localStorage
  };
  vm.createContext(ctx);
  vm.runInContext(lib.extractFn(lib.read("app.js"), "loadSavedGrade"), ctx);
  return { grade: ctx.loadSavedGrade(), values };
}

const legacy = migrate("middle", null);
assert(legacy.grade === "preSenior" && legacy.values.mc_grade === "preSenior" &&
  legacy.values.mc_grade_version === "2",
  "legacy 5-9 preference migrates once to 8-9");
assert(migrate("middle", "2").grade === "middle",
  "new 5-7 preference is preserved on later visits");
assert(migrate("middle", "2").values.mc_grade === "middle",
  "a current 5-7 choice is not rewritten by the migration");
assert(migrate("middle", "1").grade === "preSenior",
  "an older storage version still migrates the stale 5-9 value");
assert(migrate("preSenior", "2").grade === "preSenior",
"8-9 preference is restored");
assert(migrate("unknown", "2").grade === "senior",
"invalid stored preference falls back to 10-11");

const html = lib.read("index.html");
assert((html.match(/data-grade="/g) || []).length === 4 &&
  html.includes('data-grade="middle"') && html.includes('data-grade="preSenior"'),
"four grade choices are present in the page");
assert(!/<title>[^<]*10.?11/i.test(html) &&
  !/<meta name="description" content="[^"]*10.?11/i.test(html),
"document title and description are grade-neutral");

if (failures) process.exit(1);
console.log("GRADE SPLIT TESTS PASSED");
