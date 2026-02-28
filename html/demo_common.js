/**
 * Common Demo Scaling and Height Reporting
 * Shared by all embedded HTML demos (import_demo, pixel_demo, variable_demo, etc.)
 *
 * Usage:
 *   1. Include this script in your HTML: <script src="demo_common.js"></script>
 *   2. Call DemoCommon.init({ appId: 'app', designWidth: 1080 }) after DOM is ready
 *
 * The script will:
 *   - Scale the #app element to fit the iframe width
 *   - Report the correct (unscaled) height to the parent window via postMessage
 */

(function() {
    'use strict';

    // State
    let appRoot = null;
    let designWidth = 1080;
    let currentScale = 1;
    let lastSentHeight = 0;
    let resizeTimeout = null;

    /**
     * Initialize the demo scaling system
     * @param {Object} options - Configuration options
     * @param {string} options.appId - ID of the root app element (default: 'app')
     * @param {number} options.designWidth - Design width in pixels (default: 1080)
     */
    function init(options) {
        options = options || {};
        const appId = options.appId || 'app';
        designWidth = options.designWidth || 1080;

        appRoot = document.getElementById(appId);
        if (!appRoot) {
            console.warn('[DemoCommon] App element #' + appId + ' not found');
            return;
        }

        // Set up the app root styles
        appRoot.style.transformOrigin = 'top left';
        appRoot.style.width = designWidth + 'px';

        // Apply initial scaling
        applyScaleToFit();

        // Set up event listeners
        window.addEventListener('resize', applyScaleToFit);
        window.addEventListener('load', function() {
            applyScaleToFit();
            sendHeightToParent();
        });

        // Periodic height updates for dynamic content
        setInterval(sendHeightToParent, 2000);

        // Initial height report
        setTimeout(sendHeightToParent, 100);
    }

    /**
     * Scale the app content to fit the available width
     */
    function applyScaleToFit() {
        if (!appRoot) return;

        const available = Math.max(1, window.innerWidth);
        currentScale = Math.min(1, available / designWidth);

        // Apply scale transform (parent container handles centering)
        appRoot.style.transform = 'scale(' + currentScale + ')';

        // Prevent scrollbars inside the iframe
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        // Set body dimensions using actual (unscaled) height
        const rect = appRoot.getBoundingClientRect();
        const actualHeight = (rect.height || appRoot.scrollHeight) / currentScale;

        document.body.style.width = available + 'px';
        document.body.style.height = actualHeight + 'px';

        debouncedSendHeight();
    }

    /**
     * Send the actual (unscaled) height to the parent window
     */
    function sendHeightToParent() {
        if (!appRoot) return;

        try {
            // Calculate the actual (unscaled) height
            const visualHeight = appRoot.getBoundingClientRect().height;
            const height = visualHeight / currentScale;

            // Only send if height changed significantly (more than 5px)
            if (Math.abs(height - lastSentHeight) > 5) {
                lastSentHeight = height;
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                        type: 'iframe-resize',
                        height: height
                    }, '*');
                }
            }
        } catch (e) {
            // Cross-origin or other error - silently fail
        }
    }

    /**
     * Debounced version of sendHeightToParent
     */
    function debouncedSendHeight() {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(sendHeightToParent, 200);
    }

    /**
     * Get the current scale factor
     */
    function getScale() {
        return currentScale;
    }

    /**
     * Manually trigger a height update (useful after dynamic content changes)
     */
    function updateHeight() {
        debouncedSendHeight();
    }

    // Export API
    window.DemoCommon = {
        init: init,
        applyScaleToFit: applyScaleToFit,
        sendHeightToParent: sendHeightToParent,
        debouncedSendHeight: debouncedSendHeight,
        getScale: getScale,
        updateHeight: updateHeight
    };

})();
