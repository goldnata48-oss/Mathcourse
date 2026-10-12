/*
 * Mathcourse — end-to-end checks against the live deployment.
 *
 * Usage:
 *   node tools/check-live.js [--base https://site.netlify.app/]
 *   MC_BASE=https://... node tools/check-live.js
 */
const https = require("https");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const baseArg = process.argv.find(a => a.startsWith("--base="));
const BASE = (baseArg ? baseArg.split("=")[1] : process.env.MC_BASE) || "https://roaring-melba-8c60da.netlify.app/";

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "cache-control": "no-cache" } }, r => {
      let d = "";
      r.on("data", c => d += c);
      r.on("end", () => resolve({ status: r.statusCode, headers: r.headers, body: d }));
    });
    req.on("error", reject);
    req.setTimeout(300000, () => req.destroy(new Error("timeout")));
  });
}

function post(url, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        "cache-control": "no-cache",
      },
    }, r => {
      let d = "";
      r.on("data", c => d += c);
      r.on("end", () => {
        let json = null;
        try { json = JSON.parse(d); } catch (_) { /* non-JSON */ }
        resolve({ status: r.statusCode, json });
      });
    });
    req.on("error", reject);
    req.setTimeout(300000, () => req.destroy(new Error("timeout")));
    req.write(body);
    req.end();
  });
}

(async function () {
  let failed = 0;
  const check = (ok, label) => { if (!ok) failed++; console.log((ok ? "  OK   " : "  MISS ") + label); };

  const page = await get(BASE);
  console.log("=== index.html ===");
  console.log("HTTP", page.status, "| bytes:", page.body.length);
  console.log("content-type:", page.headers["content-type"]);
  console.log("last-modified:", page.headers["last-modified"]);
  console.log("etag:", page.headers["etag"]);

  const pageHtml = page.body;
  const jsParts = [];
  for (const f of ["i18n.js", "lessons.js", "lesson-data.js", "trainer.js", "app.js"]) {
    try { jsParts.push((await get(BASE + f)).body); }
    catch (e) { console.log("  WARN could not load " + f + ": " + e.message); }
  }
  const body = [pageHtml, ...jsParts].join("\n");
  const checks = {
    "geoCircles lesson":   body.indexOf('id: "geoCircles"') > 0,
    "geoCircles hint":     body.indexOf("geoCircles:{ru:") > 0,
    "roadmap id":          /"geoCircles",/.test(body),
    "stale soon-entry":    body.indexOf('soon:true, t:{ru:"Вписанная и описанная') < 0,
    "geoCurved lesson":    body.indexOf('id: "geoCurved"') > 0,
    "geoCurved hint":      body.indexOf("geoCurved:{ru:") > 0,
    "facultative section": body.indexOf("const FACULTATIVE") > 0,
    "geoCurved faculty":   /lessons:\["geoCurved","geoRose"\]/.test(body),
    "no geoCurved in m5":  /"geoCircles","geoCurved"/.test(body) === false,
    "no stale geoCurved":  body.indexOf('soon:true, t:{ru:"Площади криволинейных фигур"') < 0,
    "geoRose lesson":      body.indexOf('id: "geoRose"') > 0,
    "geoRose hint":        body.indexOf("geoRose:{ru:") > 0,
    "facultative label":   body.indexOf("Факультатив") > 0,
    "no stale geoRose":    body.indexOf('soon:true, t:{ru:"Полярные кривые. Роза"') < 0,
    "geoSineCos lesson":   body.indexOf('id: "geoSineCos"') > 0,
    "geoVectorTasks":      body.indexOf('id: "geoVectorTasks"') > 0,
    "stereo geoPerp":      body.indexOf('id: "geoPerp"') > 0,
    "stereo geoPrism":     body.indexOf('id: "geoPrism"') > 0,
    "stereo geoRevolve":   body.indexOf('id: "geoRevolve"') > 0,
    "stereoIntro lesson":  body.indexOf('makeTopicLesson("stereoIntro"') > 0,
    "m7 comb1":            body.indexOf('id: "comb1"') > 0,
    "m7 comb2":            body.indexOf('id: "comb2"') > 0,
    "m7 prob1":            body.indexOf('id: "prob1"') > 0,
    "m7 prob2":            body.indexOf('id: "prob2"') > 0,
    "m8 stat1":            body.indexOf('id: "stat1"') > 0,
    "m7 comb1 hint":       body.indexOf("comb1:{ru:") > 0,
    "m8 stat1 hint":       body.indexOf("stat1:{ru:") > 0,
    "m6 test6 roadmap":    body.indexOf('{test:true, id:"test6"') > 0,
    "ten-module priority roadmap": body.indexOf("exam_priority:true") > 0 && body.indexOf("advanced:true") > 0,
    "m10 final set":       /"final1","final2","final3","final4","final5","final6"/.test(body),
    "final explanations":  body.indexOf("function buildFinalQuestions") > 0 && body.indexOf("mini-explanation") > 0,
    "m15 re1 lesson":      body.indexOf('makeTopicLesson("re1"') > 0,
    "m15 re4 lesson":      body.indexOf('makeTopicLesson("re4"') > 0,
    "m15 roadmap 15":      body.indexOf('makeTopicLesson("re1", 15') > 0 || body.indexOf("15:{ru:\"Модуль 15") > 0,
    "m15 test15 roadmap":  body.indexOf('{test:true, id:"test15"') > 0,
    "m15 re hints":        body.indexOf("как разность квадратов") > 0 && body.indexOf("решите линейное уравнение; проверьте") > 0,
    "m15 trainer topics":  body.indexOf('{ id:"ratSimplify"') > 0 && body.indexOf('{ id:"ratInequality"') > 0,
    "m15 generators":      body.indexOf("function genRatSimplifyMC") > 0 &&
                           body.indexOf("function genRatPowerMC") > 0 &&
                           body.indexOf("function genRatEquationMC") > 0 &&
                           body.indexOf("function genRatInequalityMC") > 0,
    "m15 lesson grades":   body.indexOf("re1:[\"preSenior\",\"senior\"]") > 0,
    "m5 geoTri hint":      body.indexOf("geoTriangles:{ru:") > 0,
    "m5 geoPoly hint":     body.indexOf("geoPolygons:{ru:") > 0,
    "m5 dot gen":          body.indexOf("function genVectorsDotMC") > 0,
    "m5 loc gen":          body.indexOf("function genLawOfCosinesMC") > 0,
    "m5 inscribed gen":    body.indexOf("function genInscribedAngleMC") > 0,
    "m5 vangle gen":       body.indexOf("function genVectorsAngleMC") > 0,
    "m5 los gen":          body.indexOf("function genLawOfSinesMC") > 0,
    "m5 radii gen":        body.indexOf("function genCircleRadiiMC") > 0,
    "m5 cross gen":        body.indexOf("function genVectorsCrossMC") > 0,
    "m5 area gen":         body.indexOf("function genAreaFiguresHigh") > 0,
    "m5 dot topic":        body.indexOf('{ id:"vectorsDot"') > 0,
    "m5 angle topic":      body.indexOf('{ id:"vectorsAngle"') > 0,
    "m5 area topic":       body.indexOf('{ id:"areaFigures"') > 0,
    "trainer c6 gens":     body.indexOf("function genC6StatMedianModeShort") > 0,
    "trainer c6 total":    /function genC6\w+Short|MC/.test(body),
    "trainer panel":       body.indexOf("function renderTaskMeta") > 0,
    "b3 absArea topic":    body.indexOf('topic:{ru:"Площадь под синусоидой"') > 0,
    "b3 nmt param topic":  body.indexOf('topic:{ru:"НМТ: параметр"') > 0,
    "b3 short format":     body.indexOf("коротка відповідь (вкажіть одне значення)") > 0,
    "b4 mini state":       body.indexOf('miniChecks: JSON.parse(localStorage.getItem("mc_mini")') > 0,
    "b4 mini save":        body.indexOf("function saveMiniChecks") > 0,
    "b4 mini badge":       body.indexOf("mini-check-badge") > 0,
    "b4 mini progress":    body.indexOf("miniCheckProgress") > 0,
    "b4 sidebar data":     body.indexOf("state.miniChecks[lessonId]") > 0,
    "b4 mini indicator":   body.indexOf("function refreshMiniIndicators") > 0,
    "b5 stats record":     body.indexOf("function recordTrainerResult") > 0,
    "b5 review start":     body.indexOf("function startTrainerReview") > 0,
    "b5 review render":    body.indexOf("function renderTrainerReview") > 0,
    "b5 question core":    body.indexOf("function renderTrainerQuestion") > 0,
    "b5 stats panel":      body.indexOf("trainerStatsTitle") > 0,
    "b5 topic stat":       body.indexOf("topic-stat") > 0,
  };
  Object.keys(checks).forEach(k => check(checks[k], k));

  const pageTag = (body.match(/mathcourse-[a-f0-9]+/) || [])[0];
  console.log("sw cache tag (page, informational):", pageTag);

  console.log("\n=== companion files ===");
  let liveSwBody = null;
  for (const f of ["sw.js", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-180.png", "icon-512.png", "icon-og.png", "privacy.html"]) {
    try {
      const r = await get(BASE + f);
      if (f === "sw.js") liveSwBody = r.body;
      check(r.status === 200, f.padEnd(22) + r.status + "  " + r.body.length + " bytes");
    } catch (e) { check(false, "ERR " + f + " " + e.message); }
  }

  let robots = { status: 0, body: "" };
  try { robots = await get(BASE + "robots.txt"); } catch (_) { /* leave default */ }
  check(robots.status === 200, "robots.txt".padEnd(22) + robots.status + "  " + robots.body.length + " bytes");
  check(robots.body.indexOf("Sitemap: https://roaring-melba-8c60da.netlify.app/sitemap.xml") !== -1,
    "robots.txt points to sitemap.xml");

  console.log("\n=== page weight ===");
  check(pageHtml.length < 1024 * 1024,
    "index.html under 1 MB (" + Math.round(pageHtml.length / 1024) + " KB)");
  check(pageHtml.indexOf("<script src=\"app.js\"") > 0 || pageHtml.indexOf("<script defer src=\"app.js\"") > 0,
    "scripts external (not inlined in HTML)");
  try {
    const ld = pageHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const data = ld ? JSON.parse(ld[1]) : null;
    check(!!data && data["@type"] === "Course", "JSON-LD Course present on live page");
  } catch (e) { check(false, "JSON-LD parses (" + e.message + ")"); }

  console.log("\n=== 404 page ===");
  try {
    const missing = await get(BASE + "no-such-page-" + Date.now());
    check(missing.status === 404, "missing path returns 404 (HTTP " + missing.status + ")");
    check(missing.body.indexOf("Страница не найдена") > 0 && missing.body.indexOf("Сторінку не знайдено") > 0,
      "custom bilingual 404 page served");
  } catch (e) { check(false, "ERR 404 page " + e.message); }

  console.log("\n=== cookie consent + privacy ===");
  check(body.indexOf('id="cookie-consent"') > 0, "consent banner present on live page");
  check(body.indexOf('<script async src="https://www.googletagmanager.com/gtag/js') < 0 &&
        body.indexOf('<script type="text/javascript">\n    (function(c,l,a,r,i,t,y)') < 0,
    "analytics not inlined in served HTML (gated by consent)");
  try {
    const privacy = await get(BASE + "privacy.html");
    check(privacy.status === 200 && privacy.body.indexOf("Microsoft Clarity") > 0,
      "privacy.html live (HTTP " + privacy.status + ")");
  } catch (e) { check(false, "ERR privacy.html " + e.message); }

  let localTag = "none";
  try {
    localTag = (fs.readFileSync(path.join(ROOT, "dist", "sw.js"), "utf8").match(/mathcourse-[a-f0-9]+/) || [])[0] || "none";
  } catch (_) { /* dist not built */ }
  const liveTag = (String(liveSwBody || "").match(/mathcourse-[a-f0-9]+/) || [])[0] || "none";
  check(liveTag === localTag, "live sw.js cache tag matches local (" + liveTag + " vs " + localTag + ")");

  console.log("\n=== kvantik function ===");
  const fnUrl = BASE.replace(/\/$/, "") + "/.netlify/functions/kvantik";
  const greet = await post(fnUrl, { message: "Привет", lessonId: "l1", lang: "ru" });
  const greetOk = greet.status === 200 && /Квантик/.test((greet.json && greet.json.reply) || "");
  check(greetOk, "kvantik greeting ru (HTTP " + greet.status + ")");
  const ctx = await post(fnUrl, { message: "дальше что", lessonId: "seq2", lang: "ru" });
  const ctxOk = ctx.status === 200 && /seq2/.test((ctx.json && ctx.json.reply) || "");
  check(ctxOk, "kvantik lesson context (HTTP " + ctx.status + ")");
  const nonPost = await get(fnUrl);
  check(nonPost.status === 405, "kvantik GET -> 405 (HTTP " + nonPost.status + ")");

  console.log("\n" + (failed === 0 ? "LIVE CHECKS PASSED" : "LIVE CHECKS FAILED: " + failed));
  process.exit(failed === 0 ? 0 : 1);
})().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
