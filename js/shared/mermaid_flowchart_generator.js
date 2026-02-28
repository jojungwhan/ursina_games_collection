/**
 * Mermaid Flowchart Generator Class
 * Encapsulates flowchart generation from Blockly workspace
 *
 * Dependencies:
 * - configuration_manager.js (optional, for ConfigurationManager)
 * - Mermaid library (external)
 */

class MermaidFlowchartGenerator {
    /**
     * @param {Object} options - Configuration options
     * @param {Object} options.config - ConfigurationManager instance
     * @param {Object} options.mermaid - Mermaid library instance
     */
    constructor(options = {}) {
        this._config = options.config || null;
        this._mermaid = options.mermaid || null;
        this._ready = false;
        this._nodeCounter = 0;
    }

    // ========================================================================
    // GETTERS
    // ========================================================================

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
     * Get Mermaid library (lazy load from window)
     * @returns {Object|null}
     */
    getMermaid() {
        if (this._mermaid) return this._mermaid;
        if (typeof window !== 'undefined' && typeof window.mermaid !== 'undefined') {
            this._mermaid = window.mermaid;
        }
        return this._mermaid;
    }

    /**
     * Check if Mermaid is ready
     * @returns {boolean}
     */
    isReady() {
        return this._ready;
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /**
     * Initialize Mermaid library
     * @returns {Promise<boolean>}
     */
    async ensureReady() {
        if (this._ready) return true;

        const mermaid = this.getMermaid();
        if (!mermaid) {
            console.warn('MermaidFlowchartGenerator: Mermaid library not loaded');
            return false;
        }

        const config = this.getConfig();
        const mermaidConfig = config ? config.getMermaidConfig() : null;

        try {
            mermaid.initialize({
                startOnLoad: false,
                theme: mermaidConfig?.THEME || 'default',
                flowchart: mermaidConfig?.FLOWCHART || {
                    useMaxWidth: true,
                    htmlLabels: true,
                    curve: 'basis'
                },
                securityLevel: mermaidConfig?.SECURITY_LEVEL || 'loose'
            });
            this._ready = true;
            console.log('MermaidFlowchartGenerator: Mermaid initialized');
            return true;
        } catch (e) {
            console.warn('MermaidFlowchartGenerator: Error initializing Mermaid:', e);
            return false;
        }
    }

    // ========================================================================
    // LABEL GENERATION
    // ========================================================================

    /**
     * Escape text for Mermaid labels
     * @param {string} text - Text to escape
     * @returns {string}
     */
    escapeLabel(text) {
        if (typeof window !== 'undefined' && typeof window.escapeMermaidLabel === 'function') {
            return window.escapeMermaidLabel(text);
        }
        return text.replace(/"/g, "'").replace(/[<>\[\]{}|()~=;]/g, '');
    }

    /**
     * Get block input value
     * @param {Object} block - Blockly block
     * @param {string} inputName - Input name
     * @param {string} defaultValue - Default value
     * @returns {string}
     * @private
     */
    _getInputValue(block, inputName, defaultValue) {
        if (typeof window !== 'undefined' && typeof window.getBlockInputValue === 'function') {
            return window.getBlockInputValue(block, inputName, defaultValue);
        }

        const input = block.getInput(inputName);
        if (!input || !input.connection || !input.connection.targetBlock()) return defaultValue;
        const targetBlock = input.connection.targetBlock();
        if (targetBlock.type === 'math_number') {
            return targetBlock.getFieldValue('NUM') || defaultValue;
        }
        return defaultValue;
    }

    /**
     * Get human-readable label for a block
     * @param {Object} block - Blockly block
     * @returns {string}
     */
    getBlockLabel(block) {
        // Use shared function if available
        if (typeof window !== 'undefined' && typeof window.getBlockLabel === 'function') {
            return window.getBlockLabel(block, this._getInputValue.bind(this));
        }

        const type = block.type;

        // Turtle blocks
        if (type === 'turtle_setup') return '거북이 시작';
        if (type === 'turtle_done') return '거북이 끝';
        if (type === 'turtle_forward') return '앞으로 ' + this._getInputValue(block, 'STEP', '10');
        if (type === 'turtle_backward') return '뒤로 ' + this._getInputValue(block, 'STEP', '10');
        if (type === 'turtle_right') return '오른쪽 ' + this._getInputValue(block, 'ANGLE', '90') + '도';
        if (type === 'turtle_left') return '왼쪽 ' + this._getInputValue(block, 'ANGLE', '90') + '도';
        if (type === 'turtle_penup') return '펜 올리기';
        if (type === 'turtle_pendown') return '펜 내리기';
        if (type === 'turtle_pencolor') return '펜 색상: ' + (block.getFieldValue('COLOR') || 'black');
        if (type === 'turtle_reset') return '화면 지우기';
        if (type === 'turtle_clear') return '그림만 지우기';

        // Control blocks
        if (type === 'controls_if') return '만약';
        if (type === 'controls_ifelse') return '만약/아니면';
        if (type === 'controls_repeat_ext') return this._getInputValue(block, 'TIMES', '10') + '번 반복';
        if (type === 'controls_whileUntil') return '반복';
        if (type === 'controls_for') return 'for 반복';

        // Text/Output
        if (type === 'text_print') return '출력';

        // Default
        return type.replace(/_/g, ' ');
    }

    /**
     * Get condition text for a block
     * @param {Object} block - Blockly block
     * @returns {string}
     */
    getConditionText(block) {
        if (typeof window !== 'undefined' && typeof window.getConditionText === 'function') {
            return window.getConditionText(block);
        }

        const config = this.getConfig();
        return config ? config.getString('CONDITION', '조건') : '조건';
    }

    // ========================================================================
    // SVG POST-PROCESSING
    // ========================================================================

    /**
     * Shorten flowchart arrow/edge paths to approximately half length
     * while ensuring arrows remain connected to target nodes
     * @param {string} svgString - The SVG string from Mermaid
     * @returns {string} - Modified SVG string with shortened arrows
     * @private
     */
    _shortenFlowchartArrows(svgString) {
        
        if (!svgString || typeof svgString !== 'string') {
            return svgString;
        }

        // Create a temporary DOM element to parse the SVG
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgString;
        const svgElement = tempDiv.querySelector('svg');
        
        
        if (!svgElement) {
            return svgString;
        }

        // Find all path elements that represent edges/arrows
        // Mermaid uses classes like "flowchart-link", "edge", or paths with marker-end
        const edgePaths = svgElement.querySelectorAll('path[class*="flowchart-link"], path[class*="edge"], path[marker-end]');
        
        // Get all nodes to find target nodes for each path
        const allNodes = Array.from(svgElement.querySelectorAll('.node rect, .node circle, .node ellipse, .node polygon'));
        const nodeBounds = allNodes.map(node => {
            const bbox = node.getBBox();
            return { element: node, x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height, 
                     top: bbox.y, bottom: bbox.y + bbox.height, left: bbox.x, right: bbox.x + bbox.width };
        });
        
        
        edgePaths.forEach((path, index) => {
            try {
                // Get the path data
                const pathData = path.getAttribute('d');
                if (!pathData) return;

                // Use SVGPathElement API to get path length and points
                const pathLength = path.getTotalLength();
                if (pathLength === 0) return;

                // Get start and end points (these should be at node edges)
                const startPoint = path.getPointAtLength(0);
                const endPoint = path.getPointAtLength(pathLength);
                
                
                // Strategy: Shorten the path to about 50% of its length,
                // then add a small straight extension to ensure connection to target node
                
                // Get the point at 50% of the path length (this is where we'll "cut" the arrow)
                const shortenedPoint = path.getPointAtLength(pathLength * 0.5);
                
                // Get the direction at the shortened point to maintain arrow direction
                const directionPoint = path.getPointAtLength(Math.min(pathLength * 0.5 + 2, pathLength));
                const directionDx = directionPoint.x - shortenedPoint.x;
                const directionDy = directionPoint.y - shortenedPoint.y;
                const directionLength = Math.sqrt(directionDx * directionDx + directionDy * directionDy);
                
                // Find the target node by finding the closest node to the original end point
                // The target node should be near the end point
                let targetNode = null;
                let minDist = Infinity;
                let targetNodeBoundary = null;
                
                for (const nodeBound of nodeBounds) {
                    // Check if end point is near this node (within reasonable distance)
                    const distToNode = Math.min(
                        Math.abs(endPoint.x - nodeBound.left),
                        Math.abs(endPoint.x - nodeBound.right),
                        Math.abs(endPoint.y - nodeBound.top),
                        Math.abs(endPoint.y - nodeBound.bottom)
                    );
                    
                    // Also check if point is within node bounds (with small tolerance)
                    const isNearNode = (endPoint.x >= nodeBound.left - 5 && endPoint.x <= nodeBound.right + 5 &&
                                       endPoint.y >= nodeBound.top - 5 && endPoint.y <= nodeBound.bottom + 5) ||
                                      distToNode < 20;
                    
                    if (isNearNode && distToNode < minDist) {
                        minDist = distToNode;
                        targetNode = nodeBound;
                        
                        // Determine which edge of the node the arrow should connect to
                        // Based on direction from shortened point to end point
                        const toEndDx = endPoint.x - shortenedPoint.x;
                        const toEndDy = endPoint.y - shortenedPoint.y;
                        
                        if (Math.abs(toEndDy) > Math.abs(toEndDx)) {
                            // Vertical arrow - connect to top or bottom
                            targetNodeBoundary = toEndDy > 0 ? nodeBound.top : nodeBound.bottom;
                        } else {
                            // Horizontal arrow - connect to left or right
                            targetNodeBoundary = toEndDx > 0 ? nodeBound.left : nodeBound.right;
                        }
                    }
                }
                
                // Calculate how far we need to extend to reach the target node
                const toEndDx = endPoint.x - shortenedPoint.x;
                const toEndDy = endPoint.y - shortenedPoint.y;
                const toEndDistance = Math.sqrt(toEndDx * toEndDx + toEndDy * toEndDy);
                
                
                // Calculate final end point - extend all the way to target node if found
                let finalEndX, finalEndY;
                let extensionAmount;
                let normalizedDx, normalizedDy;
                
                if (targetNode && directionLength > 0) {
                    // Extend all the way to the target node boundary
                    normalizedDx = directionDx / directionLength;
                    normalizedDy = directionDy / directionLength;
                    
                    // Calculate distance needed to reach node boundary
                    // Project shortened point + direction onto node boundary
                    if (Math.abs(normalizedDy) > Math.abs(normalizedDx)) {
                        // Vertical arrow
                        const targetY = normalizedDy > 0 ? targetNode.top : targetNode.bottom;
                        const t = (targetY - shortenedPoint.y) / normalizedDy;
                        finalEndX = shortenedPoint.x + normalizedDx * t;
                        finalEndY = targetY;
                        extensionAmount = t;
                    } else {
                        // Horizontal arrow
                        const targetX = normalizedDx > 0 ? targetNode.left : targetNode.right;
                        const t = (targetX - shortenedPoint.x) / normalizedDx;
                        finalEndX = targetX;
                        finalEndY = shortenedPoint.y + normalizedDy * t;
                        extensionAmount = t;
                    }
                } else {
                    // Fallback: extend by a larger amount (up to 50px or 50% of remaining distance)
                    extensionAmount = Math.min(50, toEndDistance * 0.5);
                    normalizedDx = directionLength > 0 ? directionDx / directionLength : toEndDx / toEndDistance;
                    normalizedDy = directionLength > 0 ? directionDy / directionLength : toEndDy / toEndDistance;
                    finalEndX = shortenedPoint.x + normalizedDx * extensionAmount;
                    finalEndY = shortenedPoint.y + normalizedDy * extensionAmount;
                }
                

                // Create a new path that's shorter but still reaches the target
                let newPathData;
                
                // Check if the original path has curve commands
                if (pathData.includes('C') || pathData.includes('Q') || pathData.includes('S')) {
                    // For curved paths, sample a few points along the first 50% to preserve curve shape
                    const p1 = startPoint;
                    const p2 = path.getPointAtLength(pathLength * 0.25);
                    const p3 = shortenedPoint;
                    
                    // Create a smooth curve through these points, then extend straight to final end
                    const controlX = p1.x + (p3.x - p1.x) * 0.6;
                    const controlY = p1.y + (p3.y - p1.y) * 0.6;
                    
                    // Use quadratic curve for the main shortened path, then line to final end
                    newPathData = `M ${p1.x},${p1.y} Q ${controlX},${controlY} ${p3.x},${p3.y} L ${finalEndX},${finalEndY}`;
                } else {
                    // For straight paths, create a direct line (shortened to 50% + small extension)
                    newPathData = `M ${startPoint.x},${startPoint.y} L ${finalEndX},${finalEndY}`;
                }

                // Update the path data
                path.setAttribute('d', newPathData);
                
            } catch (e) {
                // If path manipulation fails, skip this path
                console.warn('MermaidFlowchartGenerator: Error shortening path:', e);
            }
        });
        

        // Return the modified SVG as string
        return tempDiv.innerHTML;
    }

    // ========================================================================
    // FLOWCHART GENERATION
    // ========================================================================

    /**
     * Process a block and its children recursively
     * @param {Object} block - Blockly block
     * @param {string[]} lines - Mermaid lines array
     * @param {string} parentId - Parent node ID
     * @param {string} connectionLabel - Label for connection
     * @param {string} endNodeId - End node ID
     * @returns {Array} - Terminal nodes
     * @private
     */
    _processBlock(block, lines, parentId, connectionLabel, endNodeId) {
        if (!block || block.isShadow()) return [parentId];

        const nodeId = 'N' + (this._nodeCounter++);
        let label = this.escapeLabel(this.getBlockLabel(block));
        const type = block.type;

        // Safeguard: ensure label is never empty (prevents invalid mermaid syntax)
        if (!label || label.trim() === '') {
            label = type ? type.replace(/_/g, ' ') : 'block';
        }

        const config = this.getConfig();
        const strings = config ? {
            YES: config.getString('YES', '예'),
            NO: config.getString('NO', '아니오'),
            LOOP: config.getString('LOOP', '반복')
        } : { YES: '예', NO: '아니오', LOOP: '반복' };

        // Determine node shape
        let nodeShape;
        if (type === 'turtle_setup' || type === 'turtle_done') {
            nodeShape = nodeId + '([' + label + '])';
        } else if (type.startsWith('controls_if') || type === 'controls_whileUntil') {
            const condText = this.escapeLabel(this.getConditionText(block));
            nodeShape = nodeId + '{' + condText + '}';
        } else if (type === 'controls_repeat_ext' || type === 'controls_for') {
            nodeShape = nodeId + '{' + label + '}';
        } else if (type === 'text_print') {
            nodeShape = nodeId + '[/' + label + '/]';
        } else {
            nodeShape = nodeId + '[' + label + ']';
        }

        lines.push('    ' + nodeShape);

        // Connect to parent
        if (parentId) {
            if (connectionLabel) {
                lines.push('    ' + parentId + ' -->|' + connectionLabel + '| ' + nodeId);
            } else {
                lines.push('    ' + parentId + ' --> ' + nodeId);
            }
        }

        let terminalNodes = [];

        // Handle control structures
        if (type === 'controls_if' || type === 'controls_ifelse') {
            const doInput = block.getInput('DO0');
            let hasDoBlock = doInput && doInput.connection && doInput.connection.targetBlock();

            if (hasDoBlock) {
                const doTerminals = this._processBlock(
                    doInput.connection.targetBlock(), lines, nodeId, strings.YES, endNodeId
                );
                terminalNodes = terminalNodes.concat(doTerminals);
            }

            const elseInput = block.getInput('ELSE');
            let hasElseBlock = elseInput && elseInput.connection && elseInput.connection.targetBlock();

            if (hasElseBlock) {
                const elseTerminals = this._processBlock(
                    elseInput.connection.targetBlock(), lines, nodeId, strings.NO, endNodeId
                );
                terminalNodes = terminalNodes.concat(elseTerminals);
            }

            if (!hasDoBlock) {
                terminalNodes.push({ id: nodeId, label: strings.YES, isEmpty: true });
            }
            if (!hasElseBlock) {
                terminalNodes.push({ id: nodeId, label: strings.NO, isEmpty: true });
            }

        } else if (type === 'controls_repeat_ext' || type === 'controls_whileUntil' || type === 'controls_for') {
            const doInput = block.getInput('DO');
            if (doInput && doInput.connection && doInput.connection.targetBlock()) {
                const loopTerminals = this._processBlock(
                    doInput.connection.targetBlock(), lines, nodeId, strings.LOOP, endNodeId
                );
                loopTerminals.forEach(terminal => {
                    if (typeof terminal === 'string') {
                        lines.push('    ' + terminal + ' --> ' + nodeId);
                    } else if (!terminal.isEmpty) {
                        lines.push('    ' + terminal.id + ' --> ' + nodeId);
                    }
                });
            }
            terminalNodes.push(nodeId);
        } else {
            terminalNodes.push(nodeId);
        }

        // Process next block
        const nextBlock = block.getNextBlock();
        if (nextBlock) {
            const realTerminals = terminalNodes.filter(t => typeof t === 'string' || !t.isEmpty);
            const emptyBranches = terminalNodes.filter(t => typeof t !== 'string' && t.isEmpty);

            if (realTerminals.length > 0) {
                const firstTerminal = typeof realTerminals[0] === 'string'
                    ? realTerminals[0] : realTerminals[0].id;
                return this._processBlock(nextBlock, lines, firstTerminal, null, endNodeId);
            }

            const nextTerminals = this._processBlock(nextBlock, lines, null, null, endNodeId);
            const nextFirstNode = 'N' + (this._nodeCounter - 1);

            emptyBranches.forEach(eb => {
                lines.push('    ' + eb.id + ' -->|' + eb.label + '| ' + nextFirstNode);
            });

            return nextTerminals;
        }

        return terminalNodes;
    }

    /**
     * Generate Mermaid flowchart code from workspace
     * @param {Object} workspace - Blockly workspace
     * @returns {string|null} - Mermaid code or null if empty
     */
    generate(workspace) {
        if (!workspace) return null;

        // Reset counter for each generation
        this._nodeCounter = 0;

        const config = this.getConfig();
        const startLabel = config ? config.getString('FLOWCHART_START', '시작') : '시작';
        const endLabel = config ? config.getString('FLOWCHART_END', '끝') : '끝';

        const lines = ['flowchart TD'];
        const topBlocks = workspace.getTopBlocks(true);

        if (topBlocks.length === 0) return null;

        const startId = 'START';
        const endId = 'END';
        lines.push('    ' + startId + '([' + startLabel + '])');

        let allTerminals = [];

        topBlocks.forEach((block) => {
            if (!block.isShadow()) {
                const terminals = this._processBlock(block, lines, startId, null, endId);
                allTerminals = allTerminals.concat(terminals);
            }
        });

        lines.push('    ' + endId + '([' + endLabel + '])');

        // Connect terminals to end
        allTerminals.forEach(terminal => {
            if (typeof terminal === 'string') {
                lines.push('    ' + terminal + ' --> ' + endId);
            } else if (terminal.isEmpty) {
                lines.push('    ' + terminal.id + ' -->|' + terminal.label + '| ' + endId);
            } else {
                lines.push('    ' + terminal.id + ' --> ' + endId);
            }
        });

        return lines.join('\n');
    }

    /**
     * Render flowchart to element
     * @param {Object} workspace - Blockly workspace
     * @param {string|HTMLElement} displayElement - Display element or ID
     * @returns {Promise<boolean>}
     */
    async render(workspace, displayElement) {
        const element = typeof displayElement === 'string'
            ? document.getElementById(displayElement)
            : displayElement;

        if (!element) {
            console.warn('MermaidFlowchartGenerator: Display element not found');
            return false;
        }

        const config = this.getConfig();

        // Generate code
        let mermaidCode;
        try {
            mermaidCode = this.generate(workspace);
        } catch (e) {
            console.error('MermaidFlowchartGenerator: Error generating code:', e);
            const errorMsg = config ? config.getString('FLOWCHART_GEN_ERROR', '흐름도 코드 생성 중 오류가 발생했습니다.') :
                '흐름도 코드 생성 중 오류가 발생했습니다.';
            element.innerHTML = '<div class="flowchart-placeholder">' + errorMsg + '</div>';
            return false;
        }

        // Handle empty workspace
        if (!mermaidCode) {
            const placeholder = config ? config.getString('FLOWCHART_PLACEHOLDER', '블록을 추가하면 흐름도가 여기에 표시됩니다...') :
                '블록을 추가하면 흐름도가 여기에 표시됩니다...';
            element.innerHTML = '<div class="flowchart-placeholder">' + placeholder + '</div>';
            return true;
        }

        // Ensure Mermaid is ready
        const ready = await this.ensureReady();

        if (!ready) {
            const loadingMsg = config ? config.getString('FLOWCHART_LOADING', 'Mermaid 라이브러리를 로딩 중입니다...') :
                'Mermaid 라이브러리를 로딩 중입니다...';
            element.innerHTML = '<div class="flowchart-placeholder">' + loadingMsg + '</div>';

            // Retry
            const retryDelay = config ? config.getTiming('MERMAID_RETRY_DELAY', 500) : 500;
            setTimeout(() => this.render(workspace, displayElement), retryDelay);
            return false;
        }

        // Render
        try {
            const mermaid = this.getMermaid();
            const diagramId = 'mermaid-diagram-' + Date.now();
            const { svg } = await mermaid.render(diagramId, mermaidCode);

            // Arrow spacing is now controlled via Mermaid's rankSpacing config
            // No SVG post-processing needed

            // Re-get element in case DOM changed
            const currentElement = typeof displayElement === 'string'
                ? document.getElementById(displayElement)
                : displayElement;

            if (currentElement) {
                currentElement.innerHTML = '<div class="mermaid-rendered">' + svg + '</div>';
            }
            return true;
        } catch (e) {
            console.error('MermaidFlowchartGenerator: Error rendering:', e);
            const errorMsg = config ? config.getString('FLOWCHART_ERROR', '흐름도 렌더링 중 오류가 발생했습니다.') :
                '흐름도 렌더링 중 오류가 발생했습니다.';
            element.innerHTML = '<div class="flowchart-placeholder">' + errorMsg +
                '<br><small>' + (e.message || 'Unknown error') + '</small></div>';
            return false;
        }
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let _flowchartGeneratorInstance = null;

/**
 * Get or create the singleton MermaidFlowchartGenerator instance
 * @param {Object} options - Options for creating new instance
 * @returns {MermaidFlowchartGenerator}
 */
function getFlowchartGenerator(options = {}) {
    if (!_flowchartGeneratorInstance) {
        _flowchartGeneratorInstance = new MermaidFlowchartGenerator(options);
    }
    return _flowchartGeneratorInstance;
}

/**
 * Reset the singleton instance (mainly for testing)
 */
function resetFlowchartGenerator() {
    _flowchartGeneratorInstance = null;
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof window !== 'undefined') {
    window.MermaidFlowchartGenerator = MermaidFlowchartGenerator;
    window.getFlowchartGenerator = getFlowchartGenerator;
    window.resetFlowchartGenerator = resetFlowchartGenerator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MermaidFlowchartGenerator, getFlowchartGenerator, resetFlowchartGenerator };
}
