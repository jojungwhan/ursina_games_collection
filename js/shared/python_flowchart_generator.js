/**
 * Python Code Flowchart Generator
 * Generates Mermaid flowcharts from Python code text
 *
 * Dependencies:
 * - Mermaid library (external)
 * - configuration_manager.js (optional)
 */

class PythonFlowchartGenerator {
    constructor(options = {}) {
        this._config = options.config || null;
        this._mermaid = options.mermaid || null;
        this._ready = false;
        this._nodeCounter = 0;
    }

    /**
     * Get configuration manager (lazy load)
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
     */
    isReady() {
        return this._ready;
    }

    /**
     * Initialize Mermaid library
     */
    async ensureReady() {
        if (this._ready) return true;

        const mermaid = this.getMermaid();
        if (!mermaid) {
            console.warn('PythonFlowchartGenerator: Mermaid library not loaded');
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
            return true;
        } catch (e) {
            console.warn('PythonFlowchartGenerator: Error initializing Mermaid:', e);
            return false;
        }
    }

    /**
     * Escape text for Mermaid labels
     */
    escapeLabel(text) {
        return text.replace(/"/g, "'").replace(/[<>\[\]{}|()~=;]/g, '').trim();
    }

    /**
     * Parse Python code into structured lines
     */
    parseCode(code) {
        const lines = code.split('\n');
        const parsed = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Skip empty lines and comments
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Calculate indentation level
            const indent = line.search(/\S/);
            const indentLevel = indent >= 0 ? Math.floor(indent / 4) : 0;

            parsed.push({
                lineNumber: i + 1,
                content: trimmed,
                indent: indentLevel,
                type: this.classifyLine(trimmed)
            });
        }

        return parsed;
    }

    /**
     * Classify a line of Python code
     */
    classifyLine(line) {
        if (line.startsWith('import ') || line.startsWith('from ')) {
            return 'import';
        }
        if (line.startsWith('def ')) {
            return 'function_def';
        }
        if (line.startsWith('class ')) {
            return 'class_def';
        }
        if (line.startsWith('for ')) {
            return 'for_loop';
        }
        if (line.startsWith('while ')) {
            return 'while_loop';
        }
        if (line.startsWith('if ')) {
            return 'if_statement';
        }
        if (line.startsWith('elif ')) {
            return 'elif_statement';
        }
        if (line.startsWith('else:')) {
            return 'else_statement';
        }
        if (line.startsWith('return ')) {
            return 'return';
        }
        if (line.startsWith('print(') || line.includes('.print(')) {
            return 'print';
        }
        if (line.includes('=') && !line.includes('==')) {
            return 'assignment';
        }
        if (line.includes('(') && line.includes(')')) {
            return 'function_call';
        }
        return 'statement';
    }

    /**
     * Get human-readable label for a line
     */
    getLineLabel(line) {
        const content = line.content;
        const type = line.type;

        switch (type) {
            case 'import':
                // Extract module name
                const importMatch = content.match(/import\s+(\w+)/);
                if (importMatch) {
                    return importMatch[1] + ' 불러오기';
                }
                const fromMatch = content.match(/from\s+(\w+)/);
                if (fromMatch) {
                    return fromMatch[1] + '에서 불러오기';
                }
                return '라이브러리 불러오기';

            case 'function_def':
                const funcMatch = content.match(/def\s+(\w+)/);
                return funcMatch ? funcMatch[1] + ' 함수 정의' : '함수 정의';

            case 'for_loop':
                const forMatch = content.match(/for\s+(\w+)\s+in\s+(.+):/);
                if (forMatch) {
                    return forMatch[1] + ' 반복';
                }
                return '반복문';

            case 'while_loop':
                return '조건 반복';

            case 'if_statement':
                const ifMatch = content.match(/if\s+(.+):/);
                if (ifMatch) {
                    return '조건: ' + this.escapeLabel(ifMatch[1].substring(0, 20));
                }
                return '조건문';

            case 'elif_statement':
                return '다른 조건';

            case 'else_statement':
                return '아니면';

            case 'return':
                return '반환';

            case 'print':
                return '출력';

            case 'assignment':
                const assignMatch = content.match(/(\w+)\s*=/);
                if (assignMatch) {
                    return assignMatch[1] + ' 설정';
                }
                return '변수 설정';

            case 'function_call':
                // Extract function name
                const callMatch = content.match(/(\w+)\s*\(/);
                if (callMatch) {
                    const funcName = callMatch[1];
                    // Translate common turtle functions
                    const translations = {
                        'forward': '앞으로 이동',
                        'backward': '뒤로 이동',
                        'right': '오른쪽 회전',
                        'left': '왼쪽 회전',
                        'penup': '펜 올리기',
                        'pendown': '펜 내리기',
                        'pencolor': '펜 색상',
                        'bgcolor': '배경색',
                        'shape': '모양 설정',
                        'done': '종료',
                        'circle': '원 그리기',
                        'goto': '위치 이동',
                        'speed': '속도 설정',
                        'Turtle': '거북이 생성',
                        'Screen': '화면 설정'
                    };
                    return translations[funcName] || funcName;
                }
                // Handle method calls like t.forward(100)
                const methodMatch = content.match(/\w+\.(\w+)\s*\(/);
                if (methodMatch) {
                    const methodName = methodMatch[1];
                    const translations = {
                        'forward': '앞으로 이동',
                        'backward': '뒤로 이동',
                        'right': '오른쪽 회전',
                        'left': '왼쪽 회전',
                        'penup': '펜 올리기',
                        'pendown': '펜 내리기',
                        'pencolor': '펜 색상',
                        'shape': '모양 설정',
                        'circle': '원 그리기',
                        'goto': '위치 이동',
                        'speed': '속도 설정',
                        'bgcolor': '배경색',
                        'Screen': '화면 설정'
                    };
                    return translations[methodName] || methodName;
                }
                return this.escapeLabel(content.substring(0, 25));

            default:
                return this.escapeLabel(content.substring(0, 25));
        }
    }

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
                let targetNode = null;
                let minDist = Infinity;
                
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
                    }
                }
                
                // Calculate how far we need to extend to reach the target node
                const toEndDx = endPoint.x - shortenedPoint.x;
                const toEndDy = endPoint.y - shortenedPoint.y;
                const toEndDistance = Math.sqrt(toEndDx * toEndDx + toEndDy * toEndDy);
                
                // Calculate final end point - extend all the way to target node if found
                let finalEndX, finalEndY;
                let extensionAmount;
                
                if (targetNode && directionLength > 0) {
                    // Extend all the way to the target node boundary
                    const normalizedDx = directionDx / directionLength;
                    const normalizedDy = directionDy / directionLength;
                    
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
                    const normalizedDx = directionLength > 0 ? directionDx / directionLength : toEndDx / toEndDistance;
                    const normalizedDy = directionLength > 0 ? directionDy / directionLength : toEndDy / toEndDistance;
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
                console.warn('PythonFlowchartGenerator: Error shortening path:', e);
            }
        });

        // Return the modified SVG as string
        return tempDiv.innerHTML;
    }

    /**
     * Generate Mermaid flowchart code from Python code
     */
    generate(code) {
        if (!code || !code.trim()) return null;

        this._nodeCounter = 0;
        const parsed = this.parseCode(code);

        if (parsed.length === 0) return null;

        const config = this.getConfig();
        const startLabel = config ? config.getString('FLOWCHART_START', '시작') : '시작';
        const endLabel = config ? config.getString('FLOWCHART_END', '끝') : '끝';

        const lines = ['flowchart TD'];
        const startId = 'START';
        const endId = 'END';

        lines.push('    ' + startId + '([' + startLabel + '])');

        let prevNodeId = startId;
        let loopStack = []; // Track loop structures
        let functionStack = []; // Track function definitions

        for (let i = 0; i < parsed.length; i++) {
            const line = parsed[i];
            const nodeId = 'N' + (this._nodeCounter++);
            const label = this.getLineLabel(line);

            // Check if we're exiting any functions/classes (indent decreased)
            while (functionStack.length > 0) {
                const currentFunc = functionStack[functionStack.length - 1];
                // If current line is at or below function's indent level, function has ended
                if (line.indent <= currentFunc.indent) {
                    // Add end node with appropriate label
                    const funcEndId = 'FEND' + (this._nodeCounter++);
                    const endType = currentFunc.type === 'class' ? '클래스 끝' : '함수 끝';
                    const funcEndLabel = currentFunc.name + ' ' + endType;
                    lines.push('    ' + funcEndId + '([' + funcEndLabel + '])');

                    // Connect previous node to function end
                    if (prevNodeId && prevNodeId !== currentFunc.id) {
                        lines.push('    ' + prevNodeId + ' --> ' + funcEndId);
                    }

                    prevNodeId = funcEndId;
                    functionStack.pop();
                } else {
                    break;
                }
            }

            // Determine node shape based on type
            let nodeShape;
            switch (line.type) {
                case 'import':
                    nodeShape = nodeId + '[/' + label + '/]';
                    break;
                case 'for_loop':
                case 'while_loop':
                    nodeShape = nodeId + '{' + label + '}';
                    loopStack.push({ id: nodeId, indent: line.indent });
                    break;
                case 'if_statement':
                case 'elif_statement':
                    nodeShape = nodeId + '{' + label + '}';
                    break;
                case 'else_statement':
                    nodeShape = nodeId + '([' + label + '])';
                    break;
                case 'return':
                    nodeShape = nodeId + '([' + label + '])';
                    break;
                case 'function_def':
                    nodeShape = nodeId + '[[' + label + ']]';
                    // Extract function name for the end label
                    const funcMatch = line.content.match(/def\s+(\w+)/);
                    const funcName = funcMatch ? funcMatch[1] : '함수';
                    functionStack.push({ id: nodeId, indent: line.indent, name: funcName, type: 'function' });
                    break;
                case 'class_def':
                    nodeShape = nodeId + '[[' + label + ']]';
                    // Extract class name for the end label
                    const classMatch = line.content.match(/class\s+(\w+)/);
                    const className = classMatch ? classMatch[1] : '클래스';
                    functionStack.push({ id: nodeId, indent: line.indent, name: className, type: 'class' });
                    break;
                case 'print':
                    nodeShape = nodeId + '[/' + label + '/]';
                    break;
                default:
                    nodeShape = nodeId + '[' + label + ']';
            }

            lines.push('    ' + nodeShape);

            // Connect to previous node
            if (prevNodeId) {
                lines.push('    ' + prevNodeId + ' --> ' + nodeId);
            }

            // Handle loop back connections
            if (loopStack.length > 0) {
                const currentLoop = loopStack[loopStack.length - 1];
                // Check if next line exits the loop
                const nextLine = parsed[i + 1];
                if (!nextLine || nextLine.indent <= currentLoop.indent) {
                    // This is the last line of the loop, connect back to loop start
                    if (line.type !== 'for_loop' && line.type !== 'while_loop') {
                        lines.push('    ' + nodeId + ' --> ' + currentLoop.id);
                    }
                    loopStack.pop();
                }
            }

            prevNodeId = nodeId;
        }

        // Close any remaining open functions/classes at the end of code
        while (functionStack.length > 0) {
            const currentFunc = functionStack.pop();
            const funcEndId = 'FEND' + (this._nodeCounter++);
            const endType = currentFunc.type === 'class' ? '클래스 끝' : '함수 끝';
            const funcEndLabel = currentFunc.name + ' ' + endType;
            lines.push('    ' + funcEndId + '([' + funcEndLabel + '])');

            if (prevNodeId && prevNodeId !== currentFunc.id) {
                lines.push('    ' + prevNodeId + ' --> ' + funcEndId);
            }

            prevNodeId = funcEndId;
        }

        // Connect last node to end
        lines.push('    ' + endId + '([' + endLabel + '])');
        if (prevNodeId) {
            lines.push('    ' + prevNodeId + ' --> ' + endId);
        }

        return lines.join('\n');
    }

    /**
     * Render flowchart to element
     */
    async render(code, displayElement) {
        const element = typeof displayElement === 'string'
            ? document.getElementById(displayElement)
            : displayElement;

        if (!element) {
            console.warn('PythonFlowchartGenerator: Display element not found');
            return false;
        }

        const config = this.getConfig();

        // Generate code
        let mermaidCode;
        try {
            mermaidCode = this.generate(code);
        } catch (e) {
            console.error('PythonFlowchartGenerator: Error generating code:', e);
            element.innerHTML = '<div class="flowchart-placeholder">흐름도 생성 중 오류가 발생했습니다.</div>';
            return false;
        }

        // Handle empty code
        if (!mermaidCode) {
            element.innerHTML = '<div class="flowchart-placeholder">코드를 입력하면 흐름도가 여기에 표시됩니다...</div>';
            return true;
        }

        // Ensure Mermaid is ready
        const ready = await this.ensureReady();

        if (!ready) {
            element.innerHTML = '<div class="flowchart-placeholder">Mermaid 라이브러리를 로딩 중입니다...</div>';
            setTimeout(() => this.render(code, displayElement), 500);
            return false;
        }

        // Render
        try {
            const mermaid = this.getMermaid();
            const diagramId = 'py-mermaid-' + Date.now();
            let { svg } = await mermaid.render(diagramId, mermaidCode);

            // Post-process SVG to shorten arrows
            svg = this._shortenFlowchartArrows(svg);

            const currentElement = typeof displayElement === 'string'
                ? document.getElementById(displayElement)
                : displayElement;

            if (currentElement) {
                currentElement.innerHTML = '<div class="mermaid-rendered">' + svg + '</div>';
            }
            return true;
        } catch (e) {
            console.error('PythonFlowchartGenerator: Error rendering:', e);
            element.innerHTML = '<div class="flowchart-placeholder">흐름도 렌더링 중 오류: ' +
                (e.message || 'Unknown error') + '</div>';
            return false;
        }
    }
}

// Singleton instance
let _pythonFlowchartGeneratorInstance = null;

function getPythonFlowchartGenerator(options = {}) {
    if (!_pythonFlowchartGeneratorInstance) {
        _pythonFlowchartGeneratorInstance = new PythonFlowchartGenerator(options);
    }
    return _pythonFlowchartGeneratorInstance;
}

// Exports
if (typeof window !== 'undefined') {
    window.PythonFlowchartGenerator = PythonFlowchartGenerator;
    window.getPythonFlowchartGenerator = getPythonFlowchartGenerator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PythonFlowchartGenerator, getPythonFlowchartGenerator };
}
