import fs from "fs";
import path from "path";
import { marked } from "marked";

const CASES_JSON = "./case/cases.json";
const TEMPLATE_PATH = "./case/case-template.html";
const OUTPUT_DIR = "./case";

async function build() {
  const raw = fs.readFileSync(CASES_JSON, "utf8");
  const data = JSON.parse(raw);

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  for (const c of data.cases) {
    // Normalize fields from your schema → expected schema
    const slug = c.id; 
    const markdownPath = "." + c.contentFile; 
    const heroImage = c.image; 

    const md = fs.readFileSync(markdownPath, "utf8");
    const body_html = marked(md);

    let html = template
      .replace(/{{title}}/g, c.title)
      .replace(/{{excerpt}}/g, c.excerpt)
      .replace(/{{hero_image}}/g, heroImage)
      .replace(/{{body_html}}/g, body_html);

    const outDir = path.join(OUTPUT_DIR, slug);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(path.join(outDir, "index.html"), html);

    console.log(`Built: /case/${slug}/index.html`);
  }

  console.log("🎉 All case pages generated!");
}

build();
