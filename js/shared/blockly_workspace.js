/**
 * Blockly Workspace Manager
 * Provides modular functions for workspace initialization and management
 *
 * Dependencies:
 * - shared/config.js (for CONFIG)
 * - shared/utils.js (for utility functions)
 * - shared/turtle_blocks_config.js (for registerTurtleBlocks)
 */

// ============================================================================
// WORKSPACE STATE
// ============================================================================

/**
 * Global workspace state (kept for backwards compatibility)
 */
let _blocklyWorkspace = null;
let _turtleBlocksRegistered = false;

/**
 * Get the current workspace
 * @returns {Object|null}
 */
function getWorkspace() {
    return _blocklyWorkspace;
}

/**
 * Set the current workspace
 * @param {Object} workspace
 */
function setWorkspace(workspace) {
    _blocklyWorkspace = workspace;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if Blockly libraries are loaded
 * @returns {boolean}
 */
function isBlocklyLoaded() {
    return typeof Blockly !== 'undefined' && typeof Blockly.Python !== 'undefined';
}

/**
 * Validate Blockly div exists and is ready
 * @param {string} divId - ID of the Blockly container
 * @returns {HTMLElement|null}
 */
function validateBlocklyDiv(divId) {
    const blocklyDiv = document.getElementById(divId || 'blocklyDiv');
    if (!blocklyDiv) {
        return null;
    }
    return blocklyDiv;
}

/**
 * Check if container has valid layout dimensions
 * @param {HTMLElement} blocklyDiv - Blockly container
 * @returns {boolean}
 */
function isLayoutReady(blocklyDiv) {
    const cfg = typeof CONFIG !== 'undefined' ? CONFIG : null;
    const minWidth = cfg?.THRESHOLDS?.MIN_CONTAINER_WIDTH || 100;

    const parentContainer = blocklyDiv.closest('.blockly-container');
    if (parentContainer) {
        return parentContainer.offsetWidth >= minWidth;
    }
    return true;
}

/**
 * Check if workspace is already initialized
 * @param {HTMLElement} blocklyDiv - Blockly container
 * @returns {boolean}
 */
function isWorkspaceInitialized(blocklyDiv) {
    return _blocklyWorkspace && blocklyDiv.querySelector('.blocklySvg');
}

// ============================================================================
// INITIALIZATION FUNCTIONS
// ============================================================================

/**
 * Register turtle blocks if needed
 */
function ensureTurtleBlocksRegistered() {
    console.log('ensureTurtleBlocksRegistered called', {
        alreadyRegistered: _turtleBlocksRegistered,
        registerFnExists: typeof window.registerTurtleBlocks === 'function',
        blocklyExists: typeof Blockly !== 'undefined'
    });

    // Always verify blocks actually exist, even if flag says registered
    const turtleBlocksPresent = typeof Blockly !== 'undefined' &&
        Blockly.Blocks && Blockly.Blocks['turtle_setup'] !== undefined;

    if (_turtleBlocksRegistered && turtleBlocksPresent) {
        console.log('Turtle blocks already registered and verified present');
        return;
    }

    if (_turtleBlocksRegistered && !turtleBlocksPresent) {
        console.warn('Blocks were marked as registered but not found in Blockly.Blocks, re-registering');
        _turtleBlocksRegistered = false;
    }

    if (typeof window.registerTurtleBlocks === 'function') {
        const result = window.registerTurtleBlocks(Blockly);
        _turtleBlocksRegistered = true;

        // Verify registration succeeded
        const blockTypes = ['turtle_setup', 'turtle_forward', 'turtle_right', 'turtle_pencolor'];
        const registeredBlocks = blockTypes.filter(type => Blockly.Blocks[type] !== undefined);
        console.log('Turtle blocks registered:', {
            result: result,
            verified: registeredBlocks.length + '/' + blockTypes.length,
            totalBlocksInRegistry: Object.keys(Blockly.Blocks).length
        });
    } else {
        console.warn('registerTurtleBlocks function not found');
    }
}

/**
 * Get workspace configuration
 * @param {Element} toolbox - Toolbox element
 * @returns {Object}
 */
function getWorkspaceConfig(toolbox) {
    const cfg = typeof CONFIG !== 'undefined' ? CONFIG.BLOCKLY : null;

    return {
        toolbox: toolbox,
        media: cfg?.MEDIA_PATH || 'https://unpkg.com/blockly/media/',
        // Explicitly set toolbox position to ensure proper flyout alignment
        horizontalLayout: false,
        toolboxPosition: 'start',
        zoom: cfg?.ZOOM || {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2
        },
        trashcan: cfg?.TRASHCAN !== false,
        grid: cfg?.GRID || {
            spacing: 20,
            length: 3,
            colour: '#ccc',
            snap: true
        }
    };
}

/**
 * Create Blockly workspace
 * @param {string} divId - ID of container div
 * @param {Element} toolbox - Toolbox element
 * @returns {Object} - Blockly workspace
 */
function createWorkspace(divId, toolbox) {
    const config = getWorkspaceConfig(toolbox);
    return Blockly.inject(divId, config);
}

/**
 * Check if workspace has turtle blocks in toolbox
 * @param {Object} workspace - Blockly workspace
 * @param {Element} toolboxElement - Original toolbox element
 * @returns {boolean}
 */
function isTurtleWorkspace(workspace, toolboxElement) {
    if (!workspace || !toolboxElement) return false;
    
    // Check if toolbox contains turtle blocks
    const turtleBlockTypes = ['turtle_setup', 'turtle_forward', 'turtle_backward', 
                              'turtle_right', 'turtle_left', 'turtle_shape'];
    const blocks = toolboxElement.querySelectorAll('block[type]');
    for (let block of blocks) {
        const blockType = block.getAttribute('type');
        if (turtleBlockTypes.includes(blockType)) {
            return true;
        }
    }
    return false;
}

/**
 * Add default turtle blocks to workspace if empty
 * @param {Object} workspace - Blockly workspace
 * @param {Element} toolboxElement - Original toolbox element
 */
function addDefaultTurtleBlocks(workspace, toolboxElement) {
    if (!workspace || !isTurtleWorkspace(workspace, toolboxElement)) {
        return;
    }

    // Check if workspace is empty
    const topBlocks = workspace.getTopBlocks(false);
    if (topBlocks.length > 0) {
        // Workspace already has blocks, don't add defaults
        return;
    }

    try {
        // Create XML for default blocks: turtle_setup + turtle_forward(100)
        const xmlText = `
            <xml xmlns="https://developers.google.com/blockly/xml">
                <block type="turtle_setup" id="default_setup" x="50" y="50">
                    <next>
                        <block type="turtle_forward" id="default_forward">
                            <value name="STEP">
                                <shadow type="math_number">
                                    <field name="NUM">100</field>
                                </shadow>
                            </value>
                        </block>
                    </next>
                </block>
            </xml>
        `;

        // Note: textToDom moved to Blockly.utils.xml in v11, but
        // domToWorkspace remains on Blockly.Xml (not moved).
        const xml = Blockly.utils.xml.textToDom(xmlText);
        Blockly.Xml.domToWorkspace(xml, workspace);
        
        console.log('Default turtle blocks added to workspace');
    } catch (error) {
        console.warn('Failed to add default turtle blocks:', error);
    }
}

/**
 * Setup workspace change listener for code display
 * @param {Object} workspace - Blockly workspace
 * @param {string} codeDisplayId - ID of code display element
 * @param {Function} onFlowchartUpdate - Optional flowchart update callback
 */
function setupCodeChangeListener(workspace, codeDisplayId, onFlowchartUpdate) {
    const cfg = typeof CONFIG !== 'undefined' ? CONFIG : null;
    const placeholder = cfg?.EDITOR?.BLOCKLY_CODE_PLACEHOLDER ||
        '# 블록을 추가하면 Python 코드가 여기에 표시됩니다...';

    workspace.addChangeListener(function(event) {
        if (event.isUiEvent) return;

        try {
            const pythonCode = Blockly.Python.workspaceToCode(workspace);
            const codeDisplay = document.getElementById(codeDisplayId);

            if (codeDisplay) {
                if (codeDisplay.tagName === 'PRE' || codeDisplay.tagName === 'CODE') {
                    codeDisplay.textContent = pythonCode || placeholder;
                } else {
                    codeDisplay.value = pythonCode;
                }
            }

            // Update flowchart if callback provided and panel is active
            if (onFlowchartUpdate) {
                const flowchartPanel = document.getElementById('flowchartPanel');
                if (flowchartPanel && flowchartPanel.classList.contains('active')) {
                    onFlowchartUpdate();
                }
            }
        } catch (e) {
            console.warn('Error generating Python code:', e);
        }
    });
}

/**
 * Dispose existing workspace
 * @param {Object} workspace - Workspace to dispose
 */
function disposeWorkspace(workspace) {
    if (!workspace) return;

    try {
        workspace.dispose();
    } catch (e) {
        // Ignore disposal errors
    }
}

/**
 * Reset all workspace state for navigation
 * Call this before reinitializing after page navigation
 */
function resetWorkspaceState() {
    console.log('resetWorkspaceState called', {
        hasWorkspace: !!_blocklyWorkspace,
        turtleBlocksRegistered: _turtleBlocksRegistered
    });

    // Dispose existing workspace if it exists and its DOM is still present
    if (_blocklyWorkspace) {
        try {
            // Check if workspace's container still exists in DOM
            const svgGroup = _blocklyWorkspace.svgGroup_;
            if (svgGroup && svgGroup.parentNode) {
                _blocklyWorkspace.dispose();
                console.log('Old workspace disposed successfully');
            } else {
                console.log('Old workspace DOM already removed, skipping dispose');
            }
        } catch (e) {
            console.log('Workspace dispose error (ignoring):', e.message);
        }
    }

    // Reset state variables
    _blocklyWorkspace = null;

    // IMPORTANT: Reset turtle blocks registration flag
    // This ensures blocks will be re-registered for the new page
    _turtleBlocksRegistered = false;

    // Remove refresh button so it can be re-added
    const refreshBtn = document.getElementById('blocklyRefreshBtn');
    if (refreshBtn) {
        refreshBtn.remove();
    }

    // Clear any stale Blockly state
    if (typeof Blockly !== 'undefined') {
        // Reset the Python generator's name database
        if (Blockly.Python && typeof Blockly.Python.nameDB_ !== 'undefined') {
            Blockly.Python.nameDB_ = undefined;
        }

        // Force re-registration of turtle blocks by removing them from registry
        // This ensures a completely fresh state
        const turtleBlockTypes = [
            'turtle_setup', 'turtle_done', 'turtle_shape', 'turtle_forward',
            'turtle_backward', 'turtle_right', 'turtle_left', 'turtle_goto',
            'turtle_penup', 'turtle_pendown', 'turtle_pencolor', 'turtle_pensize',
            'turtle_circle', 'turtle_speed', 'turtle_reset', 'turtle_clear',
            'turtle_stamp', 'turtle_bgcolor'
        ];

        turtleBlockTypes.forEach(function(type) {
            if (Blockly.Blocks[type]) {
                delete Blockly.Blocks[type];
            }
            // Also clear Python generators
            if (Blockly.Python && Blockly.Python.forBlock && Blockly.Python.forBlock[type]) {
                delete Blockly.Python.forBlock[type];
            }
            if (Blockly.Python && Blockly.Python[type]) {
                delete Blockly.Python[type];
            }
        });

        console.log('Cleared turtle block definitions from Blockly registry');
    }

    // CRITICAL: Reset singleton instances so they re-register blocks on next init
    if (typeof window.resetBlocklyEnvironment === 'function') {
        window.resetBlocklyEnvironment();
        console.log('BlocklyEnvironment singleton reset');
    }
    if (typeof window.resetTurtleBlocksRegistrar === 'function') {
        window.resetTurtleBlocksRegistrar();
        console.log('TurtleBlocksRegistrar singleton reset');
    }

    console.log('Blockly workspace state reset complete');
}

// ============================================================================
// UI SETUP FUNCTIONS
// ============================================================================

/**
 * Add refresh button for Blockly pages
 * @param {HTMLElement} blocklyDiv - Blockly container
 */
function addRefreshButton(blocklyDiv) {
    if (!blocklyDiv) return;
    if (document.getElementById('blocklyRefreshBtn')) return;

    const cfg = typeof CONFIG !== 'undefined' ? CONFIG : null;

    const refreshBtn = document.createElement('button');
    refreshBtn.id = 'blocklyRefreshBtn';
    refreshBtn.innerHTML = cfg?.STRINGS?.REFRESH_BUTTON || '🔄 블록이 안 보이면 클릭';
    refreshBtn.style.cssText = (cfg?.STYLES?.REFRESH_BUTTON ||
        'background-color: #ff9800; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-bottom: 10px; font-size: 14px;') + ' display: none;';
    refreshBtn.onclick = function() {
        window.location.reload();
    };

    // Insert button before .blockly-container to position it above the Blockly coding area
    // (not inside the flex container, which would place it next to the area)
    const container = blocklyDiv.closest('.blockly-container');
    if (container && container.parentElement) {
        container.parentElement.insertBefore(refreshBtn, container);
    }
}

/**
 * Setup turtle canvas and output layout
 * Creates a structured layout matching the Python editor style
 */
function setupTurtleOutputLayout() {
    const turtleContainer = document.getElementById('turtleCanvasContainer');
    const outputCanvas = document.getElementById('outputCanvas');
    const mycanvas = document.getElementById('mycanvas');

    if (!turtleContainer || !outputCanvas) return;

    // Check if already wrapped
    if (turtleContainer.parentElement &&
        turtleContainer.parentElement.classList.contains('output-section')) {
        return;
    }

    // Create the output section container
    const outputSection = document.createElement('div');
    outputSection.className = 'output-section';

    // Create canvas container with header
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'canvas-container';

    const canvasHeader = document.createElement('div');
    canvasHeader.className = 'section-header';
    canvasHeader.textContent = '거북이 캔버스';

    const canvasArea = document.createElement('div');
    canvasArea.className = 'canvas-area';

    // Move mycanvas into the new canvas area
    if (mycanvas) {
        canvasArea.appendChild(mycanvas);
        mycanvas.style.width = '300px';
        mycanvas.style.height = '300px';
    }

    canvasContainer.appendChild(canvasHeader);
    canvasContainer.appendChild(canvasArea);

    // Create console container with header
    const consoleContainer = document.createElement('div');
    consoleContainer.className = 'console-container';

    const consoleHeader = document.createElement('div');
    consoleHeader.className = 'section-header';
    consoleHeader.textContent = '출력';

    // Update outputCanvas classes
    outputCanvas.className = 'console-area';
    outputCanvas.removeAttribute('style');

    consoleContainer.appendChild(consoleHeader);
    consoleContainer.appendChild(outputCanvas);

    // Insert the output section
    turtleContainer.parentElement.insertBefore(outputSection, turtleContainer);

    outputSection.appendChild(canvasContainer);
    outputSection.appendChild(consoleContainer);

    // Remove original turtleContainer (we moved mycanvas out of it)
    turtleContainer.remove();
}

/**
 * Initialize tab switching functionality
 * @param {string} tabSelector - Selector for tab buttons
 * @param {string} panelSelector - Selector for tab panels
 * @param {Function} onTabChange - Callback when tab changes
 */
function initTabs(tabSelector, panelSelector, onTabChange) {
    const tabs = document.querySelectorAll(tabSelector || '.preview-tab');
    const panels = document.querySelectorAll(panelSelector || '.tab-panel');

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

            // Callback
            if (onTabChange) {
                onTabChange(targetTab);
            }
        });
    });
}

// ============================================================================
// SCROLLBAR POSITIONING FIX
// ============================================================================

/**
 * Fix scrollbar positioning - ensure they appear inside workspace, not outside
 * Note: Scrollbars are SVG elements positioned via transform attribute, NOT CSS position
 * @param {Object} workspace - Blockly workspace instance
 * @param {Element} blocklyDiv - Container div element
 */
function fixScrollbarPosition(workspace, blocklyDiv) {
    if (!workspace || !blocklyDiv) return;

    // Force workspace metrics recalculation
    try {
        Blockly.svgResize(workspace);
    } catch (e) {
        console.log('Blockly.svgResize failed:', e.message);
    }

    // Get the blocklySvg which is the parent of scrollbars
    const blocklySvg = blocklyDiv.querySelector('.blocklySvg');
    if (!blocklySvg) return;

    const svgRect = blocklySvg.getBoundingClientRect();
    const verticalScrollbar = blocklyDiv.querySelector('svg.blocklyScrollbarVertical.blocklyMainWorkspaceScrollbar');
    const horizontalScrollbar = blocklyDiv.querySelector('svg.blocklyScrollbarHorizontal.blocklyMainWorkspaceScrollbar');

    // Get toolbox width to calculate workspace area
    const toolbox = blocklyDiv.querySelector('.blocklyToolboxDiv');
    const toolboxWidth = toolbox ? toolbox.offsetWidth : 0;

    // Calculate the actual workspace area (excluding toolbox)
    const workspaceWidth = svgRect.width - toolboxWidth;
    const workspaceHeight = svgRect.height;

    if (verticalScrollbar) {
        const scrollbarWidth = parseFloat(verticalScrollbar.getAttribute('width')) || 15;
        const scrollbarRect = verticalScrollbar.getBoundingClientRect();

        // Check if scrollbar is visually outside the blocklySvg bounds
        const isOutside = scrollbarRect.left >= svgRect.right ||
                          scrollbarRect.right <= svgRect.left ||
                          scrollbarRect.top >= svgRect.bottom ||
                          scrollbarRect.bottom <= svgRect.top;

        // Correct position: at right edge of workspace, starting from top
        // x = toolboxWidth + workspaceWidth - scrollbarWidth = svgRect.width - scrollbarWidth
        const correctX = svgRect.width - scrollbarWidth;
        const correctY = 0;

        console.log('Vertical scrollbar check:', {
            isOutside,
            scrollbarRect: { left: scrollbarRect.left, right: scrollbarRect.right, top: scrollbarRect.top, bottom: scrollbarRect.bottom },
            svgRect: { left: svgRect.left, right: svgRect.right, top: svgRect.top, bottom: svgRect.bottom, width: svgRect.width, height: svgRect.height },
            correctPosition: { x: correctX, y: correctY },
            currentTransform: verticalScrollbar.style.transform
        });

        if (isOutside) {
            verticalScrollbar.style.transform = `translate(${correctX}px, ${correctY}px)`;
            console.log('Fixed vertical scrollbar to:', { x: correctX, y: correctY });
        }
    }

    if (horizontalScrollbar) {
        const scrollbarHeight = parseFloat(horizontalScrollbar.getAttribute('height')) || 15;
        const scrollbarRect = horizontalScrollbar.getBoundingClientRect();

        // Check if scrollbar is visually outside the blocklySvg bounds
        const isOutside = scrollbarRect.left >= svgRect.right ||
                          scrollbarRect.right <= svgRect.left ||
                          scrollbarRect.top >= svgRect.bottom ||
                          scrollbarRect.bottom <= svgRect.top;

        // Correct position: at bottom edge of workspace, starting after toolbox
        const correctX = toolboxWidth;
        const correctY = svgRect.height - scrollbarHeight;

        console.log('Horizontal scrollbar check:', {
            isOutside,
            scrollbarRect: { left: scrollbarRect.left, right: scrollbarRect.right, top: scrollbarRect.top, bottom: scrollbarRect.bottom },
            svgRect: { left: svgRect.left, right: svgRect.right, top: svgRect.top, bottom: svgRect.bottom, width: svgRect.width, height: svgRect.height },
            correctPosition: { x: correctX, y: correctY },
            currentTransform: horizontalScrollbar.style.transform
        });

        if (isOutside) {
            horizontalScrollbar.style.transform = `translate(${correctX}px, ${correctY}px)`;
            console.log('Fixed horizontal scrollbar to:', { x: correctX, y: correctY });
        }
    }
}

// ============================================================================
// MAIN INITIALIZATION FUNCTION
// ============================================================================

/**
 * Initialize Blockly workspace with all features
 * @param {Object} options - Initialization options
 * @returns {Object|null} - Workspace or null on failure
 */
function initBlocklyWorkspace(options = {}) {
    const {
        divId = 'blocklyDiv',
        toolboxId = 'toolbox',
        codeDisplayId = 'pythonCodeDisplay',
        onFlowchartUpdate = null,
        onTabChange = null
    } = options;

    const cfg = typeof CONFIG !== 'undefined' ? CONFIG : null;
    const initDelay = cfg?.TIMING?.LAYOUT_CHECK_DELAY || 50;
    const resizeDelay = cfg?.TIMING?.RESIZE_DELAY || 100;

    // Validate blockly div
    const blocklyDiv = validateBlocklyDiv(divId);
    if (!blocklyDiv) {
        return null;
    }

    // Wait for layout if not ready
    if (!isLayoutReady(blocklyDiv)) {
        console.log('Blockly: Parent container not ready, waiting for layout...');
        setTimeout(() => initBlocklyWorkspace(options), initDelay);
        return null;
    }

    // Add UI elements
    addRefreshButton(blocklyDiv);
    setupTurtleOutputLayout();

    // If already initialized, just resize
    if (isWorkspaceInitialized(blocklyDiv)) {
        Blockly.svgResize(_blocklyWorkspace);
        console.log('Blockly workspace already initialized');
        return _blocklyWorkspace;
    }

    // Dispose existing workspace
    disposeWorkspace(_blocklyWorkspace);
    _blocklyWorkspace = null;

    // Clear the div
    blocklyDiv.innerHTML = '';

    // Get toolbox
    const toolboxElement = document.getElementById(toolboxId);
    console.log('initBlocklyWorkspace: Getting toolbox', {
        toolboxId: toolboxId,
        toolboxFound: !!toolboxElement,
        toolboxHTML: toolboxElement ? toolboxElement.outerHTML.substring(0, 200) + '...' : null
    });

    if (!toolboxElement) {
        console.warn('Blockly toolbox not found:', toolboxId);
    }

    try {
        // Validate Blockly is loaded
        if (!isBlocklyLoaded()) {
            throw new Error('Blockly library is not loaded');
        }

        // Register blocks BEFORE creating workspace
        console.log('initBlocklyWorkspace: Registering turtle blocks...');
        ensureTurtleBlocksRegistered();

        // Verify blocks are in registry
        const blockTypesInToolbox = [];
        if (toolboxElement) {
            const blocks = toolboxElement.querySelectorAll('block[type]');
            blocks.forEach(b => blockTypesInToolbox.push(b.getAttribute('type')));
        }
        const missingBlocks = blockTypesInToolbox.filter(type => !Blockly.Blocks[type]);
        console.log('initBlocklyWorkspace: Block verification', {
            blocksInToolbox: blockTypesInToolbox,
            missingBlocks: missingBlocks,
            allBlocksRegistered: missingBlocks.length === 0
        });

        if (missingBlocks.length > 0) {
            console.error('Missing block definitions:', missingBlocks);
        }

        // Initialize tabs
        initTabs('.preview-tab', '.tab-panel', function(targetTab) {
            if (targetTab === 'flowchart' && onFlowchartUpdate) {
                onFlowchartUpdate();
            }
            if (onTabChange) {
                onTabChange(targetTab);
            }
        });

        // Clone toolbox and remove ID to avoid duplicates
        let toolbox = null;
        if (toolboxElement) {
            toolbox = toolboxElement.cloneNode(true);
            toolbox.removeAttribute('id');
            console.log('initBlocklyWorkspace: Toolbox cloned for workspace');
        }

        // Create workspace with toolbox
        console.log('initBlocklyWorkspace: Creating workspace...');
        _blocklyWorkspace = createWorkspace(divId, toolbox);
        console.log('initBlocklyWorkspace: Workspace created', {
            workspaceId: _blocklyWorkspace ? _blocklyWorkspace.id : null
        });

        // Add default turtle blocks if workspace is empty and has turtle blocks
        if (_blocklyWorkspace && toolboxElement) {
            setTimeout(() => {
                addDefaultTurtleBlocks(_blocklyWorkspace, toolboxElement);
            }, 100);
        }

        // Setup change listener
        setupCodeChangeListener(_blocklyWorkspace, codeDisplayId, onFlowchartUpdate);

        // Initial resize
        Blockly.svgResize(_blocklyWorkspace);

        // Note: Don't call updateToolbox() here - toolbox was already passed during inject()
        // Calling updateToolbox() after inject can cause flyout rendering issues

        // Setup flyout position fixes
        if (typeof createFlyoutObserver === 'function') {
            createFlyoutObserver(blocklyDiv);
        }
        if (typeof setupFlyoutClickFix === 'function') {
            setupFlyoutClickFix(blocklyDiv);
        }


        // Fix scrollbar positioning - ensure they appear inside workspace, not outside
        // Use shared fixScrollbarPosition function
        function fixScrollbarPositionLocal() {
            fixScrollbarPosition(_blocklyWorkspace, blocklyDiv);
        }

        // Fix scrollbars after workspace is created and scrollbars are rendered
        setTimeout(fixScrollbarPositionLocal, 300);
        setTimeout(fixScrollbarPositionLocal, 600);
        setTimeout(fixScrollbarPositionLocal, 1000);

        // Use ResizeObserver to detect container size changes and fix scrollbars
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(function(entries) {
                // Debounce resize handling
                clearTimeout(blocklyDiv._scrollbarResizeTimeout);
                blocklyDiv._scrollbarResizeTimeout = setTimeout(function() {
                    if (_blocklyWorkspace) {
                        Blockly.svgResize(_blocklyWorkspace);
                        fixScrollbarPositionLocal();
                    }
                }, 100);
            });
            resizeObserver.observe(blocklyDiv);
        }

        // Delayed resize and toolbox refresh
        setTimeout(function() {
            if (_blocklyWorkspace) {
                Blockly.svgResize(_blocklyWorkspace);

                // Force toolbox refresh - helps after navigation
                const toolboxObj = _blocklyWorkspace.getToolbox();
                if (toolboxObj && typeof toolboxObj.refreshSelection === 'function') {
                    try {
                        toolboxObj.refreshSelection();
                        console.log('Toolbox selection refreshed');
                    } catch (e) {
                        console.log('Toolbox refresh skipped:', e.message);
                    }
                }
            }
        }, resizeDelay);

        // Additional delayed check for flyout issues
        setTimeout(function() {
            if (_blocklyWorkspace) {
                const toolboxObj = _blocklyWorkspace.getToolbox();
                if (toolboxObj) {
                    console.log('Toolbox state check:', {
                        hasToolbox: true,
                        selectedItem: toolboxObj.getSelectedItem ?
                            toolboxObj.getSelectedItem()?.getName?.() : 'unknown'
                    });
                }
            }
        }, resizeDelay + 200);

        console.log('Blockly workspace initialized successfully');
        return _blocklyWorkspace;

    } catch (error) {
        console.error('Error initializing Blockly workspace:', error);
        return null;
    }
}

// ============================================================================
// NAVIGATION SUPPORT
// ============================================================================

/**
 * Setup MkDocs Material instant loading support
 * @param {Function} initFn - Initialization function to call
 */
function setupMkDocsSupport(initFn) {
    // Method 1: Using document$ observable
    if (typeof document$ !== 'undefined') {
        document$.subscribe(function() {
            initFn();
        });
    }

    // Method 2: Listen for location changes
    let lastUrl = location.href;
    new MutationObserver(function() {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(initFn, 100);
        }
    }).observe(document, { subtree: true, childList: true });

    // Method 3: Navigation link clicks
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link && link.href && link.href.includes(window.location.origin)) {
            setTimeout(initFn, 200);
            setTimeout(initFn, 500);
        }
    });
}

/**
 * Setup window resize handler
 */
function setupResizeHandler() {
    window.addEventListener('resize', function() {
        if (_blocklyWorkspace) {
            Blockly.svgResize(_blocklyWorkspace);
        }
    });

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && _blocklyWorkspace) {
            setTimeout(function() {
                Blockly.svgResize(_blocklyWorkspace);
            }, 100);
        }
    });
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof window !== 'undefined') {
    // State
    window.getWorkspace = getWorkspace;
    window.setWorkspace = setWorkspace;

    // Validation
    window.isBlocklyLoaded = isBlocklyLoaded;
    window.validateBlocklyDiv = validateBlocklyDiv;
    window.isLayoutReady = isLayoutReady;
    window.isWorkspaceInitialized = isWorkspaceInitialized;

    // Initialization
    window.ensureTurtleBlocksRegistered = ensureTurtleBlocksRegistered;
    window.getWorkspaceConfig = getWorkspaceConfig;
    window.createWorkspace = createWorkspace;
    window.setupCodeChangeListener = setupCodeChangeListener;
    window.disposeWorkspace = disposeWorkspace;
    window.resetWorkspaceState = resetWorkspaceState;
    window.isTurtleWorkspace = isTurtleWorkspace;
    window.addDefaultTurtleBlocks = addDefaultTurtleBlocks;

    // UI Setup
    window.addRefreshButton = addRefreshButton;
    window.setupTurtleOutputLayout = setupTurtleOutputLayout;
    
    // Scrollbar fixing
    window.fixScrollbarPosition = fixScrollbarPosition;
    window.initTabs = initTabs;

    // Main init
    window.initBlocklyWorkspaceModular = initBlocklyWorkspace;

    // Navigation support
    window.setupMkDocsSupport = setupMkDocsSupport;
    window.setupResizeHandler = setupResizeHandler;

    // Backwards compatibility - expose workspace variable
    Object.defineProperty(window, 'blocklyWorkspace', {
        get: function() { return _blocklyWorkspace; },
        set: function(val) { _blocklyWorkspace = val; }
    });
}
