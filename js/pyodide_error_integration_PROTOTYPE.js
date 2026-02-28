/**
 * Pyodide + Error Explainer Integration - PROTOTYPE
 *
 * Shows how to integrate PythonErrorExplainer with pyodide_editor.js
 * DO NOT USE YET - This is a prototype for review
 *
 * To integrate, replace the error handling in runPyodideCode():
 */

/**
 * EXAMPLE: Modified runPyodideCode function with error explanation
 * This shows the changes needed in pyodide_editor.js
 */
async function runPyodideCodeWithExplainer(instanceId) {
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
        // ============================================
        // NEW: Use PythonErrorExplainer for friendly errors
        // ============================================
        if (typeof PythonErrorExplainer !== 'undefined') {
            const result = PythonErrorExplainer.explain(error.message, code);
            outputEl.innerHTML = PythonErrorExplainer.formatAsHTML(result);
            outputEl.className = 'pyodide-output error';
        } else {
            // Fallback to original behavior
            outputEl.innerHTML = `<pre class="pyodide-error">오류: ${escapeHtml(error.message)}</pre>`;
            outputEl.className = 'pyodide-output error';
        }
        console.error('Pyodide execution error:', error);
    }

    // Re-enable button
    if (runBtn) {
        runBtn.disabled = false;
        runBtn.textContent = '▶ 실행하기';
    }
}

/**
 * DIFF showing the minimal changes needed:
 *
 * In pyodide_editor.js, change the catch block from:
 *
 *     } catch (error) {
 *         outputEl.innerHTML = `<pre class="pyodide-error">오류: ${escapeHtml(error.message)}</pre>`;
 *         outputEl.className = 'pyodide-output error';
 *         console.error('Pyodide execution error:', error);
 *     }
 *
 * To:
 *
 *     } catch (error) {
 *         if (typeof PythonErrorExplainer !== 'undefined') {
 *             const result = PythonErrorExplainer.explain(error.message, code);
 *             outputEl.innerHTML = PythonErrorExplainer.formatAsHTML(result);
 *         } else {
 *             outputEl.innerHTML = `<pre class="pyodide-error">오류: ${escapeHtml(error.message)}</pre>`;
 *         }
 *         outputEl.className = 'pyodide-output error';
 *         console.error('Pyodide execution error:', error);
 *     }
 *
 * Then add to mkdocs.yml extra_javascript:
 *   - js/python_error_explainer.js
 *
 * And to extra_css:
 *   - css/python_error_explainer.css
 */
