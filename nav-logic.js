 function initNavLogic() {

        
  
            
            // --- Global Data (Countries & Languages) ---
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
            
            // Generate a list of all valid slugs for path checking
            const VALID_SLUGS = countries.map(c => c.slug).filter(s => s !== 'global');
            
            // --- Global Constants and Selectors ---
            const LOGO_TEXT = 'ALETHRA™';
            const NAV_LOGO_URL = 'https://plusbrand.com/wp-content/uploads/2025/10/Copia-de-ALETHRA_Logo-scaled.png'; 
            const CONTENT_IMG_URL = 'https://plusbrand.com/wp-content/uploads/2025/11/Aletha-1.webp'; 
            const CONTENT_BOX_CLASSES = 'content-box-border-style rounded-lg flex h-full overflow-hidden'; 

            const navLogoImg = document.getElementById('nav-logo-img');
            const contentLogoImg = document.getElementById('content-logo-img');
            const contentBox = document.getElementById('content-box');
            
            // Message box elements
            const messageBoxContent = document.getElementById('message-box-content');

            // --- Modal Elements ---
            const countryModal = document.getElementById('country-modal');
            const closeModalBtn = document.getElementById('close-modal-btn');
            const countryListContainer = document.getElementById('country-list-container');
            const modalContent = document.getElementById('modal-content');
            // const globalIconDesktop = document.getElementById('global-icon-desktop'); // Removed, handled by HTML onclick
            

            // --- Navigation Elements for Scroll to Top ---
            const navLogoLink = document.querySelector('header a[href="/"]');
            
            // --- Mobile Menu Elements ---
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const closeMobileMenuBtn = document.getElementById('close-mobile-menu-btn');
            const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

            // Mobile Dropdown Elements
            const solutionToggle = document.getElementById('mobile-solution-toggle');
            const solutionDropdown = document.getElementById('mobile-solution-dropdown');
            const solutionIcon = document.getElementById('mobile-solution-icon');
            
            const impactToggle = document.getElementById('mobile-impact-toggle');
            const impactDropdown = document.getElementById('mobile-impact-dropdown');
            const impactIcon = document.getElementById('mobile-impact-icon');
            
            const aboutToggle = document.getElementById('mobile-about-toggle');
            const aboutDropdown = document.getElementById('mobile-about-dropdown');
            const aboutIcon = document.getElementById('mobile-about-icon');


            // --- Helper Functions ---

            // Custom alert message function
            function alertMessage(message, isError = false) {
                if (messageBoxContent) {
                    messageBoxContent.textContent = message;
                    
                    // Clear previous classes
                    messageBoxContent.classList.remove('hidden', 'bg-red-100', 'border-red-400', 'bg-gray-100', 'border-gray-300', 'text-red-800', 'text-gray-700');
                    
                    if (isError) {
                         messageBoxContent.classList.add('bg-red-100', 'border-red-400', 'text-red-800');
                    } else {
                         messageBoxContent.classList.add('bg-gray-100', 'border-gray-300', 'text-gray-700');
                    }
                    
                    // Show message box
                    messageBoxContent.classList.remove('hidden');
                    
                    // Hide after delay
                    setTimeout(() => {
                        messageBoxContent.classList.add('hidden');
                    }, 3000);
                }
            }
            
            // --- Google Translate Functionality ---
            function translatePage(langCode) {
                const translateSelect = document.querySelector('#google_translate_element select');
                if (translateSelect) {
                    translateSelect.value = langCode;
                    translateSelect.dispatchEvent(new Event('change'));
                } else {
                    // Retry until the element is ready
                    setTimeout(() => { translatePage(langCode); }, 100);
                }
            }

            // --- URL Path and Translation Logic ---
            function setCountryPath(newSlug, newLangCode) {
                if (newLangCode !== 'en') {
                    translatePage(newLangCode);
                    alertMessage(`Region set to ${newSlug.toUpperCase()}. Content translated to ${newLangCode.toUpperCase()}.`);
                } else {
                    translatePage('en');
                    alertMessage(`Region set to GLOBAL. Content translated to ENGLISH.`);
                }
                closeOutModal(); // Close Country Modal
            }
            
            function checkAndApplyTranslationOnLoad() {
                const currentPath = window.location.pathname;
                const pathSegments = currentPath.split('/').filter(p => p.length > 0);
                const currentSlug = pathSegments.length > 0 && VALID_SLUGS.includes(pathSegments[0]) 
                                    ? pathSegments[0] 
                                    : null;
                                    
                if (currentSlug) {
                    const country = countries.find(c => c.slug === currentSlug);
                    if (country && country.langCode !== 'en') {
                        translatePage(country.langCode);
                    }
                }
            }


            // --- Initialization Functions ---

            // Apply Content Box Classes
            if (contentBox) {
                contentBox.className = CONTENT_BOX_CLASSES; 
            }

            // Populate the Logo in two locations
            if (navLogoImg) {
                navLogoImg.src = NAV_LOGO_URL; 
                navLogoImg.alt = LOGO_TEXT + ' Logo (Navigation)';
            }
            if (contentLogoImg) {
                contentLogoImg.src = CONTENT_IMG_URL; 
                contentLogoImg.alt = 'Kare Image Placeholder';
            }

            
            // Apply sticky translation immediately on load
            checkAndApplyTranslationOnLoad();

            
            // --- Simple Page Navigation/Scroll to Top ---
            // FIX: Removed scrollToTop function and listeners to restore native link behavior for Logo and /join links
            // This ensures the Logo always navigates to / and mobile links navigate correctly.


            // --- Country Modal Logic ---

            window.openModal = function (e) { 
                if (e) e.preventDefault(); 
                
                countryModal.classList.remove('hidden');
                countryModal.offsetHeight; 
                countryModal.classList.add('opacity-100');
                countryModal.classList.remove('opacity-0');
                modalContent.classList.remove('scale-95');
                modalContent.classList.add('scale-100');
                document.body.classList.add('overflow-hidden'); 
            }

            function closeOutModal() {
                countryModal.classList.remove('opacity-100');
                countryModal.classList.add('opacity-0');
                modalContent.classList.remove('scale-100');
                modalContent.classList.add('scale-95');

                setTimeout(() => {
                    countryModal.classList.add('hidden');
                    document.body.classList.remove('overflow-hidden'); 
                }, 300);
            }

            // Render country links for the Modal
            countries.forEach(country => {
                const link = document.createElement('a');
                link.href = "#"; 
                
                let content = country.name;
                let className = 'text-klyr-dark text-sm hover:text-klyr-red transition duration-150';
                
                if (country.isGlobal) {
                    content = `<span class="font-bold">${country.name}</span> <span class="text-sm text-gray-500">${country.sub}</span>`;
                    className = 'font-bold block text-klyr-dark hover:text-klyr-red transition duration-150';
                } else if (country.sub) {
                    content = `${country.name} <span class="text-xs text-gray-500">| ${country.sub}</span>`;
                }
                
                link.innerHTML = content;
                link.className = className;
                
                link.onclick = (e) => {
                    e.preventDefault();
                    setCountryPath(country.slug, country.langCode); 
                };

                countryListContainer.appendChild(link);
            });

            // Attach listener to Desktop Icon (now just the close button and backdrop)
            if (closeModalBtn) { closeModalBtn.addEventListener('click', closeOutModal); }
            
            // Close modal if user clicks on the backdrop
            if (countryModal) {
                countryModal.addEventListener('click', (e) => {
                    if (e.target === countryModal) {
                        closeOutModal();
                    }
                });
            }
            
            
            // --- MOBILE MENU LOGIC ---

            // FIX: Attach to window object to make globally accessible for inline 'onclick' attributes
            window.openMobileMenu = function (e) {
                if (e) e.preventDefault();
                mobileMenuOverlay.classList.remove('hidden');
                mobileMenuOverlay.offsetHeight; // Trigger reflow
                mobileMenuOverlay.classList.remove('opacity-0', 'translate-x-full'); // Start from RIGHT, hidden
                mobileMenuOverlay.classList.add('opacity-100', 'translate-x-0'); // Slide to visible
                document.body.classList.add('overflow-hidden');
            }

            // FIX: Attach to window object to make globally accessible for inline 'onclick' attributes
            window.closeMobileMenu = function (e) {
                // FIX: Removed e.preventDefault() to allow the anchor links to execute their href attribute
                // if (e) e.preventDefault(); 
                
                mobileMenuOverlay.classList.remove('opacity-100', 'translate-x-0');
                mobileMenuOverlay.classList.add('opacity-0', 'translate-x-full'); // Slide back RIGHT, hidden
                document.body.classList.remove('overflow-hidden');

                // Hide completely after transition
                setTimeout(() => {
                    mobileMenuOverlay.classList.add('hidden');
                }, 300); // Matches transition duration
                
                // Close all dropdowns when closing the main menu
                closeDropdown(solutionToggle, solutionDropdown, solutionIcon);
                closeDropdown(impactToggle, impactDropdown, impactIcon);
                closeDropdown(aboutToggle, aboutDropdown, aboutIcon);
            }

            // Helper function to toggle max-height and rotation for dropdowns
            function toggleDropdown(toggleBtnEl, dropdownEl, iconEl) {
                const isOpen = dropdownEl.classList.contains('max-h-40'); // Max height used for transition

                if (isOpen) {
                    closeDropdown(toggleBtnEl, dropdownEl, iconEl);
                } else {
                    // Close other dropdowns for accordion effect
                    if (dropdownEl !== solutionDropdown) closeDropdown(solutionToggle, solutionDropdown, solutionIcon);
                    if (dropdownEl !== impactDropdown) closeDropdown(impactToggle, impactDropdown, impactIcon);
                    if (dropdownEl !== aboutDropdown) closeDropdown(aboutToggle, aboutDropdown, aboutIcon);
                    
                    // Open current dropdown
                    dropdownEl.classList.remove('max-h-0', 'opacity-0');
                    dropdownEl.classList.add('max-h-40', 'opacity-100'); // max-h-40 is arbitrary but large enough
                    iconEl.classList.add('rotate-180');
                    toggleBtnEl.classList.add('bg-gray-100'); // <--- NEW: Add gray background for active state
                }
            }
            
            function closeDropdown(toggleBtnEl, dropdownEl, iconEl) {
                 dropdownEl.classList.remove('max-h-40', 'opacity-100');
                 dropdownEl.classList.add('max-h-0', 'opacity-0');
                 iconEl.classList.remove('rotate-180');
                 toggleBtnEl.classList.remove('bg-gray-100'); // <--- NEW: Remove gray background
            }

            // Event Listeners - now referencing the functions attached to the window object
            if (mobileMenuBtn) { mobileMenuBtn.addEventListener('click', window.openMobileMenu); }
            if (closeMobileMenuBtn) { closeMobileMenuBtn.addEventListener('click', window.closeMobileMenu); }
            
            // Dropdown Toggles (UPDATED to pass the toggle button element)
            if (solutionToggle) { solutionToggle.addEventListener('click', () => toggleDropdown(solutionToggle, solutionDropdown, solutionIcon)); }
            if (impactToggle) { impactToggle.addEventListener('click', () => toggleDropdown(impactToggle, impactDropdown, impactIcon)); } 
            if (aboutToggle) { aboutToggle.addEventListener('click', () => toggleDropdown(aboutToggle, aboutDropdown, aboutIcon)); }


   
} // ← this closes the function properly

