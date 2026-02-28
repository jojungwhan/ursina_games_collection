/**
 * Turtle Grader - Shape Comparison and Scoring
 *
 * Compares drawn shapes against expected shapes and calculates scores
 * with partial credit for each component (sides, angles, lengths, closure).
 */

(function() {
    'use strict';

    // Get dependencies
    const Config = window.TurtleGraderConfig;
    const Utils = window.TurtleGraderUtils;
    const Geometry = window.TurtleGeometry;

    if (!Config || !Utils || !Geometry) {
        console.error('[TurtleGrader] Dependencies not loaded. Ensure config.js, utils.js, and geometry.js are loaded first.');
        return;
    }

    const RUBRIC = Config.RUBRIC;
    const FEEDBACK = Config.FEEDBACK;
    const TOLERANCES = Config.TOLERANCES;

    // ========================================================================
    // SCORING FUNCTIONS
    // ========================================================================

    /**
     * Calculate side count score
     *
     * @param {number} expected - Expected number of sides
     * @param {number} actual - Actual number of sides
     * @returns {Object} {score, feedback}
     */
    function scoreSideCount(expected, actual) {
        if (expected === null) {
            // Any number of sides is acceptable (polygon challenge)
            if (actual >= 3) {
                return {
                    score: RUBRIC.sideCount.weight,
                    feedback: FEEDBACK.sideCount.correct
                };
            }
            return {
                score: 0,
                feedback: FEEDBACK.sideCount.zero
            };
        }

        if (actual === 0) {
            return {
                score: 0,
                feedback: FEEDBACK.sideCount.zero
            };
        }

        if (actual === expected) {
            return {
                score: RUBRIC.sideCount.weight,
                feedback: FEEDBACK.sideCount.correct
            };
        }

        // Partial credit based on how close
        const diff = Math.abs(expected - actual);
        const partialScore = Math.max(0, RUBRIC.sideCount.weight * (1 - diff * 0.25));

        return {
            score: partialScore,
            feedback: FEEDBACK.sideCount.wrong(expected, actual)
        };
    }

    /**
     * Calculate turn angle score
     *
     * @param {number} expectedAngle - Expected turn angle (or null for any)
     * @param {Array} actualAngles - Array of actual turn angles
     * @param {number} expectedSides - Expected number of sides
     * @returns {Object} {score, feedback}
     */
    function scoreTurnAngles(expectedAngle, actualAngles, expectedSides) {
        if (!actualAngles || actualAngles.length === 0) {
            return {
                score: 0,
                feedback: FEEDBACK.turnAngles.wrong(expectedAngle || '?')
            };
        }

        // Calculate expected angle if not provided
        if (expectedAngle === null && expectedSides !== null) {
            expectedAngle = 360 / expectedSides;
        }

        // For polygon challenge, calculate based on side count
        if (expectedAngle === null) {
            // Check if angles are consistent (all approximately equal)
            if (Utils.allApproxEqual(actualAngles, TOLERANCES.ANGLE)) {
                const avgAngle = Utils.mean(actualAngles);
                // Verify it's a valid polygon angle (360/n for some n >= 3)
                const impliedSides = 360 / avgAngle;
                if (impliedSides >= 3 && impliedSides <= 12 && Math.abs(impliedSides - Math.round(impliedSides)) < 0.1) {
                    return {
                        score: RUBRIC.turnAngles.weight,
                        feedback: FEEDBACK.turnAngles.correct
                    };
                }
            }
            return {
                score: RUBRIC.turnAngles.weight * 0.5,
                feedback: FEEDBACK.turnAngles.inconsistent
            };
        }

        // Check consistency of angles
        if (!Utils.allApproxEqual(actualAngles, TOLERANCES.ANGLE)) {
            return {
                score: RUBRIC.turnAngles.weight * 0.3,
                feedback: FEEDBACK.turnAngles.inconsistent
            };
        }

        // Calculate average angle
        const avgAngle = Utils.mean(actualAngles);

        // Check if average is close to expected
        if (Utils.approxEqual(avgAngle, expectedAngle, TOLERANCES.ANGLE)) {
            return {
                score: RUBRIC.turnAngles.weight,
                feedback: FEEDBACK.turnAngles.correct
            };
        }

        // Partial credit based on how close
        const angleDiff = Math.abs(avgAngle - expectedAngle);
        const partialScore = Math.max(0, RUBRIC.turnAngles.weight * (1 - angleDiff / 45));

        return {
            score: partialScore,
            feedback: FEEDBACK.turnAngles.wrong(expectedAngle)
        };
    }

    /**
     * Calculate side length score
     *
     * @param {number} expectedLength - Expected side length (or null for any)
     * @param {Array} actualLengths - Array of actual side lengths
     * @param {boolean} mustBeRegular - Whether sides must be equal
     * @returns {Object} {score, feedback}
     */
    function scoreSideLengths(expectedLength, actualLengths, mustBeRegular) {
        if (!actualLengths || actualLengths.length === 0) {
            return {
                score: 0,
                feedback: FEEDBACK.sideLengths.wrong(expectedLength)
            };
        }

        const avgLength = Utils.mean(actualLengths);
        const lengthTolerance = avgLength * TOLERANCES.LENGTH_PERCENT;

        // Check consistency (all sides approximately equal)
        const isConsistent = Utils.allApproxEqual(actualLengths, lengthTolerance);

        if (!isConsistent && mustBeRegular) {
            return {
                score: RUBRIC.sideLengths.weight * 0.4,
                feedback: FEEDBACK.sideLengths.inconsistent
            };
        }

        // If specific length required
        if (expectedLength !== null) {
            const tolerance = expectedLength * TOLERANCES.LENGTH_PERCENT;

            if (Utils.approxEqual(avgLength, expectedLength, tolerance)) {
                if (isConsistent) {
                    return {
                        score: RUBRIC.sideLengths.weight,
                        feedback: FEEDBACK.sideLengths.correct
                    };
                }
                return {
                    score: RUBRIC.sideLengths.weight * 0.7,
                    feedback: FEEDBACK.sideLengths.inconsistent
                };
            }

            // Partial credit based on how close
            const lengthDiff = Math.abs(avgLength - expectedLength) / expectedLength;
            const partialScore = Math.max(0, RUBRIC.sideLengths.weight * (1 - lengthDiff));

            return {
                score: partialScore * (isConsistent ? 1 : 0.7),
                feedback: FEEDBACK.sideLengths.wrong(expectedLength)
            };
        }

        // No specific length required, just check consistency
        if (isConsistent || !mustBeRegular) {
            return {
                score: RUBRIC.sideLengths.weight,
                feedback: FEEDBACK.sideLengths.correct
            };
        }

        return {
            score: RUBRIC.sideLengths.weight * 0.5,
            feedback: FEEDBACK.sideLengths.inconsistent
        };
    }

    /**
     * Calculate closure score
     *
     * @param {boolean} mustBeClosed - Whether shape must be closed
     * @param {boolean} isClosed - Whether shape is closed
     * @param {number} closureGap - Gap between start and end
     * @returns {Object} {score, feedback}
     */
    function scoreClosure(mustBeClosed, isClosed, closureGap) {
        if (!mustBeClosed) {
            // Closure not required
            return {
                score: RUBRIC.isClosed.weight,
                feedback: FEEDBACK.closure.closed
            };
        }

        if (isClosed) {
            return {
                score: RUBRIC.isClosed.weight,
                feedback: FEEDBACK.closure.closed
            };
        }

        // Partial credit if almost closed
        if (closureGap <= TOLERANCES.CLOSURE_GAP * 3) {
            return {
                score: RUBRIC.isClosed.weight * 0.7,
                feedback: FEEDBACK.closure.almostClosed
            };
        }

        return {
            score: 0,
            feedback: FEEDBACK.closure.notClosed
        };
    }

    // ========================================================================
    // MAIN GRADING FUNCTION
    // ========================================================================

    /**
     * Grade a drawn shape against expected shape
     *
     * @param {Object} trace - Command trace from interceptor
     * @param {string} quizId - Quiz ID from config
     * @returns {Object} Grading result with scores and feedback
     */
    function gradeShape(trace, quizId) {
        // Get quiz configuration
        const quiz = Config.getQuiz(quizId);
        if (!quiz) {
            console.error('[TurtleGrader] Unknown quiz ID:', quizId);
            return createErrorResult(FEEDBACK.errors.noCode);
        }

        const expected = quiz.expected;

        // Analyze the drawn shape
        const metrics = Geometry.analyzeShape(trace);

        // Handle no shape case
        if (!metrics.valid || metrics.sideCount === 0) {
            return createErrorResult(FEEDBACK.overall.noShape);
        }

        // Calculate individual scores
        const sideCountResult = scoreSideCount(expected.sideCount, metrics.sideCount);
        const turnAnglesResult = scoreTurnAngles(
            expected.turnAngle,
            metrics.turnAngles,
            expected.sideCount
        );
        const sideLengthsResult = scoreSideLengths(
            expected.sideLength,
            metrics.sideLengths,
            expected.mustBeRegular
        );
        const closureResult = scoreClosure(
            expected.mustBeClosed,
            metrics.isClosed,
            metrics.closureGap
        );

        // Calculate total score
        const totalScore = Math.round(
            sideCountResult.score +
            turnAnglesResult.score +
            sideLengthsResult.score +
            closureResult.score
        );

        // Determine overall feedback
        const overallFeedback = Config.getOverallFeedback(totalScore);

        // Identify the shape
        const shapeName = Geometry.identifyShape(metrics);

        return {
            success: true,
            quizId: quizId,
            score: totalScore,
            maxScore: 100,
            percentage: totalScore,
            shapeName: shapeName,
            metrics: metrics,
            breakdown: {
                sideCount: sideCountResult,
                turnAngles: turnAnglesResult,
                sideLengths: sideLengthsResult,
                closure: closureResult
            },
            feedback: {
                overall: overallFeedback,
                details: [
                    sideCountResult.feedback,
                    turnAnglesResult.feedback,
                    sideLengthsResult.feedback,
                    closureResult.feedback
                ].filter(f => f)
            },
            hints: getRelevantHints(quiz, metrics, expected),
            timestamp: Date.now()
        };
    }

    /**
     * Create an error result
     *
     * @param {string} message - Error message
     * @returns {Object} Error result
     */
    function createErrorResult(message) {
        return {
            success: false,
            score: 0,
            maxScore: 100,
            percentage: 0,
            feedback: {
                overall: message,
                details: []
            },
            hints: [],
            timestamp: Date.now()
        };
    }

    /**
     * Get relevant hints based on what's wrong
     *
     * @param {Object} quiz - Quiz configuration
     * @param {Object} metrics - Shape metrics
     * @param {Object} expected - Expected shape
     * @returns {Array} Array of relevant hints
     */
    function getRelevantHints(quiz, metrics, expected) {
        if (!quiz.hints) return [];

        const hints = [];
        const maxHints = 2;

        // Add hints based on what's wrong
        if (expected.sideCount !== null && metrics.sideCount !== expected.sideCount) {
            hints.push(quiz.hints[0]); // Usually about side count
        }

        if (expected.turnAngle !== null) {
            const avgAngle = Utils.mean(metrics.turnAngles);
            if (!Utils.approxEqual(avgAngle, expected.turnAngle, TOLERANCES.ANGLE)) {
                hints.push(quiz.hints[1]); // Usually about angles
            }
        }

        if (!metrics.isClosed && expected.mustBeClosed) {
            hints.push(quiz.hints[quiz.hints.length - 1]); // Usually about closing
        }

        // Return up to maxHints
        return hints.slice(0, maxHints);
    }

    // ========================================================================
    // QUICK VALIDATION FUNCTIONS
    // ========================================================================

    /**
     * Quick check if shape is valid for a quiz (without full grading)
     *
     * @param {Object} trace - Command trace
     * @param {string} quizId - Quiz ID
     * @returns {boolean} True if shape passes basic validation
     */
    function quickValidate(trace, quizId) {
        const quiz = Config.getQuiz(quizId);
        if (!quiz) return false;

        const metrics = Geometry.analyzeShape(trace);
        if (!metrics.valid) return false;

        const expected = quiz.expected;

        // Check side count (if required)
        if (expected.sideCount !== null && metrics.sideCount !== expected.sideCount) {
            return false;
        }

        // Check closure (if required)
        if (expected.mustBeClosed && !metrics.isClosed) {
            return false;
        }

        return true;
    }

    /**
     * Check if score meets passing threshold
     *
     * @param {number} score - Score to check
     * @returns {boolean} True if passing
     */
    function isPassing(score) {
        return score >= Config.SCORE_THRESHOLDS.passing;
    }

    /**
     * Check if score is perfect
     *
     * @param {number} score - Score to check
     * @returns {boolean} True if perfect
     */
    function isPerfect(score) {
        return score >= Config.SCORE_THRESHOLDS.perfect;
    }

    // ========================================================================
    // MODULE EXPORT
    // ========================================================================

    const TurtleGrader = {
        // Main grading
        gradeShape,
        quickValidate,

        // Score checking
        isPassing,
        isPerfect,

        // Individual scoring (for testing/debugging)
        scoreSideCount,
        scoreTurnAngles,
        scoreSideLengths,
        scoreClosure
    };

    // Export to global scope
    if (typeof window !== 'undefined') {
        window.TurtleGrader = TurtleGrader;
    }

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TurtleGrader;
    }

})();
