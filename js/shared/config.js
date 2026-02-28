/**
 * Shared Configuration Module
 * Single source of truth for all configuration values
 */

const CONFIG = {
    // Canvas dimensions
    CANVAS: {
        DEFAULT_WIDTH: 400,
        DEFAULT_HEIGHT: 300,
        MULTI_INSTANCE_HEIGHT: 400
    },

    // Editor settings
    EDITOR: {
        DEFAULT_HEIGHT: '200px',
        DEFAULT_CODE_PLACEHOLDER: '# 여기에 Python 코드를 작성하세요\n',
        BLOCKLY_CODE_PLACEHOLDER: '# 블록을 추가하면 Python 코드가 여기에 표시됩니다...'
    },

    // Blockly workspace settings
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

    // Mermaid flowchart settings
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

    // Timing constants (in milliseconds)
    TIMING: {
        LAYOUT_CHECK_DELAY: 50,
        INIT_DELAY: 100,
        RESIZE_DELAY: 100,
        FLYOUT_FIX_DELAYS: [50, 100, 200],
        CANVAS_FIX_DELAY: 100,
        MERMAID_RETRY_DELAY: 500,
        POST_LOAD_DELAY: 500
    },

    // Threshold values
    THRESHOLDS: {
        MIN_CONTAINER_WIDTH: 100,
        FLYOUT_Y_THRESHOLD: 50
    },

    // UI strings (Korean)
    STRINGS: {
        // Flowchart
        FLOWCHART_START: '시작',
        FLOWCHART_END: '끝',
        FLOWCHART_PLACEHOLDER: '블록을 추가하면 흐름도가 여기에 표시됩니다...',
        FLOWCHART_LOADING: 'Mermaid 라이브러리를 로딩 중입니다...',
        FLOWCHART_ERROR: '흐름도 렌더링 중 오류가 발생했습니다.',
        FLOWCHART_GEN_ERROR: '흐름도 코드 생성 중 오류가 발생했습니다.',

        // Execution
        NO_CODE: 'No code to execute. Please add some blocks.',
        NO_CODE_KR: '블록을 추가해주세요.',
        NO_PYTHON_CODE: 'Error: No Python code found.',
        CODE_GEN_ERROR: 'Error generating code: ',

        // Buttons
        REFRESH_BUTTON: '🔄 블록이 안 보이면 클릭',

        // Control flow labels
        YES: '예',
        NO: '아니오',
        LOOP: '반복',
        CONDITION: '조건',

        // Block labels
        TURTLE_START: '거북이 시작',
        TURTLE_END: '거북이 끝',
        FORWARD: '앞으로',
        BACKWARD: '뒤로',
        RIGHT: '오른쪽',
        LEFT: '왼쪽',
        MOVE_TO: '이동',
        PEN_UP: '펜 올리기',
        PEN_DOWN: '펜 내리기',
        PEN_COLOR: '펜 색상',
        PEN_SIZE: '펜 두께',
        DRAW_CIRCLE: '원 그리기',
        SPEED: '속도',
        SHAPE: '모양',
        CLEAR_SCREEN: '화면 지우기',
        CLEAR_DRAWING: '그림만 지우기',
        STAMP: '도장 찍기',
        IF: '만약',
        IF_ELSE: '만약/아니면',
        REPEAT: '번 반복',
        WHILE: '~하는 동안',
        UNTIL: '~할 때까지',
        PRINT: '출력',
        CALCULATE: '계산',
        SET_VAR: '설정',
        TRUE: '참',
        FALSE: '거짓'
    },

    // DOM selectors
    SELECTORS: {
        BLOCKLY_DIV: 'blocklyDiv',
        TOOLBOX: 'toolbox',
        OUTPUT_CANVAS: 'outputCanvas',
        TURTLE_CANVAS: 'mycanvas',
        CODE_DISPLAY: 'pythonCodeDisplay',
        MERMAID_DISPLAY: 'mermaidDisplay',
        FLOWCHART_PANEL: 'flowchartPanel',
        TURTLE_CONTAINER: 'turtleCanvasContainer',

        // CSS classes
        BLOCKLY_FLYOUT: '.blocklyFlyout',
        BLOCKLY_TREE_ROW: '.blocklyTreeRow',
        BLOCKLY_SVG: '.blocklySvg',
        BLOCKLY_CONTAINER: '.blockly-container',
        PREVIEW_TAB: '.preview-tab',
        TAB_PANEL: '.tab-panel',
        TURTLE_OUTPUT_CONTAINER: 'turtle-output-container'
    },

    // CSS styles
    STYLES: {
        REFRESH_BUTTON: 'background-color: #ff9800; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-bottom: 10px; font-size: 14px;'
    }
};

// Freeze configuration to prevent accidental modification
Object.freeze(CONFIG);
Object.freeze(CONFIG.CANVAS);
Object.freeze(CONFIG.EDITOR);
Object.freeze(CONFIG.BLOCKLY);
Object.freeze(CONFIG.BLOCKLY.ZOOM);
Object.freeze(CONFIG.BLOCKLY.GRID);
Object.freeze(CONFIG.MERMAID);
Object.freeze(CONFIG.MERMAID.FLOWCHART);
Object.freeze(CONFIG.TIMING);
Object.freeze(CONFIG.THRESHOLDS);
Object.freeze(CONFIG.STRINGS);
Object.freeze(CONFIG.SELECTORS);
Object.freeze(CONFIG.STYLES);

// Export for use in other files
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
