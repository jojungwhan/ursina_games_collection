/**
 * Turtle Grader Interceptor
 *
 * Captures turtle commands by parsing Python code directly.
 *
 * NOTE: Skulpt turtle uses HTML5 Canvas, not SVG.
 * We cannot extract shape data from canvas pixels reliably.
 * Instead, we parse the Python code to extract turtle commands
 * and simulate the turtle path mathematically.
 */

(function() {
    'use strict';

    // ========================================================================
    // STATE
    // ========================================================================

    let _currentTrace = null;
    let _isCapturing = false;
    let _captureCallbacks = [];
    let _hooksInstalled = false;
    let _lastCode = '';

    // ========================================================================
    // TRACE DATA STRUCTURE
    // ========================================================================

    /**
     * Create a new empty trace
     */
    function createEmptyTrace() {
        return {
            commands: [],
            segments: [],
            startPos: { x: 0, y: 0 },
            startHeading: 90, // Turtle default: facing up (north)
            finalPos: { x: 0, y: 0 },
            finalHeading: 90,
            penDown: true,
            timestamp: Date.now()
        };
    }

    /**
     * Reset trace for new execution
     */
    function resetTrace() {
        _currentTrace = createEmptyTrace();
    }

    // ========================================================================
    // CODE PARSING (Primary Method)
    // ========================================================================

    /**
     * Parse Python code to extract turtle commands
     *
     * @param {string} code - Python source code
     * @returns {Array} Array of command objects
     */
    function parseTurtleCode(code) {
        const commands = [];
        const lines = code.split('\n');

        // Find loop sections
        let inLoop = false;
        let loopCount = 0;
        let loopBody = [];
        let loopIndent = -1;

        lines.forEach((line) => {
            const trimmedLine = line.trim();
            const currentIndent = line.length - line.trimStart().length;

            // Check for loop start
            const loopMatch = /for\s+\w+\s+in\s+range\s*\(\s*(\d+)\s*\)\s*:/.exec(trimmedLine);
            if (loopMatch) {
                inLoop = true;
                loopCount = parseInt(loopMatch[1]);
                loopIndent = currentIndent;
                loopBody = [];
                return;
            }

            // Check if we're still in loop body
            if (inLoop) {
                if (currentIndent > loopIndent && trimmedLine !== '') {
                    loopBody.push(trimmedLine);
                    return;
                } else if (trimmedLine !== '') {
                    // Exit loop - process loop body multiple times
                    for (let i = 0; i < loopCount; i++) {
                        loopBody.forEach(bodyLine => {
                            parseLineForCommands(bodyLine, commands);
                        });
                    }
                    inLoop = false;
                    loopBody = [];
                    loopIndent = -1;
                }
            }

            // Parse non-loop lines
            if (!inLoop && trimmedLine !== '') {
                parseLineForCommands(trimmedLine, commands);
            }
        });

        // Process any remaining loop body (loop at end of code)
        if (inLoop && loopBody.length > 0) {
            for (let i = 0; i < loopCount; i++) {
                loopBody.forEach(bodyLine => {
                    parseLineForCommands(bodyLine, commands);
                });
            }
        }

        console.log('[TurtleInterceptor] Parsed', commands.length, 'commands from code');
        return commands;
    }

    /**
     * Safely evaluate a mathematical expression
     * Only allows numbers, basic operators, and parentheses
     *
     * @param {string} expr - Mathematical expression (e.g., "360/5*2", "100+50")
     * @returns {number|null} Evaluated result or null if invalid
     */
    function safeEvalMathExpr(expr) {
        if (!expr || typeof expr !== 'string') {
            return null;
        }

        // Trim whitespace
        expr = expr.trim();

        // If it's already a simple number, return it
        if (/^-?\d+\.?\d*$/.test(expr)) {
            return parseFloat(expr);
        }

        // Only allow: digits, decimal points, +, -, *, /, parentheses, spaces
        if (!/^[\d\s+\-*/().]+$/.test(expr)) {
            console.warn('[TurtleInterceptor] Invalid math expression:', expr);
            return null;
        }

        try {
            // Use Function constructor for safer eval
            const result = new Function('return ' + expr)();
            if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
                return result;
            }
            return null;
        } catch (e) {
            console.warn('[TurtleInterceptor] Failed to evaluate:', expr, e);
            return null;
        }
    }

    /**
     * Parse a single line for turtle commands
     *
     * @param {string} line - Single line of Python code
     * @param {Array} commands - Array to push commands to
     */
    function parseLineForCommands(line, commands) {
        let match;

        // Forward - now accepts expressions like "360/5*2" or "100+50"
        const fwdPattern = /(?:t\.|turtle\.)?(?:forward|fd)\s*\(\s*([^)]+)\s*\)/gi;
        while ((match = fwdPattern.exec(line)) !== null) {
            const value = safeEvalMathExpr(match[1]);
            if (value !== null) {
                commands.push({ cmd: 'forward', args: [value] });
            }
        }

        // Backward
        const bkPattern = /(?:t\.|turtle\.)?(?:backward|bk|back)\s*\(\s*([^)]+)\s*\)/gi;
        while ((match = bkPattern.exec(line)) !== null) {
            const value = safeEvalMathExpr(match[1]);
            if (value !== null) {
                commands.push({ cmd: 'backward', args: [value] });
            }
        }

        // Right turn
        const rtPattern = /(?:t\.|turtle\.)?(?:right|rt)\s*\(\s*([^)]+)\s*\)/gi;
        while ((match = rtPattern.exec(line)) !== null) {
            const value = safeEvalMathExpr(match[1]);
            if (value !== null) {
                commands.push({ cmd: 'right', args: [value] });
            }
        }

        // Left turn
        const ltPattern = /(?:t\.|turtle\.)?(?:left|lt)\s*\(\s*([^)]+)\s*\)/gi;
        while ((match = ltPattern.exec(line)) !== null) {
            const value = safeEvalMathExpr(match[1]);
            if (value !== null) {
                commands.push({ cmd: 'left', args: [value] });
            }
        }

        // Pen up
        const puPattern = /(?:t\.|turtle\.)?(?:penup|pu|up)\s*\(\s*\)/gi;
        if (puPattern.test(line)) {
            commands.push({ cmd: 'penup', args: [] });
        }

        // Pen down
        const pdPattern = /(?:t\.|turtle\.)?(?:pendown|pd|down)\s*\(\s*\)/gi;
        if (pdPattern.test(line)) {
            commands.push({ cmd: 'pendown', args: [] });
        }

        // Goto - accepts expressions for both coordinates
        const gotoPattern = /(?:t\.|turtle\.)?(?:goto|setpos|setposition)\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/gi;
        while ((match = gotoPattern.exec(line)) !== null) {
            const x = safeEvalMathExpr(match[1]);
            const y = safeEvalMathExpr(match[2]);
            if (x !== null && y !== null) {
                commands.push({ cmd: 'goto', args: [x, y] });
            }
        }

        // Set heading
        const shPattern = /(?:t\.|turtle\.)?(?:setheading|seth)\s*\(\s*([^)]+)\s*\)/gi;
        while ((match = shPattern.exec(line)) !== null) {
            const value = safeEvalMathExpr(match[1]);
            if (value !== null) {
                commands.push({ cmd: 'setheading', args: [value] });
            }
        }
    }

    /**
     * Simulate turtle movement to generate segments
     *
     * @param {Array} commands - Array of command objects
     * @returns {Object} Simulation result with segments and final state
     */
    function simulateTurtle(commands) {
        let x = 0;
        let y = 0;
        let heading = 90; // Turtle starts facing up (north)
        let penDown = true;
        const segments = [];

        commands.forEach(cmd => {
            const oldX = x;
            const oldY = y;

            switch (cmd.cmd) {
                case 'forward':
                case 'fd':
                    const fwdDist = cmd.args[0];
                    const fwdRad = heading * Math.PI / 180;
                    x += fwdDist * Math.cos(fwdRad);
                    y += fwdDist * Math.sin(fwdRad);
                    if (penDown) {
                        segments.push({
                            start: { x: oldX, y: oldY },
                            end: { x: x, y: y }
                        });
                    }
                    break;

                case 'backward':
                case 'bk':
                case 'back':
                    const bkDist = cmd.args[0];
                    const bkRad = heading * Math.PI / 180;
                    x -= bkDist * Math.cos(bkRad);
                    y -= bkDist * Math.sin(bkRad);
                    if (penDown) {
                        segments.push({
                            start: { x: oldX, y: oldY },
                            end: { x: x, y: y }
                        });
                    }
                    break;

                case 'right':
                case 'rt':
                    heading -= cmd.args[0];
                    heading = ((heading % 360) + 360) % 360;
                    break;

                case 'left':
                case 'lt':
                    heading += cmd.args[0];
                    heading = ((heading % 360) + 360) % 360;
                    break;

                case 'penup':
                case 'pu':
                case 'up':
                    penDown = false;
                    break;

                case 'pendown':
                case 'pd':
                case 'down':
                    penDown = true;
                    break;

                case 'goto':
                case 'setpos':
                case 'setposition':
                    if (penDown) {
                        segments.push({
                            start: { x: oldX, y: oldY },
                            end: { x: cmd.args[0], y: cmd.args[1] }
                        });
                    }
                    x = cmd.args[0];
                    y = cmd.args[1];
                    break;

                case 'setheading':
                case 'seth':
                    heading = cmd.args[0];
                    heading = ((heading % 360) + 360) % 360;
                    break;
            }
        });

        console.log('[TurtleInterceptor] Simulated', segments.length, 'segments');
        return {
            segments: segments,
            finalPos: { x, y },
            finalHeading: heading
        };
    }

    /**
     * Process code and generate trace
     *
     * @param {string} code - Python source code
     * @returns {Object} Trace object
     */
    function processCode(code) {
        _lastCode = code;

        if (!_currentTrace) {
            _currentTrace = createEmptyTrace();
        }

        const commands = parseTurtleCode(code);
        const simulation = simulateTurtle(commands);

        _currentTrace.commands = commands;
        _currentTrace.segments = simulation.segments;
        _currentTrace.finalPos = simulation.finalPos;
        _currentTrace.finalHeading = simulation.finalHeading;

        return _currentTrace;
    }

    // ========================================================================
    // COMMAND CAPTURE (For future Skulpt hook integration)
    // ========================================================================

    /**
     * Record a turtle command (for direct hook integration)
     *
     * @param {string} cmd - Command name (forward, right, left, etc.)
     * @param {Array} args - Command arguments
     * @param {Object} state - Turtle state after command
     */
    function recordCommand(cmd, args, state) {
        if (!_isCapturing || !_currentTrace) return;

        const command = {
            cmd: cmd,
            args: args || [],
            pos: state ? { x: state.x, y: state.y } : null,
            heading: state ? state.heading : null,
            penDown: state ? state.penDown : true,
            timestamp: Date.now()
        };

        _currentTrace.commands.push(command);

        // If this was a movement command with pen down, record segment
        if (cmd === 'forward' || cmd === 'backward' || cmd === 'fd' || cmd === 'bk') {
            if (state && state.penDown && _currentTrace.commands.length > 1) {
                const prevCmd = _currentTrace.commands[_currentTrace.commands.length - 2];
                if (prevCmd && prevCmd.pos) {
                    _currentTrace.segments.push({
                        start: { x: prevCmd.pos.x, y: prevCmd.pos.y },
                        end: { x: state.x, y: state.y }
                    });
                }
            }
        }

        // Update final position
        if (state) {
            _currentTrace.finalPos = { x: state.x, y: state.y };
            _currentTrace.finalHeading = state.heading;
        }
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    /**
     * Start capturing turtle commands
     *
     * @param {Object} options - Capture options
     * @param {string} options.canvasId - Canvas container ID
     * @param {string} options.code - Python code to process
     * @param {Function} options.onComplete - Callback when execution completes
     */
    function startCapture(options = {}) {
        resetTrace();
        _isCapturing = true;

        // If code is provided, process it immediately
        if (options.code) {
            processCode(options.code);
        }

        // Store callback for later
        if (options.onComplete) {
            _captureCallbacks.push({
                callback: options.onComplete
            });
        }

        return _currentTrace;
    }

    /**
     * Stop capturing and return the trace
     *
     * @returns {Object} Complete trace
     */
    function stopCapture() {
        _isCapturing = false;

        // Call callbacks
        _captureCallbacks.forEach(({ callback }) => {
            if (callback && _currentTrace) {
                callback(_currentTrace);
            }
        });
        _captureCallbacks = [];

        return _currentTrace;
    }

    /**
     * Get current trace (during or after capture)
     *
     * @returns {Object} Current trace
     */
    function getCurrentTrace() {
        return _currentTrace;
    }

    /**
     * Check if currently capturing
     *
     * @returns {boolean}
     */
    function isCapturing() {
        return _isCapturing;
    }

    /**
     * Install global hooks (called once on load)
     */
    function installHooks() {
        if (_hooksInstalled) return;
        _hooksInstalled = true;
        console.log('[TurtleInterceptor] Hooks ready (code-parsing mode)');
    }

    /**
     * Extract trace from code (main method for grading)
     *
     * @param {string} code - Python source code
     * @returns {Promise<Object>} Promise resolving to trace
     */
    function extractFromCode(code) {
        return new Promise((resolve) => {
            const trace = processCode(code);
            resolve(trace);
        });
    }

    /**
     * Extract after execution (legacy API, now uses code parsing)
     *
     * @param {string} canvasIdOrCode - Canvas ID or Python code
     * @returns {Promise<Object>} Extracted trace
     */
    function extractAfterExecution(canvasIdOrCode) {
        if (!_currentTrace) {
            _currentTrace = createEmptyTrace();
        }

        return new Promise((resolve) => {
            // If we have stored code from the last capture, use that
            if (_lastCode) {
                processCode(_lastCode);
            }

            // Small delay to ensure any async operations complete
            setTimeout(() => {
                console.log('[TurtleInterceptor] Final trace:', _currentTrace);
                resolve(_currentTrace);
            }, 100);
        });
    }

    /**
     * Set the code to be analyzed
     * Call this before extractAfterExecution
     *
     * @param {string} code - Python source code
     */
    function setCode(code) {
        _lastCode = code;
        processCode(code);
    }

    // ========================================================================
    // MODULE EXPORT
    // ========================================================================

    const TurtleInterceptor = {
        // Lifecycle
        startCapture,
        stopCapture,
        resetTrace,

        // Data access
        getCurrentTrace,
        isCapturing,

        // Code processing (primary method)
        processCode,
        extractFromCode,
        parseTurtleCode,
        simulateTurtle,
        setCode,

        // Manual control
        recordCommand,
        extractAfterExecution,

        // Setup
        installHooks
    };

    // Export to global scope
    if (typeof window !== 'undefined') {
        window.TurtleInterceptor = TurtleInterceptor;
    }

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TurtleInterceptor;
    }

})();
