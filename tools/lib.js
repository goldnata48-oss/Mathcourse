/* Mathcourse — shared helpers for tools and tests. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");

/* Extract a top-level `function name(...) {...}` block by brace matching. */
function extractFn(src, name) {
  const start = src.indexOf("function " + name + "(");
  if (start < 0) throw new Error("function not found: " + name);
  const open = src.indexOf("{", start);
  let depth = 0;
  for (let j = open; j < src.length; j++) {
    const ch = src[j];
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) return src.slice(start, j + 1); }
  }
  throw new Error("unbalanced braces in: " + name);
}

/* Math helpers live in app.js but are referenced by trainer.js generators. */
const TRAINER_STUB = `
function rnd(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function fmtNum(x){ return (Math.round(x*1000)/1000).toString(); }
function shuffleArr(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function buildMC(c,d){ const o=[c,...d]; const s=shuffleArr(o); return {opts:s, correctIdx:s.indexOf(c)}; }
function near(a,b,e){ e=e===undefined?0.02:e; return Math.abs(a-b)<e; }
function fmtRad(num,den){ if(num===0) return "0"; let pref=num===1?"":num+""; let core=pref+"\u03c0"; return den===1?core:core+"/"+den; }
const DEG_TABLE = [
  {deg:0,num:0,den:1},{deg:30,num:1,den:6},{deg:45,num:1,den:4},{deg:60,num:1,den:3},
  {deg:90,num:1,den:2},{deg:120,num:2,den:3},{deg:135,num:3,den:4},{deg:150,num:5,den:6},
  {deg:180,num:1,den:1},{deg:210,num:7,den:6},{deg:225,num:5,den:4},{deg:240,num:4,den:3},
  {deg:270,num:3,den:2},{deg:300,num:5,den:3},{deg:315,num:7,den:4},{deg:330,num:11,den:6},
  {deg:360,num:2,den:1}
];
`;

function loadLessons() {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(read("lessons.js") + "\n;var __L = LESSONS, __R = ROADMAP, __F = buildFinalQuestions;", ctx);
  return { lessons: ctx.__L, roadmap: ctx.__R, buildFinalQuestions: ctx.__F };
}

function loadUI() {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(read("i18n.js") + "\n;var __UI = UI;", ctx);
  return ctx.__UI;
}

function loadTrainer() {
  const ctx = {};
  vm.createContext(ctx);
  const parseAnswer = extractFn(read("app.js"), "parseAnswer");
  vm.runInContext(TRAINER_STUB + "\n" + parseAnswer + "\n" + read("trainer.js") + "\n;var __L = LEVEL_DEFS;", ctx);
  return ctx;
}

/* Build a vm realm from selected functions of a source file, plus extra globals. */
function makeRealm(fnNames, globals = {}, file = "app.js") {
  const ctx = Object.assign({}, globals);
  vm.createContext(ctx);
  const src = read(file);
  for (const n of fnNames) vm.runInContext(extractFn(src, n), ctx);
  return ctx;
}

module.exports = { ROOT, read, extractFn, TRAINER_STUB, loadLessons, loadUI, loadTrainer, makeRealm };
