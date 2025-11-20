import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import slugify from "slugify";

const BLOG_MD_DIR = "./blog/content";
const BLOG_IMG_DIR = "./blog/img";
const POSTS_JSON = "./blog/posts.json";

// Ensure folders exist
if (!fs.existsSync(BLOG_MD_DIR)) fs.mkdirSync(BLOG_MD_DIR, { recursive: true });
if (!fs.existsSync(BLOG_IMG_DIR)) fs.mkdirSync(BLOG_IMG_DIR, { recursive: true });

// Input
const filePath = process.argv[2];
if (!filePath) {
  console.error("❌ Usage: node convert-docx.js <file.docx>");
  process.exit(1);
}
if (!fs.existsSync(filePath)) {
  console.error("❌ File not found:", filePath);
  process.exit(1);
}

// Globals
let imgCounter = 0;
let slug = "";

// -------------------- MAMMOTH OPTIONS -------------------------

const mammothOptions = {
  convertImage: mammoth.images.imgElement(image => {
    const ext = image.contentType.split("/")[1];
    imgCounter++;
    const imgName = `${slug}-img${imgCounter}.${ext}`;
    const imgPath = path.join(BLOG_IMG_DIR, imgName);

    fs.writeFileSync(imgPath, image.read());
    return { src: `/blog/img/${imgName}` };
  }),

  styleMap: [
    "u => u",
    "color => span"
  ]
};

// -------------------- CLEANERS -------------------------

function cleanGoogleDocsArtifacts(md) {
  md = md
    .replace(/<a[^>]*id="[^"]*"[^>]*><\/a>/gi, "")
    .replace(/<a[^>]*name="[^"]*"[^>]*><\/a>/gi, "")
    .replace(/<a[^>]*id="[^"]*"[^>]*>(.*?)<\/a>/gi, "$1")
    .replace(/<a[^>]*name="[^"]*"[^>]*>(.*?)<\/a>/gi, "$1")
    .replace(/<p[^>]*>/gi, "<p>")
    .replace(/<span[^>]*>/gi, "<span>")
    .trim();

  // Preserve bold
  md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b>(.*?)<\/b>/gi, "**$1**");

  // Preserve italics
  md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i>(.*?)<\/i>/gi, "*$1*");

  // Preserve inline color
  md = md.replace(
    /<span[^>]*color:\s*([^;"']+)[;"']?[^>]*>(.*?)<\/span>/gi,
    `<span style="color:$1">$2</span>`
  );

  return md;
}

function cleanMarkdownEscapes(md) {
  return md
    .replace(/\\-/g, "-")
    .replace(/\\\./g, ".")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\+/g, "+")
    .replace(/\\%/g, "%")
    .trim();
}

// Slug cleaner (removes ™ / ® only from slug)
function stripTrademarksForSlug(str) {
  return str.replace(/™|®|℠|\(tm\)|tm/gi, "").trim();
}

// Extracts the first non-empty line as title
function extractTitle(md) {
  const first = md.split("\n").find(l => l.trim() !== "");
  return first?.replace(/[#*_]/g, "").trim() || "untitled";
}

// Removes ALL markdown formatting from excerpt ONLY
function stripMarkdown(md) {
  return md
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")

    // Italic
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")

    // Strikethrough
    .replace(/~~(.*?)~~/g, "$1")

    // Code
    .replace(/`(.*?)`/g, "$1")

    // Headings
    .replace(/^#+\s+(.*)/gm, "$1")

    // Blockquotes
    .replace(/^>\s+/gm, "")

    // Images
    .replace(/!\[(.*?)\]\(.*?\)/g, "")

    // Links
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")

    // Lists
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")

    // Remove HTML
    .replace(/<\/?[^>]+(>|$)/g, "")

    // Collapse whitespace
    .replace(/\s+/g, " ")

    .trim();
}

// -------------------- MAIN -------------------------

(async () => {
  console.log("⚙️ Converting DOCX → Markdown…");

  // 1. Convert DOCX → Markdown
  const { value: mdRaw } = await mammoth.convertToMarkdown(
    { path: filePath },
    mammothOptions
  );

  // 2. Clean HTML → proper markdown
  const mdStep1 = cleanGoogleDocsArtifacts(mdRaw);
  const mdClean = cleanMarkdownEscapes(mdStep1);

  // 3. Extract full title (keeps ™ / ®)
  const title = extractTitle(mdClean);

  // 4. Slug (no trademarks)
  const slugTitle = stripTrademarksForSlug(title);
  slug = slugify(slugTitle, { lower: true, strict: true });

  // 5. Remove title line from content
  const mdBody = mdClean.split("\n").slice(1).join("\n").trim();

  // 6. Write Markdown file
  const finalMD = `${mdBody}\n`;
  const mdPath = path.join(BLOG_MD_DIR, `${slug}.md`);
  fs.writeFileSync(mdPath, finalMD);

  console.log(`📄 Markdown saved → ${mdPath}`);

  // 7. Add to posts.json
  const posts = JSON.parse(fs.readFileSync(POSTS_JSON, "utf-8"));
  const cleanExcerpt = stripMarkdown(mdBody).slice(0, 180) + "...";

  const newPost = {
    id: slug,
    title: title, // FULL title with ™, ® kept
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }),
    excerpt: cleanExcerpt,
    image: imgCounter > 0 ? `/blog/img/${slug}-img1.png` : "",
    contentFile: `/blog/content/${slug}.md`
  };

  posts.push(newPost);
  fs.writeFileSync(POSTS_JSON, JSON.stringify(posts, null, 2));

  console.log(`🧾 Updated posts.json with new post → ${slug}`);
  console.log(`🖼 Extracted images: ${imgCounter}`);
  console.log(`✅ Conversion complete! Run:`);
  console.log(`node build.js --post=${slug}`);
})();
