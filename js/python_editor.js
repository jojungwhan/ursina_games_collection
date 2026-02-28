/**
 * Python Text Editor with Skulpt Execution
 * Provides a reusable text-based Python coding environment
 * Supports both turtle graphics and standard Python output
 *
 * Features:
 * - Code execution via Skulpt
 * - Solution validation with visual feedback
 * - Hint system
 * - Turtle graphics support
 *
 * Version: 2.0.3 - Fixed re-initialization bug that caused input loss on typing
 */

// Track editor instances for multi-instance support
let pythonEditorInstances = {};
let editorInstanceCounter = 0;

// Log version to confirm cache is cleared
console.log('[PythonEditor] Version 2.0.3 loaded - Fixed re-initialization bug');

/**
 * Initialize a Python editor instance
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Configuration options
 */
function initPythonEditor(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Python editor container not found:', containerId);
        return null;
    }

    // CRITICAL: Check if already initialized to prevent losing user input
    if (container.dataset.pythonEditorInitialized === 'true') {
        console.log('[PythonEditor] Already initialized, skipping:', containerId);
        return container.dataset.pythonEditorInstanceId || null;
    }

    const instanceId = 'py-editor-' + (editorInstanceCounter++);

    // Default options
    const config = {
        initialCode: options.initialCode || '# 여기에 Python 코드를 작성하세요\n',
        hasTurtle: options.hasTurtle !== false, // Default true
        height: options.height || '200px',
        canvasWidth: options.canvasWidth || 400,
        canvasHeight: options.canvasHeight || 300,
        readOnly: options.readOnly || false,
        hint: options.hint || '',
        solution: options.solution || ''
    };

    // Create mission text from options or generate default
    const missionText = options.mission || (config.solution ? '코드를 완성하고 실행하세요' : '');

    // Create editor HTML structure
    const editorHTML = `
        <div class="python-editor-container" id="${instanceId}">
            ${config.solution ? `
            <div class="editor-mission-checklist">
                <div class="editor-mission-header">
                    <span class="editor-mission-icon">🎯</span>
                    <span class="editor-mission-title">미션</span>
                    <span class="editor-mission-progress" id="${instanceId}-progress">0/2</span>
                </div>
                <div class="editor-mission-text">${missionText}</div>
                <div class="editor-mission-steps">
                    <div class="editor-mission-step" data-step="code" id="${instanceId}-step-code">
                        <span class="editor-step-indicator">
                            <span class="editor-step-number">1</span>
                            <span class="editor-step-check">✓</span>
                        </span>
                        <span class="editor-step-text">코드 완성하기</span>
                    </div>
                    <div class="editor-mission-step" data-step="run" id="${instanceId}-step-run">
                        <span class="editor-step-indicator">
                            <span class="editor-step-number">2</span>
                            <span class="editor-step-check">✓</span>
                        </span>
                        <span class="editor-step-text">실행해서 결과 확인하기</span>
                    </div>
                </div>
            </div>
            ` : ''}
            <div class="python-editor-main-container">
                <div class="python-editor-main">
                    <div class="python-editor-code-section">
                        <div class="python-editor-header">
                            <span class="python-editor-title">Python 코드</span>
                            ${config.hint ? `<button class="python-editor-hint-btn" onclick="toggleHint('${instanceId}')">💡 힌트</button>` : ''}
                            ${config.solution ? `<button class="python-editor-solution-btn" onclick="toggleSolution('${instanceId}')">📝 정답</button>` : ''}
                        </div>
                        <textarea class="python-editor-textarea"
                                  id="${instanceId}-code"
                                  style="height: ${config.height};"
                                  ${config.readOnly ? 'readonly' : ''}
                                  spellcheck="false">${config.initialCode}</textarea>
                        ${config.hint ? `<div class="python-editor-hint" id="${instanceId}-hint" style="display: none;">${config.hint}</div>` : ''}
                        ${config.solution ? `<div class="python-editor-solution" id="${instanceId}-solution" style="display: none;"><div class="python-editor-solution-title">📝 정답 코드</div><pre><code>${escapeHtml(config.solution)}</code></pre></div>` : ''}
                        <div class="python-editor-feedback" id="${instanceId}-feedback" style="display: none;"></div>
                    </div>
                    <div class="python-editor-controls">
                        <button class="python-editor-run-btn" onclick="runPythonEditor('${instanceId}')">▶ 실행</button>
                        ${config.solution ? `<button class="python-editor-check-btn" onclick="checkPythonEditor('${instanceId}')">✓ 확인</button>` : ''}
                        <button class="python-editor-clear-btn" onclick="clearPythonEditor('${instanceId}')">🗑 초기화</button>
                    </div>
                </div>
                <div class="python-editor-flowchart-section">
                    <div class="code-preview-container">
                        <div class="preview-tabs">
                            <button class="preview-tab active" data-tab="flowchart" onclick="switchPythonEditorTab('${instanceId}', 'flowchart')">흐름도</button>
                        </div>
                        <div class="preview-content">
                            <div id="${instanceId}-flowchartPanel" class="tab-panel active">
                                <div id="${instanceId}-flowchart" class="mermaid-container">
                                    <div class="flowchart-placeholder">코드를 입력하면 흐름도가 여기에 표시됩니다...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="python-editor-output-section">
                ${config.hasTurtle ? `
                <div class="python-editor-canvas-container">
                    <div class="python-editor-canvas-header">거북이 캔버스</div>
                    <div class="python-editor-canvas" id="${instanceId}-canvas"></div>
                </div>
                ` : ''}
                <div class="python-editor-console-container">
                    <div class="python-editor-console-header">출력</div>
                    <pre class="python-editor-console" id="${instanceId}-output"></pre>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = editorHTML;

    // Mark container as initialized to prevent re-initialization
    container.dataset.pythonEditorInitialized = 'true';
    container.dataset.pythonEditorInstanceId = instanceId;

    // Store instance configuration
    pythonEditorInstances[instanceId] = {
        config: config,
        initialCode: config.initialCode,
        missionState: {
            codeComplete: false,
            executed: false
        }
    };

    // Setup code change listener for real-time validation and flowchart update
    const codeEl = document.getElementById(instanceId + '-code');
    if (codeEl) {
        codeEl.addEventListener('input', function() {
            if (config.solution) {
                updateEditorMission(instanceId);
            }
            // Debounce flowchart updates
            if (pythonEditorInstances[instanceId]._flowchartTimeout) {
                clearTimeout(pythonEditorInstances[instanceId]._flowchartTimeout);
            }
            pythonEditorInstances[instanceId]._flowchartTimeout = setTimeout(function() {
                updatePythonEditorFlowchart(instanceId);
            }, 500);
        });

        // Initial flowchart render
        setTimeout(function() {
            updatePythonEditorFlowchart(instanceId);
        }, 100);
    }

    return instanceId;
}

/**
 * Update editor mission checklist state
 */
function updateEditorMission(instanceId) {
    const instance = pythonEditorInstances[instanceId];
    if (!instance || !instance.config.solution) return;

    const codeEl = document.getElementById(instanceId + '-code');
    const stepCodeEl = document.getElementById(instanceId + '-step-code');
    const stepRunEl = document.getElementById(instanceId + '-step-run');
    const progressEl = document.getElementById(instanceId + '-progress');

    if (!codeEl) return;

    const userCode = codeEl.value;
    const solution = instance.config.solution;

    // Check if code matches solution patterns
    const patternCheck = checkRequiredPatterns(userCode, solution);
    instance.missionState.codeComplete = patternCheck.valid;

    // Update step 1 (code)
    if (stepCodeEl) {
        if (instance.missionState.codeComplete) {
            stepCodeEl.classList.add('completed');
            stepCodeEl.classList.remove('active');
        } else {
            stepCodeEl.classList.add('active');
            stepCodeEl.classList.remove('completed');
        }
    }

    // Update step 2 (run)
    if (stepRunEl) {
        if (instance.missionState.executed && instance.missionState.codeComplete) {
            stepRunEl.classList.add('completed');
            stepRunEl.classList.remove('active');
        } else if (instance.missionState.codeComplete) {
            stepRunEl.classList.add('active');
            stepRunEl.classList.remove('completed');
        } else {
            stepRunEl.classList.remove('active', 'completed');
        }
    }

    // Update progress
    if (progressEl) {
        let completed = 0;
        if (instance.missionState.codeComplete) completed++;
        if (instance.missionState.executed && instance.missionState.codeComplete) completed++;
        progressEl.textContent = `${completed}/2`;
        if (completed === 2) {
            progressEl.classList.add('complete');
        } else {
            progressEl.classList.remove('complete');
        }
    }

    // Update container class for overall completion
    const containerEl = document.getElementById(instanceId);
    if (containerEl) {
        if (instance.missionState.codeComplete && instance.missionState.executed) {
            containerEl.classList.add('mission-complete');
        } else {
            containerEl.classList.remove('mission-complete');
        }
    }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Toggle hint visibility
 */
function toggleHint(instanceId) {
    const hintEl = document.getElementById(instanceId + '-hint');
    if (hintEl) {
        hintEl.style.display = hintEl.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * Toggle solution visibility
 */
function toggleSolution(instanceId) {
    const solutionEl = document.getElementById(instanceId + '-solution');
    if (solutionEl) {
        solutionEl.style.display = solutionEl.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * Normalize code for comparison
 * Removes comments, extra whitespace, and normalizes line endings
 */
function normalizeCode(code) {
    return code
        .split('\n')
        .map(line => {
            // Remove inline comments (but keep strings)
            let inString = false;
            let stringChar = '';
            let result = '';
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (!inString && (char === '"' || char === "'")) {
                    inString = true;
                    stringChar = char;
                    result += char;
                } else if (inString && char === stringChar && line[i-1] !== '\\') {
                    inString = false;
                    result += char;
                } else if (!inString && char === '#') {
                    break; // Stop at comment
                } else {
                    result += char;
                }
            }
            return result.trim();
        })
        .filter(line => line.length > 0) // Remove empty lines
        .join('\n')
        .toLowerCase() // Case insensitive
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

/**
 * Check if code contains required patterns
 */
function checkRequiredPatterns(code, solution) {
    // Extract key patterns from solution
    const patterns = [];

    // Check for import statements
    const importMatch = solution.match(/import\s+(\w+)/g);
    if (importMatch) {
        patterns.push(...importMatch.map(p => p.toLowerCase()));
    }

    // Check for function calls like turtle.done(), t.forward(100), etc.
    const callMatch = solution.match(/\w+\.\w+\s*\([^)]*\)/g);
    if (callMatch) {
        callMatch.forEach(call => {
            // Normalize the call pattern
            const normalized = call.toLowerCase().replace(/\s+/g, '');
            patterns.push(normalized);
        });
    }

    // Check for variable assignments
    const assignMatch = solution.match(/^\s*(\w+)\s*=\s*.+/gm);
    if (assignMatch) {
        assignMatch.forEach(assign => {
            // Just check that similar assignment exists
            const varName = assign.match(/^\s*(\w+)\s*=/)[1];
            patterns.push(varName.toLowerCase() + ' =');
        });
    }

    const normalizedCode = code.toLowerCase().replace(/\s+/g, ' ');

    const missing = [];
    for (const pattern of patterns) {
        const searchPattern = pattern.replace(/\s+/g, '');
        const codeNoSpace = normalizedCode.replace(/\s+/g, '');
        if (!codeNoSpace.includes(searchPattern)) {
            missing.push(pattern);
        }
    }

    return {
        valid: missing.length === 0,
        missing: missing
    };
}

/**
 * Check Python editor code against solution
 */
function checkPythonEditor(instanceId) {
    const instance = pythonEditorInstances[instanceId];
    if (!instance || !instance.config.solution) {
        console.warn('No solution available for:', instanceId);
        return;
    }

    const codeEl = document.getElementById(instanceId + '-code');
    const feedbackEl = document.getElementById(instanceId + '-feedback');
    const containerEl = document.getElementById(instanceId);

    if (!codeEl || !feedbackEl) return;

    const userCode = codeEl.value;
    const solution = instance.config.solution;

    // First, check if code is essentially empty or unchanged
    if (!userCode.trim() || userCode.trim() === instance.initialCode.trim()) {
        showFeedback(feedbackEl, 'warning', '코드를 작성해주세요!', '힌트를 확인하고 코드를 완성하세요.');
        return;
    }

    // Check for required patterns
    const patternCheck = checkRequiredPatterns(userCode, solution);

    if (patternCheck.valid) {
        // Success!
        showFeedback(feedbackEl, 'success', '🎉 정답입니다!', '잘했어요! 실행 버튼을 눌러 결과를 확인하세요.');
        containerEl.classList.add('editor-success');
        containerEl.classList.remove('editor-error');

        // Mark as completed
        instance.completed = true;
    } else {
        // Show what's missing
        let hint = '';
        if (patternCheck.missing.length > 0) {
            const missingHints = patternCheck.missing.slice(0, 2).map(m => `<code>${m}</code>`);
            hint = `다음이 빠졌어요: ${missingHints.join(', ')}`;
        }
        showFeedback(feedbackEl, 'error', '아직 완성되지 않았어요', hint || '코드를 다시 확인해주세요.');
        containerEl.classList.add('editor-error');
        containerEl.classList.remove('editor-success');
    }
}

/**
 * Show feedback message
 */
function showFeedback(feedbackEl, type, title, message) {
    feedbackEl.style.display = 'block';
    feedbackEl.className = `python-editor-feedback feedback-${type}`;
    feedbackEl.innerHTML = `
        <div class="feedback-title">${title}</div>
        ${message ? `<div class="feedback-message">${message}</div>` : ''}
    `;

    // Auto-hide after delay for success
    if (type === 'success') {
        setTimeout(() => {
            feedbackEl.classList.add('feedback-fade');
        }, 5000);
    }
}

/**
 * Clear editor to initial state
 */
function clearPythonEditor(instanceId) {
    const instance = pythonEditorInstances[instanceId];
    if (!instance) return;

    const codeEl = document.getElementById(instanceId + '-code');
    const outputEl = document.getElementById(instanceId + '-output');
    const canvasEl = document.getElementById(instanceId + '-canvas');
    const feedbackEl = document.getElementById(instanceId + '-feedback');
    const containerEl = document.getElementById(instanceId);

    if (codeEl) codeEl.value = instance.initialCode;
    if (outputEl) {
        outputEl.textContent = '';
        outputEl.className = 'python-editor-console';
    }
    if (canvasEl) canvasEl.innerHTML = '';
    if (feedbackEl) {
        feedbackEl.style.display = 'none';
        feedbackEl.className = 'python-editor-feedback';
    }
    if (containerEl) {
        containerEl.classList.remove('editor-success', 'editor-error', 'mission-complete');
    }

    // Reset completion state
    instance.completed = false;

    // Reset mission state
    if (instance.missionState) {
        instance.missionState.codeComplete = false;
        instance.missionState.executed = false;
        updateEditorMission(instanceId);
    }
}

/**
 * Run Python code using Skulpt
 */
function runPythonEditor(instanceId) {
    const instance = pythonEditorInstances[instanceId];
    if (!instance) {
        console.error('Python editor instance not found:', instanceId);
        return;
    }

    const codeEl = document.getElementById(instanceId + '-code');
    const outputEl = document.getElementById(instanceId + '-output');
    const canvasEl = document.getElementById(instanceId + '-canvas');

    if (!codeEl || !outputEl) {
        console.error('Required elements not found for instance:', instanceId);
        return;
    }

    // Clear previous output
    outputEl.textContent = '';
    outputEl.className = 'python-editor-console';

    let pythonCode = codeEl.value;

    if (!pythonCode || pythonCode.trim() === '' || pythonCode.trim() === '# 여기에 Python 코드를 작성하세요') {
        outputEl.textContent = '코드를 입력해주세요.';
        outputEl.className = 'python-editor-console error';
        return;
    }

    // Preprocess code for Skulpt compatibility
    // 1. Normalize line endings (Windows CRLF to LF)
    pythonCode = pythonCode.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 2. Remove non-ASCII characters that would cause Skulpt tokenizer errors
    pythonCode = pythonCode.split('\n').map(function(line) {
        const trimmed = line.trim();

        // If line is only a comment, check for non-ASCII and remove if found
        if (trimmed.startsWith('#')) {
            if (/[^\x00-\x7F]/.test(trimmed)) {
                return '# ...'; // Replace with empty comment
            }
            return line;
        }

        // For lines with code + comment
        const commentIndex = line.indexOf('#');
        if (commentIndex !== -1) {
            const beforeComment = line.substring(0, commentIndex);
            const singleQuotes = (beforeComment.match(/'/g) || []).length;
            const doubleQuotes = (beforeComment.match(/"/g) || []).length;
            // If # is not inside a string
            if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0) {
                const commentPart = line.substring(commentIndex);
                if (/[^\x00-\x7F]/.test(commentPart)) {
                    return beforeComment.trimEnd(); // Remove the comment entirely
                }
            }
        }

        // For lines with Korean text NOT in a comment (user edited the line)
        // Remove trailing non-ASCII text that's not inside quotes
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
            // If the whole line is Korean or starts with Korean, keep as empty
            if (/^\s*[^\x00-\x7F]/.test(line)) {
                return '';
            }
        }

        return line;
    }).join('\n');

    console.log('Preprocessed Python code:', pythonCode);

    // Configure Skulpt output
    function outf(text) {
        outputEl.textContent += text;
        outputEl.className = 'python-editor-console success';
    }

    function builtinRead(x) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
        return Sk.builtinFiles["files"][x];
    }

    // Reset Skulpt's turtle state to avoid caching issues
    if (Sk.TurtleGraphics) {
        Sk.TurtleGraphics = undefined;
    }

    // Clear any cached modules to ensure fresh execution
    if (Sk.sysmodules) {
        Sk.sysmodules = new Sk.builtin.dict([]);
    }

    // Configure turtle graphics if canvas exists
    if (canvasEl && instance.config.hasTurtle) {
        // Clear canvas first
        canvasEl.innerHTML = '';

        // Create a unique canvas ID for this instance
        const canvasId = instanceId + '-turtle-canvas';
        canvasEl.innerHTML = `<div id="${canvasId}" style="width: ${instance.config.canvasWidth}px; height: ${instance.config.canvasHeight}px;"></div>`;

        // Set up turtle graphics target
        Sk.TurtleGraphics = {
            target: canvasId,
            width: instance.config.canvasWidth,
            height: instance.config.canvasHeight
        };

        // Watch for canvas elements and fix positioning
        const turtleDiv = document.getElementById(canvasId);
        if (turtleDiv) {
            turtleDiv.style.position = 'relative';

            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            const canvases = node.tagName === 'CANVAS' ? [node] : (node.querySelectorAll ? node.querySelectorAll('canvas') : []);
                            canvases.forEach(function(canvas) {
                                canvas.style.position = 'relative';
                            });
                        }
                    });
                });
            });
            observer.observe(turtleDiv, { childList: true, subtree: true });
        }
    } else if (canvasEl) {
        canvasEl.innerHTML = '';
    }

    // Configure Skulpt
    Sk.configure({
        output: outf,
        read: builtinRead,
        __future__: Sk.python3
    });

    // Execute the Python code
    Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, pythonCode, true);
    }).then(function() {
        console.log('Python execution completed for:', instanceId);

        // Mark execution as successful
        if (instance.missionState) {
            instance.missionState.executed = true;
            updateEditorMission(instanceId);
        }

        // Fix canvas positioning after execution
        if (canvasEl) {
            setTimeout(() => {
                const canvases = canvasEl.querySelectorAll('canvas');
                canvases.forEach(canvas => {
                    canvas.style.position = 'relative';
                });
            }, 100);
        }
    }).catch(function(e) {
        if (e instanceof Sk.builtin.SystemExit) {
            // SystemExit is normal - still counts as successful execution
            if (instance.missionState) {
                instance.missionState.executed = true;
                updateEditorMission(instanceId);
            }
            return;
        }
        outputEl.textContent = '오류: ' + e.toString();
        outputEl.className = 'python-editor-console error';
        console.error('Skulpt execution error:', e);
    });
}

/**
 * Create multiple editors from HTML markers
 * Looks for elements with class 'python-editor-placeholder' and data attributes
 */
function initAllPythonEditors() {
    const placeholders = document.querySelectorAll('.python-editor-placeholder');

    placeholders.forEach(function(placeholder) {
        const containerId = placeholder.id;
        if (!containerId) {
            console.warn('Python editor placeholder missing id attribute');
            return;
        }

        // Get options from data attributes
        const options = {
            initialCode: placeholder.dataset.code ? decodeURIComponent(placeholder.dataset.code) : undefined,
            hasTurtle: placeholder.dataset.turtle !== 'false',
            height: placeholder.dataset.height,
            canvasWidth: placeholder.dataset.canvasWidth ? parseInt(placeholder.dataset.canvasWidth) : undefined,
            canvasHeight: placeholder.dataset.canvasHeight ? parseInt(placeholder.dataset.canvasHeight) : undefined,
            hint: placeholder.dataset.hint ? decodeURIComponent(placeholder.dataset.hint) : undefined,
            solution: placeholder.dataset.solution ? decodeURIComponent(placeholder.dataset.solution) : undefined,
            mission: placeholder.dataset.mission ? decodeURIComponent(placeholder.dataset.mission) : undefined
        };

        initPythonEditor(containerId, options);
    });
}

// Initialize editors when DOM is ready
document.addEventListener('DOMContentLoaded', initAllPythonEditors);

// Support MkDocs Material instant loading
if (typeof document$ !== 'undefined') {
    document$.subscribe(function() {
        initAllPythonEditors();
    });
}

// Also check on navigation changes (fallback)
let lastEditorUrl = location.href;
new MutationObserver(function() {
    const url = location.href;
    if (url !== lastEditorUrl) {
        lastEditorUrl = url;
        setTimeout(initAllPythonEditors, 100);
    }
}).observe(document, { subtree: true, childList: true });

/**
 * Update flowchart for a Python editor instance
 */
function updatePythonEditorFlowchart(instanceId) {
    const instance = pythonEditorInstances[instanceId];
    if (!instance) return;

    const codeEl = document.getElementById(instanceId + '-code');
    const flowchartEl = document.getElementById(instanceId + '-flowchart');

    if (!codeEl || !flowchartEl) return;

    const code = codeEl.value;

    // Check if PythonFlowchartGenerator is available
    if (typeof getPythonFlowchartGenerator === 'function') {
        const generator = getPythonFlowchartGenerator();
        generator.render(code, flowchartEl);
    } else {
        // Fallback: show placeholder
        flowchartEl.innerHTML = '<div class="flowchart-placeholder">흐름도 생성기를 로딩 중입니다...</div>';
    }
}

/**
 * Switch tabs in Python editor (for future extensibility)
 */
function switchPythonEditorTab(instanceId, tabName) {
    // Currently only one tab (flowchart), but this supports future tabs
    const container = document.getElementById(instanceId);
    if (!container) return;

    // Update tab buttons
    const tabs = container.querySelectorAll('.preview-tab');
    tabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update tab panels
    const panels = container.querySelectorAll('.tab-panel');
    panels.forEach(panel => {
        const panelId = panel.id;
        if (panelId.includes(tabName)) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });

    // If switching to flowchart, update it
    if (tabName === 'flowchart') {
        updatePythonEditorFlowchart(instanceId);
    }
}
