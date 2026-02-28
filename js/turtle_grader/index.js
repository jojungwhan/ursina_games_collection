/**
 * Turtle Grader - Main Entry Point
 *
 * This file serves as the public API for the turtle auto-grading system.
 * It aggregates all modules and provides a unified interface.
 *
 * Load order (handled by mkdocs.yml):
 * 1. config.js
 * 2. utils.js
 * 3. geometry.js
 * 4. interceptor.js
 * 5. grader.js
 * 6. integration.js
 * 7. index.js (this file)
 */

(function() {
    'use strict';

    // ========================================================================
    // MODULE COLLECTION
    // ========================================================================

    const modules = {
        Config: window.TurtleGraderConfig,
        Utils: window.TurtleGraderUtils,
        Geometry: window.TurtleGeometry,
        Interceptor: window.TurtleInterceptor,
        Grader: window.TurtleGrader,
        Integration: window.TurtleQuizIntegration
    };

    // Verify all modules are loaded
    const missingModules = Object.entries(modules)
        .filter(([name, module]) => !module)
        .map(([name]) => name);

    if (missingModules.length > 0) {
        console.error('[TurtleGraderSystem] Missing modules:', missingModules.join(', '));
        console.error('[TurtleGraderSystem] Ensure all module files are loaded in the correct order.');
    }

    // ========================================================================
    // VERSION INFO
    // ========================================================================

    const VERSION = '1.0.0';
    const BUILD_DATE = '2026-01-19';

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    /**
     * TurtleGraderSystem - Unified API for turtle auto-grading
     */
    const TurtleGraderSystem = {
        // Version info
        version: VERSION,
        buildDate: BUILD_DATE,

        // Module references (for advanced usage)
        modules: modules,

        // ====================================================================
        // HIGH-LEVEL API
        // ====================================================================

        /**
         * Grade a shape drawn by turtle code
         *
         * @param {string} quizId - Quiz ID from configuration
         * @param {Object} trace - Command trace (optional, will extract if not provided)
         * @returns {Object} Grading result
         */
        grade: function(quizId, trace) {
            if (!modules.Grader) {
                console.error('[TurtleGraderSystem] Grader module not available');
                return null;
            }
            return modules.Grader.gradeShape(trace, quizId);
        },

        /**
         * Analyze a shape without grading
         *
         * @param {Object} trace - Command trace
         * @returns {Object} Shape metrics
         */
        analyzeShape: function(trace) {
            if (!modules.Geometry) {
                console.error('[TurtleGraderSystem] Geometry module not available');
                return null;
            }
            return modules.Geometry.analyzeShape(trace);
        },

        /**
         * Start capturing turtle commands
         *
         * @param {Object} options - Capture options
         * @returns {Object} Trace object
         */
        startCapture: function(options) {
            if (!modules.Interceptor) {
                console.error('[TurtleGraderSystem] Interceptor module not available');
                return null;
            }
            return modules.Interceptor.startCapture(options);
        },

        /**
         * Stop capturing and get trace
         *
         * @returns {Object} Complete trace
         */
        stopCapture: function() {
            if (!modules.Interceptor) {
                console.error('[TurtleGraderSystem] Interceptor module not available');
                return null;
            }
            return modules.Interceptor.stopCapture();
        },

        /**
         * Get current trace
         *
         * @returns {Object} Current trace
         */
        getCurrentTrace: function() {
            if (!modules.Interceptor) return null;
            return modules.Interceptor.getCurrentTrace();
        },

        // ====================================================================
        // QUIZ MANAGEMENT
        // ====================================================================

        /**
         * Get quiz configuration
         *
         * @param {string} quizId - Quiz ID
         * @returns {Object} Quiz configuration
         */
        getQuiz: function(quizId) {
            if (!modules.Config) return null;
            return modules.Config.getQuiz(quizId);
        },

        /**
         * Get all available quiz IDs
         *
         * @returns {Array} Array of quiz IDs
         */
        getQuizIds: function() {
            if (!modules.Config) return [];
            return modules.Config.getQuizIds();
        },

        /**
         * Get quiz state (progress, attempts, etc.)
         *
         * @param {string} quizId - Quiz ID
         * @returns {Object} Quiz state
         */
        getQuizState: function(quizId) {
            if (!modules.Integration) return null;
            return modules.Integration.getQuizState(quizId);
        },

        /**
         * Reset quiz state
         *
         * @param {string} quizId - Quiz ID
         * @returns {Object} New state
         */
        resetQuizState: function(quizId) {
            if (!modules.Integration) return null;
            return modules.Integration.resetQuizState(quizId);
        },

        /**
         * Manually trigger grading for a quiz
         *
         * @param {string} quizId - Quiz ID
         */
        triggerGrading: function(quizId) {
            if (!modules.Integration) {
                console.error('[TurtleGraderSystem] Integration module not available');
                return;
            }
            modules.Integration.triggerGrading(quizId);
        },

        // ====================================================================
        // CONFIGURATION
        // ====================================================================

        /**
         * Get tolerances
         *
         * @returns {Object} Tolerance values
         */
        getTolerances: function() {
            if (!modules.Config) return null;
            return modules.Config.TOLERANCES;
        },

        /**
         * Get scoring rubric
         *
         * @returns {Object} Rubric configuration
         */
        getRubric: function() {
            if (!modules.Config) return null;
            return modules.Config.RUBRIC;
        },

        /**
         * Get feedback messages
         *
         * @returns {Object} Feedback messages
         */
        getFeedback: function() {
            if (!modules.Config) return null;
            return modules.Config.FEEDBACK;
        },

        // ====================================================================
        // UTILITIES
        // ====================================================================

        /**
         * Calculate expected turn angle for regular polygon
         *
         * @param {number} sides - Number of sides
         * @returns {number} Turn angle in degrees
         */
        calculateTurnAngle: function(sides) {
            return 360 / sides;
        },

        /**
         * Identify shape type from metrics
         *
         * @param {Object} metrics - Shape metrics
         * @returns {string} Shape name
         */
        identifyShape: function(metrics) {
            if (!modules.Geometry) return 'unknown';
            return modules.Geometry.identifyShape(metrics);
        },

        /**
         * Check if score is passing
         *
         * @param {number} score - Score to check
         * @returns {boolean} True if passing
         */
        isPassing: function(score) {
            if (!modules.Grader) return false;
            return modules.Grader.isPassing(score);
        },

        /**
         * Check if score is perfect
         *
         * @param {number} score - Score to check
         * @returns {boolean} True if perfect
         */
        isPerfect: function(score) {
            if (!modules.Grader) return false;
            return modules.Grader.isPerfect(score);
        },

        // ====================================================================
        // DEBUG/DEVELOPMENT
        // ====================================================================

        /**
         * Check if all modules are loaded
         *
         * @returns {boolean} True if all modules available
         */
        isReady: function() {
            return missingModules.length === 0;
        },

        /**
         * Get list of missing modules
         *
         * @returns {Array} Missing module names
         */
        getMissingModules: function() {
            return missingModules;
        },

        /**
         * Debug: log current state
         */
        debug: function() {
            console.group('[TurtleGraderSystem] Debug Info');
            console.log('Version:', VERSION);
            console.log('Build Date:', BUILD_DATE);
            console.log('Modules Loaded:', Object.entries(modules)
                .filter(([, m]) => m)
                .map(([n]) => n));
            console.log('Missing Modules:', missingModules);
            console.log('Current Trace:', this.getCurrentTrace());
            console.groupEnd();
        }
    };

    // ========================================================================
    // INITIALIZATION LOGGING
    // ========================================================================

    console.log(`[TurtleGraderSystem] v${VERSION} loaded`);

    if (missingModules.length === 0) {
        console.log('[TurtleGraderSystem] All modules ready');
    } else {
        console.warn('[TurtleGraderSystem] Some modules missing - functionality may be limited');
    }

    // ========================================================================
    // EXPORT
    // ========================================================================

    // Freeze the public API
    Object.freeze(TurtleGraderSystem);

    // Export to global scope
    if (typeof window !== 'undefined') {
        window.TurtleGraderSystem = TurtleGraderSystem;

        // Also provide shorthand alias
        window.TGS = TurtleGraderSystem;
    }

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TurtleGraderSystem;
    }

})();
