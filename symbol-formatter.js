document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // AUTOMATIC SYMBOL FORMATTER (TM and R)
    // ===================================================================
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
        // Skip if parent is script or style
        if (node.parentElement && ['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) return;
        
        if (node.nodeValue && (node.nodeValue.includes('™') || node.nodeValue.includes('®'))) {
            // Check computed style to see if the text is white
            const computedStyle = window.getComputedStyle(node.parentElement);
            const color = computedStyle.color;
            
            // Robust check for white (rgb/rgba/hex/name). 
            // Stripping spaces ensures 'rgb(255, 255, 255)' matches 'rgb(255,255,255)'
            const cleanColor = color ? color.replace(/\s/g, '') : '';
            const isWhite = cleanColor === 'rgb(255,255,255)' || 
                          cleanColor === 'rgba(255,255,255,1)' || 
                          cleanColor === '#ffffff' || 
                          cleanColor === 'white';

            const fragment = document.createDocumentFragment();
            const parts = node.nodeValue.split(/([™®])/);
            
            parts.forEach(part => {
                if (part === '™' || part === '®') {
                    const span = document.createElement('span');
                    
                    // Always apply normal font weight (non-bold)
                    span.style.fontWeight = 'normal';

                    if (isWhite) {
                        // EXCEPTION: If parent is white, keep it white (inherit)
                        // Only apply font-normal class
                        span.className = 'font-normal';
                        span.style.color = 'inherit';
                    } else {
                        // DEFAULT: Turn black
                        // Apply Tailwind classes for black and non-bold
                        span.className = 'text-black font-normal'; 
                        span.style.color = 'black'; 
                    }

                    span.textContent = part;
                    fragment.appendChild(span);
                } else {
                    fragment.appendChild(document.createTextNode(part));
                }
            });
            
            node.parentNode.replaceChild(fragment, node);
        }
    });
});