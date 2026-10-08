import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(projectRoot, "src");
const outputDir = path.join(projectRoot, "dist");

await mkdir(outputDir, { recursive: true });

await build({
  entryPoints: [path.join(sourceDir, "code.ts")],
  outfile: path.join(outputDir, "code.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
});

const uiBundle = await build({
  entryPoints: [path.join(sourceDir, "ui.ts")],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
  write: false,
});

const uiTemplate = await readFile(path.join(sourceDir, "ui.html"), "utf8");
const uiScript = uiBundle.outputFiles[0].text;
const uiHtml = uiTemplate.replace("/*__UI_SCRIPT__*/", uiScript);

await writeFile(path.join(outputDir, "ui.html"), uiHtml);

console.log("Built Puble Asset Exporter in dist/");
