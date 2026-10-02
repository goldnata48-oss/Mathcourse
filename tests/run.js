/* Mathcourse — run all feature tests. */
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith(".test.js")).sort();
let failed = 0;

for (const f of files) {
  console.log("\n=== " + f + " ===");
  try {
    const out = execFileSync(process.execPath, [path.join(dir, f)], { cwd: path.join(dir, ".."), encoding: "utf8" });
    process.stdout.write(out.split("\n").map(l => "  " + l).join("\n") + "\n");
  } catch (e) {
    if (e.stdout) process.stdout.write(e.stdout.split("\n").map(l => "  " + l).join("\n") + "\n");
    if (e.stderr) process.stderr.write(e.stderr);
    failed++;
  }
}

console.log("\n" + (failed === 0 ? "ALL TESTS PASSED (" + files.length + " files)" : "TESTS FAILED: " + failed + " of " + files.length));
process.exit(failed === 0 ? 0 : 1);
