(function() {
    // ==========================================
    // 1. CONFIGURATION
    // ==========================================
    const targetContainerId = 'content-box2'; 
    
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

                .loader-content {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: opacity 0.1s ease-out; 
                }

                /* --- THE SLOW COMET --- */
                .comet-spinner {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    animation: spin 2s linear infinite; 
                    background: conic-gradient(from 0deg, rgba(231, 47, 60, 0) 0%, rgba(231, 47, 60, 0.1) 50%, rgba(231, 47, 60, 1) 100%);
                    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1px), black calc(100% - 1px));
                    mask: radial-gradient(farthest-side, transparent calc(100% - 1px), black calc(100% - 1px));
                }

                .comet-spinner::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px; 
                    height: 4px;
                    border-radius: 50%;
                    background: #E72F3C;
                    box-shadow: 0 0 6px rgba(231, 47, 60, 0.6);
                }

                .inner-text {
                    position: absolute;
                    font-family: 'Inter', sans-serif;
                    font-size: 10px; 
                    font-weight: 600;
                    color: #1F2937;
                    letter-spacing: 0.1em;
                    z-index: 2;
                }

                sup {
                    font-size: 6px;
                    vertical-align: top;
                    position: relative;
                    top: -2px;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

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
                    <div class="comet-spinner"></div>
                    <div class="inner-text">ALETHA<sup>TM</sup></div>
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
                    // IF FALSE, WE DO NOT HIDE THE BUTTON
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