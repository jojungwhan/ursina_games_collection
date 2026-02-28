/**
 * Turtle Grader Utilities
 *
 * Helper functions for:
 * - Base64 encoding/decoding
 * - Hash computation (simple client-side)
 * - LocalStorage operations
 * - Math helpers
 */

(function() {
    'use strict';

    // ========================================================================
    // MATH UTILITIES
    // ========================================================================

    /**
     * Convert degrees to radians
     */
    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Convert radians to degrees
     */
    function toDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    /**
     * Normalize angle to [0, 360) range
     */
    function normalizeAngle(angle) {
        angle = angle % 360;
        if (angle < 0) angle += 360;
        return angle;
    }

    /**
     * Normalize angle to [-180, 180) range
     */
    function normalizeAngleSigned(angle) {
        angle = normalizeAngle(angle);
        if (angle >= 180) angle -= 360;
        return angle;
    }

    /**
     * Calculate distance between two points
     */
    function distance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate angle from p1 to p2 (in degrees, 0 = right/east)
     */
    function angleBetweenPoints(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return toDegrees(Math.atan2(dy, dx));
    }

    /**
     * Calculate centroid of points
     */
    function centroid(points) {
        if (!points || points.length === 0) {
            return { x: 0, y: 0 };
        }

        let sumX = 0;
        let sumY = 0;

        for (const p of points) {
            sumX += p.x;
            sumY += p.y;
        }

        return {
            x: sumX / points.length,
            y: sumY / points.length
        };
    }

    /**
     * Check if two numbers are approximately equal
     */
    function approxEqual(a, b, tolerance) {
        return Math.abs(a - b) <= tolerance;
    }

    /**
     * Check if two angles are approximately equal (handles wraparound)
     */
    function anglesApproxEqual(a, b, tolerance) {
        const diff = normalizeAngle(a - b);
        return diff <= tolerance || diff >= (360 - tolerance);
    }

    /**
     * Calculate mean of array
     */
    function mean(arr) {
        if (!arr || arr.length === 0) return 0;
        return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    }

    /**
     * Calculate standard deviation of array
     */
    function standardDeviation(arr) {
        if (!arr || arr.length === 0) return 0;
        const m = mean(arr);
        const squaredDiffs = arr.map(val => Math.pow(val - m, 2));
        return Math.sqrt(mean(squaredDiffs));
    }

    /**
     * Check if all values in array are approximately equal
     */
    function allApproxEqual(arr, tolerance) {
        if (!arr || arr.length < 2) return true;
        const first = arr[0];
        return arr.every(val => approxEqual(val, first, tolerance));
    }

    // ========================================================================
    // ENCODING UTILITIES
    // ========================================================================

    /**
     * Encode object to Base64
     */
    function encodeToBase64(obj) {
        try {
            const json = JSON.stringify(obj);
            return btoa(encodeURIComponent(json));
        } catch (e) {
            console.error('[TurtleGrader] Failed to encode to Base64:', e);
            return null;
        }
    }

    /**
     * Decode Base64 to object
     */
    function decodeFromBase64(str) {
        try {
            const json = decodeURIComponent(atob(str));
            return JSON.parse(json);
        } catch (e) {
            console.error('[TurtleGrader] Failed to decode from Base64:', e);
            return null;
        }
    }

    /**
     * Simple hash function (djb2)
     * Not cryptographically secure, but fast for client-side verification
     */
    function simpleHash(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) + hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash >>> 0; // Convert to unsigned
    }

    /**
     * Generate hash of trace data for verification
     */
    function hashTrace(trace) {
        if (!trace || !trace.commands) return 0;

        // Create a normalized string representation
        const normalized = trace.commands.map(cmd => {
            return `${cmd.cmd}:${JSON.stringify(cmd.args)}`;
        }).join('|');

        return simpleHash(normalized);
    }

    // ========================================================================
    // STORAGE UTILITIES
    // ========================================================================

    /**
     * Save data to localStorage with prefix
     */
    function saveToStorage(key, value, prefix) {
        try {
            const fullKey = (prefix || '') + key;
            const json = JSON.stringify(value);
            localStorage.setItem(fullKey, json);
            return true;
        } catch (e) {
            console.warn('[TurtleGrader] Failed to save to localStorage:', e);
            return false;
        }
    }

    /**
     * Load data from localStorage with prefix
     */
    function loadFromStorage(key, prefix) {
        try {
            const fullKey = (prefix || '') + key;
            const json = localStorage.getItem(fullKey);
            return json ? JSON.parse(json) : null;
        } catch (e) {
            console.warn('[TurtleGrader] Failed to load from localStorage:', e);
            return null;
        }
    }

    /**
     * Remove data from localStorage with prefix
     */
    function removeFromStorage(key, prefix) {
        try {
            const fullKey = (prefix || '') + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (e) {
            console.warn('[TurtleGrader] Failed to remove from localStorage:', e);
            return false;
        }
    }

    /**
     * Clear all storage with given prefix
     */
    function clearStorageWithPrefix(prefix) {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (e) {
            console.warn('[TurtleGrader] Failed to clear storage:', e);
            return false;
        }
    }

    // ========================================================================
    // DOM UTILITIES
    // ========================================================================

    /**
     * Create element with classes and attributes
     */
    function createElement(tag, options = {}) {
        const el = document.createElement(tag);

        if (options.className) {
            el.className = options.className;
        }

        if (options.id) {
            el.id = options.id;
        }

        if (options.text) {
            el.textContent = options.text;
        }

        if (options.html) {
            el.innerHTML = options.html;
        }

        if (options.attrs) {
            for (const [key, value] of Object.entries(options.attrs)) {
                el.setAttribute(key, value);
            }
        }

        if (options.data) {
            for (const [key, value] of Object.entries(options.data)) {
                el.dataset[key] = value;
            }
        }

        if (options.children) {
            for (const child of options.children) {
                el.appendChild(child);
            }
        }

        return el;
    }

    /**
     * Find closest ancestor matching selector
     */
    function findClosest(el, selector) {
        while (el && el !== document) {
            if (el.matches && el.matches(selector)) {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    /**
     * Debounce function execution
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function execution
     */
    function throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ========================================================================
    // MODULE EXPORT
    // ========================================================================

    const TurtleGraderUtils = {
        // Math utilities
        toRadians,
        toDegrees,
        normalizeAngle,
        normalizeAngleSigned,
        distance,
        angleBetweenPoints,
        centroid,
        approxEqual,
        anglesApproxEqual,
        mean,
        standardDeviation,
        allApproxEqual,

        // Encoding utilities
        encodeToBase64,
        decodeFromBase64,
        simpleHash,
        hashTrace,

        // Storage utilities
        saveToStorage,
        loadFromStorage,
        removeFromStorage,
        clearStorageWithPrefix,

        // DOM utilities
        createElement,
        findClosest,
        debounce,
        throttle
    };

    // Export to global scope
    if (typeof window !== 'undefined') {
        window.TurtleGraderUtils = TurtleGraderUtils;
    }

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TurtleGraderUtils;
    }

})();
