/**
 * Demo Iframe Handler
 * Unified JavaScript for handling iframe height resizing across all embedded HTML demos.
 *
 * Usage: Add class "demo-iframe-container" to container div and "demo-iframe" to iframe.
 * The iframe should have a unique ID or will be auto-assigned one.
 */

(function() {
    'use strict';

    // Store iframe states to prevent feedback loops
    const iframeStates = new Map();

    /**
     * Initialize all demo iframes on the page
     */
    function initDemoIframes() {
        const containers = document.querySelectorAll('.demo-iframe-container');

        containers.forEach((container, index) => {
            const iframe = container.querySelector('.demo-iframe');
            if (!iframe) return;

            // Ensure iframe has an ID
            if (!iframe.id) {
                iframe.id = `demo-iframe-${index}-${Date.now()}`;
            }

            // Initialize state tracking
            iframeStates.set(iframe.id, {
                lastHeight: 0,
                resizeTimeout: null
            });

            // Set initial height from data attribute or default
            const demoType = container.getAttribute('data-demo');
            const defaultHeights = {
                'import': 520,
                'pixel': 560,
                'for-loop': 640,
                'variable': 750,
                'function': 700
            };

            const initialHeight = defaultHeights[demoType] || 500;
            if (!iframe.style.height) {
                iframe.style.height = initialHeight + 'px';
                iframeStates.get(iframe.id).lastHeight = initialHeight;
            }
        });

        // Set up global message listener (once)
        if (!window._demoIframeListenerAttached) {
            window.addEventListener('message', handleIframeMessage);
            window._demoIframeListenerAttached = true;
        }
    }

    /**
     * Handle postMessage from iframes for height resizing
     */
    function handleIframeMessage(event) {
        // Verify message format
        if (!event.data || event.data.type !== 'iframe-resize' || !event.data.height) {
            return;
        }

        const height = event.data.height;

        // Find which iframe sent this message
        const iframes = document.querySelectorAll('.demo-iframe');

        iframes.forEach(iframe => {
            // Try to match the source
            try {
                if (iframe.contentWindow === event.source) {
                    setIframeHeight(iframe, height);
                }
            } catch (e) {
                // Cross-origin check may fail, that's OK
            }
        });
    }

    /**
     * Set iframe height with debouncing to prevent feedback loops
     */
    function setIframeHeight(iframe, height) {
        const state = iframeStates.get(iframe.id);
        if (!state) return;

        // Only update if height changed significantly (more than 5px)
        if (Math.abs(height - state.lastHeight) > 5) {
            // Debounce rapid updates
            if (state.resizeTimeout) {
                clearTimeout(state.resizeTimeout);
            }

            state.resizeTimeout = setTimeout(() => {
                state.lastHeight = height;
                iframe.style.height = height + 'px';
            }, 100);
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDemoIframes);
    } else {
        initDemoIframes();
    }

    // Re-initialize when new content is loaded (for SPAs like MkDocs Material)
    // Using MutationObserver to detect when new iframes are added
    const observer = new MutationObserver((mutations) => {
        let hasNewIframes = false;

        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.classList && node.classList.contains('demo-iframe-container')) {
                        hasNewIframes = true;
                    } else if (node.querySelector && node.querySelector('.demo-iframe-container')) {
                        hasNewIframes = true;
                    }
                }
            });
        });

        if (hasNewIframes) {
            initDemoIframes();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Export for manual initialization if needed
    window.DemoIframe = {
        init: initDemoIframes,
        setHeight: setIframeHeight
    };

})();
