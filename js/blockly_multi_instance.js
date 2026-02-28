/**
 * Blockly Multi-Instance Support
 * Allows multiple independent Blockly workspaces on a single page
 *
 * Dependencies (load in order):
 * 1. shared/config.js
 * 2. shared/configuration_manager.js
 * 3. shared/turtle_blocks_config.js
 * 4. shared/turtle_blocks_registrar.js
 * 5. shared/python_executor.js
 * 6. shared/mermaid_flowchart_generator.js
 * 7. shared/blockly_chunk_registry.js
 * 8. shared/blockly_environment.js
 */

// ============================================================================
// INITIALIZATION GUARD
// ============================================================================

// Prevent double initialization
let _multiInstanceInitialized = false;

/**
 * Check if this page should use multi-instance mode
 * @returns {boolean}
 */
function shouldUseMultiInstance() {
    // Only initialize if page has data-blockly-chunk elements
    return document.querySelectorAll('[data-blockly-chunk]').length > 0;
}

// ============================================================================
// ENVIRONMENT ACCESS
// ============================================================================

/**
 * Get the Blockly environment instance
 * @returns {Object|null}
 */
function getMultiInstanceEnvironment() {
    if (typeof getBlocklyEnvironment === 'function') {
        return getBlocklyEnvironment();
    }
    return null;
}

/**
 * Get the chunk registry instance
 * @returns {Object|null}
 */
function getMultiInstanceRegistry() {
    const env = getMultiInstanceEnvironment();
    if (env && typeof env.getChunkRegistry === 'function') {
        return env.getChunkRegistry();
    }
    if (typeof getChunkRegistry === 'function') {
        return getChunkRegistry();
    }
    return null;
}

// ============================================================================
// BACKWARDS COMPATIBILITY - Store for legacy code
// ============================================================================

const BlocklyChunks = {
    get instances() {
        const registry = getMultiInstanceRegistry();
        if (registry) {
            const result = {};
            for (const id of registry.getIds()) {
                result[id] = registry.get(id);
            }
            return result;
        }
        return this._legacyInstances || {};
    },
    set instances(val) {
        this._legacyInstances = val;
    },
    _legacyInstances: {},
    blocksRegistered: false
};

// ============================================================================
// CHUNK INITIALIZATION
// ============================================================================

/**
 * Register turtle blocks once globally
 */
function registerTurtleBlocksOnce() {
    if (BlocklyChunks.blocksRegistered) return;

    const env = getMultiInstanceEnvironment();
    if (env) {
        const registrar = env.getRegistrar();
        if (registrar && typeof registrar.ensureRegistered === 'function') {
            registrar.ensureRegistered();
            BlocklyChunks.blocksRegistered = true;
            return;
        }
    }

    // Fallback: use global registerTurtleBlocks
    if (typeof window.registerTurtleBlocks === 'function' && typeof Blockly !== 'undefined') {
        window.registerTurtleBlocks(Blockly);
        BlocklyChunks.blocksRegistered = true;
        console.log('Turtle blocks registered via shared module (multi-instance)');
        return;
    }

    BlocklyChunks.blocksRegistered = true;
    console.log('Turtle blocks registration delegated to other modules');
}

/**
 * Initialize a Blockly chunk instance
 * @param {Object} config - Configuration object
 * @returns {Object|null}
 */
function initBlocklyChunk(config) {
    // Use BlocklyChunkRegistry if available
    const registry = getMultiInstanceRegistry();
    if (registry && typeof registry.initialize === 'function') {
        return registry.initialize(config);
    }

    // Fallback: legacy initialization
    return initBlocklyChunkLegacy(config);
}

/**
 * Legacy chunk initialization (fallback)
 * @param {Object} config - Configuration object
 * @returns {Object|null}
 */
function initBlocklyChunkLegacy(config) {
    const {
        chunkId,
        blocklyDivId,
        toolboxId,
        codeDisplayId,
        mermaidDisplayId,
        canvasId,
        outputId,
        runBtnId
    } = config;

    const blocklyDiv = document.getElementById(blocklyDivId);
    if (!blocklyDiv) {
        console.warn(`Blockly div not found: ${blocklyDivId}`);
        return null;
    }

    const toolboxElement = document.getElementById(toolboxId);
    if (!toolboxElement) {
        console.warn(`Toolbox not found: ${toolboxId}`);
        return null;
    }

    // Register blocks
    registerTurtleBlocksOnce();

    // Clean up existing instance
    if (BlocklyChunks._legacyInstances[chunkId]) {
        try {
            BlocklyChunks._legacyInstances[chunkId].workspace.dispose();
        } catch (e) {
            // Ignore
        }
        delete BlocklyChunks._legacyInstances[chunkId];
    }

    blocklyDiv.innerHTML = '';

    try {
        // Clone toolbox and remove ID to avoid duplicates
        const toolbox = toolboxElement.cloneNode(true);
        toolbox.removeAttribute('id');

        const workspace = Blockly.inject(blocklyDivId, {
            toolbox: toolbox,
            media: 'https://unpkg.com/blockly/media/',
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            },
            trashcan: true,
            grid: {
                spacing: 20,
                length: 3,
                colour: '#ccc',
                snap: true
            }
        });

        const instance = {
            chunkId,
            workspace,
            config
        };
        BlocklyChunks._legacyInstances[chunkId] = instance;

        // Add default turtle blocks if workspace is empty and has turtle blocks
        if (workspace && toolboxElement && typeof window.addDefaultTurtleBlocks === 'function') {
            setTimeout(() => {
                window.addDefaultTurtleBlocks(workspace, toolboxElement);
            }, 100);
        }

        // Code change listener
        workspace.addChangeListener(function(event) {
            if (event.isUiEvent) return;

            try {
                const pythonCode = Blockly.Python.workspaceToCode(workspace);
                const codeDisplay = document.getElementById(codeDisplayId);
                if (codeDisplay) {
                    if (codeDisplay.tagName === 'PRE' || codeDisplay.tagName === 'CODE') {
                        codeDisplay.textContent = pythonCode || '# 블록을 추가하면 코드가 표시됩니다...';
                    } else {
                        codeDisplay.value = pythonCode;
                    }
                }

                if (mermaidDisplayId) {
                    const mermaidDisplay = document.getElementById(mermaidDisplayId);
                    const flowchartPanel = mermaidDisplay ? mermaidDisplay.closest('.tab-panel') : null;
                    if (flowchartPanel && flowchartPanel.classList.contains('active')) {
                        updateChunkFlowchart(chunkId);
                    }
                }
            } catch (e) {
                console.warn('Error generating code for chunk ' + chunkId + ':', e);
            }
        });

        Blockly.svgResize(workspace);

        // Run button
        const runBtn = document.getElementById(runBtnId);
        if (runBtn) {
            runBtn.onclick = function() {
                runChunkCode(chunkId);
            };
        }

        // Tabs
        initChunkTabs(chunkId);

        console.log(`Blockly chunk "${chunkId}" initialized successfully`);
        return instance;

    } catch (error) {
        console.error(`Error initializing Blockly chunk "${chunkId}":`, error);
        return null;
    }
}

/**
 * Initialize tab switching for a specific chunk
 * @param {string} chunkId - Chunk identifier
 */
function initChunkTabs(chunkId) {
    const tabContainer = document.querySelector(`[data-chunk="${chunkId}"] .preview-tabs, #tabs-${chunkId}`);
    if (!tabContainer) return;

    const tabs = tabContainer.querySelectorAll('.preview-tab');
    const panelContainer = tabContainer.closest('.code-preview-container');
    if (!panelContainer) return;

    const panels = panelContainer.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `${targetTab}Panel-${chunkId}`) {
                    panel.classList.add('active');
                }
            });

            if (targetTab === 'flowchart') {
                updateChunkFlowchart(chunkId);
            }
        });
    });
}

// ============================================================================
// FLOWCHART GENERATION
// ============================================================================

/**
 * Update flowchart for a specific chunk
 * @param {string} chunkId - Chunk identifier
 */
async function updateChunkFlowchart(chunkId) {
    // Use registry if available
    const registry = getMultiInstanceRegistry();
    if (registry && typeof registry.updateFlowchart === 'function') {
        await registry.updateFlowchart(chunkId);
        return;
    }

    // Fallback: legacy implementation
    const instance = BlocklyChunks._legacyInstances[chunkId];
    if (!instance) return;

    const mermaidDisplayId = instance.config.mermaidDisplayId;
    if (!mermaidDisplayId) return;

    const mermaidDisplay = document.getElementById(mermaidDisplayId);
    if (!mermaidDisplay) return;

    // Use flowchart generator if available
    if (typeof getFlowchartGenerator === 'function') {
        const generator = getFlowchartGenerator();
        await generator.render(instance.workspace, mermaidDisplay);
        return;
    }

    // Simple fallback
    const mermaidCode = generateSimpleFlowchart(instance.workspace);
    if (!mermaidCode) {
        mermaidDisplay.innerHTML = '<div class="flowchart-placeholder">블록을 추가하면 흐름도가 표시됩니다...</div>';
        return;
    }

    try {
        if (typeof mermaid !== 'undefined' && mermaid.render) {
            const diagramId = `mermaid-${chunkId}-${Date.now()}`;
            const { svg } = await mermaid.render(diagramId, mermaidCode);
            const currentDisplay = document.getElementById(mermaidDisplayId);
            if (currentDisplay) {
                currentDisplay.innerHTML = '<div class="mermaid-rendered">' + svg + '</div>';
            }
        }
    } catch (e) {
        console.warn('Flowchart rendering error:', e);
        mermaidDisplay.innerHTML = '<div class="flowchart-placeholder">흐름도 생성 중...</div>';
    }
}

/**
 * Generate simple flowchart from workspace (fallback)
 * @param {Object} workspace - Blockly workspace
 * @returns {string|null}
 */
function generateSimpleFlowchart(workspace) {
    const topBlocks = workspace.getTopBlocks(true);
    if (topBlocks.length === 0) return null;

    const lines = ['flowchart TD'];
    lines.push('    START([시작])');

    let nodeCounter = 0;
    let prevNode = 'START';

    function getBlockLabel(block) {
        const type = block.type;
        if (type === 'turtle_setup') return '거북이 시작';
        if (type === 'turtle_done') return '거북이 끝';
        if (type === 'turtle_shape') return '모양: ' + (block.getFieldValue('SHAPE') || 'turtle');
        if (type === 'turtle_forward') return '앞으로';
        if (type === 'turtle_backward') return '뒤로';
        if (type === 'turtle_right') return '오른쪽';
        if (type === 'turtle_left') return '왼쪽';
        if (type === 'turtle_penup') return '펜 올리기';
        if (type === 'turtle_pendown') return '펜 내리기';
        if (type === 'turtle_pencolor') return '펜 색상: ' + (block.getFieldValue('COLOR') || 'black');
        if (type === 'turtle_reset') return '화면 지우기';
        if (type === 'turtle_clear') return '그림만 지우기';
        return type.replace(/_/g, ' ');
    }

    function processBlock(block) {
        if (!block || block.isShadow()) return;

        const nodeId = 'N' + (nodeCounter++);
        const label = getBlockLabel(block).replace(/"/g, "'");

        if (block.type === 'turtle_setup' || block.type === 'turtle_done') {
            lines.push(`    ${nodeId}([${label}])`);
        } else {
            lines.push(`    ${nodeId}[${label}]`);
        }
        lines.push(`    ${prevNode} --> ${nodeId}`);
        prevNode = nodeId;

        const nextBlock = block.getNextBlock();
        if (nextBlock) {
            processBlock(nextBlock);
        }
    }

    topBlocks.forEach(block => {
        if (!block.isShadow()) {
            processBlock(block);
        }
    });

    lines.push('    END([끝])');
    lines.push(`    ${prevNode} --> END`);

    return lines.join('\n');
}

// ============================================================================
// CODE EXECUTION
// ============================================================================

/**
 * Run code for a specific chunk
 * @param {string} chunkId - Chunk identifier
 */
function runChunkCode(chunkId) {
    // Use registry if available
    const registry = getMultiInstanceRegistry();
    if (registry && typeof registry.runCode === 'function') {
        registry.runCode(chunkId);
        return;
    }

    // Fallback: legacy implementation
    const instance = BlocklyChunks._legacyInstances[chunkId];
    if (!instance) {
        console.error('Chunk not found:', chunkId);
        return;
    }

    const config = instance.config;
    const outputElement = document.getElementById(config.outputId);
    const canvasElement = document.getElementById(config.canvasId);

    // Clear
    if (outputElement) {
        outputElement.textContent = '';
        outputElement.className = '';
    }
    if (canvasElement) {
        canvasElement.innerHTML = '';
    }

    // Get code
    let pythonCode = '';
    try {
        pythonCode = Blockly.Python.workspaceToCode(instance.workspace);
    } catch (e) {
        if (outputElement) {
            outputElement.textContent = 'Error generating code: ' + e.toString();
            outputElement.className = 'error';
        }
        return;
    }

    if (!pythonCode || pythonCode.trim() === '') {
        if (outputElement) {
            outputElement.textContent = '블록을 추가해주세요.';
            outputElement.className = 'error';
        }
        return;
    }

    // Use PythonExecutor if available
    if (typeof window.createPythonExecutor === 'function') {
        const executor = window.createPythonExecutor({
            outputElement: outputElement,
            canvasId: config.canvasId,
            canvasWidth: 400,
            canvasHeight: 400
        });
        executor.execute(pythonCode).then(function() {
            console.log(`Chunk ${chunkId}: Python execution completed`);
        });
        return;
    }

    // Fallback execution
    function outf(text) {
        if (outputElement) {
            outputElement.textContent += text;
            outputElement.className = 'success';
        }
    }

    function builtinRead(x) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw new Error("File not found: '" + x + "'");
        return Sk.builtinFiles["files"][x];
    }

    if (canvasElement) {
        canvasElement.style.position = 'relative';
        Sk.TurtleGraphics = {
            target: config.canvasId,
            width: 400,
            height: 400
        };
    }

    Sk.configure({
        output: outf,
        read: builtinRead,
        __future__: Sk.python3
    });

    Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, pythonCode, true);
    }).then(function() {
        console.log(`Chunk ${chunkId}: Python execution completed`);
        setTimeout(() => {
            if (canvasElement) {
                canvasElement.style.position = 'relative';
                const canvases = canvasElement.querySelectorAll('canvas');
                canvases.forEach(c => {
                    c.style.position = 'relative';
                });
            }
        }, 100);
    }).catch(function(e) {
        if (e instanceof Sk.builtin.SystemExit) return;
        if (outputElement) {
            outputElement.textContent = 'Error: ' + e.toString();
            outputElement.className = 'error';
        }
        console.error(`Chunk ${chunkId} error:`, e);
    });
}

// ============================================================================
// AUTO-INITIALIZATION
// ============================================================================

/**
 * Initialize all chunks on the page
 */
function initAllBlocklyChunks() {
    // Guard: Don't initialize if already done or if this is a single-workspace page
    if (_multiInstanceInitialized) {
        return;
    }

    if (!shouldUseMultiInstance()) {
        console.log('Blockly multi-instance: Skipping init (no data-blockly-chunk elements found)');
        return;
    }

    _multiInstanceInitialized = true;
    console.log('Blockly multi-instance: Initializing multi-instance mode');

    // Use registry if available
    const registry = getMultiInstanceRegistry();
    if (registry && typeof registry.initializeAll === 'function') {
        registry.initializeAll();
        return;
    }

    // Fallback: manual discovery and initialization
    const chunkConfigs = document.querySelectorAll('[data-blockly-chunk]');

    chunkConfigs.forEach(element => {
        const chunkId = element.getAttribute('data-blockly-chunk');
        const config = {
            chunkId: chunkId,
            blocklyDivId: `blocklyDiv-${chunkId}`,
            toolboxId: `toolbox-${chunkId}`,
            codeDisplayId: `pythonCodeDisplay-${chunkId}`,
            mermaidDisplayId: `mermaidDisplay-${chunkId}`,
            canvasId: `mycanvas-${chunkId}`,
            outputId: `outputCanvas-${chunkId}`,
            runBtnId: `runBtn-${chunkId}`
        };

        initBlocklyChunk(config);
    });
}

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initAllBlocklyChunks, 100);
});

/**
 * Reset state and reinitialize for MkDocs navigation
 */
function resetAndInitMultiInstance() {
    // Check if this page will use multi-instance mode
    // Don't reset state if this is a single-workspace page
    const willUseMultiInstance = document.querySelectorAll('[data-blockly-chunk]').length > 0;

    if (!willUseMultiInstance) {
        // For single-workspace pages, just reset our flag and exit
        // Don't touch BlocklyChunks.blocksRegistered as it might interfere
        _multiInstanceInitialized = false;
        console.log('Blockly multi-instance: Single workspace page, minimal reset');
        return;
    }

    console.log('Blockly multi-instance: Resetting for multi-instance page');

    // Reset initialization flag for new page
    _multiInstanceInitialized = false;
    BlocklyChunks.blocksRegistered = false;

    // Clean up existing instances
    for (const id in BlocklyChunks._legacyInstances) {
        try {
            BlocklyChunks._legacyInstances[id].workspace.dispose();
        } catch (e) {
            // Ignore disposal errors
        }
    }
    BlocklyChunks._legacyInstances = {};

    // Small delay to ensure DOM is updated
    setTimeout(initAllBlocklyChunks, 100);
}

// Support MkDocs Material instant loading
if (typeof document$ !== 'undefined') {
    document$.subscribe(resetAndInitMultiInstance);
} else {
    // Fallback: Use MutationObserver to detect URL changes
    let lastUrl = location.href;
    new MutationObserver(function() {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            resetAndInitMultiInstance();
        }
    }).observe(document, { subtree: true, childList: true });
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof window !== 'undefined') {
    window.initBlocklyChunk = initBlocklyChunk;
    window.runChunkCode = runChunkCode;
    window.updateChunkFlowchart = updateChunkFlowchart;
    window.initAllBlocklyChunks = initAllBlocklyChunks;
    window.resetAndInitMultiInstance = resetAndInitMultiInstance;
    window.BlocklyChunks = BlocklyChunks;
}
