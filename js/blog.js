document.addEventListener("DOMContentLoaded", async () => {
    const BLOG_JSON_PATH = "/blog/posts.json";
    const MAX_RELATED_POSTS = 2;

    const articleContainer = document.getElementById("article-container");
    const titleEl = document.getElementById("blog-title");
    const contentEl = document.getElementById("blog-content");
    const imageEl = document.getElementById("blog-image");
    const relatedContainer = document.getElementById("related-posts-container");

    // ------------------------------------------------------------
    //  PRODUCT-SAFE HIGHLIGHTER (NO FORCED BOLD)
    // ------------------------------------------------------------
    function highlightHTML(html) {
        if (!html) return html;

        // ALETHRA™ + product name
        html = html.replace(
            /ALETHRA™\s+(FLOW|SENSE|AI)/g,
            (m, product) =>
                `<span class="text-klyr-red">ALETHRA</span><span>™</span> <span class="text-klyr-red">${product}</span>`
        );

        // ALETHRA™ standalone
        html = html.replace(
            /ALETHRA™/g,
            `<span class="text-klyr-red">ALETHRA</span><span>™</span>`
        );

        // ALETHRA (not followed by TM)
        html = html.replace(
            /ALETHRA(?!™)/g,
            `<span class="text-klyr-red">ALETHRA</span>`
        );

        return html;
    }

    // ==text== → red (NO bold)
    function parseRed(text) {
        if (!text) return text;
        const withRed = text.replace(/==(.+?)==/g, (_, p1) =>
            `<span class="text-klyr-red">${p1}</span>`
        );
        return highlightHTML(withRed);
    }

    // ------------------------------------------------------------
    //  APPLY <a> formatting + bullet tightening
    // ------------------------------------------------------------
    function applyFormatting(html) {
        if (!html) return html;

        // Add underline + open in new tab
        html = html.replace(
            /<a\b([^>]*)>/g,
            (full, attrs) =>
                `<a${attrs} class="underline" target="_blank" rel="noopener noreferrer">`
        );

        // Tight bullets
        html = html.replace(
            /<li>/g,
            `<li class="list-disc ml-5">`
        );

        return html;
    }

    // ------------------------------------------------------------
    //  RELATED POST CARD
    // ------------------------------------------------------------
    const createRelatedPostCard = post => {
        const link = `/press/${post.id}/`;
        const formattedDate = new Date(post.date.replace(/-/g, "/"))
            .toLocaleDateString("en-US", { month: "long", year: "numeric" })
            .toUpperCase();

        return `
            <div class="flex flex-col bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
                <a href="${link}" class="block mb-4 group">
                    <div class="aspect-[16/9] w-full bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300 group-hover:opacity-90 transition-opacity">
                        ${post.image
                            ? `<img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover rounded-lg border border-gray-300">`
                            : `<span class="text-gray-500 font-medium">Related Image (16:9)</span>`
                        }
                    </div>
                </a>

                <p class="text-sm text-klyr-red font-semibold uppercase mb-2">${formattedDate}</p>

                <h3 class="text-xl font-bold text-klyr-dark mb-3">
                    <a href="${link}" class="hover:text-klyr-red transition-colors">
                        ${parseRed(post.title)}
                    </a>
                </h3>

                <p class="text-gray-600 text-base mb-4 description-alignment-fix">
                    ${parseRed(post.excerpt || "")}
                </p>

                <div class="mt-auto">
                    <a href="${link}" class="font-bold text-klyr-red hover:underline">Read More &raquo;</a>
                </div>
            </div>
        `;
    };

    // ------------------------------------------------------------
    //  MAIN LOAD LOGIC
    // ------------------------------------------------------------
    try {
        const res = await fetch(BLOG_JSON_PATH);
        if (!res.ok) throw new Error(`Error loading posts.json`);

        const posts = await res.json();

        // Extract post id from URL
        let pathId = window.location.pathname
            .split("/")
            .filter(Boolean)
            .pop()
            .replace(".html", "");

        let post = posts.find(p => p.id === pathId) || posts[0];
        if (!post) throw new Error("Post not found");

        // Load markdown
        let contentMd = "";
        if (post.contentFile || post.file) {
            const mdRes = await fetch(post.contentFile || post.file);
            if (mdRes.ok) contentMd = await mdRes.text();
        }

        // Inject: TITLE
        titleEl.innerHTML = parseRed(post.title);

        // Inject: CONTENT
        let html = marked.parse(parseRed(contentMd || post.excerpt || ""));
        html = highlightHTML(html);
        html = applyFormatting(html);
        contentEl.innerHTML = html;

        // Inject: IMAGE
        if (post.image) {
            imageEl.innerHTML = `
                <img src="${post.image}" 
                     alt="${post.title.replace(/==/g, "")}" 
                     class="w-full h-full object-cover rounded-lg border border-gray-300">
            `;
        }

        document.title = `${post.title.replace(/==/g, "")} - Press Center`;
        articleContainer.style.opacity = 1;

        // RELATED
        const otherPosts = posts.filter(p => p.id !== post.id);
        otherPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        const related = otherPosts.slice(0, MAX_RELATED_POSTS);

        if (related.length > 0) {
            relatedContainer.innerHTML = related.map(createRelatedPostCard).join("");
        } else {
            relatedContainer.parentElement.style.display = "none";
        }

    } catch (err) {
        console.error("Error loading blog:", err);
        contentEl.innerHTML = `<p class='text-red-500'>Failed to load blog content.</p>`;
        articleContainer.style.opacity = 1;
        relatedContainer.parentElement.style.display = "none";
    }
});
