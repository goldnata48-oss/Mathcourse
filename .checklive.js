const https = require("https");
const BASE = "https://roaring-melba-8c60da.netlify.app/";
function get(url){
  return new Promise(function(res, rej){
    const req = https.get(url, {headers: {"cache-control": "no-cache"}}, function(r){
      let d = "";
      r.on("data", c => d += c);
      r.on("end", () => res({status: r.statusCode, headers: r.headers, body: d}));
    });
    req.on("error", rej);
    req.setTimeout(25000, function(){ req.destroy(new Error("timeout")); });
  });
}
(async function(){
  const page = await get(BASE);
  console.log("=== index.html ===");
  console.log("HTTP", page.status, "| bytes:", page.body.length);
  console.log("content-type:", page.headers["content-type"]);
  console.log("last-modified:", page.headers["last-modified"]);
  console.log("etag:", page.headers["etag"]);
  const checks = {
    "geoCircles lesson":   page.body.indexOf('id: "geoCircles"') > 0,
    "geoCircles hint":    page.body.indexOf("geoCircles:{ru:") > 0,
    "roadmap id":         /"geoCircles",/.test(page.body),
    "stale soon-entry":   page.body.indexOf('soon:true, t:{ru:"Вписанная и описанная') < 0,
    "geoCurved lesson":   page.body.indexOf('id: "geoCurved"') > 0,
    "geoCurved hint":     page.body.indexOf("geoCurved:{ru:") > 0,
    "geoCurved roadmap":  /"geoCircles","geoCurved"/.test(page.body),
    "no stale geoCurved": page.body.indexOf('soon:true, t:{ru:"Площади криволинейных фигур"') < 0,
    "geoRose lesson":     page.body.indexOf('id: "geoRose"') > 0,
    "geoRose hint":       page.body.indexOf("geoRose:{ru:") > 0,
    "geoRose roadmap":    /"geoCurved","geoRose"/.test(page.body),
    "no stale geoRose":   page.body.indexOf('soon:true, t:{ru:"Полярные кривые. Роза"') < 0,
    "geoSineCos lesson":  page.body.indexOf('id: "geoSineCos"') > 0,
    "geoVectorTasks":     page.body.indexOf('id: "geoVectorTasks"') > 0,
    "stereo geoPerp":     page.body.indexOf('id: "geoPerp"') > 0,
    "stereo geoPrism":    page.body.indexOf('id: "geoPrism"') > 0,
    "stereo geoRevolve":  page.body.indexOf('id: "geoRevolve"') > 0,
    "m6 comb1":           page.body.indexOf('id: "comb1"') > 0,
    "m6 comb2":           page.body.indexOf('id: "comb2"') > 0,
    "m6 prob1":           page.body.indexOf('id: "prob1"') > 0,
    "m6 prob2":           page.body.indexOf('id: "prob2"') > 0,
    "m6 stat1":           page.body.indexOf('id: "stat1"') > 0,
    "m6 comb1 hint":      page.body.indexOf("comb1:{ru:") > 0,
    "m6 stat1 hint":      page.body.indexOf("stat1:{ru:") > 0,
    "m6 test6 roadmap":   page.body.indexOf('{test:true, id:"test6"') > 0,
    "m5 geoTri hint":     page.body.indexOf("geoTriangles:{ru:") > 0,
    "m5 geoPoly hint":    page.body.indexOf("geoPolygons:{ru:") > 0,
    "m5 dot gen":         page.body.indexOf("function genVectorsDotMC") > 0,
    "m5 loc gen":         page.body.indexOf("function genLawOfCosinesMC") > 0,
    "m5 inscribed gen":   page.body.indexOf("function genInscribedAngleMC") > 0,
    "m5 vangle gen":      page.body.indexOf("function genVectorsAngleMC") > 0,
    "m5 los gen":         page.body.indexOf("function genLawOfSinesMC") > 0,
    "m5 radii gen":       page.body.indexOf("function genCircleRadiiMC") > 0,
    "m5 cross gen":       page.body.indexOf("function genVectorsCrossMC") > 0,
    "m5 area gen":        page.body.indexOf("function genAreaFiguresHigh") > 0,
    "m5 dot topic":       page.body.indexOf('{ id:"vectorsDot"') > 0,
    "m5 angle topic":     page.body.indexOf('{ id:"vectorsAngle"') > 0,
    "m5 area topic":      page.body.indexOf('{ id:"areaFigures"') > 0,
    "trainer c6 gens":    page.body.indexOf("function genC6StatMedianModeShort") > 0,
    "trainer c6 total":   /function genC6\w+Short|MC/.test(page.body),
    "trainer panel":      page.body.indexOf("function renderTaskMeta") > 0
  };
  Object.keys(checks).forEach(k => console.log((checks[k] ? "  OK   " : "  MISS ") + k));
  const tag = (page.body.match(/mathcourse-[a-f0-9]+/) || [])[0];
  console.log("sw cache tag in page:", tag);
  const local = require("fs").readFileSync("dist/sw.js", "utf8");
  const localTag = (local.match(/mathcourse-[a-f0-9]+/) || [])[0];
  console.log("sw cache tag local  :", localTag, tag === localTag ? "(match)" : "(DIFFERENT)");

  console.log("\n=== companion files ===");
  ["sw.js", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-180.png", "icon-512.png", "icon-og.png"]
    .forEach(async function(f){
      try {
        const r = await get(BASE + f);
        console.log("  " + (r.status === 200 ? "OK  " : "FAIL") + " " + f.padEnd(22) + r.status + "  " + r.body.length + " bytes");
      } catch(e){ console.log("  ERR " + f + " " + e.message); }
    });
})();
