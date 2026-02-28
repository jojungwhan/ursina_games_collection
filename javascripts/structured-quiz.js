/**
 * @file structured-quiz.js
 * @version 1.0.0
 * @description Structured quiz (quiz cards with rows) handler.
 *
 * Dependencies:
 *   1. quiz-contract.js (QuizContract)
 *   2. quiz-core.js (QuizCore)
 *
 * Exports: window.StructuredQuiz
 */

(function(global) {
    'use strict';

    var C = global.QuizContract;
    if (!C) {
        console.error('[StructuredQuiz] QuizContract not found. Load quiz-contract.js first.');
        return;
    }

    var Core = global.QuizCore;
    if (!Core) {
        console.error('[StructuredQuiz] QuizCore not found. Load quiz-core.js first.');
        return;
    }

    /**
     * Check all answers in a structured quiz
     * @param {HTMLElement} quizCard - Quiz card container
     * @param {string} quizId - Quiz identifier
     */
    function checkStructuredQuiz(quizCard, quizId) {
        var rows = quizCard.querySelectorAll(C.selector(C.QUIZ_ROW));
        var correctCount = 0;

        rows.forEach(function(row) {
            var input = row.querySelector(C.selector(C.QUIZ_INPUT));
            if (!input) return;

            var userAnswer = input.value.trim();
            var answersStr = input.dataset[C.DATA_ANSWERS] || '';
            var answers = answersStr.split(',').map(function(a) { return a.trim(); }).filter(Boolean);
            var caseSensitive = input.dataset[C.DATA_CASE] !== 'insensitive';

            var isCorrect = answers.length > 0 && userAnswer && Core.checkExactMatch(userAnswer, answers, caseSensitive);

            row.classList.remove(C.QUIZ_ROW_IDLE, C.QUIZ_ROW_CORRECT, C.QUIZ_ROW_WRONG);
            input.classList.remove(C.INPUT_CORRECT, C.INPUT_INCORRECT);

            if (userAnswer) {
                if (isCorrect) {
                    row.classList.add(C.QUIZ_ROW_CORRECT);
                    input.classList.add(C.INPUT_CORRECT);
                    correctCount++;
                } else {
                    row.classList.add(C.QUIZ_ROW_WRONG);
                    input.classList.add(C.INPUT_INCORRECT);
                }
            }
        });

        var progressElem = quizCard.querySelector(C.selector(C.QUIZ_PROGRESS));
        if (progressElem) {
            var total = rows.length;
            progressElem.textContent = correctCount + '/' + total + (correctCount === total ? ' correct' : ' completed');
        }
    }

    /**
     * Reset a structured quiz
     * @param {HTMLElement} quizCard - Quiz card container
     * @param {string} quizId - Quiz identifier
     */
    function resetStructuredQuiz(quizCard, quizId) {
        var rows = quizCard.querySelectorAll(C.selector(C.QUIZ_ROW));

        rows.forEach(function(row, index) {
            var input = row.querySelector(C.selector(C.QUIZ_INPUT));
            if (input) {
                input.value = '';
                input.classList.remove(C.INPUT_CORRECT, C.INPUT_INCORRECT);
                Core.clearSavedAnswer(quizId, index, C.STORAGE_QUIZ_PREFIX);
            }
            row.classList.remove(C.QUIZ_ROW_CORRECT, C.QUIZ_ROW_WRONG);
            row.classList.add(C.QUIZ_ROW_IDLE);
        });

        var progressElem = quizCard.querySelector(C.selector(C.QUIZ_PROGRESS));
        if (progressElem) progressElem.textContent = '0/' + rows.length + ' completed';
    }

    /**
     * Update progress display for a structured quiz
     * @param {HTMLElement} quizCard - Quiz card container
     */
    function updateStructuredProgress(quizCard) {
        var rows = quizCard.querySelectorAll(C.selector(C.QUIZ_ROW));
        var progressElem = quizCard.querySelector(C.selector(C.QUIZ_PROGRESS));

        if (progressElem) {
            var completed = 0;
            rows.forEach(function(row) {
                var input = row.querySelector(C.selector(C.QUIZ_INPUT));
                if (input && input.value.trim()) completed++;
            });
            progressElem.textContent = completed + '/' + rows.length + ' completed';
        }
    }

    /**
     * Initialize all structured quizzes on the page
     */
    function initStructuredQuizzes() {
        var quizCards = document.querySelectorAll(C.selector(C.QUIZ_CARD));

        quizCards.forEach(function(quizCard) {
            if (quizCard.dataset[C.DATA_INITIALIZED] === 'true') return;

            var quizId = quizCard.dataset[C.DATA_QUIZ_ID] || 'quiz-' + Math.random().toString(36).substr(2, 9);
            quizCard.dataset[C.DATA_QUIZ_ID] = quizId;
            quizCard.dataset[C.DATA_INITIALIZED] = 'true';

            var inputs = quizCard.querySelectorAll(C.selector(C.QUIZ_INPUT));
            var checkBtn = quizCard.querySelector(C.selector(C.QUIZ_BTN_CHECK));
            var resetBtn = quizCard.querySelector(C.selector(C.QUIZ_BTN_RESET));

            if (inputs.length === 0) return;

            if (checkBtn) checkBtn.addEventListener('click', function() { checkStructuredQuiz(quizCard, quizId); });
            if (resetBtn) resetBtn.addEventListener('click', function() { resetStructuredQuiz(quizCard, quizId); });

            inputs.forEach(function(input, index) {
                var saved = Core.loadSavedAnswer(quizId, index, C.STORAGE_QUIZ_PREFIX);
                if (saved) input.value = saved;

                input.addEventListener('input', function() {
                    Core.saveAnswer(quizId, index, input.value, C.STORAGE_QUIZ_PREFIX);
                });

                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && checkBtn) {
                        e.preventDefault();
                        checkBtn.click();
                    }
                });
            });

            updateStructuredProgress(quizCard);
        });
    }

    // Export
    global.StructuredQuiz = {
        check: checkStructuredQuiz,
        reset: resetStructuredQuiz,
        updateProgress: updateStructuredProgress,
        init: initStructuredQuizzes
    };

})(typeof window !== 'undefined' ? window : this);
