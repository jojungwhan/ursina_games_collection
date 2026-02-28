/**
 * Blockly Environment - Main Composition Class
 * Provides dependency injection and unified access to all Blockly-related services
 *
 * Dependencies (all optional, will be lazy-loaded):
 * - configuration_manager.js
 * - turtle_blocks_registrar.js
 * - workspace_manager.js
 * - mermaid_flowchart_generator.js
 * - blockly_chunk_registry.js
 * - python_executor.js
 */

class BlocklyEnvironment {
    /**
     * Create a new BlocklyEnvironment
     * @param {Object} options - Configuration options
     * @param {Object} options.blockly - Blockly library instance
     * @param {Object} options.skulpt - Skulpt library instance
     * @param {Object} options.mermaid - Mermaid library instance
     * @param {Object} options.config - Raw configuration object
     */
    constructor(options = {}) {
        this._options = options;
        this._blockly = options.blockly || null;
        this._skulpt = options.skulpt || null;
        this._mermaid = options.mermaid || null;

        // Lazy-loaded services
        this._configManager = null;
        this._registrar = null;
        this._workspaceManager = null;
        this._flowchartGenerator = null;
        this._chunkRegistry = null;

        // State
        this._initialized = false;
    }

    // ========================================================================
    // LIBRARY GETTERS
    // ========================================================================

    /**
     * Get Blockly library
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
     * Get Skulpt library
     * @returns {Object|null}
     */
    getSkulpt() {
        if (this._skulpt) return this._skulpt;
        if (typeof window !== 'undefined' && typeof window.Sk !== 'undefined') {
            this._skulpt = window.Sk;
        }
        return this._skulpt;
    }

    /**
     * Get Mermaid library
     * @returns {Object|null}
     */
    getMermaid() {
        if (this._mermaid) return this._mermaid;
        if (typeof window !== 'undefined' && typeof window.mermaid !== 'undefined') {
            this._mermaid = window.mermaid;
        }
        return this._mermaid;
    }

    // ========================================================================
    // SERVICE GETTERS (Lazy Loading)
    // ========================================================================

    /**
     * Get ConfigurationManager instance
     * @returns {Object}
     */
    getConfigManager() {
        if (this._configManager) return this._configManager;

        // Try to use global singleton
        if (typeof window !== 'undefined' && typeof window.getConfigManager === 'function') {
            this._configManager = window.getConfigManager(this._options.config);
            return this._configManager;
        }

        // Create new instance if class is available
        if (typeof ConfigurationManager !== 'undefined') {
            this._configManager = new ConfigurationManager(this._options.config);
            return this._configManager;
        }

        // Fallback: return minimal config interface
        return this._createMinimalConfigManager();
    }

    /**
     * Get TurtleBlocksRegistrar instance
     * @returns {Object}
     */
    getRegistrar() {
        if (this._registrar) return this._registrar;

        // Try to use global singleton
        if (typeof window !== 'undefined' && typeof window.getTurtleBlocksRegistrar === 'function') {
            this._registrar = window.getTurtleBlocksRegistrar({
                blockly: this.getBlockly()
            });
            return this._registrar;
        }

        // Create new instance if class is available
        if (typeof TurtleBlocksRegistrar !== 'undefined') {
            this._registrar = new TurtleBlocksRegistrar({
                blockly: this.getBlockly()
            });
            return this._registrar;
        }

        // Fallback: return minimal interface
        return this._createMinimalRegistrar();
    }

    /**
     * Get WorkspaceManager instance
     * @returns {Object}
     */
    getWorkspaceManager() {
        if (this._workspaceManager) return this._workspaceManager;

        // Try to use global singleton
        if (typeof window !== 'undefined' && typeof window.getWorkspaceManager === 'function') {
            this._workspaceManager = window.getWorkspaceManager({
                blockly: this.getBlockly(),
                config: this.getConfigManager(),
                registrar: this.getRegistrar()
            });
            return this._workspaceManager;
        }

        // Create new instance if class is available
        if (typeof WorkspaceManager !== 'undefined') {
            this._workspaceManager = new WorkspaceManager({
                blockly: this.getBlockly(),
                config: this.getConfigManager(),
                registrar: this.getRegistrar()
            });
            return this._workspaceManager;
        }

        // Fallback: return minimal interface
        return this._createMinimalWorkspaceManager();
    }

    /**
     * Get MermaidFlowchartGenerator instance
     * @returns {Object}
     */
    getFlowchartGenerator() {
        if (this._flowchartGenerator) return this._flowchartGenerator;

        // Try to use global singleton
        if (typeof window !== 'undefined' && typeof window.getFlowchartGenerator === 'function') {
            this._flowchartGenerator = window.getFlowchartGenerator({
                config: this.getConfigManager(),
                mermaid: this.getMermaid()
            });
            return this._flowchartGenerator;
        }

        // Create new instance if class is available
        if (typeof MermaidFlowchartGenerator !== 'undefined') {
            this._flowchartGenerator = new MermaidFlowchartGenerator({
                config: this.getConfigManager(),
                mermaid: this.getMermaid()
            });
            return this._flowchartGenerator;
        }

        // Fallback: return minimal interface
        return this._createMinimalFlowchartGenerator();
    }

    /**
     * Get BlocklyChunkRegistry instance
     * @returns {Object}
     */
    getChunkRegistry() {
        if (this._chunkRegistry) return this._chunkRegistry;

        // Try to use global singleton
        if (typeof window !== 'undefined' && typeof window.getChunkRegistry === 'function') {
            this._chunkRegistry = window.getChunkRegistry({
                blockly: this.getBlockly(),
                config: this.getConfigManager(),
                registrar: this.getRegistrar(),
                flowchartGenerator: this.getFlowchartGenerator()
            });
            return this._chunkRegistry;
        }

        // Create new instance if class is available
        if (typeof BlocklyChunkRegistry !== 'undefined') {
            this._chunkRegistry = new BlocklyChunkRegistry({
                blockly: this.getBlockly(),
                config: this.getConfigManager(),
                registrar: this.getRegistrar(),
                flowchartGenerator: this.getFlowchartGenerator()
            });
            return this._chunkRegistry;
        }

        // Fallback: return minimal interface
        return this._createMinimalChunkRegistry();
    }

    /**
     * Create Python executor
     * @param {Object} options - Executor options
     * @returns {Object}
     */
    createPythonExecutor(options = {}) {
        // Use global factory if available
        if (typeof window !== 'undefined' && typeof window.createPythonExecutor === 'function') {
            return window.createPythonExecutor(options);
        }

        // Create from class if available
        if (typeof PythonExecutor !== 'undefined') {
            return new PythonExecutor(options);
        }

        // Fallback: return minimal executor
        return this._createMinimalPythonExecutor(options);
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /**
     * Initialize the environment
     * @returns {boolean}
     */
    initialize() {
        // Even if flag says initialized, verify blocks actually exist
        // This handles the case where blocks were deleted (e.g., after navigation reset)
        if (this._initialized) {
            const blockly = this.getBlockly();
            if (blockly?.Blocks?.['turtle_setup']) {
                return true;  // Actually initialized
            }
            // Blocks were deleted, need to re-initialize
            console.log('BlocklyEnvironment: Blocks were deleted, re-initializing...');
            this._initialized = false;
            // Also reset registrar cache so it re-registers
            this._registrar = null;
        }

        // Check Blockly
        const blockly = this.getBlockly();
        if (!blockly) {
            console.warn('BlocklyEnvironment: Blockly library not available');
            return false;
        }

        // Register turtle blocks
        const registrar = this.getRegistrar();
        if (registrar && typeof registrar.ensureRegistered === 'function') {
            registrar.ensureRegistered();
        }

        this._initialized = true;
        console.log('BlocklyEnvironment: Initialized');
        return true;
    }

    /**
     * Check if environment is initialized
     * @returns {boolean}
     */
    isInitialized() {
        return this._initialized;
    }

    /**
     * Check if all required libraries are available
     * @returns {Object} - Status of each library
     */
    checkLibraries() {
        return {
            blockly: !!this.getBlockly(),
            skulpt: !!this.getSkulpt(),
            mermaid: !!this.getMermaid(),
            python: !!(this.getBlockly()?.Python)
        };
    }

    // ========================================================================
    // CONVENIENCE METHODS
    // ========================================================================

    /**
     * Initialize single workspace mode
     * @param {Object} options - Initialization options
     * @returns {Object|null}
     */
    initializeWorkspace(options = {}) {
        this.initialize();
        return this.getWorkspaceManager().initialize(options);
    }

    /**
     * Initialize multi-instance mode
     * @param {Object} chunkConfig - Chunk configuration
     * @returns {Object|null}
     */
    initializeChunk(chunkConfig) {
        this.initialize();
        return this.getChunkRegistry().initialize(chunkConfig);
    }

    /**
     * Initialize all chunks on page
     */
    initializeAllChunks() {
        this.initialize();
        this.getChunkRegistry().initializeAll();
    }

    /**
     * Get current workspace (single mode)
     * @returns {Object|null}
     */
    getWorkspace() {
        return this.getWorkspaceManager().getWorkspace();
    }

    /**
     * Generate Python code from current workspace
     * @returns {string}
     */
    generatePythonCode() {
        return this.getWorkspaceManager().generatePythonCode();
    }

    /**
     * Update flowchart display
     * @param {string|HTMLElement} displayElement - Display element or ID
     */
    async updateFlowchart(displayElement) {
        const workspace = this.getWorkspace();
        if (workspace) {
            await this.getFlowchartGenerator().render(workspace, displayElement);
        }
    }

    /**
     * Execute Python code
     * @param {string} code - Python code
     * @param {Object} options - Execution options
     * @returns {Promise}
     */
    async executePython(code, options = {}) {
        const executor = this.createPythonExecutor(options);
        return executor.execute(code);
    }

    // ========================================================================
    // CLEANUP
    // ========================================================================

    /**
     * Dispose all resources
     */
    dispose() {
        if (this._workspaceManager && typeof this._workspaceManager.dispose === 'function') {
            this._workspaceManager.dispose();
        }
        if (this._chunkRegistry && typeof this._chunkRegistry.disposeAll === 'function') {
            this._chunkRegistry.disposeAll();
        }

        this._configManager = null;
        this._registrar = null;
        this._workspaceManager = null;
        this._flowchartGenerator = null;
        this._chunkRegistry = null;
        this._initialized = false;

        console.log('BlocklyEnvironment: Disposed');
    }

    // ========================================================================
    // FALLBACK IMPLEMENTATIONS
    // ========================================================================

    /**
     * @private
     */
    _createMinimalConfigManager() {
        const config = this._options.config || (typeof CONFIG !== 'undefined' ? CONFIG : {});
        return {
            get: (path, defaultValue) => {
                const parts = path.split('.');
                let current = config;
                for (const part of parts) {
                    if (current == null) return defaultValue;
                    current = current[part];
                }
                return current !== undefined ? current : defaultValue;
            },
            getString: (key, defaultValue) => config?.STRINGS?.[key] || defaultValue,
            getTiming: (key, defaultValue) => config?.TIMING?.[key] || defaultValue,
            getThreshold: (key, defaultValue) => config?.THRESHOLDS?.[key] || defaultValue,
            getBlocklyConfig: () => config?.BLOCKLY || {},
            getMermaidConfig: () => config?.MERMAID || {}
        };
    }

    /**
     * @private
     */
    _createMinimalRegistrar() {
        const blockly = this.getBlockly();
        let registered = false;

        return {
            isRegistered: () => registered,
            ensureRegistered: () => {
                if (registered) return true;
                if (typeof window !== 'undefined' && typeof window.registerTurtleBlocks === 'function') {
                    window.registerTurtleBlocks(blockly);
                    registered = true;
                    return true;
                }
                return false;
            },
            getBlockLabel: (block) => block.type.replace(/_/g, ' ')
        };
    }

    /**
     * @private
     */
    _createMinimalWorkspaceManager() {
        const self = this;
        let workspace = null;

        return {
            getWorkspace: () => workspace,
            isInitialized: () => workspace !== null,
            initialize: (options = {}) => {
                const blockly = self.getBlockly();
                if (!blockly) return null;

                const divId = options.divId || 'blocklyDiv';
                const toolboxId = options.toolboxId || 'toolbox';

                const div = document.getElementById(divId);
                const toolbox = document.getElementById(toolboxId);
                if (!div) return null;

                workspace = blockly.inject(divId, {
                    toolbox: toolbox ? toolbox.cloneNode(true) : null,
                    trashcan: true
                });
                return workspace;
            },
            dispose: () => {
                if (workspace) {
                    workspace.dispose();
                    workspace = null;
                }
            },
            generatePythonCode: () => {
                const blockly = self.getBlockly();
                if (!blockly || !workspace) return '';
                try {
                    return blockly.Python.workspaceToCode(workspace);
                } catch (e) {
                    return '';
                }
            }
        };
    }

    /**
     * @private
     */
    _createMinimalFlowchartGenerator() {
        return {
            isReady: () => false,
            generate: () => null,
            render: async () => false
        };
    }

    /**
     * @private
     */
    _createMinimalChunkRegistry() {
        return {
            get: () => null,
            has: () => false,
            getIds: () => [],
            getAll: () => [],
            size: 0,
            initialize: () => null,
            dispose: () => {},
            disposeAll: () => {},
            initializeAll: () => {}
        };
    }

    /**
     * @private
     */
    _createMinimalPythonExecutor(options) {
        const skulpt = this.getSkulpt();
        return {
            execute: async (code) => {
                if (!skulpt) {
                    console.error('Skulpt not available');
                    return;
                }

                const output = options.outputElement;
                skulpt.configure({
                    output: (text) => {
                        if (output) output.textContent += text;
                    },
                    read: (x) => {
                        if (skulpt.builtinFiles?.files?.[x]) {
                            return skulpt.builtinFiles.files[x];
                        }
                        throw new Error(`File not found: ${x}`);
                    },
                    __future__: skulpt.python3
                });

                if (options.canvasId) {
                    skulpt.TurtleGraphics = {
                        target: options.canvasId,
                        width: options.canvasWidth || 400,
                        height: options.canvasHeight || 300
                    };
                }

                return skulpt.misceval.asyncToPromise(() => {
                    return skulpt.importMainWithBody('<stdin>', false, code, true);
                });
            }
        };
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let _environmentInstance = null;

/**
 * Get or create the singleton BlocklyEnvironment instance
 * @param {Object} options - Options for creating new instance
 * @returns {BlocklyEnvironment}
 */
function getBlocklyEnvironment(options = {}) {
    if (!_environmentInstance) {
        _environmentInstance = new BlocklyEnvironment(options);
    }
    return _environmentInstance;
}

/**
 * Reset the singleton instance (mainly for testing)
 */
function resetBlocklyEnvironment() {
    if (_environmentInstance) {
        _environmentInstance.dispose();
    }
    _environmentInstance = null;
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof window !== 'undefined') {
    window.BlocklyEnvironment = BlocklyEnvironment;
    window.getBlocklyEnvironment = getBlocklyEnvironment;
    window.resetBlocklyEnvironment = resetBlocklyEnvironment;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlocklyEnvironment, getBlocklyEnvironment, resetBlocklyEnvironment };
}
