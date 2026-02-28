/**
 * Python Error Explainer (Korean) - PROTOTYPE
 *
 * Lightweight client-side Python error parser with Korean explanations
 * Designed for K-12 beginners learning Python
 *
 * DO NOT USE YET - This is a prototype for review
 */

const PythonErrorExplainer = {

    /**
     * Error patterns and their Korean explanations
     * Each pattern has:
     * - regex: Pattern to match the error
     * - title: Short error name in Korean
     * - explain: Beginner-friendly explanation
     * - fix: How to fix it
     * - example: Optional example of correct code
     */
    errorPatterns: [
        // ===== Syntax Errors =====
        {
            regex: /SyntaxError: invalid syntax/i,
            title: "문법 오류",
            explain: "파이썬이 이해할 수 없는 코드가 있어요.",
            fix: "괄호, 콜론(:), 따옴표가 빠지지 않았는지 확인하세요.",
            detectCause: (code, line) => {
                if (line && !line.includes(':') && /^(if|for|while|def|class|elif|else|try|except)\b/.test(line.trim())) {
                    return "👉 `if`, `for`, `def` 등의 뒤에는 콜론(`:`)이 필요해요!";
                }
                if (line && (line.match(/"/g) || []).length % 2 !== 0) {
                    return "👉 따옴표(`\"`)가 짝이 맞지 않아요!";
                }
                if (line && (line.match(/\(/g) || []).length !== (line.match(/\)/g) || []).length) {
                    return "👉 괄호 `()`의 개수가 맞지 않아요!";
                }
                return null;
            }
        },
        {
            regex: /SyntaxError: EOL while scanning string literal/i,
            title: "문자열 오류",
            explain: "문자열(따옴표 안의 글자)이 제대로 닫히지 않았어요.",
            fix: "따옴표(`\"` 또는 `'`)가 시작과 끝에 모두 있는지 확인하세요.",
            example: '# ❌ 잘못된 예\nprint("안녕하세요)\n\n# ✅ 올바른 예\nprint("안녕하세요")'
        },
        {
            regex: /SyntaxError: unexpected EOF while parsing/i,
            title: "코드 미완성",
            explain: "코드가 끝나기 전에 뭔가 빠졌어요.",
            fix: "괄호 `()`, `[]`, `{}`가 모두 닫혔는지 확인하세요."
        },
        {
            regex: /SyntaxError: expected ':'/i,
            title: "콜론 누락",
            explain: "`if`, `for`, `while`, `def` 뒤에 콜론(`:`)이 필요해요.",
            fix: "조건문이나 반복문 끝에 `:`를 추가하세요.",
            example: "# ❌ 잘못된 예\nif x > 5\n    print(x)\n\n# ✅ 올바른 예\nif x > 5:\n    print(x)"
        },

        // ===== Indentation Errors =====
        {
            regex: /IndentationError: expected an indented block/i,
            title: "들여쓰기 필요",
            explain: "`if`, `for`, `def` 다음 줄은 들여쓰기(스페이스 4칸)가 필요해요.",
            fix: "다음 줄 앞에 스페이스 4칸을 추가하세요.",
            example: "# ❌ 잘못된 예\nfor i in range(5):\nprint(i)\n\n# ✅ 올바른 예\nfor i in range(5):\n    print(i)"
        },
        {
            regex: /IndentationError: unexpected indent/i,
            title: "잘못된 들여쓰기",
            explain: "들여쓰기가 필요 없는 곳에 들여쓰기가 있어요.",
            fix: "불필요한 스페이스를 제거하세요."
        },
        {
            regex: /IndentationError: unindent does not match/i,
            title: "들여쓰기 불일치",
            explain: "들여쓰기 칸 수가 일치하지 않아요.",
            fix: "같은 블록은 같은 칸 수로 들여쓰기하세요. (보통 4칸)"
        },

        // ===== Name Errors =====
        {
            regex: /NameError: name '(\w+)' is not defined/i,
            title: "정의되지 않은 이름",
            explain: (match) => `'${match[1]}'라는 이름을 파이썬이 모르겠대요.`,
            fix: "변수나 함수 이름의 철자를 확인하세요. 사용하기 전에 먼저 만들어야 해요!",
            detectCause: (code, line, match) => {
                const name = match[1];
                // Check for common typos
                const commonTypos = {
                    'pirnt': 'print',
                    'prnit': 'print',
                    'pritn': 'print',
                    'ture': 'True',
                    'flase': 'False',
                    'treu': 'True',
                    'fasle': 'False',
                    'improt': 'import',
                    'form': 'from',
                    'retrun': 'return',
                    'retrn': 'return',
                    'defin': 'def',
                    'whlie': 'while',
                    'fro': 'for',
                    'rage': 'range',
                    'rnage': 'range',
                    'languege': 'language',
                    'lenght': 'length',
                };
                if (commonTypos[name.toLowerCase()]) {
                    return `👉 혹시 \`${commonTypos[name.toLowerCase()]}\`를 쓰려고 했나요?`;
                }
                // Check if it looks like a variable that wasn't assigned
                if (/^[a-z_][a-z0-9_]*$/i.test(name)) {
                    return `👉 \`${name}\` 변수를 사용하기 전에 먼저 값을 저장했나요?\n   예: \`${name} = 값\``;
                }
                return null;
            }
        },

        // ===== Type Errors =====
        {
            regex: /TypeError: can only concatenate str \(not "(\w+)"\) to str/i,
            title: "타입 오류 (문자열 연결)",
            explain: (match) => `문자열(글자)과 ${match[1] === 'int' ? '숫자' : match[1]}는 `+`로 연결할 수 없어요.`,
            fix: "숫자를 문자열로 바꾸려면 `str(숫자)`를 사용하세요.",
            example: '# ❌ 잘못된 예\nage = 10\nprint("나이: " + age)\n\n# ✅ 올바른 예\nage = 10\nprint("나이: " + str(age))\n# 또는\nprint(f"나이: {age}")'
        },
        {
            regex: /TypeError: unsupported operand type\(s\) for (.+): '(\w+)' and '(\w+)'/i,
            title: "타입 오류 (연산)",
            explain: (match) => `'${match[2]}'와 '${match[3]}' 타입은 '${match[1]}' 연산을 할 수 없어요.`,
            fix: "같은 타입끼리 연산하거나, 타입을 변환하세요."
        },
        {
            regex: /TypeError: '(\w+)' object is not callable/i,
            title: "호출 오류",
            explain: (match) => `'${match[1]}'는 함수가 아니라서 \`()\`로 호출할 수 없어요.`,
            fix: "변수 이름이 함수 이름과 겹치지 않는지 확인하세요.",
            detectCause: (code, line, match) => {
                const typeName = match[1];
                if (typeName === 'int' || typeName === 'str' || typeName === 'list') {
                    return `👉 혹시 \`${typeName}\`이라는 이름의 변수를 만들었나요? 파이썬 기본 함수와 이름이 겹쳐요!`;
                }
                return null;
            }
        },
        {
            regex: /TypeError: '(\w+)' object is not subscriptable/i,
            title: "인덱스 오류",
            explain: (match) => `'${match[1]}'는 \`[]\`로 접근할 수 없어요.`,
            fix: "리스트나 문자열에만 `[인덱스]`를 사용할 수 있어요."
        },
        {
            regex: /TypeError: (\w+)\(\) missing (\d+) required positional argument/i,
            title: "인자 누락",
            explain: (match) => `\`${match[1]}()\` 함수에 필요한 값이 ${match[2]}개 빠졌어요.`,
            fix: "함수를 호출할 때 필요한 값을 모두 넣어주세요."
        },
        {
            regex: /TypeError: (\w+)\(\) takes (\d+) positional arguments? but (\d+) (?:was|were) given/i,
            title: "인자 초과",
            explain: (match) => `\`${match[1]}()\` 함수는 ${match[2]}개의 값만 받는데, ${match[3]}개를 넣었어요.`,
            fix: "함수에 넣은 값의 개수를 확인하세요."
        },

        // ===== Index Errors =====
        {
            regex: /IndexError: list index out of range/i,
            title: "인덱스 범위 초과 (리스트)",
            explain: "리스트에 없는 위치를 찾으려고 했어요.",
            fix: "리스트의 길이보다 작은 인덱스를 사용하세요. (0부터 시작해요!)",
            example: "# 리스트가 3개면 인덱스는 0, 1, 2만 가능해요\nfruits = ['사과', '바나나', '오렌지']\nprint(fruits[0])  # ✅ 사과\nprint(fruits[2])  # ✅ 오렌지\nprint(fruits[3])  # ❌ 오류! (0,1,2만 있음)"
        },
        {
            regex: /IndexError: string index out of range/i,
            title: "인덱스 범위 초과 (문자열)",
            explain: "문자열에 없는 위치를 찾으려고 했어요.",
            fix: "문자열의 길이보다 작은 인덱스를 사용하세요."
        },

        // ===== Value Errors =====
        {
            regex: /ValueError: invalid literal for int\(\) with base 10: '(.+)'/i,
            title: "숫자 변환 오류",
            explain: (match) => `'${match[1]}'은(는) 숫자로 바꿀 수 없어요.`,
            fix: "숫자만 있는 문자열만 `int()`로 바꿀 수 있어요.",
            example: '# ❌ 잘못된 예\nint("hello")  # 글자는 숫자가 아니에요\nint("3.14")   # 소수점이 있으면 float() 사용\n\n# ✅ 올바른 예\nint("123")    # 정수 문자열\nfloat("3.14") # 소수 문자열'
        },
        {
            regex: /ValueError: could not convert string to float: '(.+)'/i,
            title: "소수 변환 오류",
            explain: (match) => `'${match[1]}'은(는) 소수로 바꿀 수 없어요.`,
            fix: "숫자 형태의 문자열만 `float()`로 바꿀 수 있어요."
        },
        {
            regex: /ValueError: math domain error/i,
            title: "수학 도메인 오류",
            explain: "수학적으로 불가능한 계산이에요.",
            fix: "음수의 제곱근이나 0으로 나누기 등을 확인하세요."
        },

        // ===== Key Errors =====
        {
            regex: /KeyError: '?(.+?)'?$/i,
            title: "키 오류",
            explain: (match) => `딕셔너리에 '${match[1]}'라는 키가 없어요.`,
            fix: "딕셔너리의 키 이름을 확인하세요. `dict.get(key)`를 사용하면 오류 없이 확인할 수 있어요."
        },

        // ===== Attribute Errors =====
        {
            regex: /AttributeError: '(\w+)' object has no attribute '(\w+)'/i,
            title: "속성 오류",
            explain: (match) => `'${match[1]}' 타입에는 '${match[2]}'가 없어요.`,
            fix: "해당 타입에서 사용할 수 있는 메서드인지 확인하세요.",
            detectCause: (code, line, match) => {
                const objType = match[1];
                const attr = match[2];
                const suggestions = {
                    'str': { 'append': 'append()는 리스트 전용이에요. 문자열 연결은 + 를 사용하세요.' },
                    'list': { 'split': 'split()는 문자열 전용이에요.' },
                    'int': { 'append': '숫자에는 append()를 쓸 수 없어요.' },
                    'NoneType': { '*': '변수가 None이에요. 값이 제대로 저장되었는지 확인하세요.' }
                };
                if (suggestions[objType] && (suggestions[objType][attr] || suggestions[objType]['*'])) {
                    return `👉 ${suggestions[objType][attr] || suggestions[objType]['*']}`;
                }
                return null;
            }
        },

        // ===== Import Errors =====
        {
            regex: /ModuleNotFoundError: No module named '(\w+)'/i,
            title: "모듈 없음",
            explain: (match) => `'${match[1]}' 모듈을 찾을 수 없어요.`,
            fix: "모듈 이름의 철자를 확인하세요.",
            detectCause: (code, line, match) => {
                const module = match[1];
                const typos = {
                    'matlotlib': 'matplotlib',
                    'matplot': 'matplotlib',
                    'numppy': 'numpy',
                    'numy': 'numpy',
                    'panda': 'pandas',
                    'randon': 'random',
                    'randome': 'random',
                };
                if (typos[module]) {
                    return `👉 혹시 \`${typos[module]}\`를 쓰려고 했나요?`;
                }
                return null;
            }
        },

        // ===== Zero Division =====
        {
            regex: /ZeroDivisionError: division by zero/i,
            title: "0으로 나누기 오류",
            explain: "숫자를 0으로 나눌 수 없어요. (수학에서도 불가능해요!)",
            fix: "나누기 전에 나누는 수가 0인지 확인하세요.",
            example: "# ✅ 0으로 나누기 방지\nif divisor != 0:\n    result = number / divisor\nelse:\n    print('0으로 나눌 수 없어요!')"
        },

        // ===== Recursion Error =====
        {
            regex: /RecursionError: maximum recursion depth exceeded/i,
            title: "재귀 오류",
            explain: "함수가 자기 자신을 너무 많이 호출했어요. (무한 반복!)",
            fix: "재귀 함수에 종료 조건이 있는지 확인하세요."
        },

        // ===== File Errors =====
        {
            regex: /FileNotFoundError: \[Errno 2\] No such file or directory: '(.+)'/i,
            title: "파일 없음",
            explain: (match) => `'${match[1]}' 파일을 찾을 수 없어요.`,
            fix: "파일 이름과 경로가 정확한지 확인하세요."
        },

        // ===== Matplotlib Specific =====
        {
            regex: /ValueError: x and y must have same first dimension/i,
            title: "데이터 길이 불일치",
            explain: "x 데이터와 y 데이터의 개수가 달라요.",
            fix: "두 리스트의 길이가 같은지 확인하세요.",
            example: "# ❌ 잘못된 예\nx = [1, 2, 3]\ny = [10, 20]  # 2개밖에 없음!\nplt.plot(x, y)\n\n# ✅ 올바른 예\nx = [1, 2, 3]\ny = [10, 20, 30]  # 3개로 맞춤\nplt.plot(x, y)"
        },
        {
            regex: /ValueError: shape mismatch/i,
            title: "배열 모양 불일치",
            explain: "배열(리스트)의 크기가 맞지 않아요.",
            fix: "데이터의 크기와 모양을 확인하세요."
        }
    ],

    /**
     * Parse an error message and return a friendly explanation
     * @param {string} errorMessage - The raw Python error message
     * @param {string} code - The code that caused the error (optional)
     * @returns {object} Friendly error object
     */
    explain(errorMessage, code = '') {
        // Extract line number if present
        const lineMatch = errorMessage.match(/line (\d+)/i);
        const lineNumber = lineMatch ? parseInt(lineMatch[1]) : null;

        // Get the problematic line of code
        let problemLine = null;
        if (lineNumber && code) {
            const lines = code.split('\n');
            if (lineNumber <= lines.length) {
                problemLine = lines[lineNumber - 1];
            }
        }

        // Find matching error pattern
        for (const pattern of this.errorPatterns) {
            const match = errorMessage.match(pattern.regex);
            if (match) {
                // Build the explanation
                const title = pattern.title;
                const explain = typeof pattern.explain === 'function'
                    ? pattern.explain(match)
                    : pattern.explain;
                const fix = pattern.fix;
                const example = pattern.example || null;

                // Try to detect specific cause
                let specificCause = null;
                if (pattern.detectCause) {
                    specificCause = pattern.detectCause(code, problemLine, match);
                }

                return {
                    success: true,
                    title: title,
                    explanation: explain,
                    fix: fix,
                    example: example,
                    specificCause: specificCause,
                    lineNumber: lineNumber,
                    problemLine: problemLine,
                    originalError: errorMessage
                };
            }
        }

        // No pattern matched - return generic help
        return {
            success: false,
            title: "알 수 없는 오류",
            explanation: "파이썬에서 오류가 발생했어요.",
            fix: "오류 메시지를 읽고 코드를 다시 확인해보세요.",
            example: null,
            specificCause: null,
            lineNumber: lineNumber,
            problemLine: problemLine,
            originalError: errorMessage
        };
    },

    /**
     * Format the error explanation as HTML
     * @param {object} result - Result from explain()
     * @returns {string} HTML string
     */
    formatAsHTML(result) {
        let html = `<div class="python-error-explained">`;

        // Title
        html += `<div class="error-title">❌ ${result.title}</div>`;

        // Line info
        if (result.lineNumber) {
            html += `<div class="error-line-info">📍 ${result.lineNumber}번째 줄에서 오류 발생</div>`;
            if (result.problemLine) {
                html += `<pre class="error-problem-line"><code>${this.escapeHtml(result.problemLine.trim())}</code></pre>`;
            }
        }

        // Explanation
        html += `<div class="error-explanation">💡 <strong>무슨 뜻이에요?</strong><br>${result.explanation}</div>`;

        // Specific cause (if detected)
        if (result.specificCause) {
            html += `<div class="error-specific-cause">${result.specificCause}</div>`;
        }

        // Fix
        html += `<div class="error-fix">🔧 <strong>어떻게 고쳐요?</strong><br>${result.fix}</div>`;

        // Example
        if (result.example) {
            html += `<div class="error-example">📝 <strong>예시:</strong><pre><code>${this.escapeHtml(result.example)}</code></pre></div>`;
        }

        // Original error (collapsed)
        html += `<details class="error-original">
            <summary>🔍 원본 오류 메시지</summary>
            <pre>${this.escapeHtml(result.originalError)}</pre>
        </details>`;

        html += `</div>`;
        return html;
    },

    /**
     * Escape HTML entities
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PythonErrorExplainer = PythonErrorExplainer;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PythonErrorExplainer;
}
