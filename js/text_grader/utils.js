/**
 * Text Grader Utilities
 *
 * Shared utility functions for the text exercise auto-grader.
 */

(function() {
    'use strict';

    const TextGraderUtils = {

        /**
         * Normalize a string for comparison
         * - Trim whitespace
         * - Collapse multiple spaces
         * - Normalize quotes
         */
        normalizeString: function(str) {
            if (typeof str !== 'string') {
                str = String(str);
            }
            return str
                .trim()
                .replace(/\s+/g, ' ')
                .replace(/\[\s+/g, '[')
                .replace(/\s+\]/g, ']')
                .replace(/\(\s+/g, '(')
                .replace(/\s+\)/g, ')')
                .replace(/{\s+/g, '{')
                .replace(/\s+}/g, '}')
                .replace(/,\s+/g, ', ')
                .replace(/:\s+/g, ': ');
        },

        /**
         * Try to parse a Python literal as JSON
         * Converts Python syntax to JSON syntax
         */
        tryParsePythonLiteral: function(str) {
            if (typeof str !== 'string') {
                return str;
            }

            // Convert Python syntax to JSON
            const jsonified = str
                .replace(/'/g, '"')           // Single quotes to double
                .replace(/True/g, 'true')     // Python True to JSON true
                .replace(/False/g, 'false')   // Python False to JSON false
                .replace(/None/g, 'null')     // Python None to JSON null
                .replace(/\(/g, '[')          // Tuples to arrays
                .replace(/\)/g, ']');

            try {
                return JSON.parse(jsonified);
            } catch {
                return str;
            }
        },

        /**
         * Deep equality comparison
         */
        deepEqual: function(a, b) {
            // Handle primitives
            if (a === b) return true;

            // Handle null/undefined
            if (a == null || b == null) return a === b;

            // Handle different types
            if (typeof a !== typeof b) return false;

            // Handle arrays
            if (Array.isArray(a) && Array.isArray(b)) {
                if (a.length !== b.length) return false;
                for (let i = 0; i < a.length; i++) {
                    if (!this.deepEqual(a[i], b[i])) return false;
                }
                return true;
            }

            // Handle objects
            if (typeof a === 'object') {
                const keysA = Object.keys(a);
                const keysB = Object.keys(b);
                if (keysA.length !== keysB.length) return false;
                for (const key of keysA) {
                    if (!this.deepEqual(a[key], b[key])) return false;
                }
                return true;
            }

            return false;
        },

        /**
         * Split output into lines
         */
        splitLines: function(str) {
            if (typeof str !== 'string') {
                return [];
            }
            return str.split('\n').filter(line => line.trim() !== '');
        },

        /**
         * Format arguments for display
         */
        formatArgs: function(args) {
            if (!Array.isArray(args)) return String(args);

            return args.map(arg => {
                if (typeof arg === 'string') {
                    return `'${arg}'`;
                }
                if (Array.isArray(arg)) {
                    return JSON.stringify(arg);
                }
                return String(arg);
            }).join(', ');
        },

        /**
         * Escape special characters for display
         */
        escapeHtml: function(str) {
            if (typeof str !== 'string') {
                str = String(str);
            }
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        },

        /**
         * Truncate long strings for display
         */
        truncate: function(str, maxLength) {
            maxLength = maxLength || 100;
            if (typeof str !== 'string') {
                str = String(str);
            }
            if (str.length <= maxLength) {
                return str;
            }
            return str.substring(0, maxLength - 3) + '...';
        },

        /**
         * Check if a value is numeric
         */
        isNumeric: function(value) {
            if (typeof value === 'number') return !isNaN(value);
            if (typeof value !== 'string') return false;
            return !isNaN(parseFloat(value)) && isFinite(value);
        },

        /**
         * Parse numeric value with tolerance
         */
        parseNumeric: function(value) {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') return parseFloat(value.trim());
            return NaN;
        },

        /**
         * Compare numbers with tolerance
         */
        numbersClose: function(a, b, tolerance) {
            tolerance = tolerance || 0.01;
            const numA = this.parseNumeric(a);
            const numB = this.parseNumeric(b);
            if (isNaN(numA) || isNaN(numB)) return false;
            return Math.abs(numA - numB) <= tolerance;
        },

        /**
         * Generate a unique ID
         */
        generateId: function() {
            return 'text_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * Debounce function calls
         */
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Get current timestamp
         */
        now: function() {
            return Date.now();
        },

        /**
         * Format a date for display
         */
        formatDate: function(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleString('ko-KR');
        },

        /**
         * Local storage helpers
         */
        storage: {
            get: function(key, defaultValue) {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : defaultValue;
                } catch {
                    return defaultValue;
                }
            },

            set: function(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch {
                    return false;
                }
            },

            remove: function(key) {
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch {
                    return false;
                }
            }
        },

        /**
         * Log messages with prefix
         */
        log: function(...args) {
            console.log('[TextGrader]', ...args);
        },

        warn: function(...args) {
            console.warn('[TextGrader]', ...args);
        },

        error: function(...args) {
            console.error('[TextGrader]', ...args);
        }
    };

    // Export
    if (typeof window !== 'undefined') {
        window.TextGraderUtils = TextGraderUtils;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TextGraderUtils;
    }

})();
