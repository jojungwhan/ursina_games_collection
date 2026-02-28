/**
 * @file quiz-core.js
 * @version 1.1.0
 * @description Unified quiz utilities for K-12 Python Learning Site.
 *
 * Dependency Graph:
 *   quiz-contract.js (standalone, load first)
 *     ← quiz-core.js (this file, shared utilities)
 *       ← quiz-engine.js (input/choice quizzes)
 *       ← cloze_quiz.js (fill-in-blank)
 *
 * Exports: window.QuizCore
 */

/**
 * @typedef {Object} CheckAnswerOptions
 * @property {boolean} [caseSensitive=false] - Case-sensitive comparison
 * @property {boolean} [trim=true] - Trim whitespace before comparing
 * @property {string} [pattern] - Regex pattern (prefix with 'regex:')
 */

/**
 * @typedef {Object} ShowAnswerOptions
 * @property {boolean} [scroll=true] - Scroll answer into view
 * @property {number} [scrollDelay=100] - Delay before scrolling (ms)
 */

(function(global) {
    'use strict';

    // ========================================
    // String Processing
    // ========================================

    /**
     * Normalize quotes (treat ' and " as equivalent).
     * @param {string} str - Input string
     * @returns {string} String with " replaced by '
     */
    function normalizeQuotes(str) {
        if (!str) return str;
        return str.replace(/"/g, "'");
    }

    // ========================================
    // Answer Checking
    // ========================================

    /**
     * Check exact match against accepted answers.
     * @param {string} userAnswer - User's answer
     * @param {string[]} answers - Accepted answers array
     * @param {boolean} caseSensitive - Case-sensitive comparison
     * @returns {boolean} True if match found
     */
    function checkExactMatch(userAnswer, answers, caseSensitive) {
        if (!userAnswer) return false;

        var processedUser = normalizeQuotes(userAnswer);
        if (!caseSensitive) processedUser = processedUser.toLowerCase();

        return answers.some(function(answer) {
            if (!answer) return false;
            var processedAnswer = normalizeQuotes(answer);
            if (!caseSensitive) processedAnswer = processedAnswer.toLowerCase();
            return processedUser === processedAnswer;
        });
    }

    /**
     * Check user answer against accepted answers.
     * Supports arrays, regex patterns, and quote normalization.
     * @param {string} userAnswer - User's answer
     * @param {string|string[]} acceptedAnswers - Accepted answer(s)
     * @param {CheckAnswerOptions|boolean} [options] - Options or legacy caseSensitive boolean
     * @returns {boolean} True if answer matches
     */
    function checkAnswer(userAnswer, acceptedAnswers, options) {
        if (!userAnswer) return false;

        // Handle legacy boolean argument
        var opts = typeof options === 'boolean'
            ? { caseSensitive: options }
            : (options || {});

        var caseSensitive = opts.caseSensitive || false;
        var trim = opts.trim !== false;
        var pattern = opts.pattern || null;

        var answers = Array.isArray(acceptedAnswers) ? acceptedAnswers : [acceptedAnswers];
        var processedAnswer = trim ? userAnswer.trim() : userAnswer;

        // Regex pattern check
        if (pattern) {
            try {
                var regexStr = pattern.replace(/^regex:/i, '');
                return new RegExp(regexStr).test(processedAnswer);
            } catch (e) {
                console.warn('[QuizCore] Invalid regex:', pattern);
                return checkExactMatch(processedAnswer, answers, caseSensitive);
            }
        }

        return checkExactMatch(processedAnswer, answers, caseSensitive);
    }

    // ========================================
    // Answer Sections
    // ========================================

    /**
     * Hide answer sections (details with "정답 보기").
     */
    function hideAnswerSections() {
        document.querySelectorAll("details").forEach(function(details) {
            var summary = details.querySelector("summary");
            if (summary && summary.textContent.trim().includes("정답 보기")) {
                details.classList.add("quiz-answer-section");
            }
        });
    }

    /**
     * Show answer section following a quiz element.
     * @param {HTMLElement} quizElement - Quiz container element
     * @param {ShowAnswerOptions} [options] - Display options
     */
    function showAnswerSection(quizElement, options) {
        var opts = options || {};
        var shouldScroll = opts.scroll !== false;
        var scrollDelay = opts.scrollDelay || 100;

        var current = quizElement.nextElementSibling;
        while (current) {
            if (current.tagName === "DETAILS") {
                var summary = current.querySelector("summary");
                if (summary && summary.textContent.trim().includes("정답 보기")) {
                    current.classList.add("quiz-answer-visible");
                    current.open = true;

                    if (shouldScroll) {
                        var target = current;
                        setTimeout(function() {
                            target.scrollIntoView({ behavior: "smooth", block: "nearest" });
                        }, scrollDelay);
                    }
                    return;
                }
            }

            // Stop at quiz boundaries
            if (current.classList && (
                current.classList.contains("quiz-choice-type") ||
                current.classList.contains("quiz-input-type"))) {
                break;
            }
            if (current.tagName === "H2" || current.tagName === "H3") break;

            current = current.nextElementSibling;
        }
    }

    // ========================================
    // Result Messages
    // ========================================

    /**
     * Update result message element with correct/incorrect state.
     * @param {HTMLElement} resultMsg - Message element
     * @param {boolean} isCorrect - Whether answer is correct
     * @param {string} [correctText] - Custom correct message
     * @param {string} [incorrectText] - Custom incorrect message
     */
    function updateResultMessage(resultMsg, isCorrect, correctText, incorrectText) {
        if (!resultMsg) return;

        if (isCorrect) {
            resultMsg.textContent = correctText || "\u2705 정답입니다!";
            resultMsg.className = "result-msg correct";
        } else {
            resultMsg.textContent = incorrectText || "\u274C 틀렸습니다. 다시 시도해 보세요.";
            resultMsg.className = "result-msg incorrect";
        }
    }

    // ========================================
    // LocalStorage
    // ========================================

    var DEFAULT_PREFIX = 'quiz-';

    /**
     * Save answer to localStorage.
     * @param {string} quizId - Quiz identifier
     * @param {number|string} index - Question index
     * @param {string} value - Value to save
     * @param {string} [prefix] - Storage key prefix
     */
    function saveAnswer(quizId, index, value, prefix) {
        try {
            localStorage.setItem((prefix || DEFAULT_PREFIX) + quizId + '-' + index, value);
        } catch (e) {
            console.warn('[QuizCore] Save failed:', e);
        }
    }

    /**
     * Load saved answer from localStorage.
     * @param {string} quizId - Quiz identifier
     * @param {number|string} index - Question index
     * @param {string} [prefix] - Storage key prefix
     * @returns {string|null} Saved value or null
     */
    function loadSavedAnswer(quizId, index, prefix) {
        try {
            return localStorage.getItem((prefix || DEFAULT_PREFIX) + quizId + '-' + index);
        } catch (e) {
            console.warn('[QuizCore] Load failed:', e);
            return null;
        }
    }

    /**
     * Clear saved answer from localStorage.
     * @param {string} quizId - Quiz identifier
     * @param {number|string} index - Question index
     * @param {string} [prefix] - Storage key prefix
     */
    function clearSavedAnswer(quizId, index, prefix) {
        try {
            localStorage.removeItem((prefix || DEFAULT_PREFIX) + quizId + '-' + index);
        } catch (e) {
            console.warn('[QuizCore] Clear failed:', e);
        }
    }

    // ========================================
    // Export
    // ========================================

    global.QuizCore = {
        // String processing
        normalizeQuotes: normalizeQuotes,

        // Answer checking
        checkAnswer: checkAnswer,
        checkExactMatch: checkExactMatch,

        // Answer sections
        hideAnswerSections: hideAnswerSections,
        showAnswerSection: showAnswerSection,

        // Result messages
        updateResultMessage: updateResultMessage,

        // LocalStorage
        saveAnswer: saveAnswer,
        loadSavedAnswer: loadSavedAnswer,
        clearSavedAnswer: clearSavedAnswer,

        // Constants
        STORAGE_PREFIX: DEFAULT_PREFIX
    };

})(typeof window !== 'undefined' ? window : this);
