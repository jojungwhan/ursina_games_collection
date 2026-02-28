/**
 * Turtle Blocks Configuration - Single Source of Truth
 * All turtle block definitions and configurations in one place
 */

const TURTLE_BLOCKS_CONFIG = {
    // Block colors (Blockly hue values)
    COLORS: {
        MOTION: 160,
        PEN: 290,
        UTILITY: 230
    },

    // Default values for inputs
    DEFAULTS: {
        STEP: '10',
        ANGLE: '90',
        COORDINATE: '0',
        RADIUS: '50',
        SPEED: '5',
        PEN_WIDTH: '1'
    },

    // Dropdown options
    DROPDOWNS: {
        SHAPES: [
            ['거북이', 'turtle'],
            ['화살표', 'arrow'],
            ['원', 'circle'],
            ['사각형', 'square'],
            ['삼각형', 'triangle'],
            ['고전', 'classic']
        ],
        COLORS: [
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
        ],
        SPEEDS: [
            ['느리게', '1'],
            ['보통', '5'],
            ['빠르게', '10'],
            ['즉시', '0']
        ]
    },

    // Block labels for flowchart generation
    LABELS: {
        'turtle_setup': '거북이 시작',
        'turtle_done': '거북이 끝',
        'turtle_forward': '앞으로',
        'turtle_backward': '뒤로',
        'turtle_right': '오른쪽',
        'turtle_left': '왼쪽',
        'turtle_goto': '이동',
        'turtle_penup': '펜 올리기',
        'turtle_pendown': '펜 내리기',
        'turtle_pencolor': '펜 색상',
        'turtle_pensize': '펜 두께',
        'turtle_fillcolor': '채우기 색상',
        'turtle_begin_fill': '채우기 시작',
        'turtle_end_fill': '채우기 끝',
        'turtle_circle': '원 그리기',
        'turtle_speed': '속도',
        'turtle_shape': '모양',
        'turtle_reset': '화면 지우기',
        'turtle_clear': '그림만 지우기',
        'turtle_stamp': '도장 찍기',
        'turtle_bgcolor': '배경 색상'
    }
};

/**
 * Register all turtle blocks with Blockly
 * @param {Object} Blockly - The Blockly library instance
 * @returns {boolean} - Whether registration was successful
 */
function registerTurtleBlocks(Blockly) {
    if (typeof Blockly === 'undefined' || typeof Blockly.Python === 'undefined') {
        console.warn('Blockly or Blockly.Python not available');
        return false;
    }

    const COLORS = TURTLE_BLOCKS_CONFIG.COLORS;
    const DEFAULTS = TURTLE_BLOCKS_CONFIG.DEFAULTS;
    const DROPDOWNS = TURTLE_BLOCKS_CONFIG.DROPDOWNS;

    // Use forBlock if available (newer Blockly), otherwise use direct assignment
    const pythonGen = Blockly.Python.forBlock || Blockly.Python;

    // ============================================================================
    // TURTLE SETUP BLOCK
    // ============================================================================
    Blockly.Blocks['turtle_setup'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('거북이 시작');
            this.setColour(COLORS.MOTION);
            this.setTooltip('거북이 그래픽을 시작합니다. 프로그램 시작 부분에 배치하세요.');
            this.setHelpUrl('');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
        }
    };

    pythonGen['turtle_setup'] = function(block) {
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
            this.setColour(COLORS.MOTION);
            this.setTooltip('거북이 그래픽을 종료합니다. 프로그램 마지막에 배치하세요.');
            this.setHelpUrl('');
            this.setPreviousStatement(true, null);
            this.setNextStatement(false, null);
        }
    };

    pythonGen['turtle_done'] = function(block) {
        return 'turtle.done()\n';
    };

    // ============================================================================
    // TURTLE SHAPE BLOCK
    // ============================================================================
    Blockly.Blocks['turtle_shape'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('모양')
                .appendField(new Blockly.FieldDropdown(DROPDOWNS.SHAPES), 'SHAPE');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.MOTION);
            this.setTooltip('거북이의 모양을 설정합니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_shape'] = function(block) {
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
            this.setColour(COLORS.MOTION);
            this.setTooltip('거북이를 지정한 거리만큼 앞으로 이동시킵니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_forward'] = function(block) {
        var step = Blockly.Python.valueToCode(block, 'STEP', Blockly.Python.ORDER_ATOMIC) || DEFAULTS.STEP;
        return 't.forward(' + step + ')\n';
    };

    Blockly.Blocks['turtle_backward'] = {
        init: function() {
            this.appendValueInput('STEP')
                .setCheck('Number')
                .appendField('뒤로');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.MOTION);
            this.setTooltip('거북이를 지정한 거리만큼 뒤로 이동시킵니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_backward'] = function(block) {
        var step = Blockly.Python.valueToCode(block, 'STEP', Blockly.Python.ORDER_ATOMIC) || DEFAULTS.STEP;
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
            this.setColour(COLORS.MOTION);
            this.setTooltip('거북이를 지정한 각도만큼 오른쪽으로 회전시킵니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_right'] = function(block) {
        var angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_ATOMIC) || DEFAULTS.ANGLE;
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
            this.setColour(COLORS.MOTION);
            this.setTooltip('거북이를 지정한 각도만큼 왼쪽으로 회전시킵니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_left'] = function(block) {
        var angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_ATOMIC) || DEFAULTS.ANGLE;
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
            this.setColour(COLORS.MOTION);
            this.setTooltip('거북이를 지정한 좌표 (X, Y)로 이동시킵니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_goto'] = function(block) {
        var x = Blockly.Python.valueToCode(block, 'X', Blockly.Python.ORDER_ATOMIC) || DEFAULTS.COORDINATE;
        var y = Blockly.Python.valueToCode(block, 'Y', Blockly.Python.ORDER_ATOMIC) || DEFAULTS.COORDINATE;
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
            this.setColour(COLORS.PEN);
            this.setTooltip('펜을 올려서 이동할 때 선을 그리지 않습니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_penup'] = function(block) {
        return 't.penup()\n';
    };

    Blockly.Blocks['turtle_pendown'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('펜 내리기');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.PEN);
            this.setTooltip('펜을 내려서 이동할 때 선을 그립니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_pendown'] = function(block) {
        return 't.pendown()\n';
    };

    Blockly.Blocks['turtle_pencolor'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('펜 색상')
                .appendField(new Blockly.FieldDropdown(DROPDOWNS.COLORS), 'COLOR');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.PEN);
            this.setTooltip('펜의 색상을 설정합니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_pencolor'] = function(block) {
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
            this.setColour(COLORS.PEN);
            this.setTooltip('펜의 두께를 설정합니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_pensize'] = function(block) {
        var width = Blockly.Python.valueToCode(block, 'WIDTH', Blockly.Python.ORDER_ATOMIC) || DEFAULTS.PEN_WIDTH;
        return 't.pensize(' + width + ')\n';
    };

    Blockly.Blocks['turtle_fillcolor'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('채우기 색상')
                .appendField(new Blockly.FieldDropdown(DROPDOWNS.COLORS), 'COLOR');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.PEN);
            this.setTooltip('도형을 채울 색상을 설정합니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_fillcolor'] = function(block) {
        var color = block.getFieldValue('COLOR');
        return "t.fillcolor('" + color + "')\n";
    };

    Blockly.Blocks['turtle_begin_fill'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('채우기 시작');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.PEN);
            this.setTooltip('도형 채우기를 시작합니다. 도형을 그린 후 채우기 끝을 사용하세요.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_begin_fill'] = function(block) {
        return 't.begin_fill()\n';
    };

    Blockly.Blocks['turtle_end_fill'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('채우기 끝');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.PEN);
            this.setTooltip('도형 채우기를 끝내고 색을 채웁니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_end_fill'] = function(block) {
        return 't.end_fill()\n';
    };

    Blockly.Blocks['turtle_stamp'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('도장 찍기');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.PEN);
            this.setTooltip('현재 위치에 거북이 모양을 찍습니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_stamp'] = function(block) {
        return 't.stamp()\n';
    };

    // ============================================================================
    // UTILITY BLOCKS
    // ============================================================================
    Blockly.Blocks['turtle_circle'] = {
        init: function() {
            this.appendValueInput('RADIUS')
                .setCheck('Number')
                .appendField('원 그리기')
                .appendField('반지름:');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.UTILITY);
            this.setTooltip('지정한 반지름의 원을 그립니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_circle'] = function(block) {
        var radius = Blockly.Python.valueToCode(block, 'RADIUS', Blockly.Python.ORDER_ATOMIC) || DEFAULTS.RADIUS;
        return 't.circle(' + radius + ')\n';
    };

    Blockly.Blocks['turtle_speed'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('속도')
                .appendField(new Blockly.FieldDropdown(DROPDOWNS.SPEEDS), 'SPEED');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.UTILITY);
            this.setTooltip('거북이의 이동 속도를 설정합니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_speed'] = function(block) {
        var speed = block.getFieldValue('SPEED') || DEFAULTS.SPEED;
        return 't.speed(' + speed + ')\n';
    };

    Blockly.Blocks['turtle_reset'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('화면 지우기');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.UTILITY);
            this.setTooltip('화면을 지우고 거북이를 초기 위치로 돌립니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_reset'] = function(block) {
        return 't.reset()\n';
    };

    Blockly.Blocks['turtle_clear'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('그림만 지우기');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.UTILITY);
            this.setTooltip('그림만 지웁니다. 거북이 위치는 유지됩니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_clear'] = function(block) {
        return 't.clear()\n';
    };

    // ============================================================================
    // BACKGROUND COLOR BLOCK
    // ============================================================================
    Blockly.Blocks['turtle_bgcolor'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('배경 색상')
                .appendField(new Blockly.FieldDropdown(DROPDOWNS.COLORS), 'COLOR');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.PEN);
            this.setTooltip('캔버스의 배경 색상을 설정합니다.');
            this.setHelpUrl('');
        }
    };

    pythonGen['turtle_bgcolor'] = function(block) {
        var color = block.getFieldValue('COLOR');
        return "turtle.Screen().bgcolor('" + color + "')\n";
    };

    console.log('Turtle blocks registered successfully');
    return true;
}

/**
 * Get human-readable label for a block
 * @param {Object} block - Blockly block
 * @param {Function} getInputValue - Function to get input values
 * @returns {string} - Human readable label
 */
function getBlockLabel(block, getInputValue) {
    const type = block.type;
    const LABELS = TURTLE_BLOCKS_CONFIG.LABELS;
    const DEFAULTS = TURTLE_BLOCKS_CONFIG.DEFAULTS;

    // Turtle blocks with values
    if (type === 'turtle_forward') {
        const step = getInputValue(block, 'STEP', DEFAULTS.STEP);
        return LABELS[type] + ' ' + step;
    }
    if (type === 'turtle_backward') {
        const step = getInputValue(block, 'STEP', DEFAULTS.STEP);
        return LABELS[type] + ' ' + step;
    }
    if (type === 'turtle_right') {
        const angle = getInputValue(block, 'ANGLE', DEFAULTS.ANGLE);
        return LABELS[type] + ' ' + angle + '도';
    }
    if (type === 'turtle_left') {
        const angle = getInputValue(block, 'ANGLE', DEFAULTS.ANGLE);
        return LABELS[type] + ' ' + angle + '도';
    }
    if (type === 'turtle_goto') {
        const x = getInputValue(block, 'X', DEFAULTS.COORDINATE);
        const y = getInputValue(block, 'Y', DEFAULTS.COORDINATE);
        return LABELS[type] + ' (' + x + ', ' + y + ')';
    }
    if (type === 'turtle_pencolor') {
        const color = block.getFieldValue('COLOR') || 'black';
        return LABELS[type] + ': ' + color;
    }
    if (type === 'turtle_pensize') {
        const width = getInputValue(block, 'WIDTH', DEFAULTS.PEN_WIDTH);
        return LABELS[type] + ': ' + width;
    }
    if (type === 'turtle_circle') {
        const radius = getInputValue(block, 'RADIUS', DEFAULTS.RADIUS);
        return LABELS[type] + ' r=' + radius;
    }
    if (type === 'turtle_speed') {
        const speed = block.getFieldValue('SPEED') || DEFAULTS.SPEED;
        return LABELS[type] + ': ' + speed;
    }
    if (type === 'turtle_shape') {
        const shape = block.getFieldValue('SHAPE') || 'turtle';
        return LABELS[type] + ': ' + shape;
    }

    // Simple labels
    if (LABELS[type]) {
        return LABELS[type];
    }

    // Default: use type name
    return type.replace(/_/g, ' ');
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.TURTLE_BLOCKS_CONFIG = TURTLE_BLOCKS_CONFIG;
    window.registerTurtleBlocks = registerTurtleBlocks;
    window.getBlockLabel = getBlockLabel;
}
