/**
 * Blockly + Skulpt Integration
 * Initializes Blockly workspace and provides Python code execution via Skulpt
 */

// Global workspace variable
let blocklyWorkspace = null;

/**
 * Force full page reload for Blockly page to avoid instant navigation issues
 */
(function() {
    // Intercept clicks on Blockly links and force full page navigation
    function handleClick(e) {
        const link = e.target.closest('a');
        if (!link || !link.href) return;

        // Check if this is a link to the Blockly page
        if (link.href.includes('blockly_demo') && !window.location.href.includes('blockly_demo')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            // Force full page navigation
            window.location.assign(link.href);
            return false;
        }
    }

    // Add listener to document with capture phase (runs before other handlers)
    document.addEventListener('click', handleClick, true);

    // Also add directly to body when ready
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

/**
 * Register all turtle blocks
 * Must be called BEFORE workspace initialization
 */
function registerTurtleBlocks() {
    // ============================================================================
    // TURTLE SETUP BLOCK
    // ============================================================================
    Blockly.Blocks['turtle_setup'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('거북이 시작');
        this.setColour(160);
        this.setTooltip('거북이 그래픽을 시작합니다. 프로그램 시작 부분에 배치하세요.');
        this.setHelpUrl('');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
      }
    };

    Blockly.Python.forBlock['turtle_setup'] = function(block) {
      return 'import turtle\n' +
             't = turtle.Turtle()\n' +
             "t.shape('turtle')\n" +
             't.speed(5)\n';
    };

    // ============================================================================
    // TURTLE DONE BLOCK
    // ============================================================================
    Blockly.Blocks['turtle_done'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('거북이 끝');
        this.setColour(160);
        this.setTooltip('거북이 그래픽을 종료합니다. 프로그램 마지막에 배치하세요.');
        this.setHelpUrl('');
        this.setPreviousStatement(true, null);
        this.setNextStatement(false, null);
      }
    };

    Blockly.Python.forBlock['turtle_done'] = function(block) {
      return 'turtle.done()\n';
    };

    // ============================================================================
    // TURTLE SHAPE BLOCK
    // ============================================================================
    Blockly.Blocks['turtle_shape'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('모양')
            .appendField(new Blockly.FieldDropdown([
                ['거북이', 'turtle'],
                ['화살표', 'arrow'],
                ['원', 'circle'],
                ['사각형', 'square'],
                ['삼각형', 'triangle'],
                ['고전', 'classic']
            ]), 'SHAPE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip('거북이의 모양을 설정합니다.');
        this.setHelpUrl('');
      }
    };

    Blockly.Python.forBlock['turtle_shape'] = function(block) {
      var shape = block.getFieldValue('SHAPE');
      return 't.shape("' + shape + '")\n';
    };

    // ============================================================================
    // MOTION BLOCKS
    // ============================================================================

    Blockly.Blocks['turtle_forward'] = {
      init: function() {
        this.appendValueInput('STEP')
            .setCheck('Number')
            .appendField('앞으로');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip('거북이를 지정한 거리만큼 앞으로 이동시킵니다.');
        this.setHelpUrl('');
      }
    };

    Blockly.Python.forBlock['turtle_forward'] = function(block) {
      var step = Blockly.Python.valueToCode(block, 'STEP', Blockly.Python.ORDER_ATOMIC) || '10';
      return 't.forward(' + step + ')\n';
    };

    Blockly.Blocks['turtle_backward'] = {
      init: function() {
        this.appendValueInput('STEP')
            .setCheck('Number')
            .appendField('뒤로');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip('거북이를 지정한 거리만큼 뒤로 이동시킵니다.');
        this.setHelpUrl('');
      }
    };

    Blockly.Python.forBlock['turtle_backward'] = function(block) {
      var step = Blockly.Python.valueToCode(block, 'STEP', Blockly.Python.ORDER_ATOMIC) || '10';
      return 't.backward(' + step + ')\n';
    };

    Blockly.Blocks['turtle_right'] = {
      init: function() {
        this.appendValueInput('ANGLE')
            .setCheck('Number')
            .appendField('오른쪽으로')
            .appendField('도 회전');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip('거북이를 지정한 각도만큼 오른쪽으로 회전시킵니다.');
        this.setHelpUrl('');
      }
    };

    Blockly.Python.forBlock['turtle_right'] = function(block) {
      var angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_ATOMIC) || '90';
      return 't.right(' + angle + ')\n';
    };

    Blockly.Blocks['turtle_left'] = {
      init: function() {
        this.appendValueInput('ANGLE')
            .setCheck('Number')
            .appendField('왼쪽으로')
            .appendField('도 회전');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip('거북이를 지정한 각도만큼 왼쪽으로 회전시킵니다.');
        this.setHelpUrl('');
      }
    };

    Blockly.Python.forBlock['turtle_left'] = function(block) {
      var angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_ATOMIC) || '90';
      return 't.left(' + angle + ')\n';
    };

    Blockly.Blocks['turtle_goto'] = {
      init: function() {
        this.appendValueInput('X')
            .setCheck('Number')
            .appendField('이동')
            .appendField('X:');
        this.appendValueInput('Y')
            .setCheck('Number')
            .appendField('Y:');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip('거북이를 지정한 좌표 (X, Y)로 이동시킵니다.');
        this.setHelpUrl('');
      }
    };

    Blockly.Python.forBlock['turtle_goto'] = function(block) {
      var x = Blockly.Python.valueToCode(block, 'X', Blockly.Python.ORDER_ATOMIC) || '0';
      var y = Blockly.Python.valueToCode(block, 'Y', Blockly.Python.ORDER_ATOMIC) || '0';
      return 't.goto(' + x + ', ' + y + ')\n';
    };

    // ============================================================================
    // PEN & STYLE BLOCKS
    // ============================================================================

    Blockly.Blocks['turtle_penup'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('펜 올리기');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('펜을 올려서 이동할 때 선을 그리지 않습니다.');
        this.setHelpUrl('');
      }
    };

    Blockly.Python.forBlock['turtle_penup'] = function(block) {
      return 't.penup()\n';
    };

    Blockly.Blocks['turtle_pendown'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('펜 내리기');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('펜을 내려서 이동할 때 선을 그립니다.');
        this.setHelpUrl('');
      }
    };

    Blockly.Python.forBlock['turtle_pendown'] = function(block) {
      return 't.pendown()\n';
    };

    Blockly.Blocks['turtle_pencolor'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('펜 색상')
            .appendField(new Blockly.FieldDropdown([
              ['빨강', 'red'],
              ['주황', 'orange'],
              ['노랑', 'yellow'],
              ['초록', 'green'],
              ['파랑', 'blue'],
              ['남색', 'navy'],
              ['보라', 'purple'],
              ['검정', 'black'],
              ['흰색', 'white'],
              ['분홍', 'pink'],
              ['갈색', 'brown'],
              ['회색', 'gray']
            ]), 'COLOR');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('펜의 색상을 설정합니다.');
        this.setHelpUrl('');
      }
    };

    Blockly.Python.forBlock['turtle_pencolor'] = function(block) {
      var color = block.getFieldValue('COLOR');
      return "t.pencolor('" + color + "')\n";
    };

    Blockly.Blocks['turtle_pensize'] = {
      init: function() {
        this.appendValueInput('WIDTH')
            .setCheck('Number')
            .appendField('펜 두께');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('펜의 두께를 설정합니다.');
        this.setHelpUrl('');
      }
    };

    Blockly.Python.forBlock['turtle_pensize'] = function(block) {
      var width = Blockly.Python.valueToCode(block, 'WIDTH', Blockly.Python.ORDER_ATOMIC) || '1';
      return 't.pensize(' + width + ')\n';
    };

    // ============================================================================
    // SHAPE & UTILITY BLOCKS
    // ============================================================================

    Blockly.Blocks['turtle_circle'] = {
      init: function() {
        this.appendValueInput('RADIUS')
            .setCheck('Number')
            .appendField('원 그리기')
            .appendField('반지름:');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip('지정한 반지름의 원을 그립니다.');
        this.setHelpUrl('');
      }
    };

    Blockly.Python.forBlock['turtle_circle'] = function(block) {
      var radius = Blockly.Python.valueToCode(block, 'RADIUS', Blockly.Python.ORDER_ATOMIC) || '50';
      return 't.circle(' + radius + ')\n';
    };

    Blockly.Blocks['turtle_speed'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('속도')
            .appendField(new Blockly.FieldDropdown([
              ['느리게', '1'],
              ['보통', '5'],
              ['빠르게', '10'],
              ['즉시', '0']
            ]), 'SPEED');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip('거북이의 이동 속도를 설정합니다.');
        this.setHelpUrl('');
      }
    };

    Blockly.Python.forBlock['turtle_speed'] = function(block) {
      var speed = block.getFieldValue('SPEED') || '5';
      return 't.speed(' + speed + ')\n';
    };

    console.log('Turtle blocks registered successfully');
}

// Track if turtle blocks have been registered
let turtleBlocksRegistered = false;

// Mermaid node counter for unique IDs
let mermaidNodeCounter = 0;


/**
 * Initialize tab switching functionality
 */
function initTabs() {
    const tabs = document.querySelectorAll('.preview-tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Update active panel
            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetTab + 'Panel') {
                    panel.classList.add('active');
                }
            });

            // Re-render flowchart when switching to flowchart tab
            if (targetTab === 'flowchart' && blocklyWorkspace) {
                updateFlowchart();
            }
        });
    });
}

/**
 * Get a human-readable label for a block
 */
function getBlockLabel(block) {
    const type = block.type;

    // Turtle blocks
    if (type === 'turtle_setup') return '거북이 시작';
    if (type === 'turtle_forward') {
        const step = getInputValue(block, 'STEP', '10');
        return '앞으로 ' + step;
    }
    if (type === 'turtle_backward') {
        const step = getInputValue(block, 'STEP', '10');
        return '뒤로 ' + step;
    }
    if (type === 'turtle_right') {
        const angle = getInputValue(block, 'ANGLE', '90');
        return '오른쪽 ' + angle + '도';
    }
    if (type === 'turtle_left') {
        const angle = getInputValue(block, 'ANGLE', '90');
        return '왼쪽 ' + angle + '도';
    }
    if (type === 'turtle_goto') {
        const x = getInputValue(block, 'X', '0');
        const y = getInputValue(block, 'Y', '0');
        return '이동 (' + x + ', ' + y + ')';
    }
    if (type === 'turtle_penup') return '펜 올리기';
    if (type === 'turtle_pendown') return '펜 내리기';
    if (type === 'turtle_pencolor') {
        const color = block.getFieldValue('COLOR') || 'black';
        return '펜 색상: ' + color;
    }
    if (type === 'turtle_pensize') {
        const width = getInputValue(block, 'WIDTH', '1');
        return '펜 두께: ' + width;
    }
    if (type === 'turtle_circle') {
        const radius = getInputValue(block, 'RADIUS', '50');
        return '원 그리기 r=' + radius;
    }
    if (type === 'turtle_speed') {
        const speed = block.getFieldValue('SPEED') || '5';
        return '속도: ' + speed;
    }

    // Control blocks
    if (type === 'controls_if') return '만약';
    if (type === 'controls_ifelse') return '만약/아니면';
    if (type === 'controls_repeat_ext') {
        const times = getInputValue(block, 'TIMES', '10');
        return times + '번 반복';
    }
    if (type === 'controls_for') {
        // Get variable display name (not ID)
        const varField = block.getField('VAR');
        const varName = varField ? varField.getText() : 'i';
        const from = getInputValue(block, 'FROM', '0');
        const to = getInputValue(block, 'TO', '10');
        const by = getInputValue(block, 'BY', '1');
        return varName + ' : ' + from + ' to ' + to + ' by ' + by;
    }
    if (type === 'controls_whileUntil') {
        const mode = block.getFieldValue('MODE');
        return mode === 'WHILE' ? '~하는 동안' : '~할 때까지';
    }

    // Text blocks
    if (type === 'text_print') {
        const printValue = getInputValue(block, 'TEXT', '');
        return '출력 ' + printValue;
    }
    if (type === 'text') {
        const text = block.getFieldValue('TEXT') || '';
        return '"' + (text.length > 10 ? text.substring(0, 10) + '...' : text) + '"';
    }

    // Math blocks
    if (type === 'math_number') {
        const num = block.getFieldValue('NUM') || '0';
        return num;
    }
    if (type === 'math_arithmetic') return '계산';

    // Variable blocks
    if (type === 'variables_set') {
        const varField = block.getField('VAR');
        const varName = varField ? varField.getText() : 'var';
        return varName + ' 설정';
    }
    if (type === 'variables_get') {
        const varField = block.getField('VAR');
        const varName = varField ? varField.getText() : 'var';
        return varName;
    }

    // Default: use type name
    return type.replace(/_/g, ' ');
}

/**
 * Get input value from a block (handles connected blocks)
 */
function getInputValue(block, inputName, defaultValue) {
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
        // Get variable display name (not ID)
        const varField = targetBlock.getField('VAR');
        return varField ? varField.getText() : defaultValue;
    }

    return defaultValue;
}

/**
 * Get condition text for control blocks
 */
function getConditionText(block) {
    const input = block.getInput('IF0') || block.getInput('BOOL');
    if (!input || !input.connection || !input.connection.targetBlock()) {
        return '조건';
    }

    const condBlock = input.connection.targetBlock();
    if (condBlock.type === 'logic_compare') {
        const op = condBlock.getFieldValue('OP');
        const opSymbol = { 'EQ': '=', 'NEQ': '≠', 'LT': '<', 'LTE': '≤', 'GT': '>', 'GTE': '≥' }[op] || '?';
        const a = getInputValue(condBlock, 'A', 'A');
        const b = getInputValue(condBlock, 'B', 'B');
        return a + ' ' + opSymbol + ' ' + b;
    }
    if (condBlock.type === 'logic_operation') {
        const op = condBlock.getFieldValue('OP');
        return op === 'AND' ? 'AND 조건' : 'OR 조건';
    }
    if (condBlock.type === 'logic_boolean') {
        return condBlock.getFieldValue('BOOL') === 'TRUE' ? '참' : '거짓';
    }

    return '조건';
}

/**
 * Escape special characters for Mermaid labels
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

/**
 * Process blocks with proper terminal tracking for all branches
 * Returns an array of terminal nodes (can be string IDs or objects with isEmpty flag)
 */
function processBlockWithTerminals(block, lines, parentId, connectionLabel, endNodeId) {
    if (!block || block.isShadow()) return [parentId];

    const nodeId = 'N' + (mermaidNodeCounter++);
    const label = escapeMermaidLabel(getBlockLabel(block));
    const type = block.type;

    // Determine node shape based on block type
    let nodeShape;
    if (type === 'turtle_setup') {
        nodeShape = nodeId + '([' + label + '])';
    } else if (type.startsWith('controls_if') || type === 'controls_whileUntil') {
        const condText = escapeMermaidLabel(getConditionText(block));
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

    // Handle control flow blocks
    if (type === 'controls_if' || type === 'controls_ifelse') {
        // Process DO (true) branch
        const doInput = block.getInput('DO0');
        let hasDoBlock = doInput && doInput.connection && doInput.connection.targetBlock();

        if (hasDoBlock) {
            const doTerminals = processBlockWithTerminals(
                doInput.connection.targetBlock(), lines, nodeId, '예', endNodeId
            );
            terminalNodes = terminalNodes.concat(doTerminals);
        }

        // Process ELSE branch
        const elseInput = block.getInput('ELSE');
        let hasElseBlock = elseInput && elseInput.connection && elseInput.connection.targetBlock();

        if (hasElseBlock) {
            const elseTerminals = processBlockWithTerminals(
                elseInput.connection.targetBlock(), lines, nodeId, '아니오', endNodeId
            );
            terminalNodes = terminalNodes.concat(elseTerminals);
        }

        // Handle missing branches - they connect directly to End or next block
        if (!hasDoBlock) {
            // True branch is empty - create direct connection marker
            terminalNodes.push({ id: nodeId, label: '예', isEmpty: true });
        }
        if (!hasElseBlock) {
            // False/Else branch is empty - create direct connection marker
            terminalNodes.push({ id: nodeId, label: '아니오', isEmpty: true });
        }

    } else if (type === 'controls_repeat_ext' || type === 'controls_whileUntil' || type === 'controls_for') {
        const doInput = block.getInput('DO');
        if (doInput && doInput.connection && doInput.connection.targetBlock()) {
            const loopTerminals = processBlockWithTerminals(
                doInput.connection.targetBlock(), lines, nodeId, '반복', endNodeId
            );
            // Loop body terminals go back to the condition
            loopTerminals.forEach(terminal => {
                if (typeof terminal === 'string') {
                    lines.push('    ' + terminal + ' --> ' + nodeId);
                } else if (!terminal.isEmpty) {
                    lines.push('    ' + terminal.id + ' --> ' + nodeId);
                }
            });
        }
        // Loop itself continues to next block
        terminalNodes.push(nodeId);
    } else {
        terminalNodes.push(nodeId);
    }

    // Process next connected block
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
        // Get real terminal nodes (not empty branch markers)
        const realTerminals = terminalNodes.filter(t =>
            typeof t === 'string' || !t.isEmpty
        );
        const emptyBranches = terminalNodes.filter(t =>
            typeof t !== 'string' && t.isEmpty
        );

        if (realTerminals.length > 0) {
            const firstTerminal = typeof realTerminals[0] === 'string'
                ? realTerminals[0]
                : realTerminals[0].id;

            const nextTerminals = processBlockWithTerminals(
                nextBlock, lines, firstTerminal, null, endNodeId
            );

            // Connect other terminals to the next block
            const nextNodeMatch = lines.find(l => l.includes('N' + (mermaidNodeCounter)));

            return nextTerminals;
        }

        // Only empty branches - connect them to next block
        const nextTerminals = processBlockWithTerminals(nextBlock, lines, null, null, endNodeId);
        const nextFirstNode = 'N' + (mermaidNodeCounter - 1);

        emptyBranches.forEach(eb => {
            lines.push('    ' + eb.id + ' -->|' + eb.label + '| ' + nextFirstNode);
        });

        return nextTerminals;
    }

    return terminalNodes;
}

/**
 * Generate Mermaid flowchart from Blockly workspace
 */
function generateMermaidFromWorkspace(workspace) {
    mermaidNodeCounter = 0;
    const lines = ['flowchart TD'];

    // Get all top-level blocks
    const topBlocks = workspace.getTopBlocks(true);

    if (topBlocks.length === 0) {
        return null;
    }

    // Add start node
    const startId = 'START';
    const endId = 'END';
    lines.push('    ' + startId + '([시작])');

    // Collect all terminal nodes
    let allTerminals = [];

    // Process each top-level block chain
    topBlocks.forEach((block, index) => {
        if (!block.isShadow()) {
            const terminals = processBlockWithTerminals(block, lines, startId, null, endId);
            allTerminals = allTerminals.concat(terminals);
        }
    });

    // Add end node
    lines.push('    ' + endId + '([끝])');

    // Connect all terminal nodes to End
    allTerminals.forEach(terminal => {
        if (typeof terminal === 'string') {
            lines.push('    ' + terminal + ' --> ' + endId);
        } else if (terminal.isEmpty) {
            // Empty branch connects directly to End with label
            lines.push('    ' + terminal.id + ' -->|' + terminal.label + '| ' + endId);
        } else {
            lines.push('    ' + terminal.id + ' --> ' + endId);
        }
    });

    return lines.join('\n');
}

// Track if Mermaid has been initialized
let mermaidReady = false;

/**
 * Ensure Mermaid is ready before rendering
 */
async function ensureMermaidReady() {
    if (mermaidReady) return true;

    if (typeof mermaid === 'undefined') {
        console.warn('Mermaid library not loaded');
        return false;
    }

    try {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            },
            securityLevel: 'loose'
        });
        mermaidReady = true;
        console.log('Mermaid initialized successfully');
        return true;
    } catch (e) {
        console.warn('Error initializing Mermaid:', e);
        return false;
    }
}

/**
 * Update the flowchart display
 */
async function updateFlowchart() {
    let mermaidDisplay = document.getElementById('mermaidDisplay');
    if (!mermaidDisplay || !blocklyWorkspace) return;

    let mermaidCode;
    try {
        mermaidCode = generateMermaidFromWorkspace(blocklyWorkspace);
    } catch (e) {
        console.error('Error generating Mermaid code:', e);
        mermaidDisplay.innerHTML = '<div class="flowchart-placeholder">흐름도 코드 생성 중 오류가 발생했습니다.</div>';
        return;
    }

    if (!mermaidCode) {
        mermaidDisplay.innerHTML = '<div class="flowchart-placeholder">블록을 추가하면 흐름도가 여기에 표시됩니다...</div>';
        return;
    }

    // Ensure Mermaid is ready
    const ready = await ensureMermaidReady();

    // Re-check mermaidDisplay after async call (DOM might have changed)
    mermaidDisplay = document.getElementById('mermaidDisplay');
    if (!mermaidDisplay) {
        console.warn('mermaidDisplay element not found after async call');
        return;
    }

    if (!ready) {
        mermaidDisplay.innerHTML = '<div class="flowchart-placeholder">Mermaid 라이브러리를 로딩 중입니다...</div>';
        // Retry after a short delay
        setTimeout(updateFlowchart, 500);
        return;
    }

    try {
        // Create a unique ID for this diagram
        const diagramId = 'mermaid-diagram-' + Date.now();

        // Use mermaid.render() to generate SVG string first (works even when element is hidden)
        // This avoids the getBBox issue that occurs when rendering to a hidden element
        if (typeof mermaid !== 'undefined' && mermaid.render) {
            const { svg } = await mermaid.render(diagramId, mermaidCode);

            // Re-check element is still available
            mermaidDisplay = document.getElementById('mermaidDisplay');
            if (mermaidDisplay) {
                mermaidDisplay.innerHTML = '<div class="mermaid-rendered">' + svg + '</div>';
            }
        } else {
            throw new Error('Mermaid render function not available');
        }
    } catch (e) {
        console.error('Error rendering Mermaid diagram:', e);
        console.log('Mermaid code that failed:\n', mermaidCode);
        // Re-check element before setting innerHTML
        mermaidDisplay = document.getElementById('mermaidDisplay');
        if (mermaidDisplay) {
            mermaidDisplay.innerHTML = '<div class="flowchart-placeholder">흐름도 렌더링 중 오류가 발생했습니다.<br><small>' +
                (e.message || 'Unknown error') + '</small></div>';
        }
    }
}

/**
 * Add refresh button for Blockly pages
 */
function addRefreshButton() {
    const blocklyDiv = document.getElementById('blocklyDiv');
    if (!blocklyDiv) return;

    // Check if button already exists
    if (document.getElementById('blocklyRefreshBtn')) return;

    // Create refresh button
    const refreshBtn = document.createElement('button');
    refreshBtn.id = 'blocklyRefreshBtn';
    refreshBtn.innerHTML = '🔄 블록이 안 보이면 클릭';
    refreshBtn.style.cssText = 'background-color: #ff9800; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-bottom: 10px; font-size: 14px;';
    refreshBtn.onclick = function() {
        window.location.reload();
    };

    // Insert before blocklyDiv's parent container
    const container = blocklyDiv.closest('.blockly-container') || blocklyDiv.parentElement;
    if (container && container.parentElement) {
        container.parentElement.insertBefore(refreshBtn, container);
    }
}

/**
 * Wrap turtle canvas and output in a flex container
 */
function setupTurtleOutputLayout() {
    const turtleContainer = document.getElementById('turtleCanvasContainer');
    const outputCanvas = document.getElementById('outputCanvas');

    if (!turtleContainer || !outputCanvas) return;

    // Check if already wrapped
    if (turtleContainer.parentElement && turtleContainer.parentElement.classList.contains('turtle-output-container')) return;

    // Create flex container
    const flexContainer = document.createElement('div');
    flexContainer.className = 'turtle-output-container';

    // Insert flex container before turtleContainer
    turtleContainer.parentElement.insertBefore(flexContainer, turtleContainer);

    // Move both elements into flex container
    flexContainer.appendChild(turtleContainer);
    flexContainer.appendChild(outputCanvas);

    // Remove inline styles that conflict with CSS
    turtleContainer.style.marginTop = '';
    turtleContainer.style.display = '';
    outputCanvas.style.marginTop = '';
}

/**
 * Initialize Blockly workspace
 */
function initBlocklyWorkspace() {
    // Check if blocklyDiv exists on the page
    const blocklyDiv = document.getElementById('blocklyDiv');
    if (!blocklyDiv) {
        return; // Exit if no Blockly workspace container found
    }

    // Wait for parent container to have valid dimensions
    // This fixes issues with instant navigation where layout isn't computed yet
    const parentContainer = blocklyDiv.closest('.blockly-container');
    if (parentContainer) {
        const parentWidth = parentContainer.offsetWidth;
        // If parent width is 0 or very small, layout isn't ready - wait and retry
        if (parentWidth < 100) {
            console.log('Blockly: Parent container not ready, waiting for layout...');
            setTimeout(initBlocklyWorkspace, 50);
            return;
        }
    }

    // Add refresh button as fallback
    addRefreshButton();

    // Setup turtle output layout (side by side)
    setupTurtleOutputLayout();

    // If already initialized properly, just resize
    if (blocklyWorkspace && blocklyDiv.querySelector('.blocklySvg')) {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/06db8c19-0fda-49d9-9e03-0ed0a5d45d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blockly_integration.js:920',message:'Already initialized, resizing',data:{blocklyDivWidth:blocklyDiv.offsetWidth,blocklyDivHeight:blocklyDiv.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        Blockly.svgResize(blocklyWorkspace);
        console.log('Blockly workspace already initialized');
        return;
    }

    // Clean up any existing workspace
    if (blocklyWorkspace) {
        try {
            blocklyWorkspace.dispose();
        } catch (e) {
            // Ignore disposal errors
        }
        blocklyWorkspace = null;
    }

    // Clear the div for fresh initialization
    blocklyDiv.innerHTML = '';

    // Check if toolbox exists and get fresh reference
    const toolboxElement = document.getElementById('toolbox');
    if (!toolboxElement) {
        console.warn('Blockly toolbox not found. Workspace will be created without toolbox.');
    }

    // Initialize Blockly workspace
    try {
        // Check if Blockly is defined before trying to use it
        if (typeof Blockly === 'undefined') {
            throw new Error('Blockly library is not loaded');
        }

        if (typeof Blockly.Python === 'undefined') {
            throw new Error('Blockly Python generator is not loaded');
        }

        // Register turtle blocks BEFORE creating workspace
        // Always re-register to ensure blocks are available after navigation
        registerTurtleBlocks();
        turtleBlocksRegistered = true;

        // Initialize tab switching (Mermaid is lazy-initialized when needed)
        initTabs();

        // Clone the toolbox to ensure fresh content for Blockly
        // This fixes issues with instant navigation where DOM is replaced
        let toolbox = null;
        if (toolboxElement) {
            toolbox = toolboxElement.cloneNode(true);
        }

        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/06db8c19-0fda-49d9-9e03-0ed0a5d45d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blockly_integration.js:970',message:'Before Blockly.inject',data:{blocklyDivWidth:blocklyDiv.offsetWidth,blocklyDivHeight:blocklyDiv.offsetHeight,blocklyDivClientWidth:blocklyDiv.clientWidth,blocklyDivClientHeight:blocklyDiv.clientHeight,computedWidth:window.getComputedStyle(blocklyDiv).width,computedHeight:window.getComputedStyle(blocklyDiv).height,parentWidth:blocklyDiv.parentElement?.offsetWidth,parentHeight:blocklyDiv.parentElement?.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion

        blocklyWorkspace = Blockly.inject('blocklyDiv', {
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

        // #region agent log
        const injectionDiv = blocklyDiv.querySelector('.injectionDiv');
        fetch('http://127.0.0.1:7246/ingest/06db8c19-0fda-49d9-9e03-0ed0a5d45d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blockly_integration.js:988',message:'After Blockly.inject',data:{injectionDivExists:!!injectionDiv,injectionDivWidth:injectionDiv?.offsetWidth,injectionDivHeight:injectionDiv?.offsetHeight,injectionDivClientWidth:injectionDiv?.clientWidth,injectionDivClientHeight:injectionDiv?.clientHeight,injectionDivScrollWidth:injectionDiv?.scrollWidth,injectionDivScrollHeight:injectionDiv?.scrollHeight,computedWidth:injectionDiv?window.getComputedStyle(injectionDiv).width:'N/A',computedHeight:injectionDiv?window.getComputedStyle(injectionDiv).height:'N/A',blocklyDivWidth:blocklyDiv.offsetWidth,blocklyDivHeight:blocklyDiv.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion

        // Add workspace change listener to update Python code display
        blocklyWorkspace.addChangeListener(function(event) {
            // Skip UI-only events that don't affect code
            if (event.isUiEvent) {
                return;
            }

            // Update code display for any non-UI event
            try {
                const pythonCode = Blockly.Python.workspaceToCode(blocklyWorkspace);
                const codeDisplay = document.getElementById('pythonCodeDisplay');
                if (codeDisplay) {
                    // Use textContent for <pre>/<code> tags, value for <textarea>
                    if (codeDisplay.tagName === 'PRE' || codeDisplay.tagName === 'CODE') {
                        codeDisplay.textContent = pythonCode || '# 블록을 추가하면 Python 코드가 여기에 표시됩니다...';
                    } else {
                        codeDisplay.value = pythonCode;
                    }
                }

                // Update flowchart if flowchart tab is active
                const flowchartPanel = document.getElementById('flowchartPanel');
                if (flowchartPanel && flowchartPanel.classList.contains('active')) {
                    updateFlowchart();
                }
            } catch (e) {
                console.warn('Error generating Python code:', e);
            }
        });

        // Force resize to ensure blocks render properly
        // This is needed especially after SPA-like navigation
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/06db8c19-0fda-49d9-9e03-0ed0a5d45d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blockly_integration.js:1022',message:'Before first svgResize',data:{injectionDivWidth:injectionDiv?.offsetWidth,injectionDivHeight:injectionDiv?.offsetHeight,blocklyDivWidth:blocklyDiv.offsetWidth,blocklyDivHeight:blocklyDiv.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        Blockly.svgResize(blocklyWorkspace);
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/06db8c19-0fda-49d9-9e03-0ed0a5d45d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blockly_integration.js:1022',message:'After first svgResize',data:{injectionDivWidth:injectionDiv?.offsetWidth,injectionDivHeight:injectionDiv?.offsetHeight,blocklyDivWidth:blocklyDiv.offsetWidth,blocklyDivHeight:blocklyDiv.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion

        // Refresh toolbox to ensure flyout works properly
        if (toolbox) {
            blocklyWorkspace.updateToolbox(toolbox);
        }

        // Also resize after a short delay to handle any layout shifts
        setTimeout(function() {
            if (blocklyWorkspace) {
                // #region agent log
                const injectionDivDelayed = blocklyDiv.querySelector('.injectionDiv');
                fetch('http://127.0.0.1:7246/ingest/06db8c19-0fda-49d9-9e03-0ed0a5d45d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blockly_integration.js:1032',message:'Before delayed svgResize',data:{injectionDivWidth:injectionDivDelayed?.offsetWidth,injectionDivHeight:injectionDivDelayed?.offsetHeight,blocklyDivWidth:blocklyDiv.offsetWidth,blocklyDivHeight:blocklyDiv.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                Blockly.svgResize(blocklyWorkspace);
                // #region agent log
                fetch('http://127.0.0.1:7246/ingest/06db8c19-0fda-49d9-9e03-0ed0a5d45d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blockly_integration.js:1032',message:'After delayed svgResize',data:{injectionDivWidth:injectionDivDelayed?.offsetWidth,injectionDivHeight:injectionDivDelayed?.offsetHeight,blocklyDivWidth:blocklyDiv.offsetWidth,blocklyDivHeight:blocklyDiv.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
            }
        }, 100);

        console.log('Blockly workspace initialized successfully');

    } catch (error) {
        console.error('Error initializing Blockly workspace:', error);
    }
}

// Initialize on DOMContentLoaded (first page load)
document.addEventListener('DOMContentLoaded', initBlocklyWorkspace);

// Check dimensions after page fully loads
window.addEventListener('load', function() {
    setTimeout(function() {
        const blocklyDiv = document.getElementById('blocklyDiv');
        const injectionDiv = blocklyDiv?.querySelector('.injectionDiv');
        if (injectionDiv) {
            // #region agent log
            fetch('http://127.0.0.1:7246/ingest/06db8c19-0fda-49d9-9e03-0ed0a5d45d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blockly_integration.js:1045',message:'After window load (final check)',data:{injectionDivWidth:injectionDiv.offsetWidth,injectionDivHeight:injectionDiv.offsetHeight,injectionDivScrollWidth:injectionDiv.scrollWidth,injectionDivScrollHeight:injectionDiv.scrollHeight,blocklyDivWidth:blocklyDiv.offsetWidth,blocklyDivHeight:blocklyDiv.offsetHeight,computedWidth:window.getComputedStyle(injectionDiv).width,computedHeight:window.getComputedStyle(injectionDiv).height},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
        }
    }, 500);
});

// Support MkDocs Material instant loading (SPA-like navigation)
// Method 1: Using document$ observable if available (MkDocs Material)
if (typeof document$ !== 'undefined') {
    document$.subscribe(function() {
        initBlocklyWorkspace();
    });
}

// Method 2: Listen for location changes (fallback)
let lastUrl = location.href;
new MutationObserver(function() {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        // Small delay to ensure DOM is updated
        setTimeout(initBlocklyWorkspace, 100);
    }
}).observe(document, { subtree: true, childList: true });

// Method 3: Also check periodically for the first few seconds after navigation
// This catches edge cases where MutationObserver might miss the update
document.addEventListener('click', function(e) {
    // Check if a navigation link was clicked
    const link = e.target.closest('a');
    if (link && link.href && link.href.includes(window.location.origin)) {
        // Wait for navigation and try to initialize
        setTimeout(initBlocklyWorkspace, 200);
        setTimeout(initBlocklyWorkspace, 500);
        setTimeout(function() {
            if (blocklyWorkspace) {
                Blockly.svgResize(blocklyWorkspace);
            }
        }, 600);
    }
});

// Resize workspace when window is resized or becomes visible
window.addEventListener('resize', function() {
    if (blocklyWorkspace) {
        // #region agent log
        const blocklyDiv = document.getElementById('blocklyDiv');
        const injectionDiv = blocklyDiv?.querySelector('.injectionDiv');
        fetch('http://127.0.0.1:7246/ingest/06db8c19-0fda-49d9-9e03-0ed0a5d45d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blockly_integration.js:1084',message:'Window resize event',data:{injectionDivWidth:injectionDiv?.offsetWidth,injectionDivHeight:injectionDiv?.offsetHeight,blocklyDivWidth:blocklyDiv?.offsetWidth,blocklyDivHeight:blocklyDiv?.offsetHeight,windowWidth:window.innerWidth,windowHeight:window.innerHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        Blockly.svgResize(blocklyWorkspace);
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/06db8c19-0fda-49d9-9e03-0ed0a5d45d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blockly_integration.js:1084',message:'After window resize svgResize',data:{injectionDivWidth:injectionDiv?.offsetWidth,injectionDivHeight:injectionDiv?.offsetHeight,blocklyDivWidth:blocklyDiv?.offsetWidth,blocklyDivHeight:blocklyDiv?.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
    }
});

document.addEventListener('visibilitychange', function() {
    if (!document.hidden && blocklyWorkspace) {
        setTimeout(function() {
            // #region agent log
            const blocklyDiv = document.getElementById('blocklyDiv');
            const injectionDiv = blocklyDiv?.querySelector('.injectionDiv');
            fetch('http://127.0.0.1:7246/ingest/06db8c19-0fda-49d9-9e03-0ed0a5d45d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blockly_integration.js:1092',message:'Visibility change svgResize',data:{injectionDivWidth:injectionDiv?.offsetWidth,injectionDivHeight:injectionDiv?.offsetHeight,blocklyDivWidth:blocklyDiv?.offsetWidth,blocklyDivHeight:blocklyDiv?.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            Blockly.svgResize(blocklyWorkspace);
            // #region agent log
            fetch('http://127.0.0.1:7246/ingest/06db8c19-0fda-49d9-9e03-0ed0a5d45d56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blockly_integration.js:1092',message:'After visibility change svgResize',data:{injectionDivWidth:injectionDiv?.offsetWidth,injectionDivHeight:injectionDiv?.offsetHeight,blocklyDivWidth:blocklyDiv?.offsetWidth,blocklyDivHeight:blocklyDiv?.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
        }, 100);
    }
});

/**
 * Global function to execute Python code using Skulpt
 * Called by the Run Code button
 */
function runit() {
    const outputCanvas = document.getElementById('outputCanvas');
    if (!outputCanvas) {
        console.error('Output canvas not found');
        return;
    }

    // Clear previous output
    outputCanvas.textContent = '';
    outputCanvas.className = '';

    // Clear turtle canvas
    const turtleCanvas = document.getElementById('mycanvas');
    if (turtleCanvas) {
        turtleCanvas.innerHTML = '';
    }

    // Get Python code from the code display or directly from workspace
    let pythonCode = '';
    const codeDisplay = document.getElementById('pythonCodeDisplay');
    const placeholderText = '# 블록을 추가하면 Python 코드가 여기에 표시됩니다...';

    if (codeDisplay) {
        // Read from textContent for <pre>/<code> tags, value for <textarea>
        if (codeDisplay.tagName === 'PRE' || codeDisplay.tagName === 'CODE') {
            pythonCode = codeDisplay.textContent;
        } else {
            pythonCode = codeDisplay.value;
        }
    }

    // If code display is empty or contains placeholder, try getting from workspace
    if (!pythonCode || pythonCode.trim() === '' || pythonCode.trim() === placeholderText) {
        if (blocklyWorkspace) {
            try {
                pythonCode = Blockly.Python.workspaceToCode(blocklyWorkspace);
            } catch (e) {
                outputCanvas.textContent = 'Error generating code: ' + e.toString();
                outputCanvas.className = 'error';
                return;
            }
        } else {
            outputCanvas.textContent = 'Error: No Python code found.';
            outputCanvas.className = 'error';
            return;
        }
    }

    if (!pythonCode || pythonCode.trim() === '') {
        outputCanvas.textContent = 'No code to execute. Please add some blocks.';
        outputCanvas.className = 'error';
        return;
    }

    // Configure Skulpt output function
    function outf(text) {
        const output = outputCanvas.textContent || '';
        outputCanvas.textContent = output + text;
        outputCanvas.className = 'success';
    }

    // Configure Skulpt error output
    function builtinRead(x) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
        return Sk.builtinFiles["files"][x];
    }

    // Configure turtle graphics canvas (must be set before Sk.configure)
    const mycanvasBefore = document.getElementById('mycanvas');
    
    // Set up MutationObserver to fix canvas positioning as soon as it's created
    if (mycanvasBefore) {
        // Fix mycanvas positioning immediately
        mycanvasBefore.style.position = 'relative';
        mycanvasBefore.style.top = '';
        mycanvasBefore.style.left = '';
        mycanvasBefore.style.right = '';
        mycanvasBefore.style.bottom = '';
        
        // Watch for canvas elements being added
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && (node.tagName === 'CANVAS' || node.querySelectorAll('canvas').length > 0)) {
                        // Fix canvas positioning
                        const canvases = node.tagName === 'CANVAS' ? [node] : node.querySelectorAll('canvas');
                        canvases.forEach(function(canvas) {
                            canvas.style.position = 'relative';
                            canvas.style.top = '';
                            canvas.style.left = '';
                            canvas.style.right = '';
                            canvas.style.bottom = '';
                        });
                    }
                });
            });
        });
        
        observer.observe(mycanvasBefore, {
            childList: true,
            subtree: true
        });
    }
    
    Sk.TurtleGraphics = {
        target: 'mycanvas',
        width: 400,
        height: 300
    };

    // Configure Skulpt with turtle graphics support
    Sk.configure({
        output: outf,
        read: builtinRead,
        __future__: Sk.python3
    });

    // Execute the Python code using promise-based approach for async operations (like turtle)
    Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, pythonCode, true);
    }).then(function() {
        console.log('Python execution completed successfully');
        // Additional fix: ensure canvas positioning is correct after execution
        setTimeout(() => {
            const mycanvasAfter = document.getElementById('mycanvas');
            if (mycanvasAfter) {
                // Force mycanvas to relative positioning
                mycanvasAfter.style.position = 'relative';
                mycanvasAfter.style.top = '';
                mycanvasAfter.style.left = '';
                mycanvasAfter.style.right = '';
                mycanvasAfter.style.bottom = '';
                
                // Fix all canvas elements inside mycanvas
                const canvasElements = mycanvasAfter.querySelectorAll('canvas');
                if (canvasElements && canvasElements.length > 0) {
                    canvasElements.forEach((canvas) => {
                        canvas.style.position = 'relative';
                        canvas.style.top = '';
                        canvas.style.left = '';
                        canvas.style.right = '';
                        canvas.style.bottom = '';
                    });
                }
            }
        }, 500);
    }).catch(function(e) {
        // Handle execution errors
        if (e instanceof Sk.builtin.SystemExit) {
            // SystemExit is normal, don't treat as error
            return;
        }
        outputCanvas.textContent = 'Error: ' + e.toString();
        outputCanvas.className = 'error';
        console.error('Skulpt execution error:', e);
    });
}
