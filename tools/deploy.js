/*
 * Mathcourse — production deploy to Netlify via REST API.
 *
 * Important: this API call intentionally does NOT send a `branch` field.
 * Passing a branch creates a branch deploy that does not update production.
 *
 * Usage:
 *   node tools/deploy.js [options]
 *
 * Options:
 *   --site <name>       Netlify site name (default: roaring-melba-8c60da)
 *   --site-id <id>      Netlify site id   (default: project site id)
 *   --dir <path>        Folder to publish (default: dist)
 *   --token <token>     Auth token (default: env NETLIFY_AUTH_TOKEN, then CLI config)
 *   --title <text>      Deploy title (default: latest git commit subject)
 *   --message <text>    Deploy commit message (default: latest git commit subject)
 *   --no-wait           Do not wait for the deploy to become ready
 *   --draft             Create a draft deploy (preview URL) instead of production
 *   --dry-run           List files and exit without uploading
 *   --help              Show this help
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const zlib = require("zlib");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DEFAULTS = {
  site: "roaring-melba-8c60da",
  siteId: "d974b04c-3fc0-4771-8817-2fcb19521a5c",
  dir: path.join(ROOT, "dist"),
};

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    if (key === "help" || key === "no-wait" || key === "dry-run" || key === "draft") { out[key] = true; continue; }
    const val = argv[++i];
    if (val === undefined) throw new Error("missing value for --" + key);
    out[key] = val;
  }
  return out;
}

function gitSubject() {
  try {
    return execFileSync("git", ["log", "-1", "--pretty=%s"], { cwd: ROOT, encoding: "utf8" }).trim();
  } catch (_) {
    return "";
  }
}

function resolveToken(explicit) {
  if (explicit) return explicit;
  if (process.env.NETLIFY_AUTH_TOKEN) return process.env.NETLIFY_AUTH_TOKEN;
  const candidates = [];
  if (process.env.APPDATA) candidates.push(path.join(process.env.APPDATA, "netlify", "Config", "config.json"));
  candidates.push(path.join(os.homedir(), ".config", "netlify", "config.json"));
  for (const p of candidates) {
    try {
      const cfg = JSON.parse(fs.readFileSync(p, "utf8"));
      const users = cfg.users || {};
      const first = Object.keys(users)[0];
      if (first && users[first] && users[first].auth && users[first].auth.token) return users[first].auth.token;
    } catch (_) { /* try next */ }
  }
  return null;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

/* ---- minimal ZIP writer (stored/deflate) to bundle Netlify Functions ----
   Netlify accepts function code as a plain zip where the entry file is
   named after the function (e.g. `kvantik.js`). We deflate with node's
   built-in zlib and compute CRC-32 ourselves — no external deps needed. */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xff];
  return (c ^ (-1)) >>> 0;
}
function makeZip(entries) {
  const local = [];
  const central = [];
  let offset = 0;
  for (const e of entries) {
    const nameBuf = Buffer.from(e.name, "utf8");
    const data = Buffer.isBuffer(e.data) ? e.data : Buffer.from(e.data, "utf8");
    const crc = crc32(data);
    const comp = zlib.deflateRawSync(data, { level: 9 });
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(8, 8);
    lh.writeUInt16LE(0, 10);
    lh.writeUInt16LE(0, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(comp.length, 18);
    lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    lh.writeUInt16LE(0, 28);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0, 8);
    ch.writeUInt16LE(8, 10);
    ch.writeUInt16LE(0, 12);
    ch.writeUInt16LE(0, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(comp.length, 20);
    ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(nameBuf.length, 28);
    ch.writeUInt16LE(0, 30);
    ch.writeUInt16LE(0, 32);
    ch.writeUInt16LE(0, 34);
    ch.writeUInt16LE(0, 36);
    ch.writeUInt32LE(0, 38);
    ch.writeUInt32LE(offset, 42);
    local.push(lh, nameBuf, comp);
    central.push(ch, nameBuf);
    offset += 30 + nameBuf.length + comp.length;
  }
  const cdLen = central.reduce((s, b) => s + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdLen, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...local, ...central, eocd]);
}

/* Discover Netlify functions: each netlify/functions/*.js becomes a bundle
   `{ name, zip, sha256 }` whose single entry is `<name>.js`. */
function loadFunctions() {
  const dir = path.join(ROOT, "netlify", "functions");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".js"))
    .map(f => {
      const name = f.slice(0, -3);
      const zip = makeZip([{ name: name + ".js", data: fs.readFileSync(path.join(dir, f)) }]);
      return { name, zip, sha256: crypto.createHash("sha256").update(zip).digest("hex") };
    });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(0, 22).join("\n"));
    return;
  }

  const siteName = args.site || DEFAULTS.site;
  const siteId = args["site-id"] || DEFAULTS.siteId;
  const dir = path.resolve(args.dir || DEFAULTS.dir);
  const subject = gitSubject();
  const title = args.title || subject || "mathcourse deploy";
  const message = args.message || subject || "mathcourse deploy";

  if (!fs.existsSync(dir)) throw new Error("publish directory not found: " + dir);
  const functions = loadFunctions();
  const functionDigest = {};
  for (const fn of functions) functionDigest[fn.name] = fn.sha256;
  const token = resolveToken(args.token);
  if (!token) {
    throw new Error("no Netlify token: pass --token, set NETLIFY_AUTH_TOKEN, or run `netlify login` once");
  }

  const api = async (method, url, body) => {
    const res = await fetch("https://api.netlify.com" + url, {
      method,
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        "User-Agent": "mathcourse-deploy",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (_) { /* non-JSON */ }
    if (!res.ok) throw new Error(method + " " + url + " -> " + res.status + " " + text.slice(0, 500));
    return json;
  };

  const me = await api("GET", "/api/v1/user");
  console.log("auth ok:", me.email);

  const site = await api("GET", "/api/v1/sites/" + siteId);
  if (site.name !== siteName && args.site) {
    console.warn("warning: --site (" + siteName + ") differs from site name (" + site.name + "); using site id");
  }
  console.log("site:", site.name, site.id, "state:", site.state);

  const files = {};
  for (const f of walk(dir)) {
    const rel = path.relative(dir, f).split(path.sep).join("/");
    files[rel] = crypto.createHash("sha1").update(fs.readFileSync(f)).digest("hex");
  }
  console.log("dir:", dir, "| files:", Object.keys(files).length);

  if (args["dry-run"]) {
    Object.keys(files).sort().forEach(f => console.log("  " + f));
    for (const fn of functions) console.log("  [fn] " + fn.name + ".js (" + fn.sha256.slice(0, 8) + ")");
    console.log("dry run: deploy skipped");
    return;
  }

  const deployBody = {
    files,
    functions: functionDigest,
    async: false,
    draft: !!args.draft,
    title,
    commit_message: message,
  };
  if (functions.length) {
    deployBody.function_configs = {};
    for (const fn of functions) deployBody.function_configs[fn.name] = { runtime: "nodejs20.x" };
  }
  const deploy = await api("POST", "/api/v1/sites/" + site.id + "/deploys", deployBody);
  console.log("deploy id:", deploy.id, "required:", (deploy.required || []).length,
    "required_functions:", (deploy.required_functions || []).length, "state:", deploy.state);
  const bySha = {};
  for (const rel of Object.keys(files)) bySha[files[rel]] = rel;

  for (const item of deploy.required || []) {
    const rel = typeof item === "string" ? bySha[item] : item.path;
    const buf = fs.readFileSync(path.join(dir, rel.split("/").join(path.sep)));
    const res = await fetch(
      "https://api.netlify.com/api/v1/deploys/" + deploy.id + "/files/" + rel,
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/mime",
          "User-Agent": "mathcourse-deploy",
        },
        body: buf,
      }
    );
    if (!res.ok) throw new Error("upload " + rel + " -> " + res.status + " " + (await res.text()).slice(0, 300));
    console.log("  uploaded", rel, buf.length);
  }

  for (const item of deploy.required_functions || []) {
    const sha = typeof item === "string" ? item : (item && (item.sha || item.sha256));
    const fn = functions.find(x => x.sha256 === sha);
    if (!fn) throw new Error("unknown required function sha: " + sha);
    const res = await fetch(
      "https://api.netlify.com/api/v1/deploys/" + deploy.id + "/functions/" + encodeURIComponent(fn.name) + "?runtime=js",
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/zip",
          "User-Agent": "mathcourse-deploy",
        },
        body: fn.zip,
      }
    );
    if (!res.ok) throw new Error("upload function " + fn.name + " -> " + res.status + " " + (await res.text()).slice(0, 300));
    console.log("  uploaded function", fn.name, fn.zip.length, "bytes (runtime=js)");
  }

  if (args["no-wait"]) {
    console.log("deploy submitted (not waiting)");
    return;
  }

  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const d = await api("GET", "/api/v1/deploys/" + deploy.id);
    console.log("  state:", d.state, d.state === "ready" ? d.deploy_ssl_url : "");
    if (d.state === "ready" || d.state === "error") {
      console.log("DEPLOY_URL:", d.deploy_ssl_url || d.deploy_url);
      console.log("FINAL_STATE:", d.state, "error_message:", d.error_message || "-");
      process.exitCode = d.state === "ready" ? 0 : 1;
      return;
    }
  }
  console.log("TIMEOUT waiting for deploy");
  process.exitCode = 2;
}

if (require.main === module) {
  main().catch(e => { console.error("FAILED:", e.message); process.exitCode = 1; });
}

module.exports = { makeZip, crc32, loadFunctions };
