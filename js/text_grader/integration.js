/**
 * Text Grader Integration
 *
 * DOM hooks, UI updates, and state persistence for the text exercise auto-grader.
 */

(function() {
    'use strict';

    // Dependencies
    const Config = window.TextGraderConfig;
    const Utils = window.TextGraderUtils;
    const Executor = window.TextGraderExecutor;
    const Comparator = window.TextGraderComparator;
    const Preprocessor = window.TextGraderPreprocessor;
    const Grader = window.TextGraderGrader;

    const TextGraderIntegration = {
        // Track initialized exercises
        _initialized: new Set(),

        // Observer for dynamic content
        _observer: null,

        /**
         * Initialize the integration
         * Call this when the page loads
         */
        init: function() {
            Utils.log('Initializing Text Grader Integration...');

            // Initialize existing exercises
            this._initAllExercises();

            // Set up mutation observer for dynamically added exercises
            this._setupObserver();

            Utils.log('Text Grader Integration initialized');
        },

        /**
         * Initialize all text exercises on the page
         * @private
         */
        _initAllExercises: function() {
            const self = this;
            const exercises = document.querySelectorAll('.text-exercise');

            exercises.forEach(function(el) {
                self._initExercise(el);
            });

            Utils.log(`Initialized ${exercises.length} text exercise(s)`);
        },

        /**
         * Initialize a single exercise
         * @private
         */
        _initExercise: function(exerciseEl) {
            const exerciseId = exerciseEl.dataset.exerciseId;

            // Prevent double initialization
            if (!exerciseId || this._initialized.has(exerciseId)) {
                return;
            }

            const exercise = Config.getExercise(exerciseId);
            if (!exercise) {
                Utils.warn(`Unknown exercise: ${exerciseId}`);
                return;
            }

            // Mark as initialized
            this._initialized.add(exerciseId);

            // Set up event delegation for run button clicks
            const self = this;
            exerciseEl.addEventListener('click', function(e) {
                // Check if clicked element is a run button
                if (e.target.matches('.python-editor-run-btn') ||
                    e.target.closest('.python-editor-run-btn')) {
                    // Delay to allow the editor to execute first
                    setTimeout(function() {
                        self._onRunClick(exerciseEl, exercise);
                    }, 100);
                }
            });

            // Load saved progress
            this._loadProgress(exerciseEl, exercise);

            Utils.log(`Initialized exercise: ${exerciseId}`);
        },

        /**
         * Handle run button click
         * @private
         */
        _onRunClick: async function(exerciseEl, exercise) {
            Utils.log(`Running exercise: ${exercise.id}`);

            // Get code from editor
            const code = this._getCodeFromEditor(exerciseEl);

            if (!code.trim()) {
                this._showFeedback(exerciseEl, {
                    score: 0,
                    maxScore: 100,
                    passed: false,
                    feedback: {
                        overall: '코드를 작성해주세요.',
                        error: null
                    },
                    testResults: []
                });
                return;
            }

            // Validate code
            const validation = Preprocessor.validate(code, exercise);
            if (!validation.valid) {
                this._showFeedback(exerciseEl, {
                    score: 0,
                    maxScore: 100,
                    passed: false,
                    feedback: {
                        overall: validation.error,
                        error: validation.error
                    },
                    testResults: []
                });
                return;
            }

            // Preprocess code (append tests, etc.)
            const processed = Preprocessor.process(code, exercise);

            // Configure executor with mock inputs if needed
            const executorOptions = {
                mockInputs: processed.mockInputs,
                timeout: 5000,
                showInputs: false
            };

            Executor.configure(executorOptions);

            // Execute the code
            const result = await Executor.execute(processed.processedCode);

            // Grade the result
            const gradeResult = Grader.grade(exercise, result);

            // Add hints if failed
            if (!gradeResult.passed) {
                gradeResult.hints = Grader.getHints(exercise, gradeResult);
            }

            // Update UI
            this._showFeedback(exerciseEl, gradeResult);

            // Save progress
            this._saveProgress(exercise.id, gradeResult);

            Utils.log(`Exercise ${exercise.id} graded: ${gradeResult.score}/${gradeResult.maxScore}`);
        },

        /**
         * Get code from the editor
         * Supports CodeMirror, textarea, and placeholder
         * @private
         */
        _getCodeFromEditor: function(exerciseEl) {
            // Try CodeMirror
            const cmWrapper = exerciseEl.querySelector('.CodeMirror');
            if (cmWrapper && cmWrapper.CodeMirror) {
                return cmWrapper.CodeMirror.getValue();
            }

            // Try textarea
            const textarea = exerciseEl.querySelector('textarea');
            if (textarea) {
                return textarea.value;
            }

            // Try placeholder data attribute
            const placeholder = exerciseEl.querySelector('.python-editor-placeholder');
            if (placeholder && placeholder.dataset.code) {
                return decodeURIComponent(placeholder.dataset.code);
            }

            // Try ace editor
            const aceEditor = exerciseEl.querySelector('.ace_editor');
            if (aceEditor && window.ace) {
                const editor = window.ace.edit(aceEditor);
                return editor.getValue();
            }

            Utils.warn('Could not find editor in exercise element');
            return '';
        },

        /**
         * Show feedback UI
         * @private
         */
        _showFeedback: function(exerciseEl, result) {
            // Find or create feedback container
            let feedbackEl = exerciseEl.querySelector('.text-exercise-feedback');
            if (!feedbackEl) {
                feedbackEl = document.createElement('div');
                feedbackEl.className = 'text-exercise-feedback';
                exerciseEl.appendChild(feedbackEl);
            }

            // Build feedback HTML
            const badge = Grader.getBadge(result.score);
            const passedClass = result.passed ? 'passed' : 'failed';

            let html = `
                <div class="text-grader-feedback ${passedClass}">
                    <div class="text-grader-score">
                        <span class="score-badge ${badge.color}">${badge.emoji}</span>
                        <span class="score-text">점수: ${result.score}/${result.maxScore}</span>
                    </div>
                    <div class="feedback-message">${Utils.escapeHtml(result.feedback.overall)}</div>
            `;

            // Show error details if present
            if (result.feedback.error) {
                html += `
                    <div class="feedback-error">
                        <strong>오류:</strong> ${Utils.escapeHtml(result.feedback.error)}
                    </div>
                `;
            }

            // Show test results for function/class exercises
            if (result.testResults && result.testResults.length > 1) {
                html += this._renderTestResults(result.testResults);
            }

            // Show expected vs actual for single-output exercises
            if (result.testResults && result.testResults.length === 1 && !result.passed) {
                const tr = result.testResults[0];
                html += `
                    <div class="feedback-comparison">
                        <div class="comparison-expected">
                            <strong>예상 출력:</strong>
                            <pre>${Utils.escapeHtml(Utils.truncate(tr.expected, 500))}</pre>
                        </div>
                        <div class="comparison-actual">
                            <strong>실제 출력:</strong>
                            <pre>${Utils.escapeHtml(Utils.truncate(tr.actual, 500))}</pre>
                        </div>
                    </div>
                `;
            }

            // Show hints if available
            if (result.hints && result.hints.length > 0) {
                html += this._renderHints(result.hints);
            }

            html += '</div>';

            feedbackEl.innerHTML = html;

            // Scroll feedback into view
            feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        },

        /**
         * Render test results table
         * @private
         */
        _renderTestResults: function(testResults) {
            let html = `
                <div class="test-results">
                    <h4>테스트 결과:</h4>
                    <table class="test-results-table">
                        <thead>
                            <tr>
                                <th>테스트</th>
                                <th>결과</th>
                                <th>예상</th>
                                <th>실제</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            testResults.forEach(function(r) {
                const icon = r.passed ? '✅' : '❌';
                const rowClass = r.passed ? 'test-passed' : 'test-failed';

                html += `
                    <tr class="${rowClass}">
                        <td class="test-name">${Utils.escapeHtml(Utils.truncate(r.name, 40))}</td>
                        <td class="test-result">${icon}</td>
                        <td class="test-expected">${Utils.escapeHtml(Utils.truncate(r.expected, 30))}</td>
                        <td class="test-actual">${Utils.escapeHtml(Utils.truncate(r.actual, 30))}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            return html;
        },

        /**
         * Render hints
         * @private
         */
        _renderHints: function(hints) {
            let html = `
                <div class="feedback-hints">
                    <h4>💡 힌트:</h4>
                    <ul>
            `;

            hints.forEach(function(hint) {
                html += `<li>${Utils.escapeHtml(hint)}</li>`;
            });

            html += `
                    </ul>
                </div>
            `;

            return html;
        },

        /**
         * Save progress to localStorage
         * @private
         */
        _saveProgress: function(exerciseId, result) {
            const key = Config.getStorageKey(exerciseId);
            const data = {
                score: result.score,
                maxScore: result.maxScore,
                passed: result.passed,
                timestamp: result.timestamp || Utils.now()
            };

            Utils.storage.set(key, data);
        },

        /**
         * Load saved progress
         * @private
         */
        _loadProgress: function(exerciseEl, exercise) {
            const key = Config.getStorageKey(exercise.id);
            const data = Utils.storage.get(key, null);

            if (data && data.score !== undefined) {
                // Show saved score indicator
                this._showSavedIndicator(exerciseEl, data);
            }
        },

        /**
         * Show indicator for previously saved score
         * @private
         */
        _showSavedIndicator: function(exerciseEl, savedData) {
            // Find or create indicator
            let indicator = exerciseEl.querySelector('.text-exercise-saved');
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.className = 'text-exercise-saved';

                // Insert after mission div
                const missionDiv = exerciseEl.querySelector('.text-exercise-mission');
                if (missionDiv) {
                    missionDiv.after(indicator);
                } else {
                    exerciseEl.prepend(indicator);
                }
            }

            const badge = Grader.getBadge(savedData.score);
            const dateStr = Utils.formatDate(savedData.timestamp);

            indicator.innerHTML = `
                <span class="saved-badge ${badge.color}">${badge.emoji}</span>
                <span class="saved-text">이전 점수: ${savedData.score}점</span>
                <span class="saved-date">(${dateStr})</span>
            `;
        },

        /**
         * Set up mutation observer for dynamically added content
         * @private
         */
        _setupObserver: function() {
            const self = this;

            // Watch for dynamically added .text-exercise elements
            this._observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the added node is a text-exercise
                            if (node.classList && node.classList.contains('text-exercise')) {
                                self._initExercise(node);
                            }

                            // Check for text-exercise descendants
                            if (node.querySelectorAll) {
                                node.querySelectorAll('.text-exercise').forEach(function(el) {
                                    self._initExercise(el);
                                });
                            }
                        }
                    });
                });
            });

            this._observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        },

        /**
         * Clear all saved progress
         */
        clearAllProgress: function() {
            const exercises = Config.getAllExercises();
            exercises.forEach(function(exercise) {
                const key = Config.getStorageKey(exercise.id);
                Utils.storage.remove(key);
            });
            Utils.log('Cleared all text exercise progress');
        },

        /**
         * Get progress summary
         */
        getProgressSummary: function() {
            const exercises = Config.getAllExercises();
            const results = [];

            exercises.forEach(function(exercise) {
                const key = Config.getStorageKey(exercise.id);
                const data = Utils.storage.get(key, null);
                results.push(data);
            });

            return Grader.generateSummary(results);
        },

        /**
         * Manually trigger grading for an exercise
         * @param {string} exerciseId - Exercise ID
         */
        triggerGrade: function(exerciseId) {
            const exerciseEl = document.querySelector(`.text-exercise[data-exercise-id="${exerciseId}"]`);
            const exercise = Config.getExercise(exerciseId);

            if (exerciseEl && exercise) {
                this._onRunClick(exerciseEl, exercise);
            } else {
                Utils.warn(`Cannot trigger grade for: ${exerciseId}`);
            }
        }
    };

    // Export
    if (typeof window !== 'undefined') {
        window.TextGraderIntegration = TextGraderIntegration;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TextGraderIntegration;
    }

    // Auto-initialize when DOM is ready
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                TextGraderIntegration.init();
            });
        } else {
            // DOM already loaded
            TextGraderIntegration.init();
        }
    }

})();
