/**
 * Configuration Manager Class
 * Provides type-safe access to configuration with validation and defaults
 *
 * Dependencies: None (standalone)
 */

class ConfigurationManager {
    /**
     * @param {Object} config - Configuration object (typically window.CONFIG)
     */
    constructor(config = null) {
        this._config = config || this._getDefaultConfig();
        this._validated = false;
    }

    /**
     * Get default configuration when none provided
     * @returns {Object}
     * @private
     */
    _getDefaultConfig() {
        return {
            CANVAS: {
                DEFAULT_WIDTH: 400,
                DEFAULT_HEIGHT: 300,
                MULTI_INSTANCE_HEIGHT: 400
            },
            EDITOR: {
                DEFAULT_HEIGHT: '200px',
                DEFAULT_CODE_PLACEHOLDER: '# 여기에 Python 코드를 작성하세요\n',
                BLOCKLY_CODE_PLACEHOLDER: '# 블록을 추가하면 Python 코드가 여기에 표시됩니다...'
            },
            BLOCKLY: {
                MEDIA_PATH: 'https://unpkg.com/blockly/media/',
                HORIZONTAL_LAYOUT: false,
                TOOLBOX_POSITION: 'start',
                ZOOM: {
                    controls: true,
                    wheel: true,
                    startScale: 1.0,
                    maxScale: 3,
                    minScale: 0.3,
                    scaleSpeed: 1.2
                },
                GRID: {
                    spacing: 20,
                    length: 3,
                    colour: '#ccc',
                    snap: true
                },
                TRASHCAN: true
            },
            MERMAID: {
                THEME: 'default',
                FLOWCHART: {
                    useMaxWidth: true,
                    htmlLabels: true,
                    curve: 'basis',
                    rankSpacing: 25,
                    nodeSpacing: 30
                },
                SECURITY_LEVEL: 'loose'
            },
            TIMING: {
                LAYOUT_CHECK_DELAY: 50,
                INIT_DELAY: 100,
                RESIZE_DELAY: 100,
                FLYOUT_FIX_DELAYS: [50, 100, 200],
                CANVAS_FIX_DELAY: 100,
                MERMAID_RETRY_DELAY: 500,
                POST_LOAD_DELAY: 500
            },
            THRESHOLDS: {
                MIN_CONTAINER_WIDTH: 100,
                FLYOUT_Y_THRESHOLD: 50
            },
            STRINGS: {
                FLOWCHART_START: '시작',
                FLOWCHART_END: '끝',
                FLOWCHART_PLACEHOLDER: '블록을 추가하면 흐름도가 여기에 표시됩니다...',
                FLOWCHART_LOADING: 'Mermaid 라이브러리를 로딩 중입니다...',
                FLOWCHART_ERROR: '흐름도 렌더링 중 오류가 발생했습니다.',
                YES: '예',
                NO: '아니오',
                LOOP: '반복',
                CONDITION: '조건',
                REFRESH_BUTTON: '🔄 블록이 안 보이면 클릭'
            },
            SELECTORS: {
                BLOCKLY_DIV: 'blocklyDiv',
                TOOLBOX: 'toolbox',
                OUTPUT_CANVAS: 'outputCanvas',
                TURTLE_CANVAS: 'mycanvas',
                CODE_DISPLAY: 'pythonCodeDisplay',
                MERMAID_DISPLAY: 'mermaidDisplay',
                FLOWCHART_PANEL: 'flowchartPanel'
            }
        };
    }

    /**
     * Get a configuration value by path
     * @param {string} path - Dot-separated path (e.g., 'CANVAS.DEFAULT_WIDTH')
     * @param {*} defaultValue - Default value if path not found
     * @returns {*}
     */
    get(path, defaultValue = undefined) {
        const parts = path.split('.');
        let current = this._config;

        for (const part of parts) {
            if (current === null || current === undefined) {
                return defaultValue;
            }
            current = current[part];
        }

        return current !== undefined ? current : defaultValue;
    }

    /**
     * Get canvas configuration
     * @returns {Object}
     */
    getCanvasConfig() {
        return this.get('CANVAS', this._getDefaultConfig().CANVAS);
    }

    /**
     * Get Blockly configuration
     * @returns {Object}
     */
    getBlocklyConfig() {
        return this.get('BLOCKLY', this._getDefaultConfig().BLOCKLY);
    }

    /**
     * Get Mermaid configuration
     * @returns {Object}
     */
    getMermaidConfig() {
        return this.get('MERMAID', this._getDefaultConfig().MERMAID);
    }

    /**
     * Get timing configuration
     * @returns {Object}
     */
    getTimingConfig() {
        return this.get('TIMING', this._getDefaultConfig().TIMING);
    }

    /**
     * Get a string by key
     * @param {string} key - String key
     * @param {string} defaultValue - Default if not found
     * @returns {string}
     */
    getString(key, defaultValue = '') {
        return this.get(`STRINGS.${key}`, defaultValue);
    }

    /**
     * Get a selector by key
     * @param {string} key - Selector key
     * @param {string} defaultValue - Default if not found
     * @returns {string}
     */
    getSelector(key, defaultValue = '') {
        return this.get(`SELECTORS.${key}`, defaultValue);
    }

    /**
     * Get a threshold value
     * @param {string} key - Threshold key
     * @param {number} defaultValue - Default if not found
     * @returns {number}
     */
    getThreshold(key, defaultValue = 0) {
        return this.get(`THRESHOLDS.${key}`, defaultValue);
    }

    /**
     * Get a timing value
     * @param {string} key - Timing key
     * @param {number} defaultValue - Default if not found
     * @returns {number}
     */
    getTiming(key, defaultValue = 100) {
        return this.get(`TIMING.${key}`, defaultValue);
    }

    /**
     * Check if configuration has a path
     * @param {string} path - Dot-separated path
     * @returns {boolean}
     */
    has(path) {
        return this.get(path) !== undefined;
    }

    /**
     * Get the raw configuration object
     * @returns {Object}
     */
    getRawConfig() {
        return this._config;
    }

    /**
     * Create a new ConfigurationManager with merged config
     * @param {Object} overrides - Configuration overrides
     * @returns {ConfigurationManager}
     */
    extend(overrides) {
        const merged = this._deepMerge(this._config, overrides);
        return new ConfigurationManager(merged);
    }

    /**
     * Deep merge two objects
     * @param {Object} target
     * @param {Object} source
     * @returns {Object}
     * @private
     */
    _deepMerge(target, source) {
        const result = { ...target };
        for (const key of Object.keys(source)) {
            if (source[key] instanceof Object && key in target) {
                result[key] = this._deepMerge(target[key], source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let _configManagerInstance = null;

/**
 * Get or create the singleton ConfigurationManager instance
 * @param {Object} config - Optional config to use (only on first call)
 * @returns {ConfigurationManager}
 */
function getConfigManager(config = null) {
    if (!_configManagerInstance) {
        // Try to use global CONFIG if available
        const globalConfig = typeof CONFIG !== 'undefined' ? CONFIG : null;
        _configManagerInstance = new ConfigurationManager(config || globalConfig);
    }
    return _configManagerInstance;
}

/**
 * Reset the singleton instance (mainly for testing)
 */
function resetConfigManager() {
    _configManagerInstance = null;
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof window !== 'undefined') {
    window.ConfigurationManager = ConfigurationManager;
    window.getConfigManager = getConfigManager;
    window.resetConfigManager = resetConfigManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConfigurationManager, getConfigManager, resetConfigManager };
}
