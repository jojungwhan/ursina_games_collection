/**
 * Pyodide Python Editor with Matplotlib Support
 * Provides browser-based Python execution with scientific libraries
 *
 * Features:
 * - Full Python via WebAssembly (Pyodide)
 * - Matplotlib chart rendering
 * - NumPy support
 */

let pyodideInstance = null;
let pyodideLoading = false;
let pyodideEditorInstances = {};
let pyodideEditorCounter = 0;

/**
 * Load Pyodide and required packages
 */
async function loadPyodideAndPackages() {
    if (pyodideInstance) return pyodideInstance;
    if (pyodideLoading) {
        // Wait for existing load to complete
        while (pyodideLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return pyodideInstance;
    }

    pyodideLoading = true;

    try {
        // Load Pyodide
        pyodideInstance = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
        });

        // Load matplotlib, numpy, and micropip (for installing additional packages)
        await pyodideInstance.loadPackage(['matplotlib', 'numpy', 'micropip']);

        // Configure matplotlib for non-interactive backend
        await pyodideInstance.runPythonAsync(`
import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt
import numpy as np
import io
import base64

def get_plot_as_base64():
    """Convert current plot to base64 image"""
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    plt.close()
    return img_base64
`);

        console.log('Pyodide loaded with matplotlib and numpy');
        pyodideLoading = false;
        return pyodideInstance;
    } catch (error) {
        console.error('Failed to load Pyodide:', error);
        pyodideLoading = false;
        throw error;
    }
}

/**
 * Create a Pyodide-based Python editor
 */
function createPyodideEditor(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return null;
    }

    const instanceId = 'pyodide-editor-' + (pyodideEditorCounter++);

    const defaultCode = options.code || '# Python code here\nimport matplotlib.pyplot as plt\nimport numpy as np\n';
    const height = options.height || '300px';
    const mission = options.mission || '';
    const hint = options.hint || '';

    // Create editor HTML
    container.innerHTML = `
        <div class="pyodide-editor-wrapper" id="${instanceId}-wrapper">
            ${mission ? `<div class="pyodide-editor-mission">
                <span class="mission-icon">🎯</span>
                <span class="mission-text">${mission}</span>
            </div>` : ''}

            <div class="pyodide-editor-toolbar">
                <span class="pyodide-status" id="${instanceId}-status">
                    <span class="status-dot loading"></span>
                    <span class="status-text">Pyodide 로딩 중...</span>
                </span>
                ${hint ? `<button class="pyodide-hint-btn" onclick="showPyodideHint('${instanceId}')" title="힌트">💡 힌트</button>` : ''}
            </div>

            <textarea id="${instanceId}-code" class="pyodide-code-input" style="height: ${height}">${defaultCode}</textarea>

            ${hint ? `<div id="${instanceId}-hint" class="pyodide-hint-box" style="display: none;">
                <strong>💡 힌트:</strong> ${hint}
            </div>` : ''}

            <button id="${instanceId}-run" class="pyodide-run-btn" onclick="runPyodideCode('${instanceId}')" disabled>
                ▶ 실행하기
            </button>

            <div id="${instanceId}-output" class="pyodide-output">
                <div class="pyodide-output-placeholder">실행 버튼을 눌러 결과를 확인하세요</div>
            </div>

            <div id="${instanceId}-plot" class="pyodide-plot-container"></div>
        </div>
    `;

    // Store instance
    pyodideEditorInstances[instanceId] = {
        containerId: containerId,
        code: defaultCode,
        hint: hint
    };

    // Initialize Pyodide
    initPyodideForEditor(instanceId);

    return instanceId;
}

/**
 * Initialize Pyodide for an editor instance
 */
async function initPyodideForEditor(instanceId) {
    const statusEl = document.getElementById(instanceId + '-status');
    const runBtn = document.getElementById(instanceId + '-run');

    try {
        await loadPyodideAndPackages();

        if (statusEl) {
            statusEl.innerHTML = '<span class="status-dot ready"></span><span class="status-text">준비 완료</span>';
        }
        if (runBtn) {
            runBtn.disabled = false;
        }
    } catch (error) {
        if (statusEl) {
            statusEl.innerHTML = '<span class="status-dot error"></span><span class="status-text">로딩 실패</span>';
        }
        console.error('Pyodide init error:', error);
    }
}

/**
 * Run Python code with Pyodide
 */
async function runPyodideCode(instanceId) {
    const codeEl = document.getElementById(instanceId + '-code');
    const outputEl = document.getElementById(instanceId + '-output');
    const plotEl = document.getElementById(instanceId + '-plot');
    const runBtn = document.getElementById(instanceId + '-run');

    if (!codeEl || !outputEl || !pyodideInstance) return;

    const code = codeEl.value;

    // Disable button during execution
    if (runBtn) {
        runBtn.disabled = true;
        runBtn.textContent = '⏳ 실행 중...';
    }

    // Clear previous output
    outputEl.innerHTML = '<div class="pyodide-running">실행 중...</div>';
    outputEl.className = 'pyodide-output';
    if (plotEl) plotEl.innerHTML = '';

    try {
        // Capture stdout
        let stdout = '';
        pyodideInstance.setStdout({
            batched: (text) => { stdout += text + '\n'; }
        });

        // Clear any existing plots
        await pyodideInstance.runPythonAsync('plt.close("all")');

        // Run user code
        await pyodideInstance.runPythonAsync(code);

        // Check if there's a plot to display
        const hasPlot = await pyodideInstance.runPythonAsync(`
len(plt.get_fignums()) > 0
`);

        if (hasPlot) {
            // Get plot as base64
            const imgBase64 = await pyodideInstance.runPythonAsync('get_plot_as_base64()');
            if (plotEl) {
                plotEl.innerHTML = `<img src="data:image/png;base64,${imgBase64}" alt="Matplotlib Plot" class="pyodide-plot-img">`;
            }
        }

        // Display stdout
        if (stdout.trim()) {
            outputEl.innerHTML = `<pre class="pyodide-stdout">${escapeHtml(stdout)}</pre>`;
            outputEl.className = 'pyodide-output success';
        } else if (hasPlot) {
            outputEl.innerHTML = '<div class="pyodide-success">✅ 그래프가 생성되었습니다!</div>';
            outputEl.className = 'pyodide-output success';
        } else {
            outputEl.innerHTML = '<div class="pyodide-success">✅ 실행 완료</div>';
            outputEl.className = 'pyodide-output success';
        }

    } catch (error) {
        outputEl.innerHTML = `<pre class="pyodide-error">오류: ${escapeHtml(error.message)}</pre>`;
        outputEl.className = 'pyodide-output error';
        console.error('Pyodide execution error:', error);
    }

    // Re-enable button
    if (runBtn) {
        runBtn.disabled = false;
        runBtn.textContent = '▶ 실행하기';
    }
}

/**
 * Show hint for editor
 */
function showPyodideHint(instanceId) {
    const hintEl = document.getElementById(instanceId + '-hint');
    if (hintEl) {
        hintEl.style.display = hintEl.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * Escape HTML entities
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize all Pyodide editors from placeholders
 */
function initAllPyodideEditors() {
    const placeholders = document.querySelectorAll('.pyodide-editor-placeholder');

    placeholders.forEach(function(placeholder) {
        const containerId = placeholder.id;
        if (!containerId) {
            console.warn('Pyodide editor placeholder missing id');
            return;
        }

        // Skip if already initialized (check for pyodide-editor-wrapper inside)
        if (placeholder.querySelector('.pyodide-editor-wrapper')) {
            console.log('Pyodide editor already initialized:', containerId);
            return;
        }

        const code = decodeURIComponent(placeholder.dataset.code || '');
        const height = placeholder.dataset.height || '300px';
        const mission = placeholder.dataset.mission || '';
        const hint = placeholder.dataset.hint || '';

        console.log('Initializing Pyodide editor:', containerId);
        createPyodideEditor(containerId, {
            code: code,
            height: height,
            mission: mission,
            hint: hint
        });
    });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllPyodideEditors);
} else {
    // Small delay to ensure other scripts are loaded
    setTimeout(initAllPyodideEditors, 100);
}

// Listen for MkDocs Material instant navigation (SPA-style page changes)
// This handles page navigation without full page reload
if (typeof document$ !== 'undefined') {
    // MkDocs Material's RxJS observable for page changes
    document$.subscribe(function() {
        setTimeout(initAllPyodideEditors, 100);
    });
} else {
    // Fallback: listen for location changes via popstate and click events
    let lastUrl = location.href;
    const observer = new MutationObserver(function() {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(initAllPyodideEditors, 200);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// Export functions
if (typeof window !== 'undefined') {
    window.createPyodideEditor = createPyodideEditor;
    window.runPyodideCode = runPyodideCode;
    window.showPyodideHint = showPyodideHint;
    window.loadPyodideAndPackages = loadPyodideAndPackages;
    window.initAllPyodideEditors = initAllPyodideEditors;
}
