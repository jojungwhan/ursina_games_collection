/**
 * Python Keywords Tooltip System
 * Adds interactive tooltips for Python keywords in code blocks
 */

// Global vocabulary storage
let pythonVocabulary = null;

/**
 * Load the vocabulary JSON file
 */
async function loadVocabulary() {
    if (pythonVocabulary) return pythonVocabulary;

    try {
        // Try different paths depending on the page location
        const paths = [
            '/data/python_vocabulary.json',
            '../data/python_vocabulary.json',
            '../../data/python_vocabulary.json',
            './data/python_vocabulary.json'
        ];

        for (const path of paths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    pythonVocabulary = await response.json();
                    console.log('Python vocabulary loaded successfully');
                    return pythonVocabulary;
                }
            } catch (e) {
                // Try next path
            }
        }

        // Fallback: use embedded vocabulary for essential keywords
        pythonVocabulary = getEmbeddedVocabulary();
        console.log('Using embedded vocabulary');
        return pythonVocabulary;
    } catch (e) {
        console.warn('Error loading vocabulary:', e);
        pythonVocabulary = getEmbeddedVocabulary();
        return pythonVocabulary;
    }
}

/**
 * Embedded vocabulary fallback
 */
function getEmbeddedVocabulary() {
    return {
        keywords: {
            "def": { ko: "함수 정의", description: "새로운 함수를 정의할 때 사용합니다." },
            "class": { ko: "클래스 정의", description: "새로운 클래스를 정의할 때 사용합니다." },
            "if": { ko: "조건문", description: "조건이 참일 때 코드를 실행합니다." },
            "elif": { ko: "그렇지 않고 만약", description: "이전 조건이 거짓이고, 새 조건이 참일 때 실행합니다." },
            "else": { ko: "그렇지 않으면", description: "모든 조건이 거짓일 때 실행합니다." },
            "for": { ko: "반복문 (for)", description: "시퀀스의 각 요소에 대해 코드를 반복 실행합니다." },
            "while": { ko: "반복문 (while)", description: "조건이 참인 동안 코드를 반복 실행합니다." },
            "return": { ko: "반환", description: "함수에서 값을 반환하고 함수를 종료합니다." },
            "import": { ko: "가져오기", description: "다른 모듈이나 패키지를 가져옵니다." },
            "from": { ko: "~로부터", description: "모듈에서 특정 항목을 가져올 때 사용합니다." },
            "True": { ko: "참", description: "불리언 참 값입니다." },
            "False": { ko: "거짓", description: "불리언 거짓 값입니다." },
            "None": { ko: "없음", description: "값이 없음을 나타냅니다." },
            "and": { ko: "그리고", description: "두 조건이 모두 참일 때 참을 반환합니다." },
            "or": { ko: "또는", description: "두 조건 중 하나라도 참이면 참을 반환합니다." },
            "not": { ko: "아닌", description: "조건의 반대 값을 반환합니다." },
            "in": { ko: "~안에", description: "시퀀스에 요소가 포함되어 있는지 확인합니다." },
            "break": { ko: "중단", description: "현재 반복문을 즉시 종료합니다." },
            "continue": { ko: "계속", description: "현재 반복을 건너뛰고 다음 반복으로 진행합니다." },
            "pass": { ko: "통과", description: "아무 작업도 수행하지 않는 자리 표시자입니다." },
            "self": { ko: "자기 자신", description: "클래스의 인스턴스 자신을 참조합니다." }
        },
        builtins: {
            "print": { ko: "출력", description: "콘솔에 값을 출력합니다.", syntax: "print(value)" },
            "len": { ko: "길이", description: "시퀀스의 길이를 반환합니다.", syntax: "len(sequence)" },
            "range": { ko: "범위", description: "숫자의 시퀀스를 생성합니다.", syntax: "range(start, stop, step)" },
            "int": { ko: "정수", description: "값을 정수로 변환합니다." },
            "float": { ko: "실수", description: "값을 실수로 변환합니다." },
            "str": { ko: "문자열", description: "값을 문자열로 변환합니다." },
            "list": { ko: "리스트", description: "리스트를 생성합니다." },
            "dict": { ko: "딕셔너리", description: "딕셔너리를 생성합니다." },
            "append": { ko: "추가", description: "리스트의 끝에 요소를 추가합니다." },
            "input": { ko: "입력", description: "사용자로부터 입력을 받습니다." }
        },
        ursina: {}
    };
}

/**
 * Create tooltip element
 */
function createTooltip() {
    let tooltip = document.getElementById('python-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'python-tooltip';
        tooltip.className = 'python-keyword-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-ko"></span>
                <span class="tooltip-en"></span>
            </div>
            <div class="tooltip-description"></div>
            <div class="tooltip-syntax"></div>
        `;
        document.body.appendChild(tooltip);
    }
    return tooltip;
}

/**
 * Show tooltip for a keyword
 */
function showTooltip(element, keyword, info) {
    const tooltip = createTooltip();

    // Set content
    const koSpan = tooltip.querySelector('.tooltip-ko');
    const enSpan = tooltip.querySelector('.tooltip-en');
    const descDiv = tooltip.querySelector('.tooltip-description');
    const syntaxDiv = tooltip.querySelector('.tooltip-syntax');

    koSpan.textContent = info.ko || keyword;
    enSpan.textContent = info.en ? `(${info.en})` : '';
    descDiv.textContent = info.description || '';

    if (info.syntax) {
        syntaxDiv.textContent = info.syntax;
        syntaxDiv.style.display = 'block';
    } else {
        syntaxDiv.style.display = 'none';
    }

    // Position tooltip
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + 5;

    // Adjust if tooltip goes off-screen
    if (left + 300 > window.innerWidth) {
        left = window.innerWidth - 310;
    }
    if (left < 10) {
        left = 10;
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.classList.add('visible');
}

/**
 * Hide tooltip
 */
function hideTooltip() {
    const tooltip = document.getElementById('python-tooltip');
    if (tooltip) {
        tooltip.classList.remove('visible');
    }
}

/**
 * Check if a word is a Python keyword/builtin
 */
function getKeywordInfo(word, vocabulary) {
    if (vocabulary.keywords && vocabulary.keywords[word]) {
        return { ...vocabulary.keywords[word], type: 'keyword' };
    }
    if (vocabulary.builtins && vocabulary.builtins[word]) {
        return { ...vocabulary.builtins[word], type: 'builtin' };
    }
    if (vocabulary.ursina && vocabulary.ursina[word]) {
        return { ...vocabulary.ursina[word], type: 'ursina' };
    }
    return null;
}

/**
 * Process a code block and add tooltips to keywords
 */
function processCodeBlock(codeElement, vocabulary) {
    // Get all text nodes and spans with syntax highlighting
    const walker = document.createTreeWalker(
        codeElement,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: function(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                if (node.nodeType === Node.ELEMENT_NODE &&
                    (node.classList.contains('k') || // keyword
                     node.classList.contains('kn') || // keyword namespace
                     node.classList.contains('kc') || // keyword constant
                     node.classList.contains('nb') || // builtin
                     node.classList.contains('nc') || // class name
                     node.classList.contains('nf') || // function name
                     node.classList.contains('n') || // name
                     node.classList.contains('bp'))) { // builtin pseudo
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
            }
        }
    );

    const elementsToWrap = [];
    let node;

    while (node = walker.nextNode()) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const text = node.textContent.trim();
            const info = getKeywordInfo(text, vocabulary);
            if (info && !node.classList.contains('python-keyword-tooltip-trigger')) {
                elementsToWrap.push({ element: node, text: text, info: info });
            }
        }
    }

    // Wrap keywords with tooltip triggers
    elementsToWrap.forEach(({ element, text, info }) => {
        element.classList.add('python-keyword-tooltip-trigger');
        element.classList.add('tooltip-type-' + info.type);
        element.dataset.keyword = text;

        element.addEventListener('mouseenter', function(e) {
            showTooltip(this, text, info);
        });

        element.addEventListener('mouseleave', function(e) {
            hideTooltip();
        });
    });
}

/**
 * Process all code blocks on the page
 */
async function processAllCodeBlocks() {
    const vocabulary = await loadVocabulary();
    if (!vocabulary) return;

    // Find all Python code blocks
    const codeBlocks = document.querySelectorAll('pre code.language-python, pre code.highlight');

    codeBlocks.forEach(codeBlock => {
        if (!codeBlock.dataset.tooltipsProcessed) {
            processCodeBlock(codeBlock, vocabulary);
            codeBlock.dataset.tooltipsProcessed = 'true';
        }
    });

    // Also process inline code that might contain Python
    const inlineCode = document.querySelectorAll('code:not([class*="language-"])');
    inlineCode.forEach(code => {
        const text = code.textContent.trim();
        const info = getKeywordInfo(text, vocabulary);
        if (info && !code.dataset.tooltipsProcessed) {
            code.classList.add('python-keyword-tooltip-trigger');
            code.classList.add('tooltip-type-' + info.type);
            code.dataset.keyword = text;
            code.dataset.tooltipsProcessed = 'true';

            code.addEventListener('mouseenter', function(e) {
                showTooltip(this, text, info);
            });

            code.addEventListener('mouseleave', function(e) {
                hideTooltip();
            });
        }
    });
}

/**
 * Initialize tooltips
 */
function initPythonTooltips() {
    // Process on initial load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processAllCodeBlocks);
    } else {
        processAllCodeBlocks();
    }

    // Process again after MkDocs Material instant navigation
    if (typeof document$ !== 'undefined') {
        document$.subscribe(function() {
            setTimeout(processAllCodeBlocks, 100);
        });
    }

    // Also use MutationObserver for dynamic content
    const observer = new MutationObserver(function(mutations) {
        let shouldProcess = false;
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.querySelector && (node.querySelector('pre code') || node.tagName === 'CODE')) {
                            shouldProcess = true;
                        }
                    }
                });
            }
        });
        if (shouldProcess) {
            setTimeout(processAllCodeBlocks, 100);
        }
    });

    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
    });
}

// Initialize
initPythonTooltips();
