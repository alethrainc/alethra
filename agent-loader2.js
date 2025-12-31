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
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    transition: opacity 0.8s ease-in-out, visibility 0.8s;
                }

                /* --- LUXURY MORPHING RING --- */
                .morph-ring {
                    width: 80px; /* Slightly larger base for elegance */
                    height: 80px;
                    /* MUCH Thinner, luxury line */
                    border: 1px solid #E72F3C; 
                    /* Subtle luxury glow */
                    box-shadow: 0 0 10px rgba(231, 47, 60, 0.15);
                    opacity: 0;
                    /* The new morphing animation */
                    animation: morphPulse 3s infinite ease-in-out;
                    /* Starting shape */
                    border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
                }
                
                .loader-text {
                    margin-top: 24px; /* Little more spacing */
                    font-family: 'Inter', sans-serif;
                    font-weight: 600; /* Slightly lighter weight for luxury */
                    font-size: 13px; /* Slightly smaller */
                    color: #1F2937;
                    letter-spacing: 0.2em; /* Wider spacing for expensive feel */
                    text-transform: uppercase;
                    animation: fadeText 3s infinite ease-in-out;
                }

                /* NEW ANIMATION: Combines pulsing with organic shape shifting */
                @keyframes morphPulse {
                    0% {
                        border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
                        transform: scale(0.8) rotate(0deg);
                        opacity: 0;
                    }
                    25% {
                         border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%;
                    }
                    50% {
                        /* At peak opacity, the shape is most complex */
                        border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%;
                        opacity: 0.7; /* Subtle opacity, not full 1 */
                        transform: scale(1.1) rotate(90deg);
                    }
                    75% {
                         border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%;
                    }
                    100% {
                        border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
                        transform: scale(1.3) rotate(180deg);
                        opacity: 0;
                    }
                }

                @keyframes fadeText {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.8; }
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
                <div class="morph-ring"></div>
                <div class="loader-text">ALETHA</div>
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
                    // NOTE: Lowered readyState requirement slightly to speed up dismissal
                    if (video && video.readyState >= 1) { 
                        dismissLoader();
                    }
                }, 100);

                function dismissLoader() {
                    const loader = document.getElementById('custom-loader');
                    if (loader && !loader.classList.contains('loader-hidden')) {
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