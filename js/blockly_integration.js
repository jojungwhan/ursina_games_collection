/**
 * Blockly + Skulpt Integration
 * Main entry point for single-workspace Blockly pages
 *
 * Dependencies (load in order):
 * 1. shared/config.js
 * 2. shared/configuration_manager.js
 * 3. shared/turtle_blocks_config.js
 * 4. shared/turtle_blocks_registrar.js
 * 5. shared/python_executor.js
 * 6. shared/workspace_manager.js
 * 7. shared/mermaid_flowchart_generator.js
 * 8. shared/blockly_environment.js
 *
 * Version: 2.1.0 - Removed duplicate functions (initTabs, addRefreshButton, setupTurtleOutputLayout)
 *                  now uses shared versions from blockly_workspace.js
 */

console.log('[BlocklyIntegration] Version 2.1.0 loaded - Uses shared UI functions');

// ============================================================================
// LINK INTERCEPTION FOR BLOCKLY PAGES
// Force full page reload when navigating to/from Blockly pages
// ============================================================================

(function() {
    function isBlocklyPageUrl(url) {
        return url.includes('/pre_basics/') ||
               url.includes('blockly_demo') ||
               url.includes('blockly');
    }

    function handleClick(e) {
        const link = e.target.closest('a');
        if (!link || !link.href) return;

        // Only intercept internal links (same origin)
        try {
            const linkUrl = new URL(link.href);
            if (linkUrl.origin !== window.location.origin) return;
        } catch (err) {
            return;
        }

        // Check if current page is a Blockly page
        const isCurrentBlocklyPage = document.getElementById('blocklyDiv') !== null;

        // Check if target is a Blockly page
        const isTargetBlocklyPage = isBlocklyPageUrl(link.href);

        // Force reload when navigating TO or FROM a Blockly page
        if (isCurrentBlocklyPage || isTargetBlocklyPage) {
            e.preventDefault();
            e.stopImmediatePropagation();
            window.location.assign(link.href);
            return false;
        }
    }

    document.addEventListener('click', handleClick, true);

    function addBodyListener() {
        if (document.body) {
            document.body.addEventListener('click', handleClick, true);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addBodyListener);
    } else {
        addBodyListener();
    }
})();

// ============================================================================
// INITIALIZATION GUARD
// ============================================================================

// Prevent double initialization when both integration files are loaded
let _singleWorkspaceInitialized = false;

/**
 * Check if this page should use single workspace mode
 * Returns false if page has multi-instance chunks (handled by blockly_multi_instance.js)
 * @returns {boolean}
 */
function shouldUseSingleWorkspace() {
    // If page has data-blockly-chunk elements, it's a multi-instance page
    const hasMultiChunks = document.querySelectorAll('[data-blockly-chunk]').length > 0;
    if (hasMultiChunks) {
        return false;
    }
    // Only initialize if blocklyDiv exists
    return document.getElementById('blocklyDiv') !== null;
}

// ============================================================================
// ENVIRONMENT INITIALIZATION
// ============================================================================

/**
 * Get the Blockly environment instance
 * @returns {Object}
 */
function getEnvironment() {
    if (typeof getBlocklyEnvironment === 'function') {
        return getBlocklyEnvironment();
    }
    // Fallback for when BlocklyEnvironment is not available
    return null;
}

// ============================================================================
// FLOWCHART UPDATE
// ============================================================================

/**
 * Update the flowchart display
 */
async function updateFlowchart() {
    const env = getEnvironment();

    // Use environment's flowchart generator if available
    if (env && typeof env.getFlowchartGenerator === 'function') {
        const generator = env.getFlowchartGenerator();
        const workspace = env.getWorkspace();
        if (generator && workspace) {
            await generator.render(workspace, 'mermaidDisplay');
            return;
        }
    }

    // Fallback: use global functions
    const workspace = typeof getWorkspace === 'function' ? getWorkspace() : window.blocklyWorkspace;
    const mermaidDisplay = document.getElementById('mermaidDisplay');

    if (!mermaidDisplay || !workspace) return;

    // Use global flowchart generator if available
    if (typeof getFlowchartGenerator === 'function') {
        const generator = getFlowchartGenerator();
        await generator.render(workspace, mermaidDisplay);
        return;
    }

    // Legacy fallback
    if (typeof generateMermaidFromWorkspace === 'function') {
        const mermaidCode = generateMermaidFromWorkspace(workspace);
        if (!mermaidCode) {
            mermaidDisplay.innerHTML = '<div class="flowchart-placeholder">블록을 추가하면 흐름도가 여기에 표시됩니다...</div>';
            return;
        }
        // Render with mermaid
        if (typeof mermaid !== 'undefined' && mermaid.render) {
            try {
                const { svg } = await mermaid.render('mermaid-diagram-' + Date.now(), mermaidCode);
                mermaidDisplay.innerHTML = '<div class="mermaid-rendered">' + svg + '</div>';
            } catch (e) {
                console.warn('Error rendering Mermaid:', e);
            }
        }
    }
}

// ============================================================================
// MAIN INITIALIZATION
// ============================================================================

/**
 * Initialize Blockly workspace using new class-based architecture
 */
function initBlocklyWorkspaceMain() {
    const blocklyDiv = document.getElementById('blocklyDiv');
    const hasBlocklyDiv = blocklyDiv !== null;

    // Debug logging
    console.log('Blockly integration: initBlocklyWorkspaceMain called', {
        hasBlocklyDiv: hasBlocklyDiv,
        alreadyInitialized: _singleWorkspaceInitialized,
        hasWorkspace: !!window.blocklyWorkspace
    });

    // Guard: Don't initialize if already done
    if (_singleWorkspaceInitialized && window.blocklyWorkspace) {
        console.log('Blockly integration: Already initialized, skipping');
        return window.blocklyWorkspace;
    }

    // Check if this page has multi-instance chunks (handled by blockly_multi_instance.js)
    const hasMultiChunks = document.querySelectorAll('[data-blockly-chunk]').length > 0;
    if (hasMultiChunks) {
        console.log('Blockly integration: Multi-instance page, skipping single workspace init');
        return null;
    }

    // Check if blocklyDiv exists
    if (!hasBlocklyDiv) {
        console.log('Blockly integration: No blocklyDiv found on this page');
        return null;
    }

    _singleWorkspaceInitialized = true;
    console.log('Blockly integration: Initializing single workspace mode');

    const env = getEnvironment();

    // Use BlocklyEnvironment if available
    if (env) {
        env.initialize();
        const workspaceManager = env.getWorkspaceManager();

        if (workspaceManager && typeof workspaceManager.initialize === 'function') {
            const workspace = workspaceManager.initialize({
                divId: 'blocklyDiv',
                toolboxId: 'toolbox',
                onCodeChange: function(pythonCode) {
                    const codeDisplay = document.getElementById('pythonCodeDisplay');
                    if (codeDisplay) {
                        if (codeDisplay.tagName === 'PRE' || codeDisplay.tagName === 'CODE') {
                            codeDisplay.textContent = pythonCode;
                        } else {
                            codeDisplay.value = pythonCode;
                        }
                    }
                    // Update flowchart if panel is active
                    const flowchartPanel = document.getElementById('flowchartPanel');
                    if (flowchartPanel && flowchartPanel.classList.contains('active')) {
                        updateFlowchart();
                    }
                }
            });

            if (workspace) {
                // Expose workspace globally for backwards compatibility
                window.blocklyWorkspace = workspace;

                // Setup tabs (use shared function from blockly_workspace.js)
                initTabs('.preview-tab', '.tab-panel', function(targetTab) {
                    if (targetTab === 'flowchart') {
                        updateFlowchart();
                    }
                });

                // Add refresh button (use shared function from blockly_workspace.js)
                addRefreshButton(document.getElementById('blocklyDiv'));

                // Setup turtle output layout (use shared function from blockly_workspace.js)
                setupTurtleOutputLayout();

                return workspace;
            }
        }
    }

    // Fallback: Use modular init if available
    if (typeof initBlocklyWorkspaceModular === 'function') {
        return initBlocklyWorkspaceModular({
            divId: 'blocklyDiv',
            toolboxId: 'toolbox',
            codeDisplayId: 'pythonCodeDisplay',
            onFlowchartUpdate: updateFlowchart
        });
    }

    // Final fallback: minimal initialization
    return initBlocklyFallback();
}

/**
 * Fallback initialization when no classes are available
 */
function initBlocklyFallback() {
    const blocklyDiv = document.getElementById('blocklyDiv');
    if (!blocklyDiv) return null;

    const toolboxElement = document.getElementById('toolbox');

    try {
        if (typeof Blockly === 'undefined') return null;

        // Register turtle blocks
        if (typeof window.registerTurtleBlocks === 'function') {
            window.registerTurtleBlocks(Blockly);
        }

        // Clone toolbox and remove ID to avoid duplicates
        let toolbox = null;
        if (toolboxElement) {
            toolbox = toolboxElement.cloneNode(true);
            toolbox.removeAttribute('id');
        }

        const workspace = Blockly.inject('blocklyDiv', {
            toolbox: toolbox,
            media: 'https://unpkg.com/blockly/media/',
            horizontalLayout: false,
            toolboxPosition: 'start',
            trashcan: true
        });

        window.blocklyWorkspace = workspace;
        Blockly.svgResize(workspace);

        // Add default turtle blocks if workspace is empty and has turtle blocks
        if (workspace && toolboxElement && typeof window.addDefaultTurtleBlocks === 'function') {
            setTimeout(() => {
                window.addDefaultTurtleBlocks(workspace, toolboxElement);
            }, 100);
        }

        // Setup flyout position fixes
        if (typeof createFlyoutObserver === 'function') {
            createFlyoutObserver(blocklyDiv);
        }
        if (typeof setupFlyoutClickFix === 'function') {
            setupFlyoutClickFix(blocklyDiv);
        }

        return workspace;
    } catch (e) {
        console.error('Error initializing Blockly:', e);
        return null;
    }
}

// Note: UI setup functions (initTabs, addRefreshButton, setupTurtleOutputLayout)
// are now provided by shared/blockly_workspace.js to avoid duplication

// ============================================================================
// CODE EXECUTION
// ============================================================================

/**
 * Execute Python code using Skulpt
 */
function runit() {
    const outputCanvas = document.getElementById('outputCanvas');
    if (!outputCanvas) {
        console.error('Output canvas not found');
        return;
    }

    const env = getEnvironment();

    // Clear outputs
    outputCanvas.textContent = '';
    outputCanvas.className = 'console-area';
    const mycanvas = document.getElementById('mycanvas');
    if (mycanvas) mycanvas.innerHTML = '';

    // Get Python code
    let pythonCode = '';
    const workspace = env ? env.getWorkspace() :
        (typeof getWorkspace === 'function' ? getWorkspace() : window.blocklyWorkspace);

    const codeDisplay = document.getElementById('pythonCodeDisplay');
    const placeholder = '# 블록을 추가하면 Python 코드가 여기에 표시됩니다...';

    if (codeDisplay) {
        pythonCode = codeDisplay.tagName === 'PRE' || codeDisplay.tagName === 'CODE'
            ? codeDisplay.textContent : codeDisplay.value;
    }

    if (!pythonCode || pythonCode.trim() === '' || pythonCode.trim() === placeholder) {
        if (workspace) {
            try {
                pythonCode = Blockly.Python.workspaceToCode(workspace);
            } catch (e) {
                outputCanvas.textContent = 'Error generating code: ' + e.toString();
                outputCanvas.className = 'console-area error';
                return;
            }
        } else {
            outputCanvas.textContent = 'Error: No Python code found.';
            outputCanvas.className = 'console-area error';
            return;
        }
    }

    if (!pythonCode || pythonCode.trim() === '') {
        outputCanvas.textContent = 'No code to execute. Please add some blocks.';
        outputCanvas.className = 'error';
        return;
    }

    // Use BlocklyEnvironment's executor if available
    if (env && typeof env.createPythonExecutor === 'function') {
        const executor = env.createPythonExecutor({
            outputElement: outputCanvas,
            canvasId: 'mycanvas',
            canvasWidth: 400,
            canvasHeight: 300
        });
        executor.execute(pythonCode);
        return;
    }

    // Use global PythonExecutor if available
    if (typeof createPythonExecutor === 'function') {
        const executor = createPythonExecutor({
            outputElement: outputCanvas,
            canvasId: 'mycanvas',
            canvasWidth: 400,
            canvasHeight: 300
        });
        executor.execute(pythonCode);
        return;
    }

    // Fallback execution
    executeWithSkulptFallback(pythonCode, outputCanvas, mycanvas);
}

/**
 * Preprocess Python code for Skulpt compatibility
 * Removes non-ASCII characters from comments and code lines
 */
function preprocessPythonCode(code) {
    // Normalize line endings
    code = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove non-ASCII characters that would cause Skulpt tokenizer errors
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
 * Fallback Skulpt execution
 */
function executeWithSkulptFallback(pythonCode, outputCanvas, mycanvas) {
    // Preprocess code for Skulpt compatibility
    pythonCode = preprocessPythonCode(pythonCode);

    function outf(text) {
        outputCanvas.textContent += text;
        outputCanvas.className = 'console-area success';
    }

    function builtinRead(x) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw new Error("File not found: '" + x + "'");
        return Sk.builtinFiles["files"][x];
    }

    if (mycanvas) mycanvas.style.position = 'relative';

    Sk.TurtleGraphics = { target: 'mycanvas', width: 400, height: 300 };
    Sk.configure({ output: outf, read: builtinRead, __future__: Sk.python3 });

    Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, pythonCode, true);
    }).then(function() {
        console.log('Python execution completed');
    }).catch(function(e) {
        if (e instanceof Sk.builtin.SystemExit) return;
        outputCanvas.textContent = 'Error: ' + e.toString();
        outputCanvas.className = 'console-area error';
    });
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initBlocklyWorkspaceMain);

// Ensure flyout fix is set up after page load
window.addEventListener('load', function() {
    setTimeout(function() {
        const blocklyDiv = document.getElementById('blocklyDiv');
        if (blocklyDiv) {
            if (typeof createFlyoutObserver === 'function') {
                createFlyoutObserver(blocklyDiv);
            }
            if (typeof setupFlyoutClickFix === 'function') {
                setupFlyoutClickFix(blocklyDiv);
            }
        }
    }, 100);
});

// Window load - delayed resize
window.addEventListener('load', function() {
    setTimeout(function() {
        const env = getEnvironment();
        if (env) {
            const workspaceManager = env.getWorkspaceManager();
            if (workspaceManager && typeof workspaceManager.resize === 'function') {
                workspaceManager.resize();
                return;
            }
        }
        const workspace = typeof getWorkspace === 'function' ? getWorkspace() : window.blocklyWorkspace;
        if (workspace && typeof Blockly !== 'undefined') {
            Blockly.svgResize(workspace);
        }
    }, 500);
});

// MkDocs support - reset state on navigation
let _resetPending = false;
let _resetTimeout = null;
let _lastResetTime = 0;
let _lastSuccessfulUrl = '';

/**
 * Get URL without hash for comparison
 * Hash changes don't require workspace reset
 */
function getUrlWithoutHash(url) {
    return url.split('#')[0];
}

function resetAndInit() {
    const now = Date.now();
    const timeSinceLastReset = now - _lastResetTime;
    const currentUrlNoHash = getUrlWithoutHash(location.href);
    const lastUrlNoHash = getUrlWithoutHash(_lastSuccessfulUrl);

    // Ignore hash-only changes - the page content doesn't change
    if (currentUrlNoHash === lastUrlNoHash && window.blocklyWorkspace) {
        console.log('Blockly integration: Hash-only change, skipping reset');
        return;
    }

    // Strong debounce: prevent any reset within 500ms of the last one
    if (timeSinceLastReset < 500) {
        console.log('Blockly integration: Debounce active (500ms), skipping', {
            timeSinceLastReset: timeSinceLastReset
        });
        return;
    }

    // If reset is already pending, skip
    if (_resetPending) {
        console.log('Blockly integration: Reset already pending, skipping');
        return;
    }

    // If we already initialized this URL (without hash) and workspace exists, skip
    if (currentUrlNoHash === lastUrlNoHash && window.blocklyWorkspace) {
        console.log('Blockly integration: Already initialized for this URL, skipping');
        return;
    }

    console.log('Blockly integration: resetAndInit starting', {
        lastUrl: _lastSuccessfulUrl,
        currentUrl: location.href,
        isNewPage: currentUrlNoHash !== lastUrlNoHash
    });

    _lastResetTime = now;
    _resetPending = true;

    // Clear any existing timeout
    if (_resetTimeout) {
        clearTimeout(_resetTimeout);
        _resetTimeout = null;
    }

    // Reset initialization flag for new page
    _singleWorkspaceInitialized = false;

    // Use proper reset function if available (disposes workspace, resets flags)
    if (typeof window.resetWorkspaceState === 'function') {
        window.resetWorkspaceState();
    } else {
        // Fallback: just set to null
        window.blocklyWorkspace = null;
    }

    // Delay to ensure DOM is fully updated after MkDocs navigation
    _resetTimeout = setTimeout(function() {
        // Keep _resetPending true until init completes to block any new resets
        _resetTimeout = null;

        // Verify DOM elements exist before initializing
        const blocklyDiv = document.getElementById('blocklyDiv');
        const toolbox = document.getElementById('toolbox');

        console.log('Blockly integration: Post-reset check', {
            hasBlocklyDiv: !!blocklyDiv,
            hasToolbox: !!toolbox,
            blocklyLoaded: typeof Blockly !== 'undefined'
        });

        if (blocklyDiv && toolbox) {
            initBlocklyWorkspaceMain();
            // Save URL without hash for comparison
            _lastSuccessfulUrl = getUrlWithoutHash(location.href);
            console.log('Blockly integration: Initialized successfully for', _lastSuccessfulUrl);

            // Ensure refresh button exists even if init had issues
            addRefreshButton(blocklyDiv);
        } else if (blocklyDiv) {
            // blocklyDiv exists but toolbox doesn't - add refresh button as fallback
            console.log('Blockly integration: Toolbox not found, adding refresh button');
            addRefreshButton(blocklyDiv);
        } else {
            console.log('Blockly integration: Required elements not found, skipping init');
        }

        // Release the lock after everything is done
        _resetPending = false;
    }, 350);
}

if (typeof setupMkDocsSupport === 'function') {
    setupMkDocsSupport(resetAndInit);
} else {
    if (typeof document$ !== 'undefined') {
        document$.subscribe(resetAndInit);
    }

    // Only use MutationObserver as fallback if document$ is not available
    if (typeof document$ === 'undefined') {
        let lastUrl = location.href;
        new MutationObserver(function() {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                resetAndInit();
            }
        }).observe(document, { subtree: true, childList: true });
    }
}

// Resize support
if (typeof setupResizeHandler === 'function') {
    setupResizeHandler();
} else {
    window.addEventListener('resize', function() {
        const env = getEnvironment();
        if (env) {
            const workspaceManager = env.getWorkspaceManager();
            if (workspaceManager && typeof workspaceManager.resize === 'function') {
                workspaceManager.resize();
                return;
            }
        }
        const workspace = typeof getWorkspace === 'function' ? getWorkspace() : window.blocklyWorkspace;
        if (workspace && typeof Blockly !== 'undefined') {
            Blockly.svgResize(workspace);
        }
    });

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(function() {
                const env = getEnvironment();
                if (env) {
                    const workspaceManager = env.getWorkspaceManager();
                    if (workspaceManager && typeof workspaceManager.resize === 'function') {
                        workspaceManager.resize();
                        return;
                    }
                }
                const workspace = typeof getWorkspace === 'function' ? getWorkspace() : window.blocklyWorkspace;
                if (workspace && typeof Blockly !== 'undefined') {
                    Blockly.svgResize(workspace);
                }
            }, 100);
        }
    });
}

// Note: Removed redundant click handler - document$ observable handles navigation

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof window !== 'undefined') {
    window.initBlocklyWorkspaceMain = initBlocklyWorkspaceMain;
    window.resetAndInitBlockly = resetAndInit;
    window.updateFlowchart = updateFlowchart;
    window.runit = runit;
}
