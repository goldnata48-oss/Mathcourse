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
    req.setTimeout(25000, () => req.destroy(new Error("timeout")));
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

  const body = page.body;
  const checks = {
    "geoCircles lesson":   body.indexOf('id: "geoCircles"') > 0,
    "geoCircles hint":     body.indexOf("geoCircles:{ru:") > 0,
    "roadmap id":          /"geoCircles",/.test(body),
    "stale soon-entry":    body.indexOf('soon:true, t:{ru:"Вписанная и описанная') < 0,
    "geoCurved lesson":    body.indexOf('id: "geoCurved"') > 0,
    "geoCurved hint":      body.indexOf("geoCurved:{ru:") > 0,
    "geoCurved roadmap":   /"geoCircles","geoCurved"/.test(body),
    "no stale geoCurved":  body.indexOf('soon:true, t:{ru:"Площади криволинейных фигур"') < 0,
    "geoRose lesson":      body.indexOf('id: "geoRose"') > 0,
    "geoRose hint":        body.indexOf("geoRose:{ru:") > 0,
    "geoRose roadmap":     /"geoCurved","geoRose"/.test(body),
    "no stale geoRose":    body.indexOf('soon:true, t:{ru:"Полярные кривые. Роза"') < 0,
    "geoSineCos lesson":   body.indexOf('id: "geoSineCos"') > 0,
    "geoVectorTasks":      body.indexOf('id: "geoVectorTasks"') > 0,
    "stereo geoPerp":      body.indexOf('id: "geoPerp"') > 0,
    "stereo geoPrism":     body.indexOf('id: "geoPrism"') > 0,
    "stereo geoRevolve":   body.indexOf('id: "geoRevolve"') > 0,
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
  for (const f of ["sw.js", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-180.png", "icon-512.png", "icon-og.png"]) {
    try {
      const r = await get(BASE + f);
      if (f === "sw.js") liveSwBody = r.body;
      check(r.status === 200, f.padEnd(22) + r.status + "  " + r.body.length + " bytes");
    } catch (e) { check(false, "ERR " + f + " " + e.message); }
  }

  let localTag = "none";
  try {
    localTag = (fs.readFileSync(path.join(ROOT, "dist", "sw.js"), "utf8").match(/mathcourse-[a-f0-9]+/) || [])[0] || "none";
  } catch (_) { /* dist not built */ }
  const liveTag = (String(liveSwBody || "").match(/mathcourse-[a-f0-9]+/) || [])[0] || "none";
  check(liveTag === localTag, "live sw.js cache tag matches local (" + liveTag + " vs " + localTag + ")");

  console.log("\n" + (failed === 0 ? "LIVE CHECKS PASSED" : "LIVE CHECKS FAILED: " + failed));
  process.exit(failed === 0 ? 0 : 1);
})().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
