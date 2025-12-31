(function() {
    // ==========================================
    // 1. CONFIGURATION
    // ==========================================
    const targetContainerId = 'content-box2'; 
    
    // TRUE  = HIDE the chat button 
    // FALSE = SHOW the chat button
    const HIDE_CHAT_BUTTON = false; 

    // ==========================================
    // 2. SANDBOX HTML DEFINITION
    // ==========================================
    const agentHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                /* --- RESET --- */
                body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; }
                
                /* --- LAYOUT --- */
                #agent-inner-container { 
                    width: 100%; 
                    height: 100%; 
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                /* --- VIDEO FIXES --- */
                video { object-position: top center !important; }

                /* --- CUSTOM LOADER CONTAINER --- */
                #custom-loader {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: #ffffff;
                    z-index: 9999;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: opacity 0.6s ease-out 0.1s, visibility 0.6s 0.1s;
                }

                /* Wrapper: Holds the text and the spinner in the same spot */
                .loader-content {
                    position: relative;
                    width: 80px; /* Slightly larger to give text breathing room */
                    height: 80px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: opacity 0.1s ease-out; 
                }

                /* --- 1. THE PHOTON (Spinning Light) --- */
                .ring-spinner {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    
                    /* Apple Physics Easing: Starts slow, fast middle, stops slow */
                    animation: appleSpin 1.6s cubic-bezier(0.65, 0, 0.35, 1) infinite; 
                    
                    /* The actual colored segment */
                    border: 1.5px solid transparent;
                    border-top-color: #E72F3C; /* Brand Red */
                    
                    /* The Glow Effect */
                    filter: drop-shadow(0 0 3px rgba(231, 47, 60, 0.6));
                }

                /* --- 2. LUXURY TEXT (Inside the Circle) --- */
                .brand-text {
                    position: absolute; /* Locks it to center */
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    font-size: 9px; /* Small, minimal */
                    font-weight: 600;
                    color: #8e8e93; /* Apple "Secondary Label" Color */
                    letter-spacing: 0.3em; /* Luxury Spacing */
                    text-transform: uppercase;
                    
                    /* Visual Centering adjustment for the letter spacing */
                    margin-left: 0.3em; 
                    
                    animation: pulseText 3s ease-in-out infinite;
                }

                /* --- ANIMATIONS --- */
                
                @keyframes appleSpin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes pulseText {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }

                /* --- DISMISSAL STATES --- */
                .content-vanished .loader-content {
                    opacity: 0;
                    transform: scale(0.95); /* Slight shrink on exit */
                }

                .loader-hidden {
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                }
            </style>
        </head>
        <body>
            
            <div id="custom-loader">
                <div class="loader-content">
                    <div class="ring-spinner"></div>
                    <div class="brand-text">ALETHA</div>
                </div>
            </div>

            <div id="agent-inner-container"></div>
            
            <script type="module"
                src="https://agent.d-id.com/v2/index.js"
                data-mode="full"
                data-client-key="Z29vZ2xlLW9hdXRoMnwxMDM3NTMwNjQ3MzA3OTA4MDA2NzQ6aFZvRkFiRzhJZTVsYUNqVEoyRWdh"
                data-agent-id="v2_agt_n4gt0-NZ"
                data-name="did-agent"
                data-monitor="true"
                data-target-id="agent-inner-container">
            <\/script>

            <script>
                const shouldHideChat = ${HIDE_CHAT_BUTTON};

                // 1. Shadow DOM Helper
                function findElementInShadow(selector) {
                    function search(root) {
                        let found = root.querySelector(selector);
                        if (found) return found;
                        const allNodes = root.querySelectorAll('*');
                        for (let node of allNodes) {
                            if (node.shadowRoot) {
                                found = search(node.shadowRoot);
                                if (found) return found;
                            }
                        }
                        return null;
                    }
                    return search(document.body);
                }

                // 2. CSS Injection for Button Hiding
                const hideStyle = document.createElement('style');
                hideStyle.textContent = '.didagent__chat__toggle { display: none !important; }';

                function pierceShadowAndHide(root) {
                    if (!shouldHideChat) return; 

                    if (!root.querySelector('style[data-hider]')) {
                        const clonedStyle = hideStyle.cloneNode(true);
                        clonedStyle.setAttribute('data-hider', 'true');
                        root.appendChild(clonedStyle);
                    }
                }

                // 3. MAIN LOOP
                const checkInterval = setInterval(() => {
                    const allNodes = document.querySelectorAll('*');
                    allNodes.forEach(node => {
                        if (node.shadowRoot) pierceShadowAndHide(node.shadowRoot);
                    });

                    const video = findElementInShadow('video');
                    if (video && video.readyState >= 1) { 
                        dismissLoader();
                    }
                }, 50); 

                function dismissLoader() {
                    const loader = document.getElementById('custom-loader');
                    if (loader && !loader.classList.contains('content-vanished')) {
                        loader.classList.add('content-vanished'); // Vanish Elements
                        loader.classList.add('loader-hidden');    // Fade Background
                    }
                }

                setTimeout(() => { dismissLoader(); }, 8000);

            <\/script>
        </body>
        </html>
    `;

    // 3. INJECTION LOGIC
    const initAgent = () => {
        const container = document.getElementById(targetContainerId);
        if (container) {
            const blob = new Blob([agentHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "none";
            iframe.allow = "microphone; camera; display-capture; autoplay"; 
            container.innerHTML = ""; 
            container.appendChild(iframe);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAgent);
    } else {
        initAgent();
    }
})();