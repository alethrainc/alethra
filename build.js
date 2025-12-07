import fs from "fs";
import path from "path";
import { marked } from "marked";

const __dirname = process.cwd();

// Paths
const postsPath = path.join(__dirname, "blog/posts.json");
const templatePath = path.join(__dirname, "press/blog-template.html");
const outputBase = path.join(__dirname, "press");

// Load posts + template
const posts = JSON.parse(fs.readFileSync(postsPath, "utf-8"));
const template = fs.readFileSync(templatePath, "utf-8");

// CLI arg
const onlyPost = process.argv.find(a => a.startsWith("--post="))
  ?.replace("--post=", "")
  ?.trim();

// ---------------------------------------------------------------------
// META + CONTENT INJECTION
// ---------------------------------------------------------------------
function ensureMetaTags(html) {
  const hasHead = /<head>[\s\S]*<\/head>/i.test(html);
  if (!hasHead) {
    throw new Error("Template missing <head> section.");
  }

  let headContent = html.match(/<head>([\s\S]*?)<\/head>/i)[1];

  const addIfMissing = (needle, tag) => {
    if (!headContent.includes(needle)) headContent += `\n${tag}`;
  };

  addIfMissing('name="description"', `<meta name="description" content="">`);
  addIfMissing('property="og:title"', `<meta property="og:title" content="">`);
  addIfMissing('property="og:description"', `<meta property="og:description" content="">`);
  addIfMissing('property="og:image"', `<meta property="og:image" content="">`);
  addIfMissing('property="og:type"', `<meta property="og:type" content="article">`);
  addIfMissing('name="twitter:card"', `<meta name="twitter:card" content="summary_large_image">`);
  addIfMissing('name="twitter:title"', `<meta name="twitter:title" content="">`);
  addIfMissing('name="twitter:description"', `<meta name="twitter:description" content="">`);
  addIfMissing('name="twitter:image"', `<meta name="twitter:image" content="">`);

  return html.replace(/<head>[\s\S]*<\/head>/i, `<head>${headContent}</head>`);
}

function injectContent(template, postHtml, post, allPosts) {
  let result = ensureMetaTags(template);

  // Title
  result = result.replace(/<title>.*<\/title>/, `<title>${post.title}</title>`);

  // Meta tags
  result = result
    .replace(/<meta name="description" content=".*">/, `<meta name="description" content="${post.excerpt}">`)
    .replace(/<meta property="og:title" content=".*">/, `<meta property="og:title" content="${post.title}">`)
    .replace(/<meta property="og:description" content=".*">/, `<meta property="og:description" content="${post.excerpt}">`)
    .replace(/<meta property="og:image" content=".*">/, `<meta property="og:image" content="${post.image}">`)
    .replace(/<meta name="twitter:title" content=".*">/, `<meta name="twitter:title" content="${post.title}">`)
    .replace(/<meta name="twitter:description" content=".*">/, `<meta name="twitter:description" content="${post.excerpt}">`)
    .replace(/<meta name="twitter:image" content=".*">/, `<meta name="twitter:image" content="${post.image}">`);

  // Blog content
  result = result.replace(
    /<main id="blog-content">[\s\S]*?<\/main>/,
    `<main id="blog-content">${postHtml}</main>`
  );

  // Related posts
  const related = allPosts
    .filter((p) => p.id !== post.id)
    .slice(0, 3)
    .map(
      (p) => `
      <div class="related-post">
        <a href="/press/${p.id}/">
          <img src="${p.image}" alt="${p.title}">
          <h3>${p.title}</h3>
          <p>${p.excerpt}</p>
        </a>
      </div>`
    )
    .join("\n");

  result = result.replace(
    /<div id="related-posts-container">[\s\S]*?<\/div>/,
    `<div id="related-posts-container">${related}</div>`
  );

  return result;
}

// ---------------------------------------------------------------------
// SMART REBUILD LOGIC — now includes template change detection
// ---------------------------------------------------------------------
function needsRebuild(post, mdPath, outputPath) {
  if (!fs.existsSync(outputPath)) return true;
  if (!fs.existsSync(mdPath)) return true;

  const mdTime = fs.statSync(mdPath).mtimeMs;
  const outTime = fs.statSync(outputPath).mtimeMs;
  const jsonTime = fs.statSync(postsPath).mtimeMs;
  const templateTime = fs.statSync(templatePath).mtimeMs;

  return (
    mdTime > outTime ||
    jsonTime > outTime ||
    templateTime > outTime
  );
}

// ---------------------------------------------------------------------
// MAIN BUILD FUNCTION
// ---------------------------------------------------------------------
async function build() {
  console.log("⚙️ Building blog...");

  const targetPosts = onlyPost
    ? posts.filter(p => p.id === onlyPost)
    : posts;

  if (onlyPost && targetPosts.length === 0) {
    console.log(`❌ No post found with id "${onlyPost}"`);
    process.exit(1);
  }

  for (const post of targetPosts) {
    const mdPath = path.join(__dirname, post.contentFile);
    const postDir = path.join(outputBase, post.id);
    const outputFile = path.join(postDir, "index.html");

    if (!needsRebuild(post, mdPath, outputFile)) {
      console.log(`⏩ Skipped (no changes): ${post.id}`);
      continue;
    }

    if (!fs.existsSync(mdPath)) {
      console.warn(`⚠️ Missing markdown: ${mdPath}`);
      continue;
    }

    const mdContent = fs.readFileSync(mdPath, "utf-8");
    const html = marked.parse(mdContent);
    const fullHtml = injectContent(template, html, post, posts);

    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(outputFile, fullHtml);

    console.log(`✅ Built /press/${post.id}/index.html`);
  }

  console.log("✨ Done!");
}

build().catch(console.error);
