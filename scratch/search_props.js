const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith(".jsx") || file.endsWith(".js")) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk("./src");
files.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("alignItems") || content.includes("primaryTypographyProps")) {
    console.log("MATCH IN FILE:", file);
    const lines = content.split("\n");
    lines.forEach((line, idx) => {
      if (line.includes("alignItems") || line.includes("primaryTypographyProps")) {
        console.log(`  L${idx + 1}: ${line.trim()}`);
      }
    });
  }
});
