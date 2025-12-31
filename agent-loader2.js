(function() {
    // 1. CONFIGURATION
    const targetContainerId = 'content-box2'; 

    // 2. SANDBOX HTML DEFINITION
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
                    /* The background fade is slightly delayed so content disappears first */
                    transition: opacity 0.6s ease-out 0.1s, visibility 0.6s 0.1s;
                }

                /* Wrapper to hold Spinner + Text together */
                .loader-content {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: opacity 0.1s ease-out; /* Super fast fade for contents */
                }

                /* --- THE SLOW COMET --- */
                .comet-spinner {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    animation: spin 2s linear infinite; /* Slower, luxury speed */
                    
                    /* Extended trace for slower speed */
                    background: conic-gradient(from 0deg, rgba(231, 47, 60, 0) 0%, rgba(231, 47, 60, 0.1) 50%, rgba(231, 47, 60, 1) 100%);
                    
                    /* 1px Thin Mask */
                    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1px), black calc(100% - 1px));
                    mask: radial-gradient(farthest-side, transparent calc(100% - 1px), black calc(100% - 1px));
                }

                /* The Leading Dot */
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

                /* --- INNER TEXT --- */
                .inner-text {
                    position: absolute;
                    font-family: 'Inter', sans-serif;
                    font-size: 10px; /* Small, expensive look */
                    font-weight: 600;
                    color: #1F2937;
                    letter-spacing: 0.1em;
                    z-index: 2;
                }

                /* Tiny TM */
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

                /* --- DISMISSAL STATES --- */
                
                /* 1. Content vanishes INSTANTLY */
                .content-vanished .loader-content {
                    opacity: 0;
                    transform: scale(0.95); /* Subtle shrink effect on exit */
                }

                /* 2. Background fades AFTER content is gone */
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

                // 2. Hide Chat Button Logic
                const hideStyle = document.createElement('style');
                hideStyle.textContent = '.didagent__chat__toggle { display: none !important; }';

                function pierceShadowAndHide(root) {
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
                    // Check if video is ready to play
                    if (video && video.readyState >= 1) { 
                        dismissLoader();
                    }
                }, 50); 

                function dismissLoader() {
                    const loader = document.getElementById('custom-loader');
                    
                    // Only run this logic if we haven't dismissed it yet
                    if (loader && !loader.classList.contains('content-vanished')) {
                        
                        // STEP 1: Cut the animation (Instant vanish of text/spinner)
                        loader.classList.add('content-vanished');
                        
                        // STEP 2: Fade the white background (Slight delay handled by CSS transition)
                        loader.classList.add('loader-hidden');
                    }
                }

                // Safety Valve (8 seconds)
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