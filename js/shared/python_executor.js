/**
 * PythonExecutor - Skulpt Abstraction Layer
 * Provides a clean interface for executing Python code via Skulpt
 *
 * Version: 2.0.1 - Added Korean comment preprocessing for Skulpt compatibility
 */

console.log('[PythonExecutor] Version 2.0.1 loaded - Korean preprocessing enabled');

/**
 * Default configuration for PythonExecutor
 */
const PYTHON_EXECUTOR_DEFAULTS = {
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 300
};

/**
 * PythonExecutor class - encapsulates Skulpt execution
 */
class PythonExecutor {
    /**
     * Create a PythonExecutor instance
     * @param {Object} options - Configuration options
     * @param {Function} options.onOutput - Callback for output text
     * @param {Function} options.onError - Callback for errors
     * @param {string} options.canvasTarget - ID of canvas element for turtle graphics
     * @param {number} options.canvasWidth - Width of turtle canvas
     * @param {number} options.canvasHeight - Height of turtle canvas
     */
    constructor(options = {}) {
        this.onOutput = options.onOutput || console.log;
        this.onError = options.onError || console.error;
        this.canvasTarget = options.canvasTarget || null;
        this.canvasWidth = options.canvasWidth || PYTHON_EXECUTOR_DEFAULTS.CANVAS_WIDTH;
        this.canvasHeight = options.canvasHeight || PYTHON_EXECUTOR_DEFAULTS.CANVAS_HEIGHT;
    }

    /**
     * Read built-in files for Skulpt
     * @private
     */
    _builtinRead(filename) {
        if (typeof Sk === 'undefined') {
            throw new Error('Skulpt library not loaded');
        }
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][filename] === undefined) {
            throw new Error("File not found: '" + filename + "'");
        }
        return Sk.builtinFiles["files"][filename];
    }

    /**
     * Setup turtle graphics canvas
     * @private
     */
    _setupTurtleCanvas() {
        if (!this.canvasTarget) return;

        const canvasElement = document.getElementById(this.canvasTarget);
        if (!canvasElement) return;

        // Fix canvas positioning
        canvasElement.style.position = 'relative';

        // Configure Skulpt turtle graphics
        Sk.TurtleGraphics = {
            target: this.canvasTarget,
            width: this.canvasWidth,
            height: this.canvasHeight
        };

        // Setup observer to fix canvas positioning when created
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        const canvases = node.tagName === 'CANVAS'
                            ? [node]
                            : (node.querySelectorAll ? node.querySelectorAll('canvas') : []);
                        canvases.forEach((canvas) => {
                            this._fixCanvasPosition(canvas);
                        });
                    }
                });
            });
        });

        observer.observe(canvasElement, {
            childList: true,
            subtree: true
        });

        return observer;
    }

    /**
     * Fix canvas element positioning
     * @private
     */
    _fixCanvasPosition(canvas) {
        canvas.style.position = 'relative';
        canvas.style.top = '';
        canvas.style.left = '';
        canvas.style.right = '';
        canvas.style.bottom = '';
    }

    /**
     * Fix all canvases in a container after execution
     * @private
     */
    _fixAllCanvases() {
        if (!this.canvasTarget) return;

        const container = document.getElementById(this.canvasTarget);
        if (!container) return;

        container.style.position = 'relative';
        const canvases = container.querySelectorAll('canvas');
        canvases.forEach((canvas) => {
            this._fixCanvasPosition(canvas);
        });
    }

    /**
     * Preprocess code for Skulpt compatibility
     * Handles Korean/non-ASCII characters in comments and normalizes line endings
     * @private
     * @param {string} code - Original Python code
     * @returns {string} - Preprocessed code
     */
    _preprocessCode(code) {
        // 1. Normalize line endings (Windows CRLF to LF)
        code = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // 2. Remove non-ASCII characters that would cause Skulpt tokenizer errors
        code = code.split('\n').map(function(line) {
            const trimmed = line.trim();

            // If line is only a comment, check for non-ASCII and remove if found
            if (trimmed.startsWith('#')) {
                if (/[^\x00-\x7F]/.test(trimmed)) {
                    return '# ...';
                }
                return line;
            }

            // For lines with code + comment
            const commentIndex = line.indexOf('#');
            if (commentIndex !== -1) {
                const beforeComment = line.substring(0, commentIndex);
                const singleQuotes = (beforeComment.match(/'/g) || []).length;
                const doubleQuotes = (beforeComment.match(/"/g) || []).length;
                if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0) {
                    const commentPart = line.substring(commentIndex);
                    if (/[^\x00-\x7F]/.test(commentPart)) {
                        return beforeComment.trimEnd();
                    }
                }
            }

            // For lines with Korean text NOT in a comment
            if (/[^\x00-\x7F]/.test(line)) {
                // Check if non-ASCII characters are inside string literals
                // If so, preserve the entire line (Skulpt can handle strings with non-ASCII)
                let inString = false;
                let quoteChar = null;
                let nonAsciiInString = false;
                let escapeNext = false;
                
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    
                    if (escapeNext) {
                        escapeNext = false;
                        continue;
                    }
                    
                    if (char === '\\') {
                        escapeNext = true;
                        continue;
                    }
                    
                    // Handle quotes
                    if (char === "'" || char === '"') {
                        if (!inString) {
                            // Opening a new string
                            inString = true;
                            quoteChar = char;
                        } else if (char === quoteChar) {
                            // Closing the current string (matching quote type)
                            inString = false;
                            quoteChar = null;
                        }
                        // If quote type doesn't match, it's part of the string content
                    } else if (inString) {
                        // We're inside a string - check if this character is non-ASCII
                        if (/[^\x00-\x7F]/.test(char)) {
                            nonAsciiInString = true;
                            // Found non-ASCII in string - we can preserve the line
                            // Continue checking to be thorough, but we know we'll preserve it
                        }
                    }
                }
                
                // If any non-ASCII is in a string, preserve the entire line
                if (nonAsciiInString) {
                    return line;
                }
                
                // Otherwise, try to truncate at a safe point
                const match = line.match(/^(.*?[\)\]\}\w\d\s"'])\s*[^\x00-\x7F].*$/);
                if (match) {
                    return match[1].trimEnd();
                }
                if (/^\s*[^\x00-\x7F]/.test(line)) {
                    return '';
                }
            }

            return line;
        }).join('\n');

        return code;
    }

    /**
     * Execute Python code
     * @param {string} code - Python code to execute
     * @returns {Promise} - Promise that resolves when execution completes
     */
    async execute(code) {
        if (typeof Sk === 'undefined') {
            const error = new Error('Skulpt library not loaded');
            this.onError(error);
            return Promise.reject(error);
        }

        if (!code || code.trim() === '') {
            const error = new Error('No code to execute');
            this.onError(error);
            return Promise.reject(error);
        }

        // Preprocess code for Skulpt compatibility
        code = this._preprocessCode(code);

        // Reset Skulpt turtle state
        if (Sk.TurtleGraphics) {
            Sk.TurtleGraphics = undefined;
        }
        if (Sk.sysmodules) {
            Sk.sysmodules = new Sk.builtin.dict([]);
        }

        // Setup turtle canvas if specified
        const observer = this._setupTurtleCanvas();

        // Configure Skulpt
        const self = this;
        Sk.configure({
            output: function(text) {
                self.onOutput(text);
            },
            read: this._builtinRead.bind(this),
            __future__: Sk.python3
        });

        // Execute code
        return Sk.misceval.asyncToPromise(function() {
            return Sk.importMainWithBody("<stdin>", false, code, true);
        }).then(() => {
            console.log('Python execution completed successfully');
            // Fix canvas positioning after execution
            setTimeout(() => {
                this._fixAllCanvases();
            }, 100);
            return { success: true };
        }).catch((error) => {
            // SystemExit is normal, don't treat as error
            if (error instanceof Sk.builtin.SystemExit) {
                return { success: true, systemExit: true };
            }
            this.onError(error);
            throw error;
        }).finally(() => {
            // Cleanup observer if exists
            if (observer) {
                setTimeout(() => observer.disconnect(), 500);
            }
        });
    }

    /**
     * Clear the output and canvas
     * @param {HTMLElement} outputElement - Output element to clear
     */
    clearOutput(outputElement) {
        if (outputElement) {
            outputElement.textContent = '';
            outputElement.className = '';
        }
        if (this.canvasTarget) {
            const canvas = document.getElementById(this.canvasTarget);
            if (canvas) {
                canvas.innerHTML = '';
            }
        }
    }
}

/**
 * Factory function to create a PythonExecutor with output element handling
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.outputElement - Element to display output
 * @param {string} options.canvasId - ID of canvas element
 * @param {number} options.canvasWidth - Canvas width
 * @param {number} options.canvasHeight - Canvas height
 * @returns {PythonExecutor}
 */
function createPythonExecutor(options = {}) {
    const outputElement = options.outputElement;

    return new PythonExecutor({
        onOutput: function(text) {
            if (outputElement) {
                outputElement.textContent += text;
                outputElement.className = 'success';
            }
        },
        onError: function(error) {
            if (outputElement) {
                outputElement.textContent = 'Error: ' + error.toString();
                outputElement.className = 'error';
            }
            console.error('Skulpt execution error:', error);
        },
        canvasTarget: options.canvasId,
        canvasWidth: options.canvasWidth || PYTHON_EXECUTOR_DEFAULTS.CANVAS_WIDTH,
        canvasHeight: options.canvasHeight || PYTHON_EXECUTOR_DEFAULTS.CANVAS_HEIGHT
    });
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.PythonExecutor = PythonExecutor;
    window.createPythonExecutor = createPythonExecutor;
    window.PYTHON_EXECUTOR_DEFAULTS = PYTHON_EXECUTOR_DEFAULTS;
}
