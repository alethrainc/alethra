document.addEventListener("DOMContentLoaded", async () => {

    const grid = document.getElementById("case-studies-grid");
    const filterBtns = document.querySelectorAll(".filter-btn");
    let allCases = [];

    // ---------------------------------------------------------------
    // FORMATTER: ONLY BRAND NAMES RED, EVERYTHING ELSE BLACK
    // ---------------------------------------------------------------
    function formatProductName(text) {
        if (!text) return "";

        const brands = [
            "ALETHRA",
            "ALETHRA ENV",
            "ALETHRA FLOW",
            "ALETHRA NODE",
            "ALETHRA SCAN",
            "ALETHRA CLOUD",
            "ALETHRA AI",
            "ALETHRA MOBIL",
            "ALETHRA SENSE"
        ];

        // Sort by longest match first
        brands.sort((a, b) => b.length - a.length);

        let formatted = text;

        brands.forEach(brand => {
            const regex = new RegExp(brand, "gi");
            formatted = formatted.replace(regex, match =>
                `<span class="text-klyr-red font-bold">${match}</span>`
            );
        });

        // ™ and ® always black
        formatted = formatted
            .replace(/™/g, '<span class="text-black">™</span>')
            .replace(/®/g, '<span class="text-black">®</span>');

        return formatted;
    }

    // ---------------------------------------------------------------
    // LOAD CASES JSON
    // ---------------------------------------------------------------
    async function loadCases() {
        try {
            const res = await fetch("/case/cases.json");
            const data = await res.json();
            allCases = data.cases;
            renderCases(allCases);
        } catch (err) {
            console.error("Error loading case JSON:", err);
        }
    }

    // ---------------------------------------------------------------
    // RENDER CASES
    // ---------------------------------------------------------------
    function renderCases(cases) {
        grid.innerHTML = "";

        cases.forEach((caseItem, index) => {
            const category = (caseItem.category || "default").toLowerCase();

            const wrapper = document.createElement("a");
            wrapper.href = caseItem.url;
            wrapper.className = "block case-study-link";
            wrapper.setAttribute("data-category", category);

            wrapper.innerHTML = `
                <div class="case-study-item">

                    <h3 class="font-bold text-black text-lg mb-2">
                        ${index + 1}. ${caseItem.title}
                    </h3>

                    <div class="text-black space-y-1 text-sm md:text-base leading-relaxed">

                        <p>
                            <strong class="text-black">Problem:</strong>
                            ${caseItem.problem ?? ""}
                        </p>

                        <p>
                            <strong class="text-black">Breakdown:</strong>
                            ${caseItem.breakdown ?? ""}
                        </p>

                        <p>
                            <strong class="text-black">Clarity Solution:</strong>
                            ${formatProductName(caseItem.solution ?? "")}
                        </p>

                        <p>
                            <strong class="text-black">Outcome:</strong>
                            ${caseItem.outcome ?? ""}
                        </p>

                    </div>
                </div>
            `;

            grid.appendChild(wrapper);
        });
    }

    // ---------------------------------------------------------------
    // FILTER LOGIC + ACTIVE STATE
    // ---------------------------------------------------------------
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {

            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter").toLowerCase();

            if (filterValue === "all") {
                renderCases(allCases);
                return;
            }

            const filtered = allCases.filter(c => {
                const cat = (c.category || "").toLowerCase();
                return cat.includes(filterValue);
            });

            renderCases(filtered);
        });
    });

    loadCases();
});
