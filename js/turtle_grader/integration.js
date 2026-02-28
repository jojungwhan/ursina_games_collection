/**
 * Turtle Grader Integration
 *
 * Handles DOM integration for turtle quizzes:
 * - Detects turtle-quiz elements
 * - Hooks into run button clicks
 * - Displays feedback UI
 * - Manages quiz state and progress
 *
 * This module integrates with existing editors WITHOUT modifying them.
 */

(function() {
    'use strict';

    // Get dependencies
    const Config = window.TurtleGraderConfig;
    const Utils = window.TurtleGraderUtils;
    const Interceptor = window.TurtleInterceptor;
    const Grader = window.TurtleGrader;
    const Geometry = window.TurtleGeometry;

    if (!Config || !Utils) {
        console.error('[TurtleQuizIntegration] Core dependencies not loaded');
        return;
    }

    // ========================================================================
    // CONSTANTS
    // ========================================================================

    const SELECTORS = {
        quizContainer: '.turtle-quiz',
        pythonEditor: '.python-editor-placeholder, .python-editor-container',
        runButton: '.python-editor-run-btn, [onclick*="runit"]',
        turtleCanvas: '[id*="canvas"], [id*="mycanvas"]',
        feedbackContainer: '.turtle-grader-feedback'
    };

    const CSS_CLASSES = {
        feedbackContainer: 'turtle-grader-feedback',
        scoreDisplay: 'turtle-grader-score',
        messageList: 'turtle-grader-messages',
        messageSuccess: 'feedback-success',
        messageWarning: 'feedback-warning',
        messageError: 'feedback-error',
        hintsContainer: 'turtle-grader-hints',
        progressBar: 'turtle-grader-progress',
        perfect: 'turtle-grader-perfect'
    };

    // ========================================================================
    // STATE
    // ========================================================================

    let _initializedQuizzes = new Set();
    let _quizStates = new Map();

    // ========================================================================
    // QUIZ STATE MANAGEMENT
    // ========================================================================

    /**
     * Load quiz state from localStorage
     */
    function loadQuizState(quizId) {
        const stored = Utils.loadFromStorage(quizId, Config.STORAGE_KEYS.progress);
        return stored || {
            attempts: 0,
            bestScore: 0,
            completed: false,
            lastAttempt: null
        };
    }

    /**
     * Save quiz state to localStorage
     */
    function saveQuizState(quizId, state) {
        Utils.saveToStorage(quizId, state, Config.STORAGE_KEYS.progress);
        _quizStates.set(quizId, state);
    }

    /**
     * Update quiz state after grading
     */
    function updateQuizState(quizId, result) {
        const state = _quizStates.get(quizId) || loadQuizState(quizId);

        state.attempts++;
        state.lastAttempt = result;

        if (result.score > state.bestScore) {
            state.bestScore = result.score;
        }

        if (result.score >= Config.SCORE_THRESHOLDS.perfect) {
            state.completed = true;
        }

        saveQuizState(quizId, state);
        return state;
    }

    // ========================================================================
    // UI CREATION
    // ========================================================================

    /**
     * Create feedback container element
     */
    function createFeedbackContainer() {
        return Utils.createElement('div', {
            className: CSS_CLASSES.feedbackContainer
        });
    }

    /**
     * Create score display element
     */
    function createScoreDisplay(score, maxScore) {
        const percentage = Math.round((score / maxScore) * 100);
        const isPerfect = percentage >= Config.SCORE_THRESHOLDS.perfect;

        const container = Utils.createElement('div', {
            className: CSS_CLASSES.scoreDisplay + (isPerfect ? ' ' + CSS_CLASSES.perfect : '')
        });

        // Score text
        const scoreText = Utils.createElement('span', {
            className: 'score-text',
            text: `${score}/${maxScore}`
        });

        // Progress bar
        const progressBar = Utils.createElement('div', {
            className: CSS_CLASSES.progressBar
        });

        const progressFill = Utils.createElement('div', {
            className: 'progress-fill',
            attrs: { style: `width: ${percentage}%` }
        });

        progressBar.appendChild(progressFill);

        container.appendChild(scoreText);
        container.appendChild(progressBar);

        return container;
    }

    /**
     * Create message list from feedback
     */
    function createMessageList(feedback) {
        const container = Utils.createElement('div', {
            className: CSS_CLASSES.messageList
        });

        // Overall message
        if (feedback.overall) {
            const overallMsg = Utils.createElement('div', {
                className: 'feedback-overall',
                text: feedback.overall
            });
            container.appendChild(overallMsg);
        }

        // Detail messages
        if (feedback.details && feedback.details.length > 0) {
            const details = Utils.createElement('ul', {
                className: 'feedback-details'
            });

            feedback.details.forEach(msg => {
                if (msg) {
                    const li = Utils.createElement('li', { text: msg });
                    details.appendChild(li);
                }
            });

            container.appendChild(details);
        }

        return container;
    }

    /**
     * Create hints section
     */
    function createHintsSection(hints) {
        if (!hints || hints.length === 0) {
            return null;
        }

        const container = Utils.createElement('div', {
            className: CSS_CLASSES.hintsContainer
        });

        const title = Utils.createElement('div', {
            className: 'hints-title',
            text: '힌트'
        });

        const list = Utils.createElement('ul', {
            className: 'hints-list'
        });

        hints.forEach(hint => {
            const li = Utils.createElement('li', { text: hint });
            list.appendChild(li);
        });

        container.appendChild(title);
        container.appendChild(list);

        return container;
    }

    /**
     * Update feedback UI with grading result
     */
    function updateFeedbackUI(quizElement, result) {
        // Find or create feedback container
        let feedbackContainer = quizElement.querySelector('.' + CSS_CLASSES.feedbackContainer);

        if (!feedbackContainer) {
            feedbackContainer = createFeedbackContainer();
            // Insert after the editor container
            const editor = quizElement.querySelector(SELECTORS.pythonEditor);
            if (editor) {
                editor.parentElement.insertBefore(feedbackContainer, editor.nextSibling);
            } else {
                quizElement.appendChild(feedbackContainer);
            }
        }

        // Clear existing content
        feedbackContainer.innerHTML = '';

        // Add score display
        const scoreDisplay = createScoreDisplay(result.score, result.maxScore);
        feedbackContainer.appendChild(scoreDisplay);

        // Add messages
        const messages = createMessageList(result.feedback);
        feedbackContainer.appendChild(messages);

        // Add hints if not perfect
        if (result.score < Config.SCORE_THRESHOLDS.perfect && result.hints) {
            const hints = createHintsSection(result.hints);
            if (hints) {
                feedbackContainer.appendChild(hints);
            }
        }

        // Add celebration animation for perfect score
        if (result.score >= Config.SCORE_THRESHOLDS.perfect) {
            feedbackContainer.classList.add(CSS_CLASSES.perfect);
            showCelebration(quizElement);
        } else {
            feedbackContainer.classList.remove(CSS_CLASSES.perfect);
        }

        // Show the container
        feedbackContainer.style.display = 'block';
    }

    /**
     * Show celebration animation
     */
    function showCelebration(quizElement) {
        // Add celebration class temporarily
        quizElement.classList.add('turtle-quiz-complete');

        // Remove after animation
        setTimeout(() => {
            quizElement.classList.remove('turtle-quiz-complete');
        }, 2000);
    }

    // ========================================================================
    // QUIZ INITIALIZATION
    // ========================================================================

    /**
     * Initialize a single turtle quiz
     */
    function initQuiz(quizElement) {
        const quizId = quizElement.dataset.quizId;

        if (!quizId) {
            console.warn('[TurtleQuizIntegration] Quiz element missing data-quiz-id');
            return;
        }

        // Check if already initialized
        if (_initializedQuizzes.has(quizId)) {
            return;
        }

        // Load quiz state
        const state = loadQuizState(quizId);
        _quizStates.set(quizId, state);

        // Find the editor container
        const editorContainer = quizElement.querySelector(SELECTORS.pythonEditor);
        if (!editorContainer) {
            console.warn('[TurtleQuizIntegration] No editor found in quiz:', quizId);
            return;
        }

        // Find canvas ID
        const canvas = quizElement.querySelector(SELECTORS.turtleCanvas);
        const canvasId = canvas ? canvas.id : null;

        // Hook into run button
        attachRunButtonHook(quizElement, quizId, canvasId);

        // Mark as initialized
        _initializedQuizzes.add(quizId);
        quizElement.dataset.initialized = 'true';

        console.log('[TurtleQuizIntegration] Initialized quiz:', quizId);
    }

    /**
     * Get code from editor element
     */
    function getCodeFromEditor(quizElement) {
        // Try multiple ways to get the code
        // 1. CodeMirror
        const cmEditor = quizElement.querySelector('.CodeMirror');
        if (cmEditor && cmEditor.CodeMirror) {
            return cmEditor.CodeMirror.getValue();
        }

        // 2. Ace editor
        const aceEditor = quizElement.querySelector('.ace_editor');
        if (aceEditor && aceEditor.env && aceEditor.env.editor) {
            return aceEditor.env.editor.getValue();
        }

        // 3. Textarea
        const textarea = quizElement.querySelector('textarea');
        if (textarea) {
            return textarea.value;
        }

        // 4. data-code attribute (URL encoded)
        const editorDiv = quizElement.querySelector('.python-editor-placeholder');
        if (editorDiv && editorDiv.dataset.code) {
            return decodeURIComponent(editorDiv.dataset.code.replace(/%0A/g, '\n'));
        }

        // 5. Check for blockly workspace
        const blocklyDiv = quizElement.querySelector('[data-blockly]');
        if (blocklyDiv && window.Blockly) {
            // Get Python code from Blockly
            const workspace = Blockly.getMainWorkspace();
            if (workspace) {
                return Blockly.Python.workspaceToCode(workspace);
            }
        }

        console.warn('[TurtleQuizIntegration] Could not get code from editor');
        return '';
    }

    /**
     * Attach hook to run button for grading
     */
    function attachRunButtonHook(quizElement, quizId, canvasId) {
        // Use event delegation to catch run button clicks
        quizElement.addEventListener('click', (event) => {
            const runButton = event.target.closest(SELECTORS.runButton);
            if (runButton) {
                // Get code from editor
                const code = getCodeFromEditor(quizElement);
                console.log('[TurtleQuizIntegration] Code from editor:', code.substring(0, 100) + '...');

                // Start capture with code
                if (Interceptor) {
                    Interceptor.startCapture({ canvasId: canvasId, code: code });
                }

                // Grade immediately (code parsing doesn't need to wait for canvas)
                setTimeout(() => {
                    gradeQuiz(quizElement, quizId, canvasId, code);
                }, 100);
            }
        });
    }

    /**
     * Grade the quiz after execution
     */
    async function gradeQuiz(quizElement, quizId, canvasId, code) {
        if (!Interceptor || !Grader) {
            console.warn('[TurtleQuizIntegration] Interceptor or Grader not available');
            return;
        }

        try {
            // If code was provided, process it directly
            let trace;
            if (code) {
                trace = Interceptor.processCode(code);
            } else {
                // Fallback: try to get code from editor or use existing trace
                const editorCode = getCodeFromEditor(quizElement);
                if (editorCode) {
                    trace = Interceptor.processCode(editorCode);
                } else {
                    trace = await Interceptor.extractAfterExecution(canvasId);
                }
            }

            // Stop capture
            Interceptor.stopCapture();

            // Grade the shape
            const result = Grader.gradeShape(trace, quizId);

            // Update state
            updateQuizState(quizId, result);

            // Update UI
            updateFeedbackUI(quizElement, result);

            // Dispatch event for other systems
            dispatchGradingEvent(quizElement, quizId, result);

        } catch (error) {
            console.error('[TurtleQuizIntegration] Grading error:', error);

            // Show error in UI
            updateFeedbackUI(quizElement, {
                success: false,
                score: 0,
                maxScore: 100,
                feedback: {
                    overall: Config.FEEDBACK.errors.syntaxError,
                    details: []
                },
                hints: []
            });
        }
    }

    /**
     * Dispatch custom event for grading completion
     */
    function dispatchGradingEvent(quizElement, quizId, result) {
        const event = new CustomEvent('turtle-quiz-graded', {
            bubbles: true,
            detail: {
                quizId: quizId,
                result: result
            }
        });

        quizElement.dispatchEvent(event);
    }

    // ========================================================================
    // DOM OBSERVATION
    // ========================================================================

    /**
     * Initialize all existing quizzes on page
     */
    function initAllQuizzes() {
        const quizzes = document.querySelectorAll(SELECTORS.quizContainer);
        quizzes.forEach(initQuiz);
    }

    /**
     * Setup mutation observer for dynamically added quizzes
     */
    function setupObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType !== Node.ELEMENT_NODE) return;

                    // Check if node is a quiz
                    if (node.matches && node.matches(SELECTORS.quizContainer)) {
                        initQuiz(node);
                    }

                    // Check for quizzes inside the node
                    if (node.querySelectorAll) {
                        const quizzes = node.querySelectorAll(SELECTORS.quizContainer);
                        quizzes.forEach(initQuiz);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return observer;
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    /**
     * Manual grading trigger (for external use)
     */
    function triggerGrading(quizId) {
        const quizElement = document.querySelector(`[data-quiz-id="${quizId}"]`);
        if (quizElement) {
            const canvasId = quizElement.querySelector(SELECTORS.turtleCanvas)?.id;
            gradeQuiz(quizElement, quizId, canvasId);
        }
    }

    /**
     * Get quiz state
     */
    function getQuizState(quizId) {
        return _quizStates.get(quizId) || loadQuizState(quizId);
    }

    /**
     * Reset quiz state
     */
    function resetQuizState(quizId) {
        const state = {
            attempts: 0,
            bestScore: 0,
            completed: false,
            lastAttempt: null
        };
        saveQuizState(quizId, state);

        // Clear feedback UI
        const quizElement = document.querySelector(`[data-quiz-id="${quizId}"]`);
        if (quizElement) {
            const feedback = quizElement.querySelector('.' + CSS_CLASSES.feedbackContainer);
            if (feedback) {
                feedback.style.display = 'none';
            }
        }

        return state;
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    function initialize() {
        // Install interceptor hooks if available
        if (Interceptor && Interceptor.installHooks) {
            Interceptor.installHooks();
        }

        // Initialize existing quizzes
        initAllQuizzes();

        // Setup observer for new quizzes
        setupObserver();

        console.log('[TurtleQuizIntegration] Initialized');
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Re-initialize on MkDocs instant navigation
    if (typeof document$ !== 'undefined') {
        document$.subscribe(() => {
            setTimeout(initAllQuizzes, 200);
        });
    }

    // ========================================================================
    // MODULE EXPORT
    // ========================================================================

    const TurtleQuizIntegration = {
        // Lifecycle
        initialize,
        initQuiz,
        initAllQuizzes,

        // Grading
        triggerGrading,

        // State management
        getQuizState,
        resetQuizState,

        // UI
        updateFeedbackUI
    };

    // Export to global scope
    if (typeof window !== 'undefined') {
        window.TurtleQuizIntegration = TurtleQuizIntegration;
    }

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TurtleQuizIntegration;
    }

})();
