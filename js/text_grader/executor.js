/**
 * Text Grader Executor
 *
 * Skulpt wrapper with mock input support for executing Python code
 * and capturing stdout output.
 */

(function() {
    'use strict';

    // Dependencies
    const Utils = window.TextGraderUtils;

    const TextGraderExecutor = {
        // Internal state
        _mockInputs: [],
        _inputIndex: 0,
        _capturedOutput: '',
        _isExecuting: false,

        /**
         * Configure Skulpt with mock input support
         * @param {Object} options - Configuration options
         * @param {string[]} options.mockInputs - Array of mock input values
         * @param {boolean} options.showInputs - Whether to include input prompts in output
         * @param {number} options.timeout - Execution timeout in ms (default: 5000)
         * @param {Function} options.onOutput - Callback for each output line
         */
        configure: function(options) {
            options = options || {};
            const self = this;

            // Reset state
            this._mockInputs = options.mockInputs || [];
            this._inputIndex = 0;
            this._capturedOutput = '';

            // Check if Skulpt is available
            if (typeof Sk === 'undefined') {
                Utils.error('Skulpt not loaded');
                return false;
            }

            Sk.configure({
                // Output capture
                output: function(text) {
                    self._capturedOutput += text;
                    if (options.onOutput) {
                        options.onOutput(text);
                    }
                },

                // Mock input function
                inputfun: function(prompt) {
                    return new Promise(function(resolve) {
                        if (self._inputIndex < self._mockInputs.length) {
                            const input = self._mockInputs[self._inputIndex++];
                            // Optionally show prompt + input in output
                            if (options.showInputs && prompt) {
                                self._capturedOutput += prompt + input + '\n';
                            }
                            resolve(input);
                        } else {
                            // No more mock inputs - resolve with empty string
                            Utils.warn('No more mock inputs available');
                            resolve('');
                        }
                    });
                },
                inputfunTakesPrompt: true,

                // Built-in read function for imports
                read: this._builtinRead.bind(this),

                // Python 3 mode
                __future__: Sk.python3,

                // Execution timeout
                execLimit: options.timeout || 5000,

                // Disable debugging for performance
                debugging: false
            });

            return true;
        },

        /**
         * Built-in read function for Skulpt
         * @private
         */
        _builtinRead: function(filename) {
            if (Sk.builtinFiles === undefined ||
                Sk.builtinFiles['files'][filename] === undefined) {
                throw new Error("File not found: '" + filename + "'");
            }
            return Sk.builtinFiles['files'][filename];
        },

        /**
         * Execute Python code and return captured output
         * @param {string} code - Python code to execute
         * @param {Object} options - Optional configuration (will call configure)
         * @returns {Promise<Object>} - { success, output, error }
         */
        execute: async function(code, options) {
            // Prevent concurrent execution
            if (this._isExecuting) {
                return {
                    success: false,
                    output: '',
                    error: '이미 코드가 실행 중입니다.'
                };
            }

            this._isExecuting = true;

            // Configure if options provided
            if (options) {
                if (!this.configure(options)) {
                    this._isExecuting = false;
                    return {
                        success: false,
                        output: '',
                        error: 'Skulpt이 로드되지 않았습니다.'
                    };
                }
            }

            // Reset output
            this._capturedOutput = '';

            try {
                // Execute the code
                await Sk.misceval.asyncToPromise(function() {
                    return Sk.importMainWithBody("<stdin>", false, code, true);
                });

                this._isExecuting = false;
                return {
                    success: true,
                    output: this._capturedOutput,
                    error: null
                };

            } catch (error) {
                this._isExecuting = false;

                // Handle SystemExit (normal exit from sys.exit())
                if (error instanceof Sk.builtin.SystemExit) {
                    return {
                        success: true,
                        output: this._capturedOutput,
                        error: null
                    };
                }

                // Format error message
                const errorMessage = this._formatError(error);

                return {
                    success: false,
                    output: this._capturedOutput,
                    error: errorMessage
                };
            }
        },

        /**
         * Format Skulpt error to user-friendly message
         * @private
         */
        _formatError: function(error) {
            let message = error.toString();

            // Extract line number if available
            const lineMatch = message.match(/line (\d+)/i);
            const lineInfo = lineMatch ? ` (${lineMatch[1]}번째 줄)` : '';

            // Categorize error
            if (message.includes('SyntaxError')) {
                return `문법 오류${lineInfo}: ${this._extractErrorDetail(message)}`;
            }
            if (message.includes('NameError')) {
                return `이름 오류${lineInfo}: 정의되지 않은 변수나 함수를 사용했습니다.`;
            }
            if (message.includes('TypeError')) {
                return `타입 오류${lineInfo}: ${this._extractErrorDetail(message)}`;
            }
            if (message.includes('IndexError')) {
                return `인덱스 오류${lineInfo}: 리스트 범위를 벗어났습니다.`;
            }
            if (message.includes('KeyError')) {
                return `키 오류${lineInfo}: 딕셔너리에 없는 키를 사용했습니다.`;
            }
            if (message.includes('ValueError')) {
                return `값 오류${lineInfo}: ${this._extractErrorDetail(message)}`;
            }
            if (message.includes('ZeroDivisionError')) {
                return `0으로 나눌 수 없습니다${lineInfo}.`;
            }
            if (message.includes('AttributeError')) {
                return `속성 오류${lineInfo}: 해당 속성이나 메서드가 없습니다.`;
            }
            if (message.includes('RecursionError') || message.includes('maximum recursion')) {
                return '재귀 호출이 너무 깊습니다. 기저 조건을 확인하세요.';
            }
            if (message.includes('TimeLimitError') || message.includes('time limit')) {
                return '실행 시간이 초과되었습니다. 무한 루프가 있는지 확인하세요.';
            }

            // Default error message
            return `실행 오류${lineInfo}: ${this._extractErrorDetail(message)}`;
        },

        /**
         * Extract detail from error message
         * @private
         */
        _extractErrorDetail: function(message) {
            // Try to extract the detail after the error type
            const colonIndex = message.indexOf(':');
            if (colonIndex > 0 && colonIndex < message.length - 1) {
                const detail = message.substring(colonIndex + 1).trim();
                // Truncate if too long
                return detail.length > 100 ? detail.substring(0, 100) + '...' : detail;
            }
            return message;
        },

        /**
         * Get the last captured output
         */
        getOutput: function() {
            return this._capturedOutput;
        },

        /**
         * Reset executor state
         */
        reset: function() {
            this._mockInputs = [];
            this._inputIndex = 0;
            this._capturedOutput = '';
            this._isExecuting = false;
        },

        /**
         * Check if currently executing
         */
        isExecuting: function() {
            return this._isExecuting;
        }
    };

    // Export
    if (typeof window !== 'undefined') {
        window.TextGraderExecutor = TextGraderExecutor;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TextGraderExecutor;
    }

})();
