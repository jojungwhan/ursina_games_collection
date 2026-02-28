/**
 * Workspace Manager Class
 * Encapsulates Blockly workspace state and lifecycle management
 *
 * Dependencies:
 * - configuration_manager.js (optional, for ConfigurationManager)
 * - turtle_blocks_registrar.js (optional, for TurtleBlocksRegistrar)
 */

class WorkspaceManager {
    /**
     * @param {Object} options - Configuration options
     * @param {Object} options.blockly - Blockly library instance
     * @param {Object} options.config - ConfigurationManager instance
     * @param {Object} options.registrar - TurtleBlocksRegistrar instance
     * @param {string} options.divId - Default container div ID
     */
    constructor(options = {}) {
        this._blockly = options.blockly || null;
        this._config = options.config || null;
        this._registrar = options.registrar || null;
        this._defaultDivId = options.divId || 'blocklyDiv';

        // State
        this._workspace = null;
        this._listeners = [];
        this._initialized = false;
        this._disposed = false;
    }

    // ========================================================================
    // GETTERS
    // ========================================================================

    /**
     * Get Blockly library (lazy load from window)
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
     * Get configuration manager
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
     * Get turtle blocks registrar
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
     * Get current workspace
     * @returns {Object|null}
     */
    getWorkspace() {
        return this._workspace;
    }

    /**
     * Check if workspace is initialized
     * @returns {boolean}
     */
    isInitialized() {
        return this._initialized && this._workspace !== null;
    }

    /**
     * Check if workspace has been disposed
     * @returns {boolean}
     */
    isDisposed() {
        return this._disposed;
    }

    // ========================================================================
    // VALIDATION
    // ========================================================================

    /**
     * Check if Blockly is loaded and ready
     * @returns {boolean}
     */
    isBlocklyReady() {
        const blockly = this.getBlockly();
        return blockly !== null &&
               typeof blockly.Python !== 'undefined';
    }

    /**
     * Validate container div exists
     * @param {string} divId - Container div ID
     * @returns {HTMLElement|null}
     */
    validateContainer(divId) {
        const id = divId || this._defaultDivId;
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`WorkspaceManager: Container div "${id}" not found`);
            return null;
        }
        return element;
    }

    /**
     * Check if container has valid dimensions
     * @param {HTMLElement} container - Container element
     * @returns {boolean}
     */
    isLayoutReady(container) {
        const config = this.getConfig();
        const minWidth = config ? config.getThreshold('MIN_CONTAINER_WIDTH', 100) : 100;

        const parentContainer = container.closest('.blockly-container');
        if (parentContainer) {
            return parentContainer.offsetWidth >= minWidth;
        }
        return true;
    }

    /**
     * Check if workspace already has SVG (already initialized)
     * @param {HTMLElement} container - Container element
     * @returns {boolean}
     */
    hasExistingSVG(container) {
        return this._workspace !== null && container.querySelector('.blocklySvg') !== null;
    }

    // ========================================================================
    // WORKSPACE CONFIGURATION
    // ========================================================================

    /**
     * Get workspace injection configuration
     * @param {Element} toolbox - Toolbox element
     * @returns {Object}
     */
    getWorkspaceConfig(toolbox) {
        const config = this.getConfig();
        const blocklyConfig = config ? config.getBlocklyConfig() : null;

        return {
            toolbox: toolbox,
            media: blocklyConfig?.MEDIA_PATH || 'https://unpkg.com/blockly/media/',
            // Explicitly set toolbox position to ensure proper flyout alignment
            horizontalLayout: blocklyConfig?.HORIZONTAL_LAYOUT === true ? true : false,
            toolboxPosition: blocklyConfig?.TOOLBOX_POSITION || 'start',
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

    // ========================================================================
    // LIFECYCLE METHODS
    // ========================================================================

    /**
     * Initialize workspace
     * @param {Object} options - Initialization options
     * @param {string} options.divId - Container div ID
     * @param {string} options.toolboxId - Toolbox element ID
     * @param {Function} options.onCodeChange - Code change callback
     * @returns {Object|null} - Workspace or null on failure
     */
    initialize(options = {}) {
        const {
            divId = this._defaultDivId,
            toolboxId = 'toolbox',
            onCodeChange = null
        } = options;

        // Reset disposed flag
        this._disposed = false;

        // Validate Blockly
        const blockly = this.getBlockly();
        if (!blockly) {
            console.error('WorkspaceManager: Blockly library not available');
            return null;
        }

        // Validate container
        const container = this.validateContainer(divId);
        if (!container) {
            return null;
        }

        // Check layout
        if (!this.isLayoutReady(container)) {
            const config = this.getConfig();
            const delay = config ? config.getTiming('LAYOUT_CHECK_DELAY', 50) : 50;
            console.log('WorkspaceManager: Layout not ready, retrying...');
            setTimeout(() => this.initialize(options), delay);
            return null;
        }

        // If already initialized, just resize
        if (this.hasExistingSVG(container)) {
            this.resize();
            console.log('WorkspaceManager: Workspace already initialized, resized');
            return this._workspace;
        }

        // Dispose existing workspace
        this.dispose();

        // Clear container
        container.innerHTML = '';

        // Register turtle blocks
        const registrar = this.getRegistrar();
        if (registrar) {
            registrar.ensureRegistered();
        }

        // Get toolbox
        const toolboxElement = document.getElementById(toolboxId);
        let toolbox = null;
        if (toolboxElement) {
            toolbox = toolboxElement.cloneNode(true);
            // Remove ID from cloned toolbox to avoid duplicate IDs
            toolbox.removeAttribute('id');
        }

        try {
            // Create workspace with toolbox
            const workspaceConfig = this.getWorkspaceConfig(toolbox);
            this._workspace = blockly.inject(divId, workspaceConfig);

            // Add default turtle blocks if workspace is empty and has turtle blocks
            if (this._workspace && toolboxElement && typeof addDefaultTurtleBlocks === 'function') {
                setTimeout(() => {
                    addDefaultTurtleBlocks(this._workspace, toolboxElement);
                }, 100);
            }

            // Setup code change listener
            if (onCodeChange) {
                this.addCodeChangeListener(onCodeChange);
            }

            // Initial resize
            this.resize();

            // Note: Don't call updateToolbox() here - toolbox was already passed during inject()
            // Calling updateToolbox() after inject can cause flyout rendering issues

            // Setup flyout position fixes
            if (typeof createFlyoutObserver === 'function') {
                createFlyoutObserver(container);
            }
            if (typeof setupFlyoutClickFix === 'function') {
                setupFlyoutClickFix(container);
            }

            // Fix scrollbar positioning - ensure they appear inside workspace, not outside
            if (typeof window.fixScrollbarPosition === 'function') {
                // Fix scrollbars after workspace is created and scrollbars are rendered
                setTimeout(() => window.fixScrollbarPosition(this._workspace, container), 300);
                setTimeout(() => window.fixScrollbarPosition(this._workspace, container), 600);
                setTimeout(() => window.fixScrollbarPosition(this._workspace, container), 1000);
            }

            // Delayed resize
            const config = this.getConfig();
            const resizeDelay = config ? config.getTiming('RESIZE_DELAY', 100) : 100;
            setTimeout(() => {
                this.resize();
                // Fix scrollbars after resize
                if (typeof window.fixScrollbarPosition === 'function') {
                    window.fixScrollbarPosition(this._workspace, container);
                }
            }, resizeDelay);

            this._initialized = true;
            this._notifyListeners('initialized', { workspace: this._workspace });

            console.log('WorkspaceManager: Workspace initialized successfully');
            return this._workspace;

        } catch (error) {
            console.error('WorkspaceManager: Initialization error:', error);
            this._notifyListeners('error', { error });
            return null;
        }
    }

    /**
     * Dispose workspace
     */
    dispose() {
        if (!this._workspace) return;

        try {
            this._workspace.dispose();
            this._notifyListeners('disposed', {});
        } catch (e) {
            // Ignore disposal errors
        }

        this._workspace = null;
        this._initialized = false;
        this._disposed = true;
    }

    /**
     * Resize workspace
     */
    resize() {
        const blockly = this.getBlockly();
        if (blockly && this._workspace) {
            blockly.svgResize(this._workspace);
            // Fix scrollbar positioning after resize
            const container = this._workspace.getInjectionDiv ? this._workspace.getInjectionDiv().parentElement : document.getElementById(this._defaultDivId);
            if (container && typeof window.fixScrollbarPosition === 'function') {
                window.fixScrollbarPosition(this._workspace, container);
            }
        }
    }

    // ========================================================================
    // CODE GENERATION
    // ========================================================================

    /**
     * Generate Python code from workspace
     * @returns {string}
     */
    generatePythonCode() {
        const blockly = this.getBlockly();
        if (!blockly || !this._workspace) {
            return '';
        }

        try {
            return blockly.Python.workspaceToCode(this._workspace);
        } catch (error) {
            console.warn('WorkspaceManager: Error generating Python code:', error);
            return '';
        }
    }

    /**
     * Get top blocks from workspace
     * @param {boolean} ordered - Whether to return in visual order
     * @returns {Array}
     */
    getTopBlocks(ordered = true) {
        if (!this._workspace) return [];
        return this._workspace.getTopBlocks(ordered);
    }

    // ========================================================================
    // EVENT HANDLING
    // ========================================================================

    /**
     * Add workspace change listener
     * @param {Function} callback - Callback function
     * @returns {Function} - Remove listener function
     */
    addChangeListener(callback) {
        if (!this._workspace || typeof callback !== 'function') {
            return () => {};
        }

        this._workspace.addChangeListener(callback);

        return () => {
            if (this._workspace) {
                this._workspace.removeChangeListener(callback);
            }
        };
    }

    /**
     * Add code change listener (filters UI events)
     * @param {Function} callback - Callback(pythonCode)
     * @returns {Function} - Remove listener function
     */
    addCodeChangeListener(callback) {
        const self = this;
        const config = this.getConfig();
        const placeholder = config ?
            config.getString('BLOCKLY_CODE_PLACEHOLDER', '# 블록을 추가하면 Python 코드가 여기에 표시됩니다...') :
            '# 블록을 추가하면 Python 코드가 여기에 표시됩니다...';

        const listener = function(event) {
            if (event.isUiEvent) return;

            const pythonCode = self.generatePythonCode();
            callback(pythonCode || placeholder);
        };

        return this.addChangeListener(listener);
    }

    /**
     * Add lifecycle event listener
     * @param {string} event - Event name ('initialized', 'disposed', 'error')
     * @param {Function} callback - Callback function
     * @returns {Function} - Remove listener function
     */
    on(event, callback) {
        const listener = { event, callback };
        this._listeners.push(listener);

        return () => {
            const index = this._listeners.indexOf(listener);
            if (index > -1) {
                this._listeners.splice(index, 1);
            }
        };
    }

    /**
     * Notify lifecycle listeners
     * @param {string} event - Event name
     * @param {Object} data - Event data
     * @private
     */
    _notifyListeners(event, data) {
        for (const listener of this._listeners) {
            if (listener.event === event) {
                try {
                    listener.callback(data);
                } catch (e) {
                    console.warn('WorkspaceManager: Listener error:', e);
                }
            }
        }
    }

    // ========================================================================
    // WORKSPACE OPERATIONS
    // ========================================================================

    /**
     * Clear workspace
     */
    clear() {
        if (this._workspace) {
            this._workspace.clear();
        }
    }

    /**
     * Undo last action
     */
    undo() {
        if (this._workspace) {
            this._workspace.undo(false);
        }
    }

    /**
     * Redo last undone action
     */
    redo() {
        if (this._workspace) {
            this._workspace.undo(true);
        }
    }

    /**
     * Get workspace XML
     * @returns {string}
     */
    toXml() {
        const blockly = this.getBlockly();
        if (!blockly || !this._workspace) return '';

        const xml = blockly.Xml.workspaceToDom(this._workspace);
        return blockly.Xml.domToText(xml);
    }

    /**
     * Load workspace from XML
     * @param {string} xmlText - XML string
     */
    fromXml(xmlText) {
        const blockly = this.getBlockly();
        if (!blockly || !this._workspace || !xmlText) return;

        try {
            const xml = blockly.utils.xml.textToDom(xmlText);
            blockly.Xml.clearWorkspaceAndLoadFromXml(xml, this._workspace);
        } catch (error) {
            console.warn('WorkspaceManager: Error loading XML:', error);
        }
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let _workspaceManagerInstance = null;

/**
 * Get or create the singleton WorkspaceManager instance
 * @param {Object} options - Options for creating new instance
 * @returns {WorkspaceManager}
 */
function getWorkspaceManager(options = {}) {
    if (!_workspaceManagerInstance) {
        _workspaceManagerInstance = new WorkspaceManager(options);
    }
    return _workspaceManagerInstance;
}

/**
 * Reset the singleton instance (mainly for testing)
 */
function resetWorkspaceManager() {
    if (_workspaceManagerInstance) {
        _workspaceManagerInstance.dispose();
    }
    _workspaceManagerInstance = null;
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof window !== 'undefined') {
    window.WorkspaceManager = WorkspaceManager;
    window.getWorkspaceManager = getWorkspaceManager;
    window.resetWorkspaceManager = resetWorkspaceManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WorkspaceManager, getWorkspaceManager, resetWorkspaceManager };
}
