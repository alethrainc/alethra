// agent-loader.js
(function() {
    // 1. CONFIGURATION
    const targetContainerId = 'content-box2'; 

    // 2. SANDBOX HTML DEFINITION
    // This HTML runs inside the isolated iframe, preventing font issues
    const agentHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                /* Reset internal styles so agent fills the box */
                body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; }
                #agent-inner-container { width: 100%; height: 100%; }
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
        </body>
        </html>
    `;

    // 3. INJECTION LOGIC
    // We wait for DOMContentLoaded to ensure the target div exists
    const initAgent = () => {
        const container = document.getElementById(targetContainerId);
        if (container) {
            // Create a secure "Blob URL" to treat the HTML string as a file
            const blob = new Blob([agentHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            // Create and configure the iframe
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "none";
            iframe.allow = "microphone; camera; display-capture; autoplay"; // Permissions

            // Insert into the page
            container.innerHTML = ""; 
            container.appendChild(iframe);
        }
    };

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAgent);
    } else {
        initAgent();
    }
})();