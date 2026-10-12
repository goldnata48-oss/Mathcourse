/* 2026 Наталия Кравченко. Все права защищены. Образовательный курс — «Маткурс» */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { generateIcons } = require("./build-icons");

const root = __dirname;
const dist = path.join(root, "dist");

const read = file => fs.readFileSync(path.join(root, file), "utf8");
/* Запись через временный файл: dist/index.html может быть открыт браузером или редактором,
   и прямое усечение тогда падает с UNKNOWN. rename перекрывает занятый файл. */
const writeFile = (file, content) => {
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, content, "utf8");
  fs.renameSync(tmp, file);
};

/* Ассеты разделены: HTML остаётся маленьким, а скрипты/стили грузятся
   отдельными файлами (SW кэширует их, браузер — отдельно от разметки). */
const ASSETS = ["theme.css", "styles.css", "i18n.js", "lessons.js", "lesson-data.js", "trainer.js", "app.js"];
const APP_SHELL = [
  "./", "./index.html", "./manifest.webmanifest", "./icon.svg",
  "./theme.css", "./styles.css", "./i18n.js", "./lessons.js", "./lesson-data.js", "./trainer.js", "./app.js",
  "./privacy.html",
];

/* Версия кэша из содержимого всех исходников — меняется при любой правке. */
function computeCacheTag() {
  const parts = ["index.html", ...ASSETS].map(read);
  return crypto.createHash("sha1").update(parts.join("\n")).digest("hex").slice(0, 8);
}

/* Оставлено для tools/verify.js: возвращает только тег версии. */
function computeBundle() {
  return { cacheTag: computeCacheTag() };
}

function build() {
  const cacheTag = computeCacheTag();

  fs.mkdirSync(dist, { recursive: true });
  for (const f of ASSETS) fs.copyFileSync(path.join(root, f), path.join(dist, f));

  const html = read("index.html");
  writeFile(path.join(dist, "index.html"), html);
  fs.copyFileSync(path.join(root, "manifest.webmanifest"), path.join(dist, "manifest.webmanifest"));
  fs.copyFileSync(path.join(root, "icon.svg"), path.join(dist, "icon.svg"));
  fs.copyFileSync(path.join(root, "sitemap.xml"), path.join(dist, "sitemap.xml"));
  fs.copyFileSync(path.join(root, "robots.txt"), path.join(dist, "robots.txt"));
  fs.copyFileSync(path.join(root, "privacy.html"), path.join(dist, "privacy.html"));
  fs.copyFileSync(path.join(root, "404.html"), path.join(dist, "404.html"));

  const sw = read("sw.js")
    .replace(/const CACHE_NAME = "mathcourse-v1";/, `const CACHE_NAME = "mathcourse-${cacheTag}";`)
    .replace(/const APP_SHELL = \[[\s\S]*?\];/, `const APP_SHELL = ${JSON.stringify(APP_SHELL, null, 2)};`);
  writeFile(path.join(dist, "sw.js"), sw);

  generateIcons(root);
  generateIcons(dist);

  const size = Buffer.byteLength(html, "utf8");
  console.log(`Built ${path.relative(root, path.join(dist, "index.html"))}`);
  console.log(`Size: ${size} bytes`);
  console.log(`Assets: ${ASSETS.join(", ")}`);
  return { size, cacheTag };
}

if (require.main === module) build();

module.exports = { computeBundle, build };
