document.addEventListener("DOMContentLoaded", async () => {
    const CASES_JSON_PATH = "/case/cases.json";
    const MAX_RELATED_CASES = 2;

    const titleEl = document.getElementById("case-title");
    const contentEl = document.getElementById("case-content");
    const imageEl = document.getElementById("case-image");
    const relatedContainer = document.getElementById("related-cases-container");
    const pageContainer = document.getElementById("case-container");

    // ------------------------------------------------------------
    //  PRODUCT-SAFE HIGHLIGHTER (WORKS INSIDE ALL HTML)
    // ------------------------------------------------------------
    function highlightHTML(html) {
        if (!html) return html;

        // 1 — ALETHRA™ + full product name
        html = html.replace(
            /ALETHRA™\s+(FLOW|SENSE|AI)/g,
            (m, product) =>
                `<span class="text-klyr-red">ALETHRA</span><span>™</span> <span class="text-klyr-red">${product}</span>`
        );

        // 2 — ALETHRA™ stand-alone
        html = html.replace(
            /ALETHRA™/g,
            `<span class="text-klyr-red">ALETHRA</span><span>™</span>`
        );

        // 3 — ALETHRA (not followed by TM)
        html = html.replace(
            /ALETHRA(?!™)/g,
            `<span class="text-klyr-red">ALETHRA</span>`
        );

        return html;
    }

    // ==text== → red (no bold forcing) then highlight products
    function parseRed(text) {
        if (!text) return text;
        const withRed = text.replace(/==(.+?)==/g, (_, p1) =>
            `<span class="text-klyr-red">${p1}</span>`
        );
        return highlightHTML(withRed);
    }

    // ------------------------------------------------------------
    //  FORMATTER: underlines <a>, adds target=_blank, and bullet circles for <li>
    // ------------------------------------------------------------
    function applyFormatting(html) {
        if (!html) return html;

        // <a> underline + new tab
        html = html.replace(
            /<a\b([^>]*)>/g,
            (full, attrs) => `<a${attrs} class="underline" target="_blank" rel="noopener noreferrer">`
        );

        // <li> → bullet circle
        html = html.replace(
            /<li>/g,
            `<li class="list-disc ml-6">`
        );

        return html;
    }

    // ------------------------------------------------------------

    const createRelatedCaseCard = caseItem => `
        <div class="flex flex-col bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
            <a href="${caseItem.url}" class="block mb-4 group">
                <div class="aspect-[16/9] w-full bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300 group-hover:opacity-90 transition-opacity">
                    ${caseItem.image
                        ? `<img src="${caseItem.image}" alt="${caseItem.title}" class="w-full h-full object-cover rounded-lg border border-gray-300">`
                        : `<span class="text-gray-500 font-medium">Related Image (16:9)</span>`}
                </div>
            </a>
            <h3 class="text-xl font-bold text-klyr-dark mb-3">
                <a href="${caseItem.url}" class="hover:text-klyr-red transition-colors">
                    ${highlightHTML(caseItem.title)}
                </a>
            </h3>
            <p class="text-gray-600 text-base mb-4 description-alignment-fix">
                ${highlightHTML(caseItem.excerpt || "")}
            </p>
            <div class="mt-auto">
                <a href="${caseItem.url}" class="font-bold text-klyr-red hover:underline">
                    ${caseItem.ctaText || "View Details"} &raquo;
                </a>
            </div>
        </div>
    `;

    try {
        // --- 1. Load JSON ---
        const res = await fetch(CASES_JSON_PATH);
        if (!res.ok) throw new Error("Failed to load cases.json");

        const raw = await res.json();
        const cases = Array.isArray(raw) ? raw : raw.cases;

        if (!Array.isArray(cases)) {
            throw new Error("cases.json must be an array");
        }

        // --- 2. Get case ID from URL ---
        let path = window.location.pathname.replace(/\/index\.html$/, "");
        let segments = path.split("/").filter(Boolean);
        let pathId = segments[1]; // /case/{id}/

        const current = cases.find(c => c.id === pathId);
        if (!current) throw new Error("Case not found");

        // --- 3. Load Markdown file ---
        let markdown = "";
        if (current.contentFile) {
            const mdRes = await fetch(current.contentFile);
            if (mdRes.ok) markdown = await mdRes.text();
        }

        if (!markdown.trim()) {
            contentEl.innerHTML = `<p class='text-red-500'>Case content is missing.</p>`;
        } else {
            let html = marked.parse(markdown);
            html = highlightHTML(html);
            html = applyFormatting(html);
            contentEl.innerHTML = html;
        }

        // --- 4. Title & image ---
        titleEl.innerHTML = highlightHTML(current.title);

        if (current.image) {
            imageEl.innerHTML = `
                <img src="${current.image}" alt="${current.title}"
                     class="w-full h-full object-cover rounded-lg border border-gray-300">
            `;
        }

        document.title = `${current.title} – Case Study`;
        pageContainer.style.opacity = 1;

        // --- 5. Related cases ---
        const otherCases = cases.filter(c => c.id !== current.id);
        const related = otherCases.slice(0, MAX_RELATED_CASES);

        if (related.length > 0) {
            relatedContainer.innerHTML = related.map(createRelatedCaseCard).join("");
        } else {
            relatedContainer.parentElement.style.display = "none";
        }

    } catch (err) {
        console.error("Case page error:", err);
        contentEl.innerHTML = `<p class='text-red-500'>Failed to load case study.</p>`;
        pageContainer.style.opacity = 1;
        if (relatedContainer) relatedContainer.parentElement.style.display = "none";
    }
});
