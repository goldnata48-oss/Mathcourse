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
    "geoVectorTasks":     page.body.indexOf('id: "geoVectorTasks"') > 0
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
