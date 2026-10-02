/* 2026 Наталия Кравченко. Все права защищены. Образовательный курс — «Маткурс» */
const fs = require("fs");
const path = require("path");
const { generateIcons } = require("./build-icons");

const root = __dirname;
const dist = path.join(root, "dist");
const htmlPath = path.join(root, "index.html");

const read = file => fs.readFileSync(path.join(root, file), "utf8");
/* Запись через временный файл: dist/index.html может быть открыт браузером или редактором,
   и прямое усечение тогда падает с UNKNOWN. rename перекрывает занятый файл. */
const writeFile = (file, content) => {
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, content, "utf8");
  fs.renameSync(tmp, file);
};
const source = read("index.html");
const css = [read("theme.css"), read("styles.css")].join("\n");
const js = [read("i18n.js"), read("lessons.js"), read("trainer.js"), read("app.js")].join("\n");

let bundle = source
  .replace(/\s*<link rel="stylesheet" href="theme\.css">\s*/g, "\n")
  .replace(/\s*<link rel="stylesheet" href="styles\.css">\s*/g, "\n")
  .replace(/\s*<script src="i18n\.js" defer><\/script>\s*/g, "\n")
  .replace(/\s*<script src="lessons\.js" defer><\/script>\s*/g, "\n")
  .replace(/\s*<script src="trainer\.js" defer><\/script>\s*/g, "\n")
  .replace(/\s*<script src="app\.js" defer><\/script>\s*/g, "\n")
  .replace("</head>", `  <style>\n${css}\n  </style>\n</head>`)
  .replace("</body>", `  <script>\n${js}\n  </script>\n</body>`);

fs.mkdirSync(dist, { recursive: true });
writeFile(path.join(dist, "index.html"), bundle);
fs.copyFileSync(path.join(root, "manifest.webmanifest"), path.join(dist, "manifest.webmanifest"));
fs.copyFileSync(path.join(root, "icon.svg"), path.join(dist, "icon.svg"));
generateIcons(root);
generateIcons(dist);

const crypto = require("crypto");
const cacheTag = crypto.createHash("sha1").update(bundle).digest("hex").slice(0, 8);
let sw = read("sw.js")
  .replace(/const CACHE_NAME = "mathcourse-v1";/, `const CACHE_NAME = "mathcourse-${cacheTag}";`)
  .replace(/const APP_SHELL = \[[\s\S]*?\];/, `const APP_SHELL = [\n  "./",\n  "./index.html",\n  "./manifest.webmanifest",\n  "./icon.svg"\n];`);
writeFile(path.join(dist, "sw.js"), sw);

console.log(`Built ${path.relative(root, path.join(dist, "index.html"))}`);
console.log(`Size: ${Buffer.byteLength(bundle, "utf8")} bytes`);
