function initNavLogic() {

    /* ================================================================
       1. GLOBAL COUNTRY / LANGUAGE DATA
    ================================================================= */
    const countries = [
        { name: "Global", sub: "🌎", isGlobal: true, slug: 'global', langCode: 'en' },
        { name: "Argentina", sub: "", slug: 'ar', langCode: 'es' },
        { name: "Australia & New Zealand", sub: "", slug: 'au', langCode: 'en' },
        { name: "Belgium", sub: "", slug: 'be', langCode: 'fr' },
        { name: "Brazil", sub: "Brasil", slug: 'br', langCode: 'pt' },
        { name: "Canada", sub: "(English)", slug: 'ca', langCode: 'en' },
        { name: "Canada", sub: "Le Canada (Français)", slug: 'qc', langCode: 'fr' },
        { name: "Central America & Caribbean", sub: "América Central y el Caribe", slug: 'cb', langCode: 'es' },
        { name: "Chile", sub: "", slug: 'cl', langCode: 'es' },
        { name: "China", sub: "中国", slug: 'cn', langCode: 'zh-CN' },
        { name: "Colombia", sub: "", slug: 'co', langCode: 'es' },
        { name: "Croatia", sub: "", slug: 'hr', langCode: 'hr' },
        { name: "Czech Republic", sub: "", slug: 'cz', langCode: 'cs' },
        { name: "Ecuador", sub: "", slug: 'ec', langCode: 'es' },
        { name: "Finland", sub: "", slug: 'fi', langCode: 'fi' },
        { name: "France", sub: "", slug: 'fr', langCode: 'fr' },
        { name: "Germany, Austria, Switzerland", sub: "Deutschland, Österreich, Schweiz", slug: 'de', langCode: 'de' },
        { name: "Greece", sub: "", slug: 'gr', langCode: 'el' },
        { name: "Hungary", sub: "", slug: 'hu', langCode: 'hu' },
        { name: "India", sub: "", slug: 'in', langCode: 'en' },
        { name: "Indonesia", sub: "", slug: 'id', langCode: 'id' },
        { name: "Ireland", sub: "", slug: 'ie', langCode: 'en' },
        { name: "Italy", sub: "Italia", slug: 'it', langCode: 'it' },
        { name: "Japan", sub: "日本", slug: 'jp', langCode: 'ja' },
        { name: "Latvia", sub: "", slug: 'lv', langCode: 'lv' },
        { name: "Maghreb", sub: "Le Maghreb", slug: 'ma', langCode: 'fr' },
        { name: "Malaysia", sub: "", slug: 'my', langCode: 'ms' },
        { name: "Mexico", sub: "México", slug: 'mx', langCode: 'es' },
        { name: "Netherlands", sub: "", slug: 'nl', langCode: 'nl' },
        { name: "Norway", sub: "", slug: 'no', langCode: 'no' },
        { name: "Pakistan", sub: "", slug: 'pk', langCode: 'ur' },
        { name: "Paraguay", sub: "", slug: 'py', langCode: 'es' },
        { name: "Peru", sub: "Perú", slug: 'pe', langCode: 'es' },
        { name: "Philippines", sub: "", slug: 'ph', langCode: 'en' },
        { name: "Poland", sub: "", slug: 'pl', langCode: 'pl' },
        { name: "Portugal", sub: "", slug: 'pt', langCode: 'pt' },
        { name: "Romania", sub: "", slug: 'ro', langCode: 'ro' },
        { name: "Saudi Arabia", sub: "", slug: 'sa', langCode: 'ar' },
        { name: "Serbia", sub: "", slug: 'rs', langCode: 'sr' },
        { name: "Singapore", sub: "", slug: 'sg', langCode: 'en' },
        { name: "Slovakia", sub: "", slug: 'sk', langCode: 'sk' },
        { name: "South Africa", sub: "", slug: 'za', langCode: 'en' },
        { name: "South Korea", sub: "", slug: 'kr', langCode: 'ko' },
        { name: "Spain", sub: "España", slug: 'es', langCode: 'es' },
        { name: "Sweden", sub: "Sverige", slug: 'sv', langCode: 'sv' },
        { name: "Switzerland", sub: "Suisse (Français)", slug: 'ch', langCode: 'fr' },
        { name: "Taiwan", sub: "", slug: 'tw', langCode: 'zh-TW' },
        { name: "Thailand", sub: "", slug: 'th', langCode: 'th' },
        { name: "Turkey", sub: "Türkiye", slug: 'tr', langCode: 'tr' },
        { name: "Ukraine", sub: "", slug: 'ua', langCode: 'uk' },
        { name: "United Kingdom", sub: "", slug: 'uk', langCode: 'en' },
        { name: "United States of America", sub: "", slug: 'us', langCode: 'en' },
        { name: "Venezuela", sub: "", slug: 've', langCode: 'es' },
        { name: "Vietnam", sub: "", slug: 'vn', langCode: 'vi' },
    ];

    const VALID_SLUGS = countries.map(c => c.slug).filter(s => s !== 'global');
    const $ = id => document.getElementById(id);


    /* ================================================================
       2. CORE SELECTORS
    ================================================================= */
    const mobileMenuBtn = $("mobile-menu-btn");
    const closeMobileMenuBtn = $("close-mobile-menu-btn");
    const mobileMenuOverlay = $("mobile-menu-overlay");

    /* ===== AUTO-DETECTED DROPDOWNS (REPLACES HARD-CODED LIST) ===== */
    const dropdowns = {};

    document.querySelectorAll("[data-dropdown]").forEach(section => {
        const name = section.dataset.dropdown;

        dropdowns[name] = {
            toggle: document.getElementById(`mobile-${name}-toggle`),
            dropdown: document.getElementById(`mobile-${name}-dropdown`),
            icon: document.getElementById(`mobile-${name}-icon`)
        };
    });

    /* Mobile globe icon */
    const mobileGlobeBtn = $("mobile-globe-btn");
    const mobileGlobeDropdown = $("mobile-globe-dropdown");

    /* Desktop globe */
    const desktopGlobeBtn = $("desktop-globe-btn");
    const desktopGlobeDropdown = $("desktop-globe-dropdown");


    /* ================================================================
       3. MESSAGE BOX
    ================================================================= */
    const messageBoxContent = $("message-box-content");

    function alertMessage(msg, isError = false) {
        if (!messageBoxContent) return;
        messageBoxContent.textContent = msg;

        messageBoxContent.classList.remove("hidden");
        setTimeout(() => messageBoxContent.classList.add("hidden"), 3000);
    }


    /* ================================================================
       4. GOOGLE TRANSLATE INTEGRATION
    ================================================================= */
    function translatePage(langCode) {
        const translateSelect = document.querySelector("#google_translate_element select");
        if (translateSelect) {
            translateSelect.value = langCode;
            translateSelect.dispatchEvent(new Event("change"));
        } else {
            setTimeout(() => translatePage(langCode), 100);
        }
    }


    /* ================================================================
       5. COUNTRY / REGION PATH LOGIC
    ================================================================= */
    function setCountryPath(slug, langCode) {
        translatePage(langCode);
        alertMessage(`Region set to ${slug.toUpperCase()}`);
        closeOutModal();
    }

    function checkAndApplyTranslationOnLoad() {
        const path = window.location.pathname.split("/").filter(Boolean);
        const slug = path[0];

        if (VALID_SLUGS.includes(slug)) {
            const c = countries.find(c => c.slug === slug);
            if (c && c.langCode !== "en") translatePage(c.langCode);
        }
    }
    checkAndApplyTranslationOnLoad();


    /* ================================================================
       6. COUNTRY MODAL
    ================================================================= */
    const countryModal = $("country-modal");
    const closeModalBtn = $("close-modal-btn");
    const countryListContainer = $("country-list-container");
    const modalContent = $("modal-content");

    window.openModal = function () {
        countryModal.classList.remove("hidden");
        countryModal.offsetHeight;
        countryModal.classList.add("opacity-100");
        countryModal.classList.remove("opacity-0");
        document.body.classList.add("overflow-hidden");
    };

    function closeOutModal() {
        countryModal.classList.add("opacity-0");
        countryModal.classList.remove("opacity-100");
        document.body.classList.remove("overflow-hidden");
        setTimeout(() => countryModal.classList.add("hidden"), 300);
    }

    closeModalBtn?.addEventListener("click", closeOutModal);
    countryModal?.addEventListener("click", e => {
        if (e.target === countryModal) closeOutModal();
    });

    /* Render modal countries */
    countries.forEach(country => {
        const a = document.createElement("a");
        a.href = "#";
        a.className = "block py-1 text-gray-800 text-sm hover:text-red-600";
        a.innerHTML = country.sub
            ? `${country.name} <span class="text-gray-500">${country.sub}</span>`
            : country.name;
        a.onclick = e => {
            e.preventDefault();
            setCountryPath(country.slug, country.langCode);
        };
        countryListContainer.appendChild(a);
    });


    /* ================================================================
       7. MOBILE MENU OPEN/CLOSE
    ================================================================= */
    window.openMobileMenu = function () {
        mobileMenuOverlay.classList.remove("hidden");
        mobileMenuOverlay.offsetHeight;
        mobileMenuOverlay.classList.remove("opacity-0", "translate-x-full");
        mobileMenuOverlay.classList.add("opacity-100", "translate-x-0");
        document.body.classList.add("overflow-hidden");
    };

    window.closeMobileMenu = function () {
        mobileMenuOverlay.classList.add("opacity-0", "translate-x-full");
        mobileMenuOverlay.classList.remove("opacity-100", "translate-x-0");
        document.body.classList.remove("overflow-hidden");
        setTimeout(() => mobileMenuOverlay.classList.add("hidden"), 300);

        Object.values(dropdowns).forEach(({ toggle, dropdown, icon }) => {
            closeDropdown(toggle, dropdown, icon);
        });
    };

    mobileMenuBtn?.addEventListener("click", window.openMobileMenu);
    closeMobileMenuBtn?.addEventListener("click", window.closeMobileMenu);


    /* ================================================================
       8. AUTO-DETECT DROPDOWN ACCORDION SYSTEM
    ================================================================= */
    function toggleDropdown(toggleBtn, dropdownEl, iconEl) {
        const isOpen = dropdownEl.classList.contains("open");

        if (isOpen) {
            dropdownEl.classList.remove("open");
            dropdownEl.style.maxHeight = "0px";
            iconEl?.classList.remove("rotate-180");
            toggleBtn?.classList.remove("bg-gray-100");
            return;
        }

        Object.values(dropdowns).forEach(({ toggle, dropdown, icon }) => {
            if (dropdown !== dropdownEl) {
                dropdown.classList.remove("open");
                dropdown.style.maxHeight = "0px";
                icon?.classList.remove("rotate-180");
                toggle?.classList.remove("bg-gray-100");
            }
        });

        dropdownEl.classList.add("open");
        dropdownEl.style.maxHeight = dropdownEl.scrollHeight + "1000px";
        iconEl?.classList.add("rotate-180");
        toggleBtn?.classList.add("bg-gray-100");
    }

    function closeDropdown(toggleBtn, dropdownEl, iconEl) {
        dropdownEl.classList.remove("open");
        dropdownEl.style.maxHeight = "0px";
        iconEl?.classList.remove("rotate-180");
        toggleBtn?.classList.remove("bg-gray-100");
    }

    /* Attach listeners to ALL auto-detected dropdowns */
    Object.values(dropdowns).forEach(({ toggle, dropdown, icon }) => {
        toggle?.addEventListener("click", () =>
            toggleDropdown(toggle, dropdown, icon)
        );
    });


    /* ================================================================
       9. NESTED ACCORDION SYSTEM
    ================================================================= */
    window.toggleNested = function (contentId, iconId) {
        const content = $(contentId);
        const icon = $(iconId);

        if (!content.classList.contains("open")) {
            content.classList.add("open");
            content.style.maxHeight = content.scrollHeight + "px";
            icon?.classList.add("rotate-45");
        } else {
            content.classList.remove("open");
            content.style.maxHeight = "0px";
            icon?.classList.remove("rotate-45");
        }
    };


    /* ================================================================
       10. MOBILE GLOBE ICON
    ================================================================= */
    mobileGlobeBtn?.addEventListener("click", () => {
        mobileGlobeDropdown.classList.toggle("hidden");
    });


    /* ================================================================
       11. DESKTOP GLOBE
    ================================================================= */
    desktopGlobeBtn?.addEventListener("click", () => {
        desktopGlobeDropdown.classList.toggle("hidden");
    });


    /* ================================================================
       12. CLOSE GLOBE DROPDOWNS ON OUTSIDE CLICK
    ================================================================= */
    document.addEventListener("click", e => {
        const clickedInsideMobile = mobileGlobeBtn?.contains(e.target) || mobileGlobeDropdown?.contains(e.target);
        const clickedInsideDesktop = desktopGlobeBtn?.contains(e.target) || desktopGlobeDropdown?.contains(e.target);

        if (!clickedInsideMobile) mobileGlobeDropdown?.classList.add("hidden");
        if (!clickedInsideDesktop) desktopGlobeDropdown?.classList.add("hidden");
    });

} // END OF initNavLogic()
