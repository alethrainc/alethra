// agent-loader.js
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
                /* Reset internal styles */
                body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; }
                
                /* --- CONTAINER STYLES --- */
                #agent-inner-container { 
                    width: 100%; 
                    height: 100%; 
                    /* FIX: Flexbox rules to center the Loading Animation on Mobile */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                /* FIX: Force Video to align to the top so head isn't cropped on Desktop */
                video { object-position: top center !important; }
            </style>
        </head>
        <body>
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
                const hideStyle = document.createElement('style');
                hideStyle.textContent = '.didagent__chat__toggle { display: none !important; }';

                function pierceShadowAndHide(root) {
                    if (!root.querySelector('style[data-hider]')) {
                        const clonedStyle = hideStyle.cloneNode(true);
                        clonedStyle.setAttribute('data-hider', 'true');
                        root.appendChild(clonedStyle);
                    }
                }

                const observer = new MutationObserver((mutations) => {
                    const allNodes = document.querySelectorAll('*');
                    allNodes.forEach(node => {
                        if (node.shadowRoot) {
                            pierceShadowAndHide(node.shadowRoot);
                        }
                    });
                });

                observer.observe(document.body, { childList: true, subtree: true });
                
                // Fallback check
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