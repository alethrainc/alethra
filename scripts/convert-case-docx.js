import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import slugify from "slugify";

// -------------------------------------------------------
// RESOLVED PATHS
// -------------------------------------------------------
const ROOT = process.cwd();
const CASE_MD_DIR = path.join(ROOT, "case/content");
const CASE_JSON = path.join(ROOT, "case/cases.json");
const CASE_IMG_PREFIX = "/img/case-";
const DOCS_DIR = path.join(ROOT, "docs/cases");

// Ensure folders exist
if (!fs.existsSync(CASE_MD_DIR)) fs.mkdirSync(CASE_MD_DIR, { recursive: true });

// -------------------------------------------------------
// INPUT
// -------------------------------------------------------
const inputArg = process.argv[2];

if (!inputArg) {
  console.error("❌ Usage: node scripts/convert-case-docx.js <file.docx | all>");
  process.exit(1);
}

let filesToProcess = [];

if (inputArg.toLowerCase() === "all") {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error("❌ Folder not found:", DOCS_DIR);
    process.exit(1);
  }

  filesToProcess = fs
    .readdirSync(DOCS_DIR)
    .filter(f => f.toLowerCase().endsWith(".docx"))
    .map(f => path.join(DOCS_DIR, f));

  if (filesToProcess.length === 0) {
    console.error("❌ No .docx files found in:", DOCS_DIR);
    process.exit(1);
  }

  console.log(`📂 Found ${filesToProcess.length} DOCX files`);
} else {
  if (!fs.existsSync(inputArg)) {
    console.error("❌ File not found:", inputArg);
    process.exit(1);
  }
  filesToProcess = [inputArg];
}

// -------------------------------------------------------
// MAMMOTH OPTIONS
// -------------------------------------------------------
const mammothOptions = {
  convertImage: mammoth.images.imgElement(() => ({ src: "" })),
  styleMap: ["u => u", "color => span"]
};

// -------------------------------------------------------
// HELPERS
// -------------------------------------------------------
function cleanDocs(md) {
  return md
    .replace(/<a[^>]*id="[^"]*"[^>]*><\/a>/gi, "")
    .replace(/<a[^>]*name="[^"]*"[^>]*><\/a>/gi, "")
    .replace(/<p[^>]*>/gi, "<p>")
    .replace(/<span[^>]*>/gi, "<span>")
    .trim();
}

function cleanEscapes(md) {
  return md
    .replace(/\\-/g, "-")
    .replace(/\\\./g, ".")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\+/g, "+")
    .replace(/\\%/g, "%")
    .trim();
}

function stripTM(str) {
  return str.replace(/™|®|℠|\(tm\)|tm/gi, "").trim();
}

function stripMarkdown(md) {
  return md
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^#+\s+(.*)/gm, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/!\[(.*?)\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanForJson(str) {
  if (!str) return "";
  return stripMarkdown(str)
    .replace(/<[^>]*>/g, "")
    .replace(/\r?\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// -------------------------------------------------------
// SMART EXCERPT (25–40 WORDS)
// -------------------------------------------------------
function createExcerpt(mdBody) {
  const clean = stripMarkdown(mdBody)
    .replace(/\r?\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const sentences = clean.split(".").map(s => s.trim()).filter(Boolean);

  let excerpt = "";
  let wordCount = 0;

  for (const sentence of sentences) {
    const words = sentence.split(" ");
    if (wordCount + words.length > 40) break;

    excerpt += sentence + ". ";
    wordCount += words.length;

    if (wordCount >= 25) break;
  }

  return excerpt.trim();
}

// -------------------------------------------------------
// SMART CTA (3–5 words)
// -------------------------------------------------------
function generateSmartCTA(title) {
  const base = cleanForJson(title).toLowerCase();

  let contextWord = "case";
  if (base.includes("hospital") || base.includes("patient")) contextWord = "results";
  else if (base.includes("manufactur") || base.includes("factory")) contextWord = "workflow";
  else if (base.includes("pharma")) contextWord = "compliance";
  else if (base.includes("food")) contextWord = "safety";
  else if (base.includes("beverage") || base.includes("distribution")) contextWord = "story";
  else if (base.includes("ai") || base.includes("automation")) contextWord = "solution";

  const verbs = ["View", "Read"];
  const endings = [
    contextWord,
    `the ${contextWord}`,
    `full ${contextWord}`,
    `${contextWord} details`
  ];

  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  const end = endings[Math.floor(Math.random() * endings.length)];

  return `${verb} ${end}`.trim().split(" ").slice(0, 4).join(" ");
}

// -------------------------------------------------------
// MAIN LOOP — PROCESS ALL FILES
// -------------------------------------------------------
(async () => {
  for (const filePath of filesToProcess) {
    console.log("--------------------------------------------------");
    console.log(`⚙️ Processing → ${filePath}`);

    const { value: mdRaw } = await mammoth.convertToMarkdown(
      { path: filePath },
      mammothOptions
    );

    const md1 = cleanDocs(mdRaw);
    const md = cleanEscapes(md1);

    let lines = md.split("\n").map(l => l.trim()).filter(Boolean);

    if (lines.length < 2) {
      console.error("❌ Invalid DOCX format (needs 'CASE STUDIES:' and a title):", filePath);
      continue;
    }

    const title = lines[1];
    const titleCleanNoTM = stripTM(title);
    const slug = slugify(titleCleanNoTM, { lower: true, strict: true });

    const mdBody = lines.slice(2).join("\n").trim();

    // Write MD
    const mdPath = path.join(CASE_MD_DIR, `${slug}.md`);
    fs.writeFileSync(mdPath, mdBody + "\n");
    console.log(`📄 Markdown saved → ${mdPath}`);

    // Update JSON
    const casesData = JSON.parse(fs.readFileSync(CASE_JSON, "utf-8"));

    const excerpt = createExcerpt(mdBody);
    const ctaText = generateSmartCTA(titleCleanNoTM);

    const newCase = {
      id: slug,
      title: cleanForJson(titleCleanNoTM),
      excerpt: cleanForJson(excerpt),
      ctaText,
      url: `/case/${slug}/`,
      image: `${CASE_IMG_PREFIX}${slug}.webp`,
      contentFile: `/case/content/${slug}.md`
    };

    const existingIndex = casesData.cases.findIndex(c => c.id === slug);
    if (existingIndex >= 0) casesData.cases[existingIndex] = newCase;
    else casesData.cases.push(newCase);

    fs.writeFileSync(CASE_JSON, JSON.stringify(casesData, null, 2));

    console.log(`🧾 cases.json updated → ${slug}`);
  }

  console.log("🎉 All DOCX conversions completed!");
})();
