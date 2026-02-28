/**
 * Blockly Chunk Registry Class
 * Manages multiple independent Blockly workspace instances
 *
 * Dependencies:
 * - configuration_manager.js (optional)
 * - turtle_blocks_registrar.js (optional)
 * - mermaid_flowchart_generator.js (optional)
 */

class BlocklyChunkInstance {
    /**
     * @param {string} chunkId - Unique chunk identifier
     * @param {Object} workspace - Blockly workspace
     * @param {Object} config - Chunk configuration
     */
    constructor(chunkId, workspace, config) {
        this.chunkId = chunkId;
        this.workspace = workspace;
        this.config = config;
        this.createdAt = Date.now();
    }

    /**
     * Generate Python code from workspace
     * @returns {string}
     */
    generateCode() {
        if (!this.workspace) return '';
        try {
            return Blockly.Python.workspaceToCode(this.workspace);
        } catch (e) {
            console.warn(`BlocklyChunkInstance[${this.chunkId}]: Error generating code:`, e);
            return '';
        }
    }

    /**
     * Dispose workspace
     */
    dispose() {
        if (this.workspace) {
            try {
                this.workspace.dispose();
            } catch (e) {
                // Ignore disposal errors
            }
            this.workspace = null;
        }
    }
}

class BlocklyChunkRegistry {
    /**
     * @param {Object} options - Configuration options
     * @param {Object} options.blockly - Blockly library instance
     * @param {Object} options.config - ConfigurationManager instance
     * @param {Object} options.registrar - TurtleBlocksRegistrar instance
     * @param {Object} options.flowchartGenerator - MermaidFlowchartGenerator instance
     */
    constructor(options = {}) {
        this._blockly = options.blockly || null;
        this._config = options.config || null;
        this._registrar = options.registrar || null;
        this._flowchartGenerator = options.flowchartGenerator || null;
        this._instances = new Map();
    }

    // ========================================================================
    // GETTERS
    // ========================================================================

    /**
     * Get Blockly library (lazy load)
     * @returns {Object|null}
     */
    getBlockly() {
        if (this._blockly) return this._blockly;
        if (typeof window !== 'undefined' && typeof window.Blockly !== 'undefined') {
            this._blockly = window.Blockly;
        }
        return this._blockly;
    }

    /**
     * Get configuration manager (lazy load)
     * @returns {Object|null}
     */
    getConfig() {
        if (this._config) return this._config;
        if (typeof window !== 'undefined' && typeof window.getConfigManager === 'function') {
            this._config = window.getConfigManager();
        }
        return this._config;
    }

    /**
     * Get turtle blocks registrar (lazy load)
     * @returns {Object|null}
     */
    getRegistrar() {
        if (this._registrar) return this._registrar;
        if (typeof window !== 'undefined' && typeof window.getTurtleBlocksRegistrar === 'function') {
            this._registrar = window.getTurtleBlocksRegistrar();
        }
        return this._registrar;
    }

    /**
     * Get flowchart generator (lazy load)
     * @returns {Object|null}
     */
    getFlowchartGenerator() {
        if (this._flowchartGenerator) return this._flowchartGenerator;
        if (typeof window !== 'undefined' && typeof window.getFlowchartGenerator === 'function') {
            this._flowchartGenerator = window.getFlowchartGenerator();
        }
        return this._flowchartGenerator;
    }

    // ========================================================================
    // INSTANCE MANAGEMENT
    // ========================================================================

    /**
     * Get a chunk instance by ID
     * @param {string} chunkId - Chunk identifier
     * @returns {BlocklyChunkInstance|null}
     */
    get(chunkId) {
        return this._instances.get(chunkId) || null;
    }

    /**
     * Check if a chunk exists
     * @param {string} chunkId - Chunk identifier
     * @returns {boolean}
     */
    has(chunkId) {
        return this._instances.has(chunkId);
    }

    /**
     * Get all chunk IDs
     * @returns {string[]}
     */
    getIds() {
        return Array.from(this._instances.keys());
    }

    /**
     * Get all chunk instances
     * @returns {BlocklyChunkInstance[]}
     */
    getAll() {
        return Array.from(this._instances.values());
    }

    /**
     * Get number of chunks
     * @returns {number}
     */
    get size() {
        return this._instances.size;
    }

    // ========================================================================
    // WORKSPACE CREATION
    // ========================================================================

    /**
     * Create workspace configuration
     * @param {Element} toolbox - Toolbox element
     * @returns {Object}
     * @private
     */
    _getWorkspaceConfig(toolbox) {
        const config = this.getConfig();
        const blocklyConfig = config ? config.getBlocklyConfig() : null;

        return {
            toolbox: toolbox,
            media: blocklyConfig?.MEDIA_PATH || 'https://unpkg.com/blockly/media/',
            zoom: blocklyConfig?.ZOOM || {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            },
            trashcan: blocklyConfig?.TRASHCAN !== false,
            grid: blocklyConfig?.GRID || {
                spacing: 20,
                length: 3,
                colour: '#ccc',
                snap: true
            }
        };
    }

    /**
     * Initialize a new chunk
     * @param {Object} chunkConfig - Chunk configuration
     * @returns {BlocklyChunkInstance|null}
     */
    initialize(chunkConfig) {
        const {
            chunkId,
            blocklyDivId,
            toolboxId,
            codeDisplayId,
            mermaidDisplayId,
            canvasId,
            outputId,
            runBtnId
        } = chunkConfig;

        if (!chunkId) {
            console.error('BlocklyChunkRegistry: chunkId is required');
            return null;
        }

        const blockly = this.getBlockly();
        if (!blockly) {
            console.error('BlocklyChunkRegistry: Blockly library not available');
            return null;
        }

        // Check container
        const blocklyDiv = document.getElementById(blocklyDivId);
        if (!blocklyDiv) {
            console.warn(`BlocklyChunkRegistry: Blockly div not found: ${blocklyDivId}`);
            return null;
        }

        // Check toolbox
        const toolboxElement = document.getElementById(toolboxId);
        if (!toolboxElement) {
            console.warn(`BlocklyChunkRegistry: Toolbox not found: ${toolboxId}`);
            return null;
        }

        // Register blocks
        const registrar = this.getRegistrar();
        if (registrar) {
            registrar.ensureRegistered();
        } else if (typeof window !== 'undefined' && typeof window.registerTurtleBlocks === 'function') {
            window.registerTurtleBlocks(blockly);
        }

        // Dispose existing instance
        this.dispose(chunkId);

        // Clear container
        blocklyDiv.innerHTML = '';

        try {
            // Clone toolbox and remove ID to avoid duplicates
            const toolbox = toolboxElement.cloneNode(true);
            toolbox.removeAttribute('id');

            // Create workspace
            const workspaceConfig = this._getWorkspaceConfig(toolbox);
            const workspace = blockly.inject(blocklyDivId, workspaceConfig);

            // Create instance
            const instance = new BlocklyChunkInstance(chunkId, workspace, chunkConfig);
            this._instances.set(chunkId, instance);

            // Setup code change listener
            this._setupCodeChangeListener(instance, codeDisplayId, mermaidDisplayId);

            // Resize
            blockly.svgResize(workspace);

            // Setup run button
            this._setupRunButton(instance, runBtnId);

            // Setup tabs
            this._setupTabs(chunkId);

            console.log(`BlocklyChunkRegistry: Chunk "${chunkId}" initialized`);
            return instance;

        } catch (error) {
            console.error(`BlocklyChunkRegistry: Error initializing chunk "${chunkId}":`, error);
            return null;
        }
    }

    /**
     * Setup code change listener for a chunk
     * @param {BlocklyChunkInstance} instance - Chunk instance
     * @param {string} codeDisplayId - Code display element ID
     * @param {string} mermaidDisplayId - Mermaid display element ID
     * @private
     */
    _setupCodeChangeListener(instance, codeDisplayId, mermaidDisplayId) {
        const workspace = instance.workspace;
        const chunkId = instance.chunkId;
        const self = this;

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

                // Update flowchart if panel is active
                if (mermaidDisplayId) {
                    const mermaidDisplay = document.getElementById(mermaidDisplayId);
                    const flowchartPanel = mermaidDisplay ? mermaidDisplay.closest('.tab-panel') : null;
                    if (flowchartPanel && flowchartPanel.classList.contains('active')) {
                        self.updateFlowchart(chunkId);
                    }
                }
            } catch (e) {
                console.warn(`BlocklyChunkRegistry: Error generating code for "${chunkId}":`, e);
            }
        });
    }

    /**
     * Setup run button for a chunk
     * @param {BlocklyChunkInstance} instance - Chunk instance
     * @param {string} runBtnId - Run button element ID
     * @private
     */
    _setupRunButton(instance, runBtnId) {
        const runBtn = document.getElementById(runBtnId);
        if (!runBtn) return;

        const self = this;
        runBtn.onclick = function() {
            self.runCode(instance.chunkId);
        };
    }

    /**
     * Setup tab switching for a chunk
     * @param {string} chunkId - Chunk identifier
     * @private
     */
    _setupTabs(chunkId) {
        const tabContainer = document.querySelector(`[data-chunk="${chunkId}"] .preview-tabs, #tabs-${chunkId}`);
        if (!tabContainer) return;

        const tabs = tabContainer.querySelectorAll('.preview-tab');
        const panelContainer = tabContainer.closest('.code-preview-container');
        if (!panelContainer) return;

        const panels = panelContainer.querySelectorAll('.tab-panel');
        const self = this;

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // Update active panel
                panels.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.id === `${targetTab}Panel-${chunkId}`) {
                        panel.classList.add('active');
                    }
                });

                // Update flowchart when switching to flowchart tab
                if (targetTab === 'flowchart') {
                    self.updateFlowchart(chunkId);
                }
            });
        });
    }

    // ========================================================================
    // OPERATIONS
    // ========================================================================

    /**
     * Update flowchart for a chunk
     * @param {string} chunkId - Chunk identifier
     */
    async updateFlowchart(chunkId) {
        const instance = this.get(chunkId);
        if (!instance) return;

        const mermaidDisplayId = instance.config.mermaidDisplayId;
        if (!mermaidDisplayId) return;

        const flowchartGenerator = this.getFlowchartGenerator();
        if (flowchartGenerator) {
            await flowchartGenerator.render(instance.workspace, mermaidDisplayId);
            return;
        }

        // Fallback: simple flowchart generation
        const mermaidDisplay = document.getElementById(mermaidDisplayId);
        if (!mermaidDisplay) return;

        const mermaidCode = this._generateSimpleFlowchart(instance.workspace);
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
            console.warn('BlocklyChunkRegistry: Flowchart rendering error:', e);
            mermaidDisplay.innerHTML = '<div class="flowchart-placeholder">흐름도 생성 중...</div>';
        }
    }

    /**
     * Generate simple flowchart (fallback)
     * @param {Object} workspace - Blockly workspace
     * @returns {string|null}
     * @private
     */
    _generateSimpleFlowchart(workspace) {
        const topBlocks = workspace.getTopBlocks(true);
        if (topBlocks.length === 0) return null;

        const lines = ['flowchart TD'];
        lines.push('    START([시작])');

        let nodeCounter = 0;
        let prevNode = 'START';

        const processBlock = (block) => {
            if (!block || block.isShadow()) return;

            const nodeId = 'N' + (nodeCounter++);
            const label = block.type.replace(/_/g, ' ');

            lines.push(`    ${nodeId}[${label}]`);
            lines.push(`    ${prevNode} --> ${nodeId}`);
            prevNode = nodeId;

            const nextBlock = block.getNextBlock();
            if (nextBlock) {
                processBlock(nextBlock);
            }
        };

        topBlocks.forEach(block => {
            if (!block.isShadow()) {
                processBlock(block);
            }
        });

        lines.push('    END([끝])');
        lines.push(`    ${prevNode} --> END`);

        return lines.join('\n');
    }

    /**
     * Run code for a chunk
     * @param {string} chunkId - Chunk identifier
     */
    runCode(chunkId) {
        const instance = this.get(chunkId);
        if (!instance) {
            console.error(`BlocklyChunkRegistry: Chunk not found: ${chunkId}`);
            return;
        }

        const config = instance.config;
        const outputElement = document.getElementById(config.outputId);
        const canvasElement = document.getElementById(config.canvasId);

        // Clear outputs
        if (outputElement) {
            outputElement.textContent = '';
            outputElement.className = '';
        }
        if (canvasElement) {
            canvasElement.innerHTML = '';
        }

        // Generate code
        const pythonCode = instance.generateCode();

        if (!pythonCode || pythonCode.trim() === '') {
            if (outputElement) {
                outputElement.textContent = '블록을 추가해주세요.';
                outputElement.className = 'error';
            }
            return;
        }

        // Use PythonExecutor if available
        if (typeof window !== 'undefined' && typeof window.createPythonExecutor === 'function') {
            const executor = window.createPythonExecutor({
                outputElement: outputElement,
                canvasId: config.canvasId,
                canvasWidth: 400,
                canvasHeight: 400
            });
            executor.execute(pythonCode).then(function() {
                console.log(`BlocklyChunkRegistry: Chunk ${chunkId} execution completed`);
            });
            return;
        }

        // Fallback execution
        this._executeFallback(pythonCode, config, outputElement, canvasElement, chunkId);
    }

    /**
     * Fallback Python execution
     * @private
     */
    _executeFallback(pythonCode, config, outputElement, canvasElement, chunkId) {
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
            console.log(`BlocklyChunkRegistry: Chunk ${chunkId} execution completed`);
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
            console.error(`BlocklyChunkRegistry: Chunk ${chunkId} error:`, e);
        });
    }

    /**
     * Dispose a chunk
     * @param {string} chunkId - Chunk identifier
     */
    dispose(chunkId) {
        const instance = this.get(chunkId);
        if (instance) {
            instance.dispose();
            this._instances.delete(chunkId);
            console.log(`BlocklyChunkRegistry: Chunk "${chunkId}" disposed`);
        }
    }

    /**
     * Dispose all chunks
     */
    disposeAll() {
        for (const instance of this._instances.values()) {
            instance.dispose();
        }
        this._instances.clear();
        console.log('BlocklyChunkRegistry: All chunks disposed');
    }

    /**
     * Initialize all chunks found on the page
     */
    initializeAll() {
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

            this.initialize(config);
        });
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let _chunkRegistryInstance = null;

/**
 * Get or create the singleton BlocklyChunkRegistry instance
 * @param {Object} options - Options for creating new instance
 * @returns {BlocklyChunkRegistry}
 */
function getChunkRegistry(options = {}) {
    if (!_chunkRegistryInstance) {
        _chunkRegistryInstance = new BlocklyChunkRegistry(options);
    }
    return _chunkRegistryInstance;
}

/**
 * Reset the singleton instance (mainly for testing)
 */
function resetChunkRegistry() {
    if (_chunkRegistryInstance) {
        _chunkRegistryInstance.disposeAll();
    }
    _chunkRegistryInstance = null;
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof window !== 'undefined') {
    window.BlocklyChunkInstance = BlocklyChunkInstance;
    window.BlocklyChunkRegistry = BlocklyChunkRegistry;
    window.getChunkRegistry = getChunkRegistry;
    window.resetChunkRegistry = resetChunkRegistry;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BlocklyChunkInstance,
        BlocklyChunkRegistry,
        getChunkRegistry,
        resetChunkRegistry
    };
}
