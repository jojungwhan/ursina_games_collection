/**
 * Text Grader Grader
 *
 * Scoring and feedback generation for text exercises.
 */

(function() {
    'use strict';

    // Dependencies
    const Config = window.TextGraderConfig;
    const Utils = window.TextGraderUtils;
    const Comparator = window.TextGraderComparator;
    const Preprocessor = window.TextGraderPreprocessor;

    const TextGraderGrader = {

        /**
         * Grade student submission
         * @param {Object} exercise - Exercise configuration
         * @param {Object} executionResult - Result from executor
         * @returns {Object} - Grading result
         */
        grade: function(exercise, executionResult) {
            // Handle execution errors
            if (!executionResult.success) {
                return {
                    score: 0,
                    maxScore: 100,
                    passed: false,
                    feedback: {
                        overall: Config.getFeedback('error'),
                        error: executionResult.error
                    },
                    testResults: [],
                    timestamp: Utils.now()
                };
            }

            // Grade based on exercise type
            switch (exercise.type) {
                case 'output-only':
                    return this._gradeOutputOnly(exercise, executionResult);

                case 'function':
                    return this._gradeFunctionTests(exercise, executionResult);

                case 'with-input':
                    return this._gradeWithInput(exercise, executionResult);

                case 'class':
                    return this._gradeClassTests(exercise, executionResult);

                default:
                    return this._gradeOutputOnly(exercise, executionResult);
            }
        },

        /**
         * Grade output-only exercise
         * Single comparison of full output
         * @private
         */
        _gradeOutputOnly: function(exercise, result) {
            const comparison = Comparator.compare(
                result.output,
                exercise.expected,
                exercise.compareMode || 'exact'
            );

            const score = comparison.match ? 100 : 0;

            return {
                score: score,
                maxScore: 100,
                passed: comparison.match,
                feedback: {
                    overall: comparison.match
                        ? Config.getFeedback('perfect')
                        : '출력이 예상과 다릅니다.',
                    details: comparison.details,
                    expected: exercise.expected,
                    actual: result.output.trim()
                },
                testResults: [{
                    name: '출력 확인',
                    passed: comparison.match,
                    expected: exercise.expected,
                    actual: result.output.trim()
                }],
                timestamp: Utils.now()
            };
        },

        /**
         * Grade function tests (multiple test cases)
         * @private
         */
        _gradeFunctionTests: function(exercise, result) {
            // Split output by lines (each test case prints one line)
            const outputs = Utils.splitLines(result.output);
            const testCases = exercise.testCases || [];

            const testResults = testCases.map(function(tc, i) {
                const actual = outputs[i] ? outputs[i].trim() : '';
                const comparison = Comparator.compare(
                    actual,
                    tc.expected,
                    exercise.compareMode || 'exact'
                );

                const argsStr = Utils.formatArgs(tc.args);

                return {
                    name: `${exercise.functionName}(${argsStr})`,
                    passed: comparison.match,
                    expected: tc.expected,
                    actual: actual || '(출력 없음)'
                };
            });

            const passedCount = testResults.filter(function(r) { return r.passed; }).length;
            const totalCount = testCases.length;
            const score = totalCount > 0 ? Math.round(100 * passedCount / totalCount) : 0;

            let overallFeedback;
            if (passedCount === totalCount) {
                overallFeedback = Config.getFeedback('perfect');
            } else if (passedCount > 0) {
                overallFeedback = Config.FEEDBACK.someTestsPassed(passedCount, totalCount);
            } else {
                overallFeedback = Config.getFeedback('failed');
            }

            return {
                score: score,
                maxScore: 100,
                passed: passedCount === totalCount,
                feedback: {
                    overall: overallFeedback,
                    details: `통과: ${passedCount}/${totalCount}`
                },
                testResults: testResults,
                timestamp: Utils.now()
            };
        },

        /**
         * Grade with-input exercise
         * Same as output-only but with mock inputs
         * @private
         */
        _gradeWithInput: function(exercise, result) {
            // Same logic as output-only
            return this._gradeOutputOnly(exercise, result);
        },

        /**
         * Grade class tests
         * Similar to function tests
         * @private
         */
        _gradeClassTests: function(exercise, result) {
            // Split output by lines
            const outputs = Utils.splitLines(result.output);
            const testCases = exercise.testCases || [];

            const testResults = testCases.map(function(tc, i) {
                const actual = outputs[i] ? outputs[i].trim() : '';
                const comparison = Comparator.compare(
                    actual,
                    tc.expected,
                    exercise.compareMode || 'exact'
                );

                return {
                    name: `${tc.setup} → ${tc.call}`,
                    passed: comparison.match,
                    expected: tc.expected,
                    actual: actual || '(출력 없음)'
                };
            });

            const passedCount = testResults.filter(function(r) { return r.passed; }).length;
            const totalCount = testCases.length;
            const score = totalCount > 0 ? Math.round(100 * passedCount / totalCount) : 0;

            let overallFeedback;
            if (passedCount === totalCount) {
                overallFeedback = Config.getFeedback('perfect');
            } else if (passedCount > 0) {
                overallFeedback = Config.FEEDBACK.someTestsPassed(passedCount, totalCount);
            } else {
                overallFeedback = Config.getFeedback('failed');
            }

            return {
                score: score,
                maxScore: 100,
                passed: passedCount === totalCount,
                feedback: {
                    overall: overallFeedback,
                    details: `통과: ${passedCount}/${totalCount}`
                },
                testResults: testResults,
                timestamp: Utils.now()
            };
        },

        /**
         * Get relevant hints based on grading result
         * @param {Object} exercise - Exercise configuration
         * @param {Object} gradingResult - Result from grade()
         * @returns {string[]} - Array of relevant hints
         */
        getHints: function(exercise, gradingResult) {
            if (!exercise.hints || exercise.hints.length === 0) {
                return [];
            }

            // If all passed, no hints needed
            if (gradingResult.passed) {
                return [];
            }

            // Return hints progressively based on score
            const score = gradingResult.score;
            const hints = exercise.hints;

            if (score === 0) {
                // Show first 2 hints for completely wrong
                return hints.slice(0, 2);
            } else if (score < 50) {
                // Show first hint
                return hints.slice(0, 1);
            } else if (score < 100) {
                // Show last hint for almost correct
                return hints.slice(-1);
            }

            return [];
        },

        /**
         * Calculate badge/achievement based on score
         * @param {number} score - Score (0-100)
         * @returns {Object} - { badge, color, emoji }
         */
        getBadge: function(score) {
            if (score >= 100) {
                return { badge: '완벽', color: 'gold', emoji: '🏆' };
            } else if (score >= 90) {
                return { badge: '훌륭', color: 'silver', emoji: '🥈' };
            } else if (score >= 70) {
                return { badge: '좋음', color: 'bronze', emoji: '🥉' };
            } else if (score >= 50) {
                return { badge: '통과', color: 'green', emoji: '✅' };
            } else {
                return { badge: '재시도', color: 'gray', emoji: '📝' };
            }
        },

        /**
         * Generate summary for exercise completion
         * @param {Object[]} results - Array of grading results
         * @returns {Object} - Summary statistics
         */
        generateSummary: function(results) {
            if (!results || results.length === 0) {
                return {
                    total: 0,
                    completed: 0,
                    passed: 0,
                    averageScore: 0,
                    perfectCount: 0
                };
            }

            const completed = results.filter(function(r) { return r !== null; }).length;
            const passed = results.filter(function(r) { return r && r.passed; }).length;
            const perfectCount = results.filter(function(r) { return r && r.score === 100; }).length;

            const scores = results
                .filter(function(r) { return r !== null; })
                .map(function(r) { return r.score; });

            const averageScore = scores.length > 0
                ? Math.round(scores.reduce(function(a, b) { return a + b; }, 0) / scores.length)
                : 0;

            return {
                total: results.length,
                completed: completed,
                passed: passed,
                averageScore: averageScore,
                perfectCount: perfectCount
            };
        }
    };

    // Export
    if (typeof window !== 'undefined') {
        window.TextGraderGrader = TextGraderGrader;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TextGraderGrader;
    }

})();
