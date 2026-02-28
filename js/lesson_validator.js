/**
 * Lesson Validator - Visual Feedback for Blockly Lessons
 *
 * Provides real-time validation and success feedback for student activities.
 * Features:
 * - Mission checklist with progress tracking
 * - Block validation (checks required blocks are connected)
 * - Execution success detection
 * - Visual celebration on completion
 */

(function() {
    'use strict';

    // ========================================================================
    // CONFIGURATION
    // ========================================================================

    const VALIDATION_RULES = {
        // Lesson A: 순차 실행과 done()
        'chunk_a_done': {
            requiredBlocks: ['turtle_setup', 'turtle_done'],
            checkConnection: true,
            successCheck: 'turtle_visible',
            missionText: '거북이 시작과 끝 블록을 연결하세요',
            steps: [
                { id: 'blocks', text: '블록 연결하기', check: 'blocks_connected' },
                { id: 'run', text: '실행하기', check: 'code_executed' },
                { id: 'result', text: '거북이 확인하기', check: 'turtle_visible' }
            ]
        },
        // Lesson B: import 라이브러리
        'chunk_b_import': {
            requiredBlocks: ['turtle_setup', 'turtle_done'],
            checkConnection: true,
            checkCodeContains: ['import turtle'],
            successCheck: 'turtle_visible',
            missionText: '거북이 시작 블록의 Python 코드를 확인하세요',
            steps: [
                { id: 'blocks', text: '블록 추가하기', check: 'blocks_connected' },
                { id: 'code', text: 'import 확인하기', check: 'code_contains_import' },
                { id: 'run', text: '실행하기', check: 'turtle_visible' }
            ]
        },
        // Lesson C: shape() 모양
        'chunk_c_shape': {
            requiredBlocks: ['turtle_setup', 'turtle_done'],
            successCheck: 'turtle_visible',
            missionText: '거북이 모양을 확인하세요',
            steps: [
                { id: 'blocks', text: '블록 연결하기', check: 'blocks_connected' },
                { id: 'run', text: '실행하기', check: 'turtle_visible' }
            ]
        },
        // Lesson D: forward() 이동
        'chunk_d_forward': {
            requiredBlocks: ['turtle_setup', 'turtle_forward', 'turtle_done'],
            successCheck: 'turtle_visible',
            missionText: '거북이를 앞으로 이동시키세요',
            steps: [
                { id: 'blocks', text: 'forward 블록 추가', check: 'has_forward' },
                { id: 'run', text: '실행하기', check: 'turtle_visible' }
            ]
        },
        // Lesson E: right()/left() 회전
        'chunk_e_turn': {
            requiredBlocks: ['turtle_setup', 'turtle_done'],
            successCheck: 'turtle_visible',
            missionText: '거북이를 회전시키세요',
            steps: [
                { id: 'blocks', text: '회전 블록 추가', check: 'has_turn' },
                { id: 'run', text: '실행하기', check: 'turtle_visible' }
            ]
        }
    };

    // ========================================================================
    // STATE
    // ========================================================================

    let _currentLesson = null;
    let _missionState = {
        blocksConnected: false,
        codeExecuted: false,
        turtleVisible: false,
        completed: false
    };
    let _checklistElement = null;
    let _bannerElement = null;

    // ========================================================================
    // LESSON DETECTION
    // ========================================================================

    /**
     * Detect current lesson from URL
     */
    function detectLesson() {
        const path = window.location.pathname;

        for (const [lessonId, config] of Object.entries(VALIDATION_RULES)) {
            if (path.includes(lessonId)) {
                return { id: lessonId, config };
            }
        }

        return null;
    }

    // ========================================================================
    // VALIDATION CHECKS
    // ========================================================================

    /**
     * Check if required blocks exist in workspace
     */
    function checkRequiredBlocks(requiredBlocks) {
        const workspace = window.blocklyWorkspace;
        if (!workspace) return false;

        const blocks = workspace.getAllBlocks();
        const blockTypes = blocks.map(b => b.type);

        return requiredBlocks.every(required => blockTypes.includes(required));
    }

    /**
     * Check if blocks are properly connected (not floating)
     */
    function checkBlocksConnected() {
        const workspace = window.blocklyWorkspace;
        if (!workspace) return false;

        const topBlocks = workspace.getTopBlocks(false);

        // For simple lessons, we want exactly one chain of blocks
        // Starting with turtle_setup
        const setupBlock = topBlocks.find(b => b.type === 'turtle_setup');
        if (!setupBlock) return false;

        // Check if turtle_done is in the chain
        let current = setupBlock;
        while (current) {
            if (current.type === 'turtle_done') {
                return true;
            }
            current = current.getNextBlock();
        }

        return false;
    }

    /**
     * Check if specific block type exists
     */
    function hasBlockType(blockType) {
        const workspace = window.blocklyWorkspace;
        if (!workspace) return false;

        const blocks = workspace.getAllBlocks();
        return blocks.some(b => b.type === blockType);
    }

    /**
     * Check if code contains specific strings
     */
    function checkCodeContains(strings) {
        const codeDisplay = document.getElementById('pythonCodeDisplay');
        if (!codeDisplay) return false;

        const code = codeDisplay.textContent || codeDisplay.value || '';
        return strings.every(s => code.includes(s));
    }

    /**
     * Check if turtle is visible on canvas
     */
    function checkTurtleVisible() {
        const canvas = document.getElementById('mycanvas');
        if (!canvas) return false;

        // Check for SVG or canvas elements (turtle graphics)
        const hasSvg = canvas.querySelector('svg');
        const hasCanvas = canvas.querySelector('canvas');

        return !!(hasSvg || hasCanvas);
    }

    /**
     * Run all checks for current lesson
     */
    function runValidation() {
        if (!_currentLesson) return;

        const config = _currentLesson.config;
        const oldState = { ..._missionState };

        // Check blocks
        if (config.requiredBlocks) {
            _missionState.blocksConnected = config.checkConnection
                ? checkBlocksConnected()
                : checkRequiredBlocks(config.requiredBlocks);
        }

        // Check code content
        if (config.checkCodeContains) {
            _missionState.codeContainsImport = checkCodeContains(config.checkCodeContains);
        }

        // Check specific blocks
        _missionState.hasForward = hasBlockType('turtle_forward');
        _missionState.hasTurn = hasBlockType('turtle_right') || hasBlockType('turtle_left');

        // Check turtle visibility
        _missionState.turtleVisible = checkTurtleVisible();

        // Update completion
        const allStepsComplete = config.steps.every(step => checkStepComplete(step.check));

        if (allStepsComplete && !_missionState.completed) {
            _missionState.completed = true;
            showSuccessBanner();
        }

        // Update UI if state changed
        if (JSON.stringify(oldState) !== JSON.stringify(_missionState)) {
            updateChecklist();
        }
    }

    /**
     * Check if a specific step is complete
     */
    function checkStepComplete(checkType) {
        switch (checkType) {
            case 'blocks_connected':
                return _missionState.blocksConnected;
            case 'code_executed':
                return _missionState.codeExecuted;
            case 'turtle_visible':
                return _missionState.turtleVisible;
            case 'code_contains_import':
                return _missionState.codeContainsImport;
            case 'has_forward':
                return _missionState.hasForward;
            case 'has_turn':
                return _missionState.hasTurn;
            default:
                return false;
        }
    }

    // ========================================================================
    // UI CREATION
    // ========================================================================

    /**
     * Create the mission checklist UI
     */
    function createChecklist() {
        if (!_currentLesson) return;

        const config = _currentLesson.config;

        // Find the blockly container to insert before
        const blocklyContainer = document.querySelector('.blockly-container');
        if (!blocklyContainer) return;

        // Check if already exists
        if (document.querySelector('.mission-checklist')) {
            _checklistElement = document.querySelector('.mission-checklist');
            return;
        }

        const checklist = document.createElement('div');
        checklist.className = 'mission-checklist';
        checklist.innerHTML = `
            <div class="mission-header">
                <span class="mission-icon">🎯</span>
                <span class="mission-title">미션</span>
                <span class="mission-progress"></span>
            </div>
            <div class="mission-text">${config.missionText}</div>
            <div class="mission-steps">
                ${config.steps.map((step, index) => `
                    <div class="mission-step" data-step="${step.id}">
                        <span class="step-indicator">
                            <span class="step-number">${index + 1}</span>
                            <span class="step-check">✓</span>
                        </span>
                        <span class="step-text">${step.text}</span>
                    </div>
                `).join('')}
            </div>
        `;

        blocklyContainer.parentElement.insertBefore(checklist, blocklyContainer);
        _checklistElement = checklist;

        updateChecklist();
    }

    /**
     * Update the checklist UI based on current state
     */
    function updateChecklist() {
        if (!_checklistElement || !_currentLesson) return;

        const config = _currentLesson.config;
        let completedCount = 0;

        config.steps.forEach((step, index) => {
            const stepElement = _checklistElement.querySelector(`[data-step="${step.id}"]`);
            if (!stepElement) return;

            const isComplete = checkStepComplete(step.check);

            if (isComplete) {
                stepElement.classList.add('completed');
                stepElement.classList.remove('active');
                completedCount++;
            } else if (index === 0 || checkStepComplete(config.steps[index - 1]?.check)) {
                stepElement.classList.add('active');
                stepElement.classList.remove('completed');
            } else {
                stepElement.classList.remove('active', 'completed');
            }
        });

        // Update progress
        const progressElement = _checklistElement.querySelector('.mission-progress');
        if (progressElement) {
            const percentage = Math.round((completedCount / config.steps.length) * 100);
            progressElement.textContent = `${completedCount}/${config.steps.length}`;

            if (completedCount === config.steps.length) {
                progressElement.classList.add('complete');
            }
        }
    }

    /**
     * Show success banner
     */
    function showSuccessBanner() {
        // Remove existing banner
        if (_bannerElement) {
            _bannerElement.remove();
        }

        const banner = document.createElement('div');
        banner.className = 'success-banner';
        banner.innerHTML = `
            <div class="success-content">
                <span class="success-icon">🎉</span>
                <span class="success-text">미션 완료!</span>
                <span class="success-subtext">잘했어요! 다음 단계로 넘어가세요</span>
            </div>
            <button class="success-dismiss" onclick="this.parentElement.classList.add('dismissed')">×</button>
        `;

        // Insert after the run button
        const runButton = document.querySelector('button[onclick="runit()"]');
        if (runButton && runButton.parentElement) {
            runButton.parentElement.insertBefore(banner, runButton.nextSibling);
        } else {
            // Fallback: insert at top of content
            const content = document.querySelector('.md-content');
            if (content) {
                content.insertBefore(banner, content.firstChild);
            }
        }

        _bannerElement = banner;

        // Animate in
        requestAnimationFrame(() => {
            banner.classList.add('visible');
        });

        // Update checklist to show complete state
        if (_checklistElement) {
            _checklistElement.classList.add('mission-complete');
        }
    }

    // ========================================================================
    // EVENT LISTENERS
    // ========================================================================

    /**
     * Hook into the run button to track execution
     */
    function hookRunButton() {
        const originalRunit = window.runit;

        if (typeof originalRunit === 'function') {
            window.runit = function() {
                // Mark as executed
                _missionState.codeExecuted = true;

                // Call original
                originalRunit.apply(this, arguments);

                // Check results after a delay (let turtle render)
                setTimeout(() => {
                    runValidation();
                }, 500);
            };
        }
    }

    /**
     * Setup workspace change listener
     */
    function setupWorkspaceListener() {
        // Poll for workspace (may not exist immediately)
        const checkWorkspace = setInterval(() => {
            const workspace = window.blocklyWorkspace;
            if (workspace) {
                clearInterval(checkWorkspace);

                workspace.addChangeListener((event) => {
                    // Only respond to block changes
                    if (event.type === Blockly.Events.BLOCK_MOVE ||
                        event.type === Blockly.Events.BLOCK_CREATE ||
                        event.type === Blockly.Events.BLOCK_DELETE ||
                        event.type === Blockly.Events.BLOCK_CHANGE) {

                        // Debounce validation
                        clearTimeout(window._validationTimeout);
                        window._validationTimeout = setTimeout(runValidation, 100);
                    }
                });

                // Initial validation
                runValidation();
            }
        }, 200);

        // Stop checking after 10 seconds
        setTimeout(() => clearInterval(checkWorkspace), 10000);
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /**
     * Initialize the lesson validator
     */
    function init() {
        _currentLesson = detectLesson();

        if (!_currentLesson) {
            console.log('Lesson Validator: No validation rules for this page');
            return;
        }

        console.log('Lesson Validator: Initializing for', _currentLesson.id);

        // Reset state
        _missionState = {
            blocksConnected: false,
            codeExecuted: false,
            turtleVisible: false,
            codeContainsImport: false,
            hasForward: false,
            hasTurn: false,
            completed: false
        };

        // Create UI
        createChecklist();

        // Hook into existing functionality
        hookRunButton();
        setupWorkspaceListener();
    }

    /**
     * Clean up empty mission checklist elements
     * CSS :empty doesn't work with whitespace, so we handle it in JS
     */
    function cleanupEmptyChecklists() {
        const checklists = document.querySelectorAll('.editor-mission-checklist, .mission-checklist');
        checklists.forEach(el => {
            // Check if element has no meaningful content (only whitespace)
            if (!el.querySelector('.editor-mission-header, .mission-header, .mission-step, .editor-mission-step')) {
                el.style.display = 'none';
            }
        });
    }

    /**
     * Re-initialize on navigation (MkDocs instant loading)
     */
    function reinit() {
        // Clean up old elements
        if (_checklistElement) {
            _checklistElement.remove();
            _checklistElement = null;
        }
        if (_bannerElement) {
            _bannerElement.remove();
            _bannerElement = null;
        }

        // Clean up empty checklists
        setTimeout(cleanupEmptyChecklists, 100);

        // Wait for DOM to update
        setTimeout(init, 400);
    }

    // ========================================================================
    // EVENT BINDINGS
    // ========================================================================

    // Initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            cleanupEmptyChecklists();
            init();
        });
    } else {
        cleanupEmptyChecklists();
        init();
    }

    // Handle MkDocs instant navigation
    if (typeof document$ !== 'undefined') {
        document$.subscribe(reinit);
    }

    // Export for debugging
    window.LessonValidator = {
        getState: () => _missionState,
        validate: runValidation,
        getCurrentLesson: () => _currentLesson
    };

})();
