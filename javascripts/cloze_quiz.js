/**
 * @file cloze_quiz.js
 * @version 1.1.0
 * @description Fill-in-the-blank (cloze) quiz engine for MkDocs.
 *
 * Dependencies (load in order):
 *   1. quiz-contract.js (QuizContract) - HTML class/attribute constants
 *   2. quiz-core.js (QuizCore) - shared utilities
 *   3. cloze-ui.js (ClozeUI) - UI helpers
 *   4. structured-quiz.js (StructuredQuiz) - structured quiz handler
 *   5. This file
 *
 * Contract: Class names and data attributes are defined in quiz-contract.js.
 * The Python backend (mkdocs_cloze_extension.py) generates HTML using the same contract.
 */

(function() {
    'use strict';

    // ========================================
    // Dependencies
    // ========================================

    var C = window.QuizContract;
    if (!C) {
        console.error('[CLOZE] QuizContract not found. Load quiz-contract.js first.');
        return;
    }

    var Core = window.QuizCore;
    if (!Core) {
        console.error('[CLOZE] QuizCore not found. Load quiz-core.js first.');
        return;
    }

    var UI = window.ClozeUI;
    if (!UI) {
        console.error('[CLOZE] ClozeUI not found. Load cloze-ui.js first.');
        return;
    }

    var Structured = window.StructuredQuiz;
    if (!Structured) {
        console.error('[CLOZE] StructuredQuiz not found. Load structured-quiz.js first.');
        return;
    }

    // ========================================
    // Cloze Blank Logic
    // ========================================

    function initBlank(blank, quizId, index) {
        var answersStr = blank.dataset[C.DATA_ANSWERS] || '';
        var answers = answersStr.split(',').map(function(a) { return a.trim(); }).filter(Boolean);
        blank.dataset[C.DATA_PARSED_ANSWERS] = JSON.stringify(answers);

        var caseSensitive = blank.dataset[C.DATA_CASE] !== 'insensitive';
        var trim = blank.dataset[C.DATA_TRIM] !== 'false';
        var pattern = blank.dataset[C.DATA_PATTERN] || null;

        blank.dataset[C.DATA_CASE_SENSITIVE] = caseSensitive ? 'true' : 'false';
        blank.dataset[C.DATA_TRIM] = trim ? 'true' : 'false';
        if (pattern) blank.dataset[C.DATA_PATTERN] = pattern;

        if (blank.dataset[C.DATA_HINT]) UI.addHintButton(blank);

        blank.addEventListener('input', function() {
            Core.saveAnswer(quizId, index, blank.value, C.STORAGE_CLOZE_PREFIX);
        });

        blank.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                var quiz = blank.closest(C.selector(C.CLOZE_QUIZ));
                var checkBtn = quiz ? quiz.querySelector(C.selector(C.CLOZE_BTN_CHECK)) : null;
                if (checkBtn) checkBtn.click();
            }
        });

        blank.dataset[C.DATA_INITIALIZED] = 'true';
    }

    function checkSingleBlank(blank) {
        var userAnswer = blank.value;
        var answers = JSON.parse(blank.dataset[C.DATA_PARSED_ANSWERS] || '[]');
        var caseSensitive = blank.dataset[C.DATA_CASE_SENSITIVE] === 'true';
        var trim = blank.dataset[C.DATA_TRIM] !== 'false';
        var pattern = blank.dataset[C.DATA_PATTERN];

        var isCorrect = Core.checkAnswer(userAnswer, answers, {
            caseSensitive: caseSensitive,
            trim: trim,
            pattern: pattern
        });
        var processedAnswer = trim ? userAnswer.trim() : userAnswer;

        blank.classList.remove(C.CLOZE_CORRECT, C.CLOZE_INCORRECT);
        if (processedAnswer) {
            blank.classList.add(isCorrect ? C.CLOZE_CORRECT : C.CLOZE_INCORRECT);
            UI.updateEmojiFeedback(blank, isCorrect, true);
        } else {
            UI.updateEmojiFeedback(blank, false, false);
        }

        return isCorrect;
    }

    // ========================================
    // Cloze Quiz Operations
    // ========================================

    function checkClozeAnswers(quiz) {
        var blanks = quiz.querySelectorAll(C.selector(C.CLOZE_BLANK));
        var correctCount = 0;

        blanks.forEach(function(blank) {
            if (checkSingleBlank(blank)) correctCount++;
        });

        var scoreDiv = quiz.querySelector(C.selector(C.CLOZE_SCORE));
        if (scoreDiv) {
            scoreDiv.textContent = '점수: ' + correctCount + '/' + blanks.length;
            scoreDiv.className = C.CLOZE_SCORE + (correctCount === blanks.length ? ' ' + C.CLOZE_PERFECT : '');
        }
    }

    function resetClozeQuiz(quiz, quizId) {
        var blanks = quiz.querySelectorAll(C.selector(C.CLOZE_BLANK));
        blanks.forEach(function(blank, index) {
            blank.value = '';
            blank.classList.remove(C.CLOZE_CORRECT, C.CLOZE_INCORRECT);
            Core.clearSavedAnswer(quizId, index, C.STORAGE_CLOZE_PREFIX);

            var emoji = blank.parentNode.querySelector(C.selector(C.CLOZE_EMOJI_FEEDBACK));
            if (emoji) emoji.remove();
        });

        var scoreDiv = quiz.querySelector(C.selector(C.CLOZE_SCORE));
        if (scoreDiv) {
            scoreDiv.textContent = '';
            scoreDiv.className = C.CLOZE_SCORE;
        }

        quiz.querySelectorAll(C.selector(C.CLOZE_HINT)).forEach(function(h) { h.remove(); });
        quiz.querySelectorAll(C.selector(C.CLOZE_BTN_HINT)).forEach(function(btn) {
            btn.textContent = '\uD83D\uDCA1 힌트';
        });
    }

    function loadClozeAnswers(quiz, quizId) {
        var blanks = quiz.querySelectorAll(C.selector(C.CLOZE_BLANK));
        blanks.forEach(function(blank, index) {
            var saved = Core.loadSavedAnswer(quizId, index, C.STORAGE_CLOZE_PREFIX);
            if (saved) blank.value = saved;
        });
    }

    function setupClozeKeyboardShortcuts(quiz, quizId) {
        var checkBtn = quiz.querySelector(C.selector(C.CLOZE_BTN_CHECK));
        var resetBtn = quiz.querySelector(C.selector(C.CLOZE_BTN_RESET));
        var clearSavedBtn = quiz.querySelector(C.selector(C.CLOZE_BTN_CLEAR_SAVED));

        quiz.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && e.target.classList.contains(C.CLOZE_BLANK)) {
                e.preventDefault();
                if (resetBtn) resetBtn.click();
            }
        });

        if (checkBtn) checkBtn.addEventListener('click', function() { checkClozeAnswers(quiz); });
        if (resetBtn) resetBtn.addEventListener('click', function() { resetClozeQuiz(quiz, quizId); });
        if (clearSavedBtn) clearSavedBtn.addEventListener('click', function() { resetClozeQuiz(quiz, quizId); });
    }

    // ========================================
    // Initialization
    // ========================================

    function initClozeQuizzes() {
        var quizzes = document.querySelectorAll(C.selector(C.CLOZE_QUIZ));

        quizzes.forEach(function(quiz) {
            if (quiz.dataset[C.DATA_INITIALIZED] === 'true') return;

            var quizId = quiz.dataset[C.DATA_QUIZ_ID] || 'quiz-' + Math.random().toString(36).substr(2, 9);
            quiz.dataset[C.DATA_QUIZ_ID] = quizId;
            quiz.dataset[C.DATA_INITIALIZED] = 'true';

            var blanks = quiz.querySelectorAll(C.selector(C.CLOZE_BLANK));
            if (blanks.length === 0) return;

            var controls = UI.createQuizControls(quizId);
            quiz.appendChild(controls);

            blanks.forEach(function(blank, index) { initBlank(blank, quizId, index); });
            loadClozeAnswers(quiz, quizId);
            setupClozeKeyboardShortcuts(quiz, quizId);
        });

        initStandaloneBlanks();
    }

    function initStandaloneBlanks() {
        var allBlanks = document.querySelectorAll(C.selector(C.CLOZE_BLANK));

        allBlanks.forEach(function(blank) {
            if (blank.dataset[C.DATA_INITIALIZED] === 'true' || blank.closest(C.selector(C.CLOZE_QUIZ))) return;

            blank.dataset[C.DATA_INITIALIZED] = 'true';

            var answersStr = blank.dataset[C.DATA_ANSWERS] || '';
            var answers = answersStr.split(',').map(function(a) { return a.trim(); }).filter(Boolean);
            blank.dataset[C.DATA_PARSED_ANSWERS] = JSON.stringify(answers);

            var caseSensitive = blank.dataset[C.DATA_CASE] !== 'insensitive';
            var trim = blank.dataset[C.DATA_TRIM] !== 'false';
            blank.dataset[C.DATA_CASE_SENSITIVE] = caseSensitive ? 'true' : 'false';
            blank.dataset[C.DATA_TRIM] = trim ? 'true' : 'false';

            blank.addEventListener('blur', function() { checkSingleBlank(blank); });
            blank.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    checkSingleBlank(blank);
                }
            });
        });
    }

    function initialize() {
        initClozeQuizzes();
        Structured.init();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    document.addEventListener('DOMContentLoaded', function() {
        document.addEventListener('navigation', initialize);
    });

    if (typeof document$ !== 'undefined') {
        document$.subscribe(function() { setTimeout(initialize, 100); });
    }

})();
