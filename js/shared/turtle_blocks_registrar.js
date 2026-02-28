/**
 * Turtle Blocks Registrar Class
 * Encapsulates turtle block registration with dependency injection
 *
 * Dependencies:
 * - turtle_blocks_config.js (for TURTLE_BLOCKS_CONFIG and registerTurtleBlocks)
 */

class TurtleBlocksRegistrar {
    /**
     * @param {Object} options - Configuration options
     * @param {Object} options.blockly - Blockly library instance (defaults to window.Blockly)
     * @param {Object} options.config - Turtle blocks config (defaults to TURTLE_BLOCKS_CONFIG)
     */
    constructor(options = {}) {
        this._blockly = options.blockly || null;
        this._config = options.config || null;
        this._registered = false;
        this._registrationError = null;
    }

    /**
     * Get Blockly instance (lazy load from window if not provided)
     * @returns {Object|null}
     * @private
     */
    _getBlockly() {
        if (this._blockly) return this._blockly;
        if (typeof window !== 'undefined' && typeof window.Blockly !== 'undefined') {
            this._blockly = window.Blockly;
        }
        return this._blockly;
    }

    /**
     * Get turtle blocks config (lazy load from window if not provided)
     * @returns {Object|null}
     * @private
     */
    _getConfig() {
        if (this._config) return this._config;
        if (typeof window !== 'undefined' && typeof window.TURTLE_BLOCKS_CONFIG !== 'undefined') {
            this._config = window.TURTLE_BLOCKS_CONFIG;
        }
        return this._config;
    }

    /**
     * Check if blocks are already registered
     * @returns {boolean}
     */
    isRegistered() {
        return this._registered;
    }

    /**
     * Get any registration error
     * @returns {Error|null}
     */
    getError() {
        return this._registrationError;
    }

    /**
     * Check if Blockly is available and ready
     * @returns {boolean}
     */
    isBlocklyReady() {
        const blockly = this._getBlockly();
        return blockly !== null &&
               typeof blockly.Python !== 'undefined';
    }

    /**
     * Register turtle blocks (idempotent - safe to call multiple times)
     * @returns {boolean} - Whether registration was successful
     */
    ensureRegistered() {
        // Even if flag says registered, verify blocks actually exist in registry
        // This handles the case where blocks were deleted (e.g., after navigation reset)
        if (this._registered) {
            const blockly = this._getBlockly();
            if (blockly?.Blocks?.['turtle_setup']) {
                return true;  // Blocks actually exist
            }
            // Blocks were deleted, need to re-register
            console.log('TurtleBlocksRegistrar: Blocks were deleted, re-registering...');
            this._registered = false;
        }

        const blockly = this._getBlockly();
        if (!blockly) {
            this._registrationError = new Error('Blockly library not available');
            console.warn('TurtleBlocksRegistrar: Blockly library not available');
            return false;
        }

        if (typeof blockly.Python === 'undefined') {
            this._registrationError = new Error('Blockly.Python not available');
            console.warn('TurtleBlocksRegistrar: Blockly.Python not available');
            return false;
        }

        try {
            // Use shared registerTurtleBlocks if available
            if (typeof window !== 'undefined' && typeof window.registerTurtleBlocks === 'function') {
                const result = window.registerTurtleBlocks(blockly);
                if (result !== false) {
                    this._registered = true;
                    console.log('TurtleBlocksRegistrar: Blocks registered via shared module');
                    return true;
                }
            }

            // Fallback: check if blocks are already defined
            if (blockly.Blocks && blockly.Blocks['turtle_setup']) {
                this._registered = true;
                console.log('TurtleBlocksRegistrar: Blocks already registered');
                return true;
            }

            this._registrationError = new Error('No registration method available');
            console.warn('TurtleBlocksRegistrar: No registration method available');
            return false;

        } catch (error) {
            this._registrationError = error;
            console.error('TurtleBlocksRegistrar: Registration failed:', error);
            return false;
        }
    }

    /**
     * Force re-registration (use with caution)
     * @returns {boolean}
     */
    forceRegister() {
        this._registered = false;
        this._registrationError = null;
        return this.ensureRegistered();
    }

    /**
     * Get the label for a block type
     * @param {Object} block - Blockly block
     * @param {Function} getInputValueFn - Function to get input values
     * @returns {string}
     */
    getBlockLabel(block, getInputValueFn) {
        // Use shared getBlockLabel if available
        if (typeof window !== 'undefined' && typeof window.getBlockLabel === 'function') {
            return window.getBlockLabel(block, getInputValueFn);
        }

        // Fallback to config-based labels
        const config = this._getConfig();
        if (config && config.LABELS && config.LABELS[block.type]) {
            return config.LABELS[block.type];
        }

        // Default: format type name
        return block.type.replace(/_/g, ' ');
    }

    /**
     * Get turtle block configuration
     * @returns {Object}
     */
    getConfig() {
        return this._getConfig() || {
            COLORS: { MOTION: 160, PEN: 290, UTILITY: 230 },
            DEFAULTS: { STEP: '10', ANGLE: '90' },
            DROPDOWNS: {},
            LABELS: {}
        };
    }

    /**
     * Check if a block type is a turtle block
     * @param {string} blockType - Block type name
     * @returns {boolean}
     */
    isTurtleBlock(blockType) {
        return blockType && blockType.startsWith('turtle_');
    }

    /**
     * Get all turtle block types
     * @returns {string[]}
     */
    getTurtleBlockTypes() {
        const config = this._getConfig();
        if (config && config.LABELS) {
            return Object.keys(config.LABELS);
        }
        return [
            'turtle_setup', 'turtle_done', 'turtle_forward', 'turtle_backward',
            'turtle_right', 'turtle_left', 'turtle_goto', 'turtle_penup',
            'turtle_pendown', 'turtle_pencolor', 'turtle_pensize', 'turtle_circle',
            'turtle_speed', 'turtle_shape', 'turtle_reset', 'turtle_clear', 'turtle_stamp'
        ];
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let _registrarInstance = null;

/**
 * Get or create the singleton TurtleBlocksRegistrar instance
 * @param {Object} options - Options for creating new instance
 * @returns {TurtleBlocksRegistrar}
 */
function getTurtleBlocksRegistrar(options = {}) {
    if (!_registrarInstance) {
        _registrarInstance = new TurtleBlocksRegistrar(options);
    }
    return _registrarInstance;
}

/**
 * Reset the singleton instance (mainly for testing)
 */
function resetTurtleBlocksRegistrar() {
    _registrarInstance = null;
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof window !== 'undefined') {
    window.TurtleBlocksRegistrar = TurtleBlocksRegistrar;
    window.getTurtleBlocksRegistrar = getTurtleBlocksRegistrar;
    window.resetTurtleBlocksRegistrar = resetTurtleBlocksRegistrar;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TurtleBlocksRegistrar, getTurtleBlocksRegistrar, resetTurtleBlocksRegistrar };
}
