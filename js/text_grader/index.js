/**
 * Text Grader - Public API
 *
 * Module aggregation and public API for the text exercise auto-grader.
 * This file should be loaded last in the dependency chain.
 *
 * Load order:
 * 1. config.js
 * 2. utils.js
 * 3. executor.js
 * 4. comparator.js
 * 5. preprocessor.js
 * 6. grader.js
 * 7. integration.js
 * 8. index.js (this file)
 */

(function() {
    'use strict';

    // Collect all modules
    const Config = window.TextGraderConfig;
    const Utils = window.TextGraderUtils;
    const Executor = window.TextGraderExecutor;
    const Comparator = window.TextGraderComparator;
    const Preprocessor = window.TextGraderPreprocessor;
    const Grader = window.TextGraderGrader;
    const Integration = window.TextGraderIntegration;

    /**
     * TextGrader - Main Public API
     */
    const TextGrader = {
        // Version
        VERSION: '1.0.0',

        // Expose submodules for advanced usage
        Config: Config,
        Utils: Utils,
        Executor: Executor,
        Comparator: Comparator,
        Preprocessor: Preprocessor,
        Grader: Grader,
        Integration: Integration,

        /**
         * Initialize the text grader
         * Usually called automatically, but can be called manually
         */
        init: function() {
            if (Integration) {
                Integration.init();
            } else {
                console.error('[TextGrader] Integration module not loaded');
            }
        },

        /**
         * Get exercise configuration by ID
         * @param {string} id - Exercise ID
         * @returns {Object|null} - Exercise configuration
         */
        getExercise: function(id) {
            return Config ? Config.getExercise(id) : null;
        },

        /**
         * Get all exercises
         * @returns {Object[]} - Array of all exercises
         */
        getAllExercises: function() {
            return Config ? Config.getAllExercises() : [];
        },

        /**
         * Get exercises by level
         * @param {number} level - Level (1, 2, or 3)
         * @returns {Object[]} - Array of exercises at that level
         */
        getExercisesByLevel: function(level) {
            return Config ? Config.getExercisesByLevel(level) : [];
        },

        /**
         * Execute Python code and get output
         * @param {string} code - Python code
         * @param {Object} options - Execution options
         * @returns {Promise<Object>} - { success, output, error }
         */
        execute: async function(code, options) {
            if (!Executor) {
                return { success: false, output: '', error: 'Executor not loaded' };
            }
            return await Executor.execute(code, options);
        },

        /**
         * Grade code against an exercise
         * @param {string} exerciseId - Exercise ID
         * @param {string} code - Student's code
         * @returns {Promise<Object>} - Grading result
         */
        grade: async function(exerciseId, code) {
            const exercise = this.getExercise(exerciseId);
            if (!exercise) {
                return {
                    success: false,
                    error: `Unknown exercise: ${exerciseId}`
                };
            }

            // Preprocess
            const processed = Preprocessor.process(code, exercise);

            // Configure executor
            Executor.configure({
                mockInputs: processed.mockInputs,
                timeout: 5000
            });

            // Execute
            const result = await Executor.execute(processed.processedCode);

            // Grade
            const gradeResult = Grader.grade(exercise, result);

            return gradeResult;
        },

        /**
         * Manually trigger grading for an exercise element
         * @param {string} exerciseId - Exercise ID
         */
        triggerGrade: function(exerciseId) {
            if (Integration) {
                Integration.triggerGrade(exerciseId);
            }
        },

        /**
         * Get progress summary
         * @returns {Object} - Summary statistics
         */
        getProgress: function() {
            return Integration ? Integration.getProgressSummary() : {
                total: 0,
                completed: 0,
                passed: 0,
                averageScore: 0,
                perfectCount: 0
            };
        },

        /**
         * Clear all saved progress
         */
        clearProgress: function() {
            if (Integration) {
                Integration.clearAllProgress();
            }
        },

        /**
         * Compare two outputs
         * @param {string} actual - Actual output
         * @param {string} expected - Expected output
         * @param {string} mode - Comparison mode
         * @returns {Object} - Comparison result
         */
        compare: function(actual, expected, mode) {
            return Comparator ? Comparator.compare(actual, expected, mode) : {
                match: false,
                details: 'Comparator not loaded'
            };
        },

        /**
         * Log a message
         */
        log: function(...args) {
            if (Utils) {
                Utils.log(...args);
            } else {
                console.log('[TextGrader]', ...args);
            }
        },

        /**
         * Check if the grader is ready
         * @returns {boolean}
         */
        isReady: function() {
            return !!(Config && Utils && Executor && Comparator &&
                     Preprocessor && Grader && Integration);
        }
    };

    // Export main API
    if (typeof window !== 'undefined') {
        window.TextGrader = TextGrader;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TextGrader;
    }

    // Log initialization
    if (TextGrader.isReady()) {
        TextGrader.log(`Text Grader v${TextGrader.VERSION} loaded successfully`);
        TextGrader.log(`${TextGrader.getAllExercises().length} exercises available`);
    } else {
        console.error('[TextGrader] Some modules failed to load');
        console.log('Loaded modules:', {
            Config: !!Config,
            Utils: !!Utils,
            Executor: !!Executor,
            Comparator: !!Comparator,
            Preprocessor: !!Preprocessor,
            Grader: !!Grader,
            Integration: !!Integration
        });
    }

})();
