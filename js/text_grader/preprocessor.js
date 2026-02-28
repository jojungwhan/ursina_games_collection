/**
 * Text Grader Preprocessor
 *
 * Prepares student code for execution by:
 * - Detecting exercise type
 * - Appending test cases for function/class exercises
 * - Setting up mock inputs
 */

(function() {
    'use strict';

    // Dependencies
    const Config = window.TextGraderConfig;
    const Utils = window.TextGraderUtils;

    const TextGraderPreprocessor = {

        /**
         * Process student code based on exercise type
         * @param {string} code - Student's code
         * @param {Object} exercise - Exercise configuration
         * @returns {Object} - { processedCode, mockInputs, testCount }
         */
        process: function(code, exercise) {
            if (!exercise) {
                Utils.warn('No exercise provided to preprocessor');
                return {
                    processedCode: code,
                    mockInputs: [],
                    testCount: 1
                };
            }

            switch (exercise.type) {
                case 'output-only':
                    return this._processOutputOnly(code, exercise);

                case 'function':
                    return this._processFunction(code, exercise);

                case 'with-input':
                    return this._processWithInput(code, exercise);

                case 'class':
                    return this._processClass(code, exercise);

                default:
                    return {
                        processedCode: code,
                        mockInputs: [],
                        testCount: 1
                    };
            }
        },

        /**
         * Process output-only exercise
         * No modifications needed, just run the code
         * @private
         */
        _processOutputOnly: function(code, exercise) {
            return {
                processedCode: code,
                mockInputs: [],
                testCount: 1
            };
        },

        /**
         * Process function exercise
         * Append test cases that call the function and print results
         * @private
         */
        _processFunction: function(code, exercise) {
            if (!exercise.testCases || exercise.testCases.length === 0) {
                Utils.warn('Function exercise has no test cases:', exercise.id);
                return {
                    processedCode: code,
                    mockInputs: [],
                    testCount: 0
                };
            }

            const functionName = exercise.functionName;
            const testCases = exercise.testCases;

            // Build test code
            const testLines = testCases.map(function(tc, index) {
                const argsStr = tc.args.map(function(arg) {
                    if (typeof arg === 'string') {
                        // Escape quotes in string arguments
                        const escaped = arg.replace(/"/g, '\\"');
                        return `"${escaped}"`;
                    }
                    if (Array.isArray(arg)) {
                        return JSON.stringify(arg);
                    }
                    return String(arg);
                }).join(', ');

                return `print(${functionName}(${argsStr}))`;
            });

            const testCode = '\n\n# === Test Cases ===\n' + testLines.join('\n');

            return {
                processedCode: code + testCode,
                mockInputs: [],
                testCount: testCases.length
            };
        },

        /**
         * Process with-input exercise
         * Set up mock inputs for the input() function
         * @private
         */
        _processWithInput: function(code, exercise) {
            const mockInputs = exercise.mockInputs || [];

            return {
                processedCode: code,
                mockInputs: mockInputs,
                testCount: 1
            };
        },

        /**
         * Process class exercise
         * Append test cases that instantiate class and call methods
         * @private
         */
        _processClass: function(code, exercise) {
            if (!exercise.testCases || exercise.testCases.length === 0) {
                Utils.warn('Class exercise has no test cases:', exercise.id);
                return {
                    processedCode: code,
                    mockInputs: [],
                    testCount: 0
                };
            }

            const testCases = exercise.testCases;

            // Build test code
            const testLines = testCases.map(function(tc) {
                // Each test case has setup (instantiation) and call (method call)
                return `${tc.setup}\n${tc.call}`;
            });

            const testCode = '\n\n# === Test Cases ===\n' + testLines.join('\n');

            return {
                processedCode: code + testCode,
                mockInputs: [],
                testCount: testCases.length
            };
        },

        /**
         * Validate that required function/class is defined
         * @param {string} code - Student's code
         * @param {Object} exercise - Exercise configuration
         * @returns {Object} - { valid: boolean, error: string|null }
         */
        validate: function(code, exercise) {
            if (!exercise) {
                return { valid: true, error: null };
            }

            // Check for function definition
            if (exercise.type === 'function' && exercise.functionName) {
                const funcPattern = new RegExp(`def\\s+${exercise.functionName}\\s*\\(`);
                if (!funcPattern.test(code)) {
                    return {
                        valid: false,
                        error: `'${exercise.functionName}' 함수가 정의되지 않았습니다.`
                    };
                }
            }

            // Check for class definition
            if (exercise.type === 'class' && exercise.className) {
                const classPattern = new RegExp(`class\\s+${exercise.className}\\s*[:(]`);
                if (!classPattern.test(code)) {
                    return {
                        valid: false,
                        error: `'${exercise.className}' 클래스가 정의되지 않았습니다.`
                    };
                }
            }

            // Check for dangerous code patterns
            const dangerousPatterns = [
                { pattern: /import\s+os/, message: 'os 모듈은 사용할 수 없습니다.' },
                { pattern: /import\s+subprocess/, message: 'subprocess 모듈은 사용할 수 없습니다.' },
                { pattern: /open\s*\(/, message: '파일 열기는 이 연습에서 사용할 수 없습니다.' },
                { pattern: /__import__/, message: '__import__는 사용할 수 없습니다.' },
                { pattern: /eval\s*\(/, message: 'eval()은 사용할 수 없습니다.' },
                { pattern: /exec\s*\(/, message: 'exec()은 사용할 수 없습니다.' }
            ];

            for (const dp of dangerousPatterns) {
                if (dp.pattern.test(code)) {
                    return {
                        valid: false,
                        error: dp.message
                    };
                }
            }

            return { valid: true, error: null };
        },

        /**
         * Extract expected outputs from test cases
         * @param {Object} exercise - Exercise configuration
         * @returns {string[]} - Array of expected outputs
         */
        getExpectedOutputs: function(exercise) {
            if (!exercise) {
                return [];
            }

            switch (exercise.type) {
                case 'output-only':
                case 'with-input':
                    return [exercise.expected || ''];

                case 'function':
                case 'class':
                    if (exercise.testCases) {
                        return exercise.testCases.map(function(tc) {
                            return tc.expected || '';
                        });
                    }
                    return [];

                default:
                    return [exercise.expected || ''];
            }
        },

        /**
         * Get test case descriptions for display
         * @param {Object} exercise - Exercise configuration
         * @returns {Object[]} - Array of test case info
         */
        getTestCaseInfo: function(exercise) {
            if (!exercise) {
                return [];
            }

            switch (exercise.type) {
                case 'function':
                    if (exercise.testCases) {
                        return exercise.testCases.map(function(tc, i) {
                            const argsStr = Utils.formatArgs(tc.args);
                            return {
                                name: `${exercise.functionName}(${argsStr})`,
                                expected: tc.expected,
                                index: i
                            };
                        });
                    }
                    return [];

                case 'class':
                    if (exercise.testCases) {
                        return exercise.testCases.map(function(tc, i) {
                            return {
                                name: `${tc.setup} → ${tc.call}`,
                                expected: tc.expected,
                                index: i
                            };
                        });
                    }
                    return [];

                default:
                    return [{
                        name: '출력 확인',
                        expected: exercise.expected,
                        index: 0
                    }];
            }
        }
    };

    // Export
    if (typeof window !== 'undefined') {
        window.TextGraderPreprocessor = TextGraderPreprocessor;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TextGraderPreprocessor;
    }

})();
