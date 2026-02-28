/**
 * Shared Utility Functions
 * Common functions used across multiple modules
 *
 * Dependencies:
 * - shared/config.js (for CONFIG)
 */

// ============================================================================
// DOM UTILITIES
// ============================================================================

/**
 * Get element by ID with optional null check
 * @param {string} id - Element ID
 * @returns {HTMLElement|null}
 */
function getElement(id) {
    return document.getElementById(id);
}

/**
 * Get element by ID, throw error if not found
 * @param {string} id - Element ID
 * @param {string} context - Context for error message
 * @returns {HTMLElement}
 */
function requireElement(id, context) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element '${id}' not found${context ? ' in ' + context : ''}`);
    }
    return element;
}

/**
 * Query selector with optional context
 * @param {string} selector - CSS selector
 * @param {Element} context - Optional context element
 * @returns {Element|null}
 */
function query(selector, context) {
    return (context || document).querySelector(selector);
}

/**
 * Query selector all with optional context
 * @param {string} selector - CSS selector
 * @param {Element} context - Optional context element
 * @returns {NodeList}
 */
function queryAll(selector, context) {
    return (context || document).querySelectorAll(selector);
}

/**
 * Clear element content and classes
 * @param {HTMLElement} element - Element to clear
 * @param {string} baseClass - Optional base class to set
 */
function clearElement(element, baseClass) {
    if (!element) return;
    element.textContent = '';
    element.className = baseClass || '';
}

/**
 * Clear multiple elements
 * @param {Object} elements - Object with element references
 * @param {Object} options - Options for clearing
 */
function clearOutputElements(elements, options = {}) {
    const { outputElement, canvasElement } = elements;
    const { outputBaseClass = '' } = options;

    if (outputElement) {
        outputElement.textContent = '';
        outputElement.className = outputBaseClass;
    }

    if (canvasElement) {
        canvasElement.innerHTML = '';
    }
}

// ============================================================================
// CANVAS UTILITIES
// ============================================================================

/**
 * Fix canvas element positioning to relative
 * @param {HTMLCanvasElement} canvas - Canvas element to fix
 */
function fixCanvasPosition(canvas) {
    if (!canvas) return;
    canvas.style.position = 'relative';
    canvas.style.top = '';
    canvas.style.left = '';
    canvas.style.right = '';
    canvas.style.bottom = '';
}

/**
 * Fix all canvas elements in a container
 * @param {HTMLElement} container - Container element
 */
function fixAllCanvasPositions(container) {
    if (!container) return;

    container.style.position = 'relative';
    const canvases = container.querySelectorAll('canvas');
    canvases.forEach(fixCanvasPosition);
}

/**
 * Create mutation observer to fix canvas positioning
 * @param {HTMLElement} container - Container to observe
 * @returns {MutationObserver}
 */
function createCanvasPositionObserver(container) {
    if (!container) return null;

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) {
                    const canvases = node.tagName === 'CANVAS'
                        ? [node]
                        : (node.querySelectorAll ? node.querySelectorAll('canvas') : []);
                    canvases.forEach(fixCanvasPosition);
                }
            });
        });
    });

    observer.observe(container, {
        childList: true,
        subtree: true
    });

    return observer;
}

// ============================================================================
// BLOCKLY UTILITIES
// ============================================================================

/**
 * Get input value from a Blockly block
 * @param {Object} block - Blockly block
 * @param {string} inputName - Input name
 * @param {string} defaultValue - Default value if not found
 * @returns {string}
 */
function getBlockInputValue(block, inputName, defaultValue) {
    const input = block.getInput(inputName);
    if (!input) return defaultValue;

    const connection = input.connection;
    if (!connection || !connection.targetBlock()) return defaultValue;

    const targetBlock = connection.targetBlock();

    if (targetBlock.type === 'math_number') {
        return targetBlock.getFieldValue('NUM') || defaultValue;
    }
    if (targetBlock.type === 'text') {
        return '"' + (targetBlock.getFieldValue('TEXT') || '') + '"';
    }
    if (targetBlock.type === 'variables_get') {
        const varField = targetBlock.getField('VAR');
        return varField ? varField.getText() : defaultValue;
    }

    return defaultValue;
}

/**
 * Get human-readable label for a Blockly block
 * @param {Object} block - Blockly block
 * @returns {string}
 */
function getBlockLabel(block) {
    const type = block.type;
    const cfg = typeof CONFIG !== 'undefined' ? CONFIG.STRINGS : null;

    // Turtle blocks
    if (type === 'turtle_setup') return cfg?.TURTLE_START || '거북이 시작';
    if (type === 'turtle_done') return cfg?.TURTLE_END || '거북이 끝';

    if (type === 'turtle_forward') {
        const step = getBlockInputValue(block, 'STEP', '10');
        return (cfg?.FORWARD || '앞으로') + ' ' + step;
    }
    if (type === 'turtle_backward') {
        const step = getBlockInputValue(block, 'STEP', '10');
        return (cfg?.BACKWARD || '뒤로') + ' ' + step;
    }
    if (type === 'turtle_right') {
        const angle = getBlockInputValue(block, 'ANGLE', '90');
        return (cfg?.RIGHT || '오른쪽') + ' ' + angle + '도';
    }
    if (type === 'turtle_left') {
        const angle = getBlockInputValue(block, 'ANGLE', '90');
        return (cfg?.LEFT || '왼쪽') + ' ' + angle + '도';
    }
    if (type === 'turtle_goto') {
        const x = getBlockInputValue(block, 'X', '0');
        const y = getBlockInputValue(block, 'Y', '0');
        return (cfg?.MOVE_TO || '이동') + ' (' + x + ', ' + y + ')';
    }
    if (type === 'turtle_penup') return cfg?.PEN_UP || '펜 올리기';
    if (type === 'turtle_pendown') return cfg?.PEN_DOWN || '펜 내리기';
    if (type === 'turtle_pencolor') {
        const color = block.getFieldValue('COLOR') || 'black';
        return (cfg?.PEN_COLOR || '펜 색상') + ': ' + color;
    }
    if (type === 'turtle_pensize') {
        const width = getBlockInputValue(block, 'WIDTH', '1');
        return (cfg?.PEN_SIZE || '펜 두께') + ': ' + width;
    }
    if (type === 'turtle_fillcolor') {
        const color = block.getFieldValue('COLOR') || 'black';
        return (cfg?.FILL_COLOR || '채우기 색상') + ': ' + color;
    }
    if (type === 'turtle_begin_fill') return cfg?.BEGIN_FILL || '채우기 시작';
    if (type === 'turtle_end_fill') return cfg?.END_FILL || '채우기 끝';
    if (type === 'turtle_circle') {
        const radius = getBlockInputValue(block, 'RADIUS', '50');
        return (cfg?.DRAW_CIRCLE || '원 그리기') + ' r=' + radius;
    }
    if (type === 'turtle_speed') {
        const speed = block.getFieldValue('SPEED') || '5';
        return (cfg?.SPEED || '속도') + ': ' + speed;
    }
    if (type === 'turtle_shape') {
        const shape = block.getFieldValue('SHAPE') || 'turtle';
        return (cfg?.SHAPE || '모양') + ': ' + shape;
    }
    if (type === 'turtle_reset') return cfg?.CLEAR_SCREEN || '화면 지우기';
    if (type === 'turtle_clear') return cfg?.CLEAR_DRAWING || '그림만 지우기';
    if (type === 'turtle_stamp') return cfg?.STAMP || '도장 찍기';

    // Control blocks
    if (type === 'controls_if') return cfg?.IF || '만약';
    if (type === 'controls_ifelse') return cfg?.IF_ELSE || '만약/아니면';
    if (type === 'controls_repeat_ext') {
        const times = getBlockInputValue(block, 'TIMES', '10');
        return times + (cfg?.REPEAT || '번 반복');
    }
    if (type === 'controls_for') {
        const varField = block.getField('VAR');
        const varName = varField ? varField.getText() : 'i';
        const from = getBlockInputValue(block, 'FROM', '0');
        const to = getBlockInputValue(block, 'TO', '10');
        const by = getBlockInputValue(block, 'BY', '1');
        return varName + ' : ' + from + ' to ' + to + ' by ' + by;
    }
    if (type === 'controls_whileUntil') {
        const mode = block.getFieldValue('MODE');
        return mode === 'WHILE' ? (cfg?.WHILE || '~하는 동안') : (cfg?.UNTIL || '~할 때까지');
    }

    // Text blocks
    if (type === 'text_print') {
        const printValue = getBlockInputValue(block, 'TEXT', '');
        return (cfg?.PRINT || '출력') + ' ' + printValue;
    }
    if (type === 'text') {
        const text = block.getFieldValue('TEXT') || '';
        return '"' + (text.length > 10 ? text.substring(0, 10) + '...' : text) + '"';
    }

    // Math blocks
    if (type === 'math_number') {
        return block.getFieldValue('NUM') || '0';
    }
    if (type === 'math_arithmetic') return cfg?.CALCULATE || '계산';

    // Variable blocks
    if (type === 'variables_set') {
        const varField = block.getField('VAR');
        const varName = varField ? varField.getText() : 'var';
        return varName + ' ' + (cfg?.SET_VAR || '설정');
    }
    if (type === 'variables_get') {
        const varField = block.getField('VAR');
        return varField ? varField.getText() : 'var';
    }

    // Default
    return type.replace(/_/g, ' ');
}

/**
 * Get condition text for control blocks
 * @param {Object} block - Blockly block
 * @returns {string}
 */
function getConditionText(block) {
    const cfg = typeof CONFIG !== 'undefined' ? CONFIG.STRINGS : null;
    const conditionLabel = cfg?.CONDITION || '조건';

    const input = block.getInput('IF0') || block.getInput('BOOL');
    if (!input || !input.connection || !input.connection.targetBlock()) {
        return conditionLabel;
    }

    const condBlock = input.connection.targetBlock();

    if (condBlock.type === 'logic_compare') {
        const op = condBlock.getFieldValue('OP');
        const opSymbol = { 'EQ': '=', 'NEQ': '≠', 'LT': '<', 'LTE': '≤', 'GT': '>', 'GTE': '≥' }[op] || '?';
        const a = getBlockInputValue(condBlock, 'A', 'A');
        const b = getBlockInputValue(condBlock, 'B', 'B');
        return a + ' ' + opSymbol + ' ' + b;
    }
    if (condBlock.type === 'logic_operation') {
        const op = condBlock.getFieldValue('OP');
        return op === 'AND' ? 'AND ' + conditionLabel : 'OR ' + conditionLabel;
    }
    if (condBlock.type === 'logic_boolean') {
        const val = condBlock.getFieldValue('BOOL') === 'TRUE';
        return val ? (cfg?.TRUE || '참') : (cfg?.FALSE || '거짓');
    }

    return conditionLabel;
}

/**
 * Fix Blockly flyout positioning
 * @param {HTMLElement} blocklyDiv - Blockly container element
 */
function fixFlyoutPosition(blocklyDiv) {
    if (!blocklyDiv) return;


    const threshold = typeof CONFIG !== 'undefined'
        ? CONFIG.THRESHOLDS.FLYOUT_Y_THRESHOLD
        : 50;

    const flyoutDiv = blocklyDiv.querySelector('.blocklyFlyout');
    const flyoutSvg = blocklyDiv.querySelector('.blocklyFlyout svg') ||
                      blocklyDiv.querySelector('svg.blocklyFlyout');


    if (flyoutDiv) {
        const flyoutRect = flyoutDiv.getBoundingClientRect();
        const blocklyRect = blocklyDiv.getBoundingClientRect();
        const relativeTop = flyoutRect.top - blocklyRect.top;

        if (relativeTop > threshold) {
            // Force flyout to top using both style and CSS to prevent drag offset
            flyoutDiv.style.top = '0px';
            flyoutDiv.style.setProperty('top', '0px', 'important');
        }
    }

    if (flyoutSvg) {
        const currentTransform = flyoutSvg.getAttribute('transform');

        if (currentTransform) {
            const translateMatch = currentTransform.match(/translate\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/);
            if (translateMatch) {
                const x = parseFloat(translateMatch[1]);
                const y = parseFloat(translateMatch[2]);

                if (y > threshold) {
                    flyoutSvg.setAttribute('transform', 'translate(' + x + ', 0)');
                }
            }
        }


        // Only force visibility if Blockly's flyout is actually visible
        // This prevents overriding Blockly's hide attempts
        if (isFlyoutVisible) {

            flyoutSvg.style.display = 'block';
            flyoutSvg.style.visibility = 'visible';

        }
    }
}

/**
 * Create flyout position observer
 * @param {HTMLElement} blocklyDiv - Blockly container
 * @returns {MutationObserver}
 */
function createFlyoutObserver(blocklyDiv) {
    const delays = typeof CONFIG !== 'undefined'
        ? CONFIG.TIMING.FLYOUT_FIX_DELAYS
        : [50, 100, 200];

    const observer = new MutationObserver(function(mutations) {
        let shouldFix = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'transform') {
                const target = mutation.target;
                if (target.classList &&
                    (target.classList.contains('blocklyFlyout') ||
                     target.classList.contains('blocklyToolboxFlyout'))) {
                    shouldFix = true;
                }
            }
        });
        if (shouldFix) {
            delays.forEach(function(delay) {
                setTimeout(function() { fixFlyoutPosition(blocklyDiv); }, delay);
            });
        }
    });

    observer.observe(blocklyDiv, {
        subtree: true,
        attributes: true,
        attributeFilter: ['transform']
    });

    return observer;
}

/**
 * Setup flyout fix on toolbox clicks
 * @param {HTMLElement} blocklyDiv - Blockly container
 */
function setupFlyoutClickFix(blocklyDiv) {
    const delays = typeof CONFIG !== 'undefined'
        ? CONFIG.TIMING.FLYOUT_FIX_DELAYS
        : [50, 100, 200];

    blocklyDiv.addEventListener('click', function(e) {

        const treeRow = e.target.closest('.blocklyTreeRow');
        if (treeRow) {
            delays.forEach(delay => {
                setTimeout(() => fixFlyoutPosition(blocklyDiv), delay);
            });
        }

    }, true);

    // Fix flyout position before drag starts to prevent coordinate offset
    blocklyDiv.addEventListener('mousedown', function(e) {
        const flyoutBlock = e.target.closest('.blocklyFlyout .blocklyDraggable');
        if (flyoutBlock) {
            // Fix flyout position immediately before drag starts
            fixFlyoutPosition(blocklyDiv);
        }
    }, true);

    // Hide flyout when clicking outside or on workspace blocks
    document.addEventListener('click', function(e) {

        // Hide flyout if clicking outside flyout/toolbox or on workspace blocks
        if (!isClickInFlyout && !isClickInToolbox && (isWorkspaceBlock || !isClickInBlocklyDiv)) {
            const workspace = typeof Blockly !== 'undefined' && typeof getWorkspace === 'function' ? getWorkspace() : null;
            const toolbox = workspace?.getToolbox?.();
            
            if (toolbox && typeof toolbox.hideFlyout === 'function') {
                
                toolbox.hideFlyout();
            }
        }
    }, true);
}

// ============================================================================
// MERMAID UTILITIES
// ============================================================================

/**
 * Escape special characters for Mermaid labels
 * @param {string} text - Text to escape
 * @returns {string}
 */
function escapeMermaidLabel(text) {
    return text
        .replace(/"/g, "'")
        .replace(/[<>]/g, '')
        .replace(/[\[\]]/g, '')
        .replace(/[{}]/g, '')
        .replace(/\|/g, '│')
        .replace(/[()]/g, '')
        .replace(/~/g, '-')
        .replace(/=/g, ':')
        .replace(/;/g, ',');
}

// ============================================================================
// HTML UTILITIES
// ============================================================================

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string}
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// TIMING UTILITIES
// ============================================================================

/**
 * Delay execution with promise
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise}
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute callback after delay
 * @param {Function} callback - Function to execute
 * @param {number} ms - Delay in milliseconds
 */
function delayedCall(callback, ms) {
    setTimeout(callback, ms);
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof window !== 'undefined') {
    // DOM utilities
    window.getElement = getElement;
    window.requireElement = requireElement;
    window.query = query;
    window.queryAll = queryAll;
    window.clearElement = clearElement;
    window.clearOutputElements = clearOutputElements;

    // Canvas utilities
    window.fixCanvasPosition = fixCanvasPosition;
    window.fixAllCanvasPositions = fixAllCanvasPositions;
    window.createCanvasPositionObserver = createCanvasPositionObserver;

    // Blockly utilities
    window.getBlockInputValue = getBlockInputValue;
    window.getBlockLabel = getBlockLabel;
    window.getConditionText = getConditionText;
    window.fixFlyoutPosition = fixFlyoutPosition;
    window.createFlyoutObserver = createFlyoutObserver;
    window.setupFlyoutClickFix = setupFlyoutClickFix;

    // Mermaid utilities
    window.escapeMermaidLabel = escapeMermaidLabel;

    // HTML utilities
    window.escapeHtml = escapeHtml;

    // Timing utilities
    window.delay = delay;
    window.delayedCall = delayedCall;
}
