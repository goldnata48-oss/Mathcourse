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
  vm.runInContext(read("lessons.js") + "\n;var __L = LESSONS, __R = ROADMAP, __FAC = FACULTATIVE, __F = buildFinalQuestions, __G = LESSON_GRADES, __TG = TOPIC_GRADES;", ctx);
  return { lessons: ctx.__L, roadmap: ctx.__R, facultative: ctx.__FAC,
    buildFinalQuestions: ctx.__F, lessonGrades: ctx.__G, topicGrades: ctx.__TG };
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

/* ---- per-lesson mini-check extraction (shared by verify.js and audit.js) ----
   Returns [{ id, module, qCount, corrects }] in LESSONS order. corrects holds the
   authored `correct:` index of each question of the lesson's REAL mini-check
   (the questions array of makeIntroLesson/makeTopicLesson or of renderMiniCheck),
   excluding mistakes simulators and workouts that do not persist to mc_mini. */
function lessonQuizStats(src, lessons) {
  function balance(s, idx, openCh, closeCh) {
    let depth = 0;
    for (let j = idx; j < s.length; j++) {
      const ch = s[j];
      if (ch === openCh) depth++;
      else if (ch === closeCh) { depth--; if (depth === 0) return s.slice(idx, j + 1); }
    }
    return null;
  }
  function skipString(s, i) {
    const q = s[i];
    for (let j = i + 1; j < s.length; j++) {
      if (s[j] === "\\") { j++; continue; }
      if (s[j] === q) return j + 1;
    }
    return s.length;
  }
  function topArrays(callBody) {
    const out = [];
    let depth = 0, seg = -1;
    for (let j = 1; j < callBody.length - 1; j++) {
      const ch = callBody[j];
      if (ch === "\"" || ch === "'" || ch === "`") { j = skipString(callBody, j) - 1; continue; }
      if (ch === "(" || ch === "[" || ch === "{") { if (depth === 0) seg = j; depth++; }
      else if (ch === ")" || ch === "]" || ch === "}") {
        depth--;
        if (depth === 0 && seg >= 0) { const t = callBody.slice(seg, j + 1); if (t[0] === "[") out.push(t); seg = -1; }
      }
    }
    return out;
  }
  /* anchor each lesson in source order */
  const anchors = [];
  for (const l of lessons) {
    const id = l.id;
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = /^final\d$/.test(id)
      ? new RegExp("makeFinalLesson\\(" + id.slice(5) + "\\)")
      : new RegExp("(makeIntroLesson\\(\\\"|makeTopicLesson\\(\\\"|id\\:\\s*\\\"|id\\:\\s*\\`)(" + esc + ")(\\\"|\\`)");
    const from = anchors.length ? anchors[anchors.length - 1] : 0;
    const hit = src.slice(from).search(re);
    if (hit < 0) throw new Error("anchor not found for lesson " + id);
    anchors.push(from + hit);
  }
  return lessons.map((l, i) => {
    const s = src.slice(anchors[i], i + 1 < anchors.length ? anchors[i + 1] : src.length);
    let quizSrc = null;
    const zi = s.search(/renderMiniCheck\(/);
    const fcall = s.match(/^(makeIntroLesson|makeTopicLesson)\(/m);
    if (zi >= 0) {
      const call = balance(s, s.indexOf("(", zi), "(", ")");
      const arrs = call ? topArrays(call) : [];
      quizSrc = arrs.length ? arrs[arrs.length - 1] : null;
    } else if (fcall) {
      const call = balance(s, fcall[0].length - 1, "(", ")");
      const arrs = call ? topArrays(call) : [];
      quizSrc = arrs.length ? arrs[arrs.length - 1] : null;
    }
    const segs = quizSrc ? quizSrc.split(/\{\s*q\s*:\s*\{\s*ru\s*:/g) : [];
    const corrects = segs.slice(1).map(seg => {
      const m = [...seg.matchAll(/correct:\s*(\d+)/g)];
      return m.length ? +m[m.length - 1][1] : null;
    }).filter(x => x !== null);
    return { id: l.id, module: l.module, qCount: segs.length - 1, corrects };
  });
}

module.exports = { ROOT, read, extractFn, TRAINER_STUB, loadLessons, loadUI, loadTrainer, makeRealm, lessonQuizStats };
