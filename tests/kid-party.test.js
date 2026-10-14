/* Celebration lesson-enders (islands 16–23): sticker catalog, grant/shelf, party html. */
const vm = require("vm");
const lib = require("../tools/lib");

const appSrc = lib.read("app.js");
const lessonsSrc = lib.readLessonsSource();

class ClassList {
  constructor() { this.set = new Set(); }
  add(...c) { c.forEach(x => this.set.add(x)); }
  remove(...c) { c.forEach(x => this.set.delete(x)); }
  toggle(c, force) { const on = force === undefined ? !this.set.has(c) : !!force; if (on) this.set.add(c); else this.set.delete(c); return on; }
  contains(c) { return this.set.has(c); }
}

class El {
  constructor(tag) {
    this.tagName = (tag || "div").toUpperCase();
    this.children = [];
    this.parent = null;
    this.classList = new ClassList();
    this.textContent = "";
    this._attrs = {};
    this.innerHTML = "";
  }
  appendChild(c) { c.parent = this; this.children.push(c); return c; }
  remove() { if (this.parent) { this.parent.children = this.parent.children.filter(x => x !== this); this.parent = null; } }
  setAttribute(k, v) { this._attrs[k] = v; }
  get className() { return [...this.classList.set].join(" "); }
  set className(v) { this.classList = new ClassList(); String(v).split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c)); }
  _all(acc) { this.children.forEach(c => { acc.push(c); c._all(acc); }); return acc; }
  querySelectorAll() { return this._all([]); }
}

const store = {};
function makeContext(initialStickers) {
  const ctx = {
    state: { stickers: new Set(initialStickers || []) },
    document: { createElement(tag) { return new El(tag); } },
    localStorage: { setItem(k, v) { store[k] = v; }, getItem(k) { return store[k] || null; } }
  };
  vm.createContext(ctx);
  const kidUi = lessonsSrc.match(/const KID_UI = (\{[\s\S]*?\n\});/);
  vm.runInContext("var KID_UI = " + kidUi[1] + ";", ctx);
  const stickers = lessonsSrc.match(/const KID_STICKERS = (\[[\s\S]*?\n\]);/);
  vm.runInContext("var KID_STICKERS = " + stickers[1] + ";", ctx);
  vm.runInContext(lib.extractFn(appSrc, "saveStickers"), ctx);
  vm.runInContext(lib.extractFn(lessonsSrc, "kidHasSticker"), ctx);
  vm.runInContext(lib.extractFn(lessonsSrc, "grantSticker"), ctx);
  vm.runInContext(lib.extractFn(lessonsSrc, "renderStickerShelf"), ctx);
  return ctx;
}

let fails = 0;
const assert = (cond, msg) => { if (!cond) { fails++; console.log("FAIL: " + msg); } else console.log("ok: " + msg); };

/* 1. Каталог наклеек: 8 штук, id совпадают с уроками-праздниками ROADMAP. */
const lessons = lib.loadLessons().lessons;
const partyIds = lessons.filter(l => /^kidParty\d+$/.test(l.id)).map(l => l.id);
assert(partyIds.length >= 8, "party lessons in LESSONS (got " + partyIds.length + ")");
assert(partyIds.every(id => { const m = lessons.find(l => l.id === id).module; return m >= 16 && m <= 24; }),
  "party lessons attached to islands 16–24");

const ctx0 = makeContext();
assert(ctx0.KID_STICKERS.length === partyIds.length, "KID_STICKERS matches party lesson count");
assert(new Set(ctx0.KID_STICKERS.map(s => s.id)).size === ctx0.KID_STICKERS.length, "sticker ids unique");
assert(ctx0.KID_STICKERS.map(s => s.id).sort().join(",") === partyIds.sort().join(","),
  "sticker ids match party lesson ids");
assert(ctx0.KID_STICKERS.every(s => s.emoji && s.name && s.name.ru && s.name.ua), "each sticker has emoji + ru/ua name");

/* 2. Выдача наклейки: идемпотентна и сохраняется. */
const ctx = makeContext();
assert(ctx.kidHasSticker("kidParty16") === false, "sticker not owned initially");
assert(ctx.grantSticker("kidParty16") === true, "first grant returns true");
assert(ctx.kidHasSticker("kidParty16") === true, "sticker owned after grant");
assert(ctx.grantSticker("kidParty16") === false, "second grant returns false (idempotent)");
assert(store.mc_stickers && JSON.parse(store.mc_stickers).includes("kidParty16"), "stickers persisted to localStorage");

/* 3. Полка наклеек: 8 ячеек, открытые/закрытые различаются. */
const ctx2 = makeContext(["kidParty17"]);
const host = new El("div");
ctx2.renderStickerShelf(host, "ru", "kidParty17");
const grid = host.children[1];
const total = ctx2.KID_STICKERS.length;
assert(host.children[0].textContent === "Моя коллекция наклеек", "shelf title from KID_UI");
assert(grid.children.length === total, "shelf renders one cell per sticker");
const earned = grid.children.filter(c => c.classList.contains("kid-sticker-earned"));
const locked = grid.children.filter(c => c.classList.contains("kid-sticker-locked"));
assert(earned.length === 1 && locked.length === total - 1, "one earned, the rest locked");
assert(grid.children[1].classList.contains("kid-sticker-current"), "current sticker highlighted");

/* 4. Разметка урока-праздника: баннер и контейнер полки. */
const partySrc = lessonsSrc.match(/function makeKidParty\([\s\S]*?\n\}/);
vm.createContext(ctx2);
vm.runInContext("var KID_UI = " + lessonsSrc.match(/const KID_UI = (\{[\s\S]*?\n\});/)[1] + ";", ctx2);
vm.runInContext(partySrc[0], ctx2);
const html = ctx2.makeKidParty("kidParty16", 16, { ru: "x", ua: "x" }, {
  ru: { banner: "Баннер", lead: "Лид", checkTitle: "Игра" },
  ua: { banner: "Баннер", lead: "Лід", checkTitle: "Гра" }
}, [{ type: "pick", ask: { ru: "?", ua: "?" }, options: ["a"], correct: 0 }], undefined, { id: "kidParty16" }).html("ru");
assert(html.includes("kid-party-banner") && html.includes("Баннер"), "party html has banner");
assert(html.includes("kid-stickers"), "party html has sticker shelf container");
assert(html.includes("mini-check"), "party html has mini-check container");

console.log(fails === 0 ? "\nALL KID-PARTY TESTS PASSED" : "\n" + fails + " TEST(S) FAILED");
process.exit(fails ? 1 : 0);
