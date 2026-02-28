/**
 * Map Exercise Integration
 *
 * Handles initialization and execution of Leaflet.js map exercises
 * within the course markdown pages.
 *
 * Supports both JavaScript and Python (via Pyodide) map exercises.
 */

(function() {
    'use strict';

    // ========================================================================
    // STATE
    // ========================================================================

    let _leafletLoaded = false;
    let _leafletLoading = false;
    let _pyodideReady = false;
    let _pythonModuleLoaded = false;
    let _mapInstances = {};
    let _codeEditors = {};
    let _pendingInit = [];

    // Python wrapper module URL (relative to docs root)
    const PYTHON_MODULE_PATH = 'js/map_grader/leaflet_python.py';

    // ========================================================================
    // LEAFLET LOADER
    // ========================================================================

    /**
     * Load Leaflet CSS and JS dynamically
     */
    function loadLeaflet(callback) {
        // Already loaded
        if (typeof L !== 'undefined') {
            _leafletLoaded = true;
            callback();
            return;
        }

        // Currently loading - queue callback
        if (_leafletLoading) {
            _pendingInit.push(callback);
            return;
        }

        _leafletLoading = true;
        _pendingInit.push(callback);

        // Load CSS first
        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);

        // Load JS
        var script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

        script.onload = function() {
            console.log('[MapIntegration] Leaflet loaded');
            _leafletLoaded = true;
            _leafletLoading = false;

            // Run all pending callbacks
            _pendingInit.forEach(function(cb) {
                try { cb(); } catch(e) { console.error(e); }
            });
            _pendingInit = [];
        };

        script.onerror = function() {
            console.error('[MapIntegration] Failed to load Leaflet');
            _leafletLoading = false;
        };

        document.head.appendChild(script);
    }

    // ========================================================================
    // PYTHON/PYODIDE SUPPORT
    // ========================================================================

    /**
     * Check if Pyodide is available
     * Site uses pyodideInstance from pyodide_editor.js
     */
    function isPyodideReady() {
        // Check for pyodideInstance (from pyodide_editor.js)
        if (typeof pyodideInstance !== 'undefined' && pyodideInstance && pyodideInstance.runPythonAsync) {
            return true;
        }
        // Also check for pyodide global (direct Pyodide usage)
        if (typeof pyodide !== 'undefined' && pyodide && pyodide.runPythonAsync) {
            return true;
        }
        return false;
    }

    /**
     * Get the Pyodide instance
     */
    function getPyodide() {
        if (typeof pyodideInstance !== 'undefined' && pyodideInstance) {
            return pyodideInstance;
        }
        if (typeof pyodide !== 'undefined' && pyodide) {
            return pyodide;
        }
        return null;
    }

    /**
     * Trigger Pyodide loading if not already started
     */
    function triggerPyodideLoad() {
        // Use the site's loadPyodideAndPackages if available
        if (typeof loadPyodideAndPackages === 'function') {
            console.log('[MapIntegration] Triggering Pyodide load via loadPyodideAndPackages()');
            loadPyodideAndPackages().catch(function(e) {
                console.error('[MapIntegration] Error loading Pyodide:', e);
            });
            return true;
        }

        // Fallback: load Pyodide directly
        if (typeof loadPyodide === 'undefined') {
            // Need to load the Pyodide script first
            console.log('[MapIntegration] Loading Pyodide script...');
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
            script.onload = function() {
                console.log('[MapIntegration] Pyodide script loaded, initializing...');
                loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
                }).then(function(py) {
                    window.pyodide = py;
                    console.log('[MapIntegration] Pyodide initialized');
                });
            };
            document.head.appendChild(script);
            return true;
        }

        return false;
    }

    /**
     * Wait for Pyodide to be ready (with timeout)
     */
    function waitForPyodide(maxWaitMs) {
        maxWaitMs = maxWaitMs || 30000;  // 30 seconds default

        // Trigger Pyodide load if needed
        if (!isPyodideReady()) {
            triggerPyodideLoad();
        }

        return new Promise(function(resolve, reject) {
            var startTime = Date.now();

            function check() {
                if (isPyodideReady()) {
                    console.log('[MapIntegration] Pyodide is ready!');
                    _pyodideReady = true;
                    resolve(true);
                } else if (Date.now() - startTime > maxWaitMs) {
                    reject(new Error('Pyodide 로딩 시간 초과'));
                } else {
                    // Check again after 500ms
                    setTimeout(check, 500);
                }
            }

            check();
        });
    }

    /**
     * Load the Python leaflet wrapper module
     */
    async function loadPythonModule() {
        var py = getPyodide();
        if (!py) {
            console.log('[MapIntegration] Pyodide not ready, will retry...');
            return false;
        }

        try {
            // Fetch the Python module - try multiple paths
            // Always fetch to get latest version (bypasses cache issues)
            var moduleCode = null;
            var baseUrl = document.querySelector('base')?.href || window.location.origin + '/';
            var paths = [
                baseUrl + PYTHON_MODULE_PATH,
                '/' + PYTHON_MODULE_PATH,
                PYTHON_MODULE_PATH,
                '../' + PYTHON_MODULE_PATH,
                '../../' + PYTHON_MODULE_PATH,
                '../../../' + PYTHON_MODULE_PATH,
                '../../../../' + PYTHON_MODULE_PATH
            ];

            console.log('[MapIntegration] Trying to load module from paths:', paths);

            for (var i = 0; i < paths.length; i++) {
                try {
                    // Add cache-busting query parameter
                    var url = paths[i] + '?t=' + Date.now();
                    var response = await fetch(url);
                    if (response.ok) {
                        moduleCode = await response.text();
                        console.log('[MapIntegration] Loaded module from:', paths[i]);
                        break;
                    }
                } catch (e) {
                    // Continue to next path
                }
            }

            if (!moduleCode) {
                console.error('[MapIntegration] Failed to load Python module from any path');
                return false;
            }

            // Write to Pyodide's virtual filesystem so it can be imported
            py.FS.writeFile('/leaflet_python.py', moduleCode);
            console.log('[MapIntegration] Wrote leaflet_python.py to Pyodide FS');

            // Clear any cached import to ensure fresh module
            await py.runPythonAsync(`
import sys
if '/' not in sys.path:
    sys.path.insert(0, '/')

# Remove cached module to ensure fresh import
if 'leaflet_python' in sys.modules:
    del sys.modules['leaflet_python']
`);

            _pythonModuleLoaded = true;
            console.log('[MapIntegration] Python leaflet module ready for import');
            return true;
        } catch (error) {
            console.error('[MapIntegration] Error loading Python module:', error);
            return false;
        }
    }

    /**
     * Run Python map code
     */
    async function runPythonMapCode(exerciseId, code, containerId) {
        var py = getPyodide();
        if (!py) {
            console.error('[MapIntegration] Pyodide not available');
            return false;
        }

        // Ensure module is loaded to filesystem
        var moduleLoaded = await loadPythonModule();
        if (!moduleLoaded) {
            throw new Error('Failed to load leaflet_python module');
        }

        // Set the current container ID for Python to use
        window._currentMapContainer = containerId;

        try {
            // Set up the container ID before running user code
            await py.runPythonAsync(`
# Set container for this exercise
import sys
if '/' not in sys.path:
    sys.path.insert(0, '/')

# Pre-configure Map class with container ID
try:
    from leaflet_python import Map
    Map._container_id = '${containerId}'
except ImportError as e:
    print(f"Import error: {e}")
    print(f"sys.path: {sys.path}")
    raise

from js import window
window._currentMapContainer = '${containerId}'
`);

            // Now run the user's code
            await py.runPythonAsync(code);
            return true;
        } catch (error) {
            console.error('[MapIntegration] Python error:', error);
            throw error;
        }
    }

    // ========================================================================
    // EXERCISE INITIALIZATION
    // ========================================================================

    /**
     * Initialize all map exercises on the page
     */
    function initializeExercises() {
        var exercises = document.querySelectorAll('.map-exercise');

        if (exercises.length === 0) {
            return;
        }

        console.log('[MapIntegration] Found', exercises.length, 'map exercises');

        loadLeaflet(function() {
            exercises.forEach(function(exercise) {
                initializeExercise(exercise);
            });
        });
    }

    /**
     * Initialize a single map exercise
     */
    function initializeExercise(exerciseEl) {
        var exerciseId = exerciseEl.getAttribute('data-exercise-id');
        if (!exerciseId) {
            exerciseId = 'map-' + Math.random().toString(36).substr(2, 9);
            exerciseEl.setAttribute('data-exercise-id', exerciseId);
        }

        // Skip if already initialized
        if (exerciseEl.getAttribute('data-initialized') === 'true') {
            return;
        }

        // Find map container
        var mapContainer = exerciseEl.querySelector('.map-container');
        if (!mapContainer) {
            console.warn('[MapIntegration] No map container for', exerciseId);
            return;
        }

        // Ensure container has ID
        if (!mapContainer.id) {
            mapContainer.id = 'map-' + exerciseId;
        }

        // Find code editor section
        var codeEditorSection = exerciseEl.querySelector('.map-code-editor');

        if (codeEditorSection) {
            setupCodeEditor(exerciseEl, exerciseId, codeEditorSection, mapContainer);
        } else {
            // No code editor - create a simple default map
            createDefaultMap(mapContainer.id);
        }

        exerciseEl.setAttribute('data-initialized', 'true');
    }

    /**
     * Setup interactive code editor
     */
    function setupCodeEditor(exerciseEl, exerciseId, editorSection, mapContainer) {
        // Find the code block - could be pre>code or just code
        var codeBlock = editorSection.querySelector('pre code');
        if (!codeBlock) {
            codeBlock = editorSection.querySelector('code');
        }

        var initialCode = '';
        if (codeBlock) {
            // Get the text content (the actual code)
            initialCode = codeBlock.textContent || codeBlock.innerText || '';
        }

        // Detect if this is Python code
        var isPython = false;

        // Check data-language attribute on exercise or editor
        if (exerciseEl.getAttribute('data-language') === 'python' ||
            editorSection.getAttribute('data-language') === 'python') {
            isPython = true;
        }

        // Check code block class for language hint
        if (!isPython && codeBlock) {
            var classes = codeBlock.className || '';
            isPython = classes.includes('python') || classes.includes('py');
        }

        // Also detect by code content
        if (!isPython && initialCode) {
            isPython = initialCode.includes('from leaflet_python') ||
                       initialCode.includes('import leaflet_python') ||
                       (initialCode.includes('Map(') && initialCode.includes('.show()'));
        }

        // Get height setting
        var height = editorSection.getAttribute('data-height') || '200px';

        // Clear the editor section and build new UI
        editorSection.innerHTML = '';

        // Create toolbar with language indicator
        var toolbar = document.createElement('div');
        toolbar.className = 'map-editor-toolbar';
        var langLabel = isPython ? '<span class="lang-label lang-python">🐍 Python</span>' :
                                   '<span class="lang-label lang-js">JS</span>';
        toolbar.innerHTML = langLabel +
                           '<button class="map-run-btn">▶ 실행</button>' +
                           '<button class="map-reset-btn">↺ 초기화</button>';

        // Create textarea
        var textarea = document.createElement('textarea');
        textarea.className = 'map-code-textarea';
        textarea.spellcheck = false;
        textarea.value = initialCode.trim();
        textarea.style.height = height;

        // Add to DOM
        editorSection.appendChild(toolbar);
        editorSection.appendChild(textarea);

        // Store reference (including language type)
        _codeEditors[exerciseId] = {
            textarea: textarea,
            initialCode: initialCode.trim(),
            containerId: mapContainer.id,
            isPython: isPython
        };

        // Event handlers
        toolbar.querySelector('.map-run-btn').addEventListener('click', function() {
            runMapCode(exerciseId);
        });

        toolbar.querySelector('.map-reset-btn').addEventListener('click', function() {
            textarea.value = initialCode.trim();
            runMapCode(exerciseId);
        });

        // Run initial code after short delay
        setTimeout(function() {
            runMapCode(exerciseId);
        }, 200);
    }

    // ========================================================================
    // CODE EXECUTION
    // ========================================================================

    /**
     * Clean up and reset a map container
     */
    function cleanupMapContainer(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;

        // Destroy existing map - check both local and window._mapInstances
        var existingMap = _mapInstances[containerId] ||
                          (window._mapInstances && window._mapInstances[containerId]);

        if (existingMap) {
            try {
                existingMap.remove();
                console.log('[MapIntegration] Removed existing map from', containerId);
            } catch(e) {
                console.log('[MapIntegration] Error removing map:', e);
            }
            delete _mapInstances[containerId];
            if (window._mapInstances) {
                delete window._mapInstances[containerId];
            }
        }

        // Clear container completely
        container.innerHTML = '';
        container.style.background = '#e8e8e8';

        // CRITICAL: Remove Leaflet's internal tracking
        // Leaflet uses _leaflet_id to track initialized containers
        try {
            delete container._leaflet_id;
        } catch(e) {}

        // Also try to remove via DOM property access (for some browsers)
        try {
            container._leaflet_id = undefined;
            container.removeAttribute('data-leaflet-id');
        } catch(e) {}

        // Remove ALL Leaflet-related classes
        var leafletClasses = [
            'leaflet-container', 'leaflet-touch', 'leaflet-fade-anim',
            'leaflet-grab', 'leaflet-touch-drag', 'leaflet-touch-zoom',
            'leaflet-retina', 'leaflet-safari'
        ];
        leafletClasses.forEach(function(cls) {
            container.classList.remove(cls);
        });

        // Reset any inline styles Leaflet may have added
        container.style.position = '';
        container.style.overflow = '';
    }

    /**
     * Run map code for an exercise (handles both Python and JavaScript)
     */
    function runMapCode(exerciseId) {
        var editor = _codeEditors[exerciseId];
        if (!editor) {
            console.error('[MapIntegration] No editor for', exerciseId);
            return;
        }

        var code = editor.textarea.value;
        var containerId = editor.containerId;
        var container = document.getElementById(containerId);

        if (!container) {
            console.error('[MapIntegration] No container:', containerId);
            return;
        }

        // Clean up the container
        cleanupMapContainer(containerId);

        // Branch based on language
        if (editor.isPython) {
            runMapCodePython(exerciseId, code, containerId, container);
        } else {
            runMapCodeJavaScript(exerciseId, code, containerId, container);
        }
    }

    /**
     * Run JavaScript map code
     */
    function runMapCodeJavaScript(exerciseId, code, containerId, container) {
        // Transform code to use correct container ID
        var transformedCode = code.replace(
            /L\.map\s*\(\s*['"]map['"]\s*\)/g,
            "L.map('" + containerId + "')"
        );

        // Also handle cases where user types L.map('map-something')
        transformedCode = transformedCode.replace(
            /L\.map\s*\(\s*['"][^'"]+['"]\s*\)/g,
            "L.map('" + containerId + "')"
        );

        // Store map instance globally for cleanup
        // Handle var, let, const declarations
        transformedCode = 'window._mapInstances = window._mapInstances || {};\n' +
                         transformedCode
                             .replace(
                                 /var\s+map\s*=/g,
                                 "var map = window._mapInstances['" + containerId + "'] ="
                             )
                             .replace(
                                 /let\s+map\s*=/g,
                                 "let map = window._mapInstances['" + containerId + "'] ="
                             )
                             .replace(
                                 /const\s+map\s*=/g,
                                 "const map = window._mapInstances['" + containerId + "'] ="
                             );

        try {
            // Execute the code
            var execFunc = new Function('L', transformedCode);
            execFunc(L);

            console.log('[MapIntegration] Executed JS code for', exerciseId);

            // Store reference
            if (window._mapInstances && window._mapInstances[containerId]) {
                _mapInstances[containerId] = window._mapInstances[containerId];
            }

        } catch (error) {
            console.error('[MapIntegration] JS Error:', error);
            showError(container, error.message);
        }
    }

    /**
     * Run Python map code (async)
     */
    async function runMapCodePython(exerciseId, code, containerId, container) {
        // Show loading indicator while waiting for Pyodide
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;">' +
            '<div><div class="pyodide-spinner" style="width:40px;height:40px;border:4px solid #e0e0e0;border-top:4px solid #3498db;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>' +
            '🐍 Pyodide 로딩 중...</div></div>';

        // Add spinner CSS if not exists
        if (!document.getElementById('pyodide-spinner-style')) {
            var style = document.createElement('style');
            style.id = 'pyodide-spinner-style';
            style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }

        // Wait for Pyodide if not ready
        if (!isPyodideReady()) {
            try {
                await waitForPyodide(30000);  // Wait up to 30 seconds
            } catch (error) {
                showError(container, 'Pyodide 로딩에 실패했습니다. 페이지를 새로고침 해주세요.');
                return;
            }
        }

        try {
            // Update loading message
            container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;">' +
                '<div>🐍 Python 코드 실행 중...</div></div>';

            await runPythonMapCode(exerciseId, code, containerId);

            console.log('[MapIntegration] Executed Python code for', exerciseId);

            // Store reference if map was created
            if (window._mapInstances && window._mapInstances[containerId]) {
                _mapInstances[containerId] = window._mapInstances[containerId];
            }

        } catch (error) {
            console.error('[MapIntegration] Python Error:', error);
            showError(container, error.message || String(error));
        }
    }

    /**
     * Create a default map
     */
    function createDefaultMap(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;

        // Clean up existing map if any
        if (_mapInstances[containerId]) {
            try { _mapInstances[containerId].remove(); } catch(e) {}
            delete _mapInstances[containerId];
        }
        if (window._mapInstances && window._mapInstances[containerId]) {
            try { window._mapInstances[containerId].remove(); } catch(e) {}
            delete window._mapInstances[containerId];
        }

        container.innerHTML = '';

        // Remove Leaflet's internal tracking
        if (container._leaflet_id) {
            delete container._leaflet_id;
        }
        container.classList.remove('leaflet-container', 'leaflet-touch',
            'leaflet-fade-anim', 'leaflet-grab', 'leaflet-touch-drag',
            'leaflet-touch-zoom');

        try {
            var map = L.map(containerId).setView([36.5, 127.5], 7);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);

            _mapInstances[containerId] = map;
            window._mapInstances = window._mapInstances || {};
            window._mapInstances[containerId] = map;

        } catch(e) {
            console.error('[MapIntegration] Error creating default map:', e);
            showError(container, e.message);
        }
    }

    /**
     * Show error in container
     */
    function showError(container, message) {
        container.innerHTML =
            '<div style="display:flex;align-items:center;justify-content:center;height:100%;' +
            'background:#fff5f5;color:#c53030;padding:20px;text-align:center;font-family:monospace;">' +
            '<div><div style="font-size:24px;margin-bottom:10px;">⚠️</div>' +
            '<div style="font-weight:bold;margin-bottom:5px;">코드 실행 오류</div>' +
            '<div style="font-size:12px;">' + escapeHtml(message) + '</div></div></div>';
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================================================
    // CITY BUTTONS & SLIDERS
    // ========================================================================

    function setupCityButtons() {
        document.querySelectorAll('.city-btn').forEach(function(btn) {
            // Skip if already has listener
            if (btn.getAttribute('data-listener') === 'true') return;
            btn.setAttribute('data-listener', 'true');

            btn.addEventListener('click', function() {
                var lat = parseFloat(btn.getAttribute('data-lat'));
                var lng = parseFloat(btn.getAttribute('data-lng'));
                var zoom = parseInt(btn.getAttribute('data-zoom')) || 13;

                var exercise = btn.closest('.map-exercise');
                if (!exercise) return;

                var container = exercise.querySelector('.map-container');
                if (!container || !container.id) return;

                var map = _mapInstances[container.id] ||
                         (window._mapInstances && window._mapInstances[container.id]);

                if (map && map.flyTo) {
                    map.flyTo([lat, lng], zoom);

                    var coordDisplay = exercise.querySelector('#current-coords');
                    var zoomDisplay = exercise.querySelector('#current-zoom');
                    if (coordDisplay) coordDisplay.textContent = lat + ', ' + lng;
                    if (zoomDisplay) zoomDisplay.textContent = zoom;
                }
            });
        });
    }

    function setupZoomSliders() {
        document.querySelectorAll('#zoom-slider').forEach(function(slider) {
            if (slider.getAttribute('data-listener') === 'true') return;
            slider.setAttribute('data-listener', 'true');

            slider.addEventListener('input', function() {
                var value = parseInt(slider.value);
                var label = document.querySelector('#zoom-value');
                if (label) label.textContent = value;

                var exercise = slider.closest('.map-exercise');
                if (!exercise) return;

                var container = exercise.querySelector('.map-container');
                if (!container || !container.id) return;

                var map = _mapInstances[container.id] ||
                         (window._mapInstances && window._mapInstances[container.id]);

                if (map && map.setZoom) {
                    map.setZoom(value);
                }
            });
        });
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    function init() {
        // Run when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onReady);
        } else {
            onReady();
        }
    }

    function onReady() {
        initializeExercises();
        setupCityButtons();
        setupZoomSliders();

        // Handle MkDocs instant navigation
        if (typeof document$ !== 'undefined') {
            document$.subscribe(function() {
                // Small delay to let DOM update
                setTimeout(function() {
                    initializeExercises();
                    setupCityButtons();
                    setupZoomSliders();
                }, 100);
            });
        }

        // Also listen for custom navigation events
        document.addEventListener('DOMContentLoaded', function() {
            initializeExercises();
        });

        // Watch for new content
        var observer = new MutationObserver(function(mutations) {
            var hasNewExercises = mutations.some(function(m) {
                return m.addedNodes.length > 0;
            });
            if (hasNewExercises) {
                setTimeout(function() {
                    initializeExercises();
                    setupCityButtons();
                    setupZoomSliders();
                }, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    window.MapExerciseIntegration = {
        init: init,
        initializeExercises: initializeExercises,
        runMapCode: runMapCode,
        loadPythonModule: loadPythonModule,
        isPyodideReady: isPyodideReady,
        getMapInstance: function(id) {
            return _mapInstances[id] || (window._mapInstances && window._mapInstances[id]);
        }
    };

    // Auto-initialize
    init();

})();
