/**
 * @file cloze-ui.js
 * @version 1.0.0
 * @description UI helper functions for cloze quizzes.
 *
 * Dependencies:
 *   1. quiz-contract.js (QuizContract)
 *
 * Exports: window.ClozeUI
 */

(function(global) {
    'use strict';

    var C = global.QuizContract;
    if (!C) {
        console.error('[ClozeUI] QuizContract not found. Load quiz-contract.js first.');
        return;
    }

    /**
     * Update emoji feedback next to a blank input
     * @param {HTMLInputElement} blank - The blank input element
     * @param {boolean} isCorrect - Whether the answer is correct
     * @param {boolean} hasAnswer - Whether user has entered an answer
     */
    function updateEmojiFeedback(blank, isCorrect, hasAnswer) {
        var existingEmoji = blank.parentNode.querySelector(C.selector(C.CLOZE_EMOJI_FEEDBACK));
        if (existingEmoji) existingEmoji.remove();
        if (!hasAnswer) return;

        var emojiSpan = document.createElement('span');
        emojiSpan.className = C.CLOZE_EMOJI_FEEDBACK;
        emojiSpan.setAttribute('aria-label', isCorrect ? 'Correct' : 'Incorrect');
        emojiSpan.textContent = isCorrect ? '\u2705' : '\u274C';
        emojiSpan.classList.add(isCorrect ? C.CLOZE_EMOJI_CORRECT : C.CLOZE_EMOJI_INCORRECT);

        try {
            if (blank.nextSibling) {
                blank.parentNode.insertBefore(emojiSpan, blank.nextSibling);
            } else {
                blank.parentNode.appendChild(emojiSpan);
            }
        } catch (e) {
            console.error('[ClozeUI] Error inserting emoji:', e);
        }
    }

    /**
     * Create quiz control buttons (check, reset, clear saved)
     * @param {string} quizId - Quiz identifier
     * @returns {HTMLElement} Controls container element
     */
    function createQuizControls(quizId) {
        var controls = document.createElement('div');
        controls.className = C.CLOZE_CONTROLS;

        var buttonGroup = document.createElement('div');
        buttonGroup.className = C.CLOZE_BUTTONS;

        var checkBtn = document.createElement('button');
        checkBtn.className = C.CLOZE_BTN_CHECK;
        checkBtn.textContent = '정답 확인';
        checkBtn.type = 'button';
        checkBtn.setAttribute('aria-label', 'Check answers');

        var resetBtn = document.createElement('button');
        resetBtn.className = C.CLOZE_BTN_RESET;
        resetBtn.textContent = '다시 하기';
        resetBtn.type = 'button';
        resetBtn.setAttribute('aria-label', 'Reset quiz');

        buttonGroup.appendChild(checkBtn);
        buttonGroup.appendChild(resetBtn);

        var scoreDiv = document.createElement('div');
        scoreDiv.className = C.CLOZE_SCORE;
        scoreDiv.textContent = '';

        var clearSavedBtn = document.createElement('button');
        clearSavedBtn.className = C.CLOZE_BTN_CLEAR_SAVED;
        clearSavedBtn.textContent = '저장된 답안 지우기';
        clearSavedBtn.type = 'button';
        clearSavedBtn.setAttribute('aria-label', 'Clear saved answers');

        controls.appendChild(buttonGroup);
        controls.appendChild(scoreDiv);
        controls.appendChild(clearSavedBtn);

        return controls;
    }

    /**
     * Add hint button before a blank input
     * @param {HTMLInputElement} blank - The blank input element
     */
    function addHintButton(blank) {
        var hintBtn = document.createElement('button');
        hintBtn.className = C.CLOZE_BTN_HINT;
        hintBtn.textContent = '\uD83D\uDCA1 힌트';
        hintBtn.type = 'button';
        hintBtn.setAttribute('aria-label', 'Show hint');

        var hint = blank.dataset[C.DATA_HINT];
        var hintShown = false;

        hintBtn.addEventListener('click', function() {
            if (!hintShown) {
                var hintDiv = document.createElement('div');
                hintDiv.className = C.CLOZE_HINT;
                hintDiv.textContent = hint;
                blank.parentNode.insertBefore(hintDiv, blank.nextSibling);
                hintShown = true;
                hintBtn.textContent = '\uD83D\uDCA1 힌트 숨기기';
            } else {
                var existingHint = blank.parentNode.querySelector(C.selector(C.CLOZE_HINT));
                if (existingHint) existingHint.remove();
                hintShown = false;
                hintBtn.textContent = '\uD83D\uDCA1 힌트';
            }
        });

        blank.parentNode.insertBefore(hintBtn, blank);
    }

    // Export
    global.ClozeUI = {
        updateEmojiFeedback: updateEmojiFeedback,
        createQuizControls: createQuizControls,
        addHintButton: addHintButton
    };

})(typeof window !== 'undefined' ? window : this);
