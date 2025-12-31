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

                /* --- CUSTOM LOADER (THE COOL PART) --- */
                #custom-loader {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: #ffffff; /* Matches your card background */
                    z-index: 9999; /* Sits on top of everything */
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    transition: opacity 0.8s ease-in-out, visibility 0.8s;
                }

                /* The "Breathing" Ring Animation */
                .pulse-ring {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    border: 4px solid #E72F3C; /* klyr-red */
                    opacity: 0;
                    animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
                }
                
                /* Brand Name Fade In */
                .loader-text {
                    margin-top: 16px;
                    font-family: 'Inter', sans-serif;
                    font-weight: 700;
                    font-size: 14px;
                    color: #1F2937; /* klyr-dark */
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    animation: fadeText 2s infinite ease-in-out;
                }

                @keyframes pulse {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                }

                @keyframes fadeText {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }

                /* Class to hide the loader smoothly */
                .loader-hidden {
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                }
            </style>
        </head>
        <body>
            
            <div id="custom-loader">
                <div class="pulse-ring"></div>
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
                // 1. Hide Chat Button Logic (Shadow DOM)
                const hideStyle = document.createElement('style');
                hideStyle.textContent = '.didagent__chat__toggle { display: none !important; }';

                function pierceShadowAndHide(root) {
                    if (!root.querySelector('style[data-hider]')) {
                        const clonedStyle = hideStyle.cloneNode(true);
                        clonedStyle.setAttribute('data-hider', 'true');
                        root.appendChild(clonedStyle);
                    }
                }

                // 2. Watch for Video Ready (To Dismiss Loader)
                const loaderCheckInterval = setInterval(() => {
                    // We look for the video element D-ID creates
                    const video = document.querySelector('video');
                    
                    // If video exists AND has enough data to play frame 1
                    if (video && video.readyState >= 2) {
                        const loader = document.getElementById('custom-loader');
                        if (loader) {
                            loader.classList.add('loader-hidden');
                            clearInterval(loaderCheckInterval);
                        }
                    }
                }, 100);

                // 3. Shadow DOM Observer
                const observer = new MutationObserver((mutations) => {
                    const allNodes = document.querySelectorAll('*');
                    allNodes.forEach(node => {
                        if (node.shadowRoot) {
                            pierceShadowAndHide(node.shadowRoot);
                        }
                    });
                });
                observer.observe(document.body, { childList: true, subtree: true });
                
                // Fallback Shadow Check
                setInterval(() => {
                   const allNodes = document.querySelectorAll('*');
                   allNodes.forEach(node => {
                       if (node.shadowRoot) {
                           pierceShadowAndHide(node.shadowRoot);
                       }
                   });
                }, 100);
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