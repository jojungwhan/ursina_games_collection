/**
 * Custom Blockly Blocks for Python Turtle Graphics
 * Compatible with Skulpt Python execution
 *
 * This file now delegates to shared/turtle_blocks_config.js for SSOT.
 * It provides a fallback if the shared module is not loaded.
 */

(function() {
    function attemptRegister() {
        // Check if Blockly is available
        if (typeof Blockly === 'undefined' || typeof Blockly.Python === 'undefined') {
            setTimeout(attemptRegister, 50);
            return;
        }

        // Use shared registerTurtleBlocks if available
        if (typeof window.registerTurtleBlocks === 'function') {
            window.registerTurtleBlocks(Blockly);
            console.log('Turtle blocks registered via shared module');
            return;
        }

        // Fallback: register blocks directly (for backwards compatibility)
        console.log('Shared turtle blocks module not found, using fallback registration');

        const COLORS = { MOTION: 160, PEN: 290, UTILITY: 230 };
        const pythonGen = Blockly.Python.forBlock || Blockly.Python;

        // TURTLE SETUP BLOCK
        Blockly.Blocks['turtle_setup'] = {
            init: function() {
                this.appendDummyInput().appendField('거북이 시작');
                this.setColour(COLORS.MOTION);
                this.setTooltip('거북이 그래픽을 시작합니다.');
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
            }
        };
        pythonGen['turtle_setup'] = function(block) {
            return 'import turtle\nt = turtle.Turtle()\nt.shape("turtle")\nt.speed(5)\n';
        };

        // MOTION BLOCKS
        Blockly.Blocks['turtle_forward'] = {
            init: function() {
                this.appendValueInput('STEP').setCheck('Number').appendField('앞으로');
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(COLORS.MOTION);
            }
        };
        pythonGen['turtle_forward'] = function(block) {
            var step = Blockly.Python.valueToCode(block, 'STEP', Blockly.Python.ORDER_ATOMIC) || '10';
            return 't.forward(' + step + ')\n';
        };

        Blockly.Blocks['turtle_backward'] = {
            init: function() {
                this.appendValueInput('STEP').setCheck('Number').appendField('뒤로');
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(COLORS.MOTION);
            }
        };
        pythonGen['turtle_backward'] = function(block) {
            var step = Blockly.Python.valueToCode(block, 'STEP', Blockly.Python.ORDER_ATOMIC) || '10';
            return 't.backward(' + step + ')\n';
        };

        Blockly.Blocks['turtle_right'] = {
            init: function() {
                this.appendValueInput('ANGLE').setCheck('Number').appendField('오른쪽으로').appendField('도 회전');
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(COLORS.MOTION);
            }
        };
        pythonGen['turtle_right'] = function(block) {
            var angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_ATOMIC) || '90';
            return 't.right(' + angle + ')\n';
        };

        Blockly.Blocks['turtle_left'] = {
            init: function() {
                this.appendValueInput('ANGLE').setCheck('Number').appendField('왼쪽으로').appendField('도 회전');
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(COLORS.MOTION);
            }
        };
        pythonGen['turtle_left'] = function(block) {
            var angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_ATOMIC) || '90';
            return 't.left(' + angle + ')\n';
        };

        Blockly.Blocks['turtle_goto'] = {
            init: function() {
                this.appendValueInput('X').setCheck('Number').appendField('이동').appendField('X:');
                this.appendValueInput('Y').setCheck('Number').appendField('Y:');
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(COLORS.MOTION);
            }
        };
        pythonGen['turtle_goto'] = function(block) {
            var x = Blockly.Python.valueToCode(block, 'X', Blockly.Python.ORDER_ATOMIC) || '0';
            var y = Blockly.Python.valueToCode(block, 'Y', Blockly.Python.ORDER_ATOMIC) || '0';
            return 't.goto(' + x + ', ' + y + ')\n';
        };

        // PEN BLOCKS
        Blockly.Blocks['turtle_penup'] = {
            init: function() {
                this.appendDummyInput().appendField('펜 올리기');
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(COLORS.PEN);
            }
        };
        pythonGen['turtle_penup'] = function(block) { return 't.penup()\n'; };

        Blockly.Blocks['turtle_pendown'] = {
            init: function() {
                this.appendDummyInput().appendField('펜 내리기');
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(COLORS.PEN);
            }
        };
        pythonGen['turtle_pendown'] = function(block) { return 't.pendown()\n'; };

        Blockly.Blocks['turtle_pencolor'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField('펜 색상')
                    .appendField(new Blockly.FieldDropdown([
                        ['빨강', 'red'], ['주황', 'orange'], ['노랑', 'yellow'],
                        ['초록', 'green'], ['파랑', 'blue'], ['남색', 'navy'],
                        ['보라', 'purple'], ['검정', 'black'], ['흰색', 'white'],
                        ['분홍', 'pink'], ['갈색', 'brown'], ['회색', 'gray']
                    ]), 'COLOR');
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(COLORS.PEN);
            }
        };
        pythonGen['turtle_pencolor'] = function(block) {
            return "t.pencolor('" + block.getFieldValue('COLOR') + "')\n";
        };

        Blockly.Blocks['turtle_pensize'] = {
            init: function() {
                this.appendValueInput('WIDTH').setCheck('Number').appendField('펜 두께');
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(COLORS.PEN);
            }
        };
        pythonGen['turtle_pensize'] = function(block) {
            var width = Blockly.Python.valueToCode(block, 'WIDTH', Blockly.Python.ORDER_ATOMIC) || '1';
            return 't.pensize(' + width + ')\n';
        };

        // UTILITY BLOCKS
        Blockly.Blocks['turtle_circle'] = {
            init: function() {
                this.appendValueInput('RADIUS').setCheck('Number').appendField('원 그리기').appendField('반지름:');
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(COLORS.UTILITY);
            }
        };
        pythonGen['turtle_circle'] = function(block) {
            var radius = Blockly.Python.valueToCode(block, 'RADIUS', Blockly.Python.ORDER_ATOMIC) || '50';
            return 't.circle(' + radius + ')\n';
        };

        Blockly.Blocks['turtle_speed'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField('속도')
                    .appendField(new Blockly.FieldDropdown([
                        ['느리게', '1'], ['보통', '5'], ['빠르게', '10'], ['즉시', '0']
                    ]), 'SPEED');
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(COLORS.UTILITY);
            }
        };
        pythonGen['turtle_speed'] = function(block) {
            return 't.speed(' + (block.getFieldValue('SPEED') || '5') + ')\n';
        };

        console.log('Turtle blocks registered (fallback)');
    }

    attemptRegister();
})();
