(function() {
    // ==========================================
    // 1. CONFIGURATION
    // ==========================================
    const targetContainerId = 'content-box'; 
    
    // TRUE  = HIDE the chat button (It vanishes)
    // FALSE = SHOW the chat button (It is Active)
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

                /* Wrapper */
                .loader-content {
                    position: relative;
                    width: 90px;
                    height: 90px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: opacity 0.1s ease-out; 
                }

                /* --- THE INFINITE SPINNER --- */
                .ring-spinner {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    
                    /* Apple Physics Easing */
                    animation: appleSpin 1.6s cubic-bezier(0.65, 0, 0.35, 1) infinite; 
                    
                    /* UPDATED: Only 0.4s head start (Less than a second) */
                    animation-delay: -0.4s;
                    
                    /* LONG GRADIENT TAIL (80% Coverage) */
                    background: conic-gradient(
                        from 0deg, 
                        transparent 0%, 
                        transparent 20%, 
                        rgba(231, 47, 60, 0.1) 40%, 
                        #E72F3C 100%
                    );
                    
                    /* MASK: 1px Thin Line */
                    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1px), black calc(100% - 1px));
                    mask: radial-gradient(farthest-side, transparent calc(100% - 1px), black calc(100% - 1px));
                    
                    /* Glow */
                    filter: drop-shadow(0 0 2px rgba(231, 47, 60, 0.4));
                }

                /* --- LUXURY TEXT (Black + Black TM) --- */
                .brand-text {
                    position: absolute; 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    font-size: 10px; 
                    font-weight: 600;
                    color: #000000; 
                    letter-spacing: 0.3em; 
                    text-transform: uppercase;
                    margin-left: 0.3em; 
                    animation: pulseText 3s ease-in-out infinite;
                }

                sup {
                    font-size: 5px;
                    vertical-align: top;
                    position: relative;
                    top: -3px;
                    margin-left: 2px;
                    color: #000000; 
                    letter-spacing: 0; 
                }

                /* --- ANIMATIONS --- */
                @keyframes appleSpin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes pulseText {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }

                /* --- DISMISSAL STATES --- */
                .content-vanished .loader-content {
                    opacity: 0;
                    transform: scale(0.95); 
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
                    <div class="brand-text">ALETHA<sup>TM</sup></div>
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
                // Pass the True/False variable from outside into this script
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

                // 2. Hide Chat Button Logic (Controlled by the Switch)
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

                // 3. WATCHER & DISMISS LOGIC
                const checkInterval = setInterval(() => {
                    const allNodes = document.querySelectorAll('*');
                    allNodes.forEach(node => {
                        if (node.shadowRoot) pierceShadowAndHide(node.shadowRoot);
                    });

                    const video = findElementInShadow('video');
                    // Check if video is ready
                    if (video && video.readyState >= 1) { 
                        dismissLoader();
                    }
                }, 50); 

                function dismissLoader() {
                    const loader = document.getElementById('custom-loader');
                    if (loader && !loader.classList.contains('content-vanished')) {
                        loader.classList.add('content-vanished'); 
                        loader.classList.add('loader-hidden');    
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