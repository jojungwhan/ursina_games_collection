/**
 * @file quiz-engine.js
 * @version 1.1.0
 * @description Input and multiple-choice quiz handler for MkDocs.
 *
 * Dependencies (load in order):
 *   1. quiz-contract.js (QuizContract) - HTML class/attribute constants
 *   2. quiz-core.js (QuizCore) - shared utilities
 *   3. This file
 *
 * Exports: window.QuizEngine
 */

(function() {
    'use strict';

    // ========================================
    // Dependencies
    // ========================================

    var C = window.QuizContract;
    if (!C) {
        console.error('[QuizEngine] QuizContract not found. Load quiz-contract.js first.');
        return;
    }

    var Core = window.QuizCore;
    if (!Core) {
        console.error('[QuizEngine] QuizCore not found. Load quiz-core.js first.');
        return;
    }

    // ========================================
    // Quiz Initialization
    // ========================================

    function initQuizzes() {
        Core.hideAnswerSections();
        initInputQuizzes();
        initChoiceQuizzes();
    }

    function initInputQuizzes() {
        var selector = C.selector(C.QUIZ_INPUT_TYPE) + ':not([data-' + C._camelToKebab(C.DATA_INITIALIZED) + '])';
        document.querySelectorAll(selector).forEach(function(quiz, index) {
            quiz.dataset[C.DATA_INITIALIZED] = 'true';

            var submitBtn = quiz.querySelector(C.selector(C.QUIZ_SUBMIT_BTN));
            var inputField = quiz.querySelector(C.selector(C.QUIZ_INPUT));
            var resultMsg = quiz.querySelector(C.selector(C.RESULT_MSG));
            var correctAnswer = quiz.dataset[C.DATA_ANSWER];

            if (!C.validateElement(submitBtn, 'submitBtn in quiz ' + index)) return;
            if (!C.validateElement(inputField, 'inputField in quiz ' + index)) return;
            if (!C.validateElement(resultMsg, 'resultMsg in quiz ' + index)) return;

            var answered = false;

            submitBtn.addEventListener('click', function() {
                if (!answered) {
                    answered = true;
                    Core.showAnswerSection(quiz);
                }
                var isCorrect = Core.checkAnswer(inputField.value, correctAnswer, false);
                Core.updateResultMessage(resultMsg, isCorrect);
            });

            inputField.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') submitBtn.click();
            });
        });
    }

    function initChoiceQuizzes() {
        var selector = C.selector(C.QUIZ_CHOICE_TYPE) + ':not([data-' + C._camelToKebab(C.DATA_INITIALIZED) + '])';
        document.querySelectorAll(selector).forEach(function(quiz, index) {
            quiz.dataset[C.DATA_INITIALIZED] = 'true';

            var choiceButtons = quiz.querySelectorAll(C.selector(C.QUIZ_CHOICE_BTN));
            var resultMsg = quiz.querySelector(C.selector(C.RESULT_MSG));
            var correctAnswer = quiz.dataset[C.DATA_ANSWER];

            if (!choiceButtons.length) {
                console.warn('[QuizEngine] Choice Quiz ' + index + ': No buttons found');
                return;
            }
            if (!C.validateElement(resultMsg, 'resultMsg in choice quiz ' + index)) return;

            var answered = false;

            choiceButtons.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    if (!answered) {
                        answered = true;
                        Core.showAnswerSection(quiz);
                    }

                    choiceButtons.forEach(function(b) { b.classList.remove(C.SELECTED); });
                    btn.classList.add(C.SELECTED);

                    var isCorrect = btn.dataset[C.DATA_VALUE] === correctAnswer;
                    Core.updateResultMessage(resultMsg, isCorrect,
                        '\u2705 정답입니다! 잘했어요!',
                        '\u274C 틀렸습니다. 다시 생각해 보세요.');
                });
            });
        });
    }

    // ========================================
    // Initialization
    // ========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuizzes);
    } else {
        initQuizzes();
    }

    if (typeof document$ !== 'undefined') {
        document$.subscribe(function() { setTimeout(initQuizzes, 100); });
    }

    window.QuizEngine = { init: initQuizzes };
})();
