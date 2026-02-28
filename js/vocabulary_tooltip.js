/**
 * Vocabulary Tooltip System
 * Provides interactive tooltips for Python keywords and built-in functions
 *
 * Loads definitions from /data/python_vocabulary.json and displays
 * bilingual (Korean/English) tooltips with syntax examples.
 */

(function() {
    'use strict';

    // ========================================================================
    // CONFIGURATION
    // ========================================================================

    const CONFIG = {
        // Path to vocabulary JSON file
        vocabularyPath: '/data/python_vocabulary.json',

        // Tooltip display delay (ms)
        showDelay: 300,
        hideDelay: 150,

        // CSS classes
        tooltipClass: 'vocab-tooltip',
        triggerClass: 'vocab-trigger',
        activeClass: 'vocab-tooltip-active',

        // Selectors for content to scan (code blocks + text content)
        contentSelectors: [
            // Code blocks
            'pre code',                    // Standard markdown code blocks
            '.highlight code',             // Pygments highlighted code
            '.python-code-view',           // Blockly Python code display
            '.codehilite code',            // CodeHilite extension
            // Inline code (not inside pre)
            '.md-content p > code',        // Inline code in paragraphs
            '.md-content li > code',       // Inline code in lists
            '.md-content td > code',       // Inline code in tables
            // Text content
            '.md-content p',               // Paragraphs in main content
            '.md-content li',              // List items
            '.md-content td',              // Table cells
            '.md-content h1',              // Headings
            '.md-content h2',
            '.md-content h3',
            '.md-content h4',
            '.md-content blockquote',      // Blockquotes
            '.md-content .admonition-title', // Admonition titles
            '.md-content .admonition > p'  // Admonition content paragraphs
        ],

        // Elements to skip when scanning
        skipSelectors: [
            '.vocab-trigger',              // Already processed
            '.vocab-tooltip',              // Tooltip itself
            'script',
            'style',
            'textarea',
            'input',
            '.mermaid',                    // Mermaid diagrams
            '.tabbed-labels',              // Tab labels
            '.md-nav',                     // Navigation
            '.md-header',                  // Header
            '.md-footer'                   // Footer
        ],

        // Keywords to skip (too common or ambiguous in regular text)
        skipKeywords: new Set(['in', 'as', 'is', 'or', 'if', 'to', 'not', 'and']),

        // Minimum keyword length to process
        minKeywordLength: 2
    };

    // ========================================================================
    // STATE
    // ========================================================================

    let vocabulary = null;
    let vocabularyMap = null;  // Flattened lookup map
    let tooltipElement = null;
    let currentTrigger = null;
    let showTimeout = null;
    let hideTimeout = null;
    let initialized = false;

    // ========================================================================
    // VOCABULARY LOADING
    // ========================================================================

    /**
     * Load vocabulary from JSON file
     * @returns {Promise<Object>}
     */
    async function loadVocabulary() {
        if (vocabulary) {
            return vocabulary;
        }

        // Build possible paths to try
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/').filter(p => p);

        // Calculate relative path to root based on current page depth
        // For /some/path/page.html, we need ../../data/...
        const depth = pathParts.length > 0 ? pathParts.length - 1 : 0;
        const relativePrefix = depth > 0 ? '../'.repeat(depth) : './';

        const pathsToTry = [
            relativePrefix + 'data/python_vocabulary.json',  // Relative from current page
            './data/python_vocabulary.json',                  // Same directory
            '../data/python_vocabulary.json',                 // Parent directory
            '../../data/python_vocabulary.json',              // Two levels up
            '/data/python_vocabulary.json',                   // Absolute from root
            CONFIG.vocabularyPath                             // Config path
        ];

        let response = null;
        let lastError = null;

        for (const path of pathsToTry) {
            try {
                response = await fetch(path);
                if (response.ok) {
                    console.log('[VocabularyTooltip] Loaded from:', path);
                    break;
                }
            } catch (e) {
                lastError = e;
            }
            response = null;
        }

        try {
            if (!response || !response.ok) {
                throw new Error(`Failed to load vocabulary: ${lastError || 'all paths failed'}`);
            }

            vocabulary = await response.json();
            vocabularyMap = buildVocabularyMap(vocabulary);

            console.log('[VocabularyTooltip] Loaded vocabulary:', {
                keywords: Object.keys(vocabulary.keywords || {}).length,
                builtins: Object.keys(vocabulary.builtins || {}).length,
                ursina: Object.keys(vocabulary.ursina || {}).length,
                totalTerms: vocabularyMap.size,
                sampleKoreanTerms: Array.from(vocabularyMap.keys()).filter(k =>
                    k.charCodeAt(0) >= 0xAC00 && k.charCodeAt(0) <= 0xD7AF
                ).slice(0, 10)
            });

            return vocabulary;
        } catch (error) {
            console.warn('[VocabularyTooltip] Failed to load vocabulary:', error);
            return null;
        }
    }

    /**
     * Build a flattened lookup map from vocabulary categories
     * Includes both English terms and Korean terms as keys
     * @param {Object} vocab - Vocabulary object with categories
     * @returns {Map}
     */
    function buildVocabularyMap(vocab) {
        const map = new Map();

        // Process each category
        for (const [category, entries] of Object.entries(vocab)) {
            for (const [term, definition] of Object.entries(entries)) {
                const entry = {
                    term: term,
                    category: category,
                    ...definition
                };

                // Add English term as key
                map.set(term.toLowerCase(), entry);

                // Also add Korean term as key (if exists)
                if (definition.ko) {
                    // Extract just the main Korean term (before parentheses or spaces with English)
                    let koTerm = definition.ko;

                    // Handle formats like "반복문 (for)" or "함수 정의"
                    const parenMatch = koTerm.match(/^([^(]+)/);
                    if (parenMatch) {
                        koTerm = parenMatch[1].trim();
                    }

                    // Add the Korean term
                    if (koTerm && koTerm.length >= 2) {
                        map.set(koTerm, entry);
                    }

                    // Also add sub-terms if it's a compound term like "함수 정의"
                    const koParts = koTerm.split(/\s+/);
                    if (koParts.length > 1) {
                        koParts.forEach(part => {
                            if (part.length >= 2 && !map.has(part)) {
                                map.set(part, entry);
                            }
                        });
                    }
                }
            }
        }

        return map;
    }

    /**
     * Look up a term in the vocabulary
     * @param {string} term - Term to look up
     * @returns {Object|null}
     */
    function lookupTerm(term) {
        if (!vocabularyMap) return null;
        return vocabularyMap.get(term.toLowerCase()) || null;
    }

    // ========================================================================
    // TOOLTIP UI
    // ========================================================================

    /**
     * Create the tooltip DOM element
     */
    function createTooltipElement() {
        if (tooltipElement) return;

        tooltipElement = document.createElement('div');
        tooltipElement.className = CONFIG.tooltipClass;
        tooltipElement.setAttribute('role', 'tooltip');
        tooltipElement.innerHTML = `
            <div class="vocab-tooltip-header">
                <span class="vocab-tooltip-term"></span>
                <span class="vocab-tooltip-category"></span>
            </div>
            <div class="vocab-tooltip-labels">
                <span class="vocab-tooltip-ko"></span>
                <span class="vocab-tooltip-en"></span>
            </div>
            <div class="vocab-tooltip-description"></div>
            <div class="vocab-tooltip-syntax"></div>
        `;

        document.body.appendChild(tooltipElement);

        // Hide on click outside
        document.addEventListener('click', function(e) {
            if (!tooltipElement.contains(e.target) &&
                !e.target.classList.contains(CONFIG.triggerClass)) {
                hideTooltip();
            }
        });
    }

    /**
     * Show tooltip for a term
     * @param {HTMLElement} trigger - Trigger element
     * @param {Object} definition - Term definition
     */
    function showTooltip(trigger, definition) {
        if (!tooltipElement) createTooltipElement();

        // Update content
        const termEl = tooltipElement.querySelector('.vocab-tooltip-term');
        const categoryEl = tooltipElement.querySelector('.vocab-tooltip-category');
        const koEl = tooltipElement.querySelector('.vocab-tooltip-ko');
        const enEl = tooltipElement.querySelector('.vocab-tooltip-en');
        const descEl = tooltipElement.querySelector('.vocab-tooltip-description');
        const syntaxEl = tooltipElement.querySelector('.vocab-tooltip-syntax');

        termEl.textContent = definition.term;

        // Category badge
        const categoryLabels = {
            keywords: 'keyword',
            builtins: 'built-in',
            ursina: 'ursina'
        };
        categoryEl.textContent = categoryLabels[definition.category] || definition.category;
        categoryEl.className = 'vocab-tooltip-category vocab-category-' + definition.category;

        koEl.textContent = definition.ko || '';
        enEl.textContent = definition.en || '';
        descEl.textContent = definition.description || '';

        if (definition.syntax) {
            syntaxEl.innerHTML = '<code>' + escapeHtml(definition.syntax) + '</code>';
            syntaxEl.style.display = 'block';
        } else {
            syntaxEl.style.display = 'none';
        }

        // Position tooltip
        positionTooltip(trigger);

        // Show
        tooltipElement.classList.add(CONFIG.activeClass);
        currentTrigger = trigger;
        trigger.classList.add('vocab-trigger-active');
    }

    /**
     * Position tooltip relative to trigger element
     * @param {HTMLElement} trigger
     */
    function positionTooltip(trigger) {
        const triggerRect = trigger.getBoundingClientRect();
        const tooltipRect = tooltipElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        // Default: position above the trigger
        let top = triggerRect.top + scrollY - tooltipRect.height - 8;
        let left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);

        // If tooltip would go above viewport, show below
        if (top < scrollY + 10) {
            top = triggerRect.bottom + scrollY + 8;
            tooltipElement.classList.add('vocab-tooltip-below');
            tooltipElement.classList.remove('vocab-tooltip-above');
        } else {
            tooltipElement.classList.add('vocab-tooltip-above');
            tooltipElement.classList.remove('vocab-tooltip-below');
        }

        // Keep within horizontal bounds
        if (left < scrollX + 10) {
            left = scrollX + 10;
        } else if (left + tooltipRect.width > scrollX + viewportWidth - 10) {
            left = scrollX + viewportWidth - tooltipRect.width - 10;
        }

        tooltipElement.style.top = top + 'px';
        tooltipElement.style.left = left + 'px';
    }

    /**
     * Hide the tooltip
     */
    function hideTooltip() {
        if (!tooltipElement) return;

        tooltipElement.classList.remove(CONFIG.activeClass);

        if (currentTrigger) {
            currentTrigger.classList.remove('vocab-trigger-active');
            currentTrigger = null;
        }
    }

    /**
     * Escape HTML special characters
     * @param {string} text
     * @returns {string}
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================================================
    // CONTENT SCANNING
    // ========================================================================

    /**
     * Scan content (code blocks and text) and add tooltip triggers
     */
    function scanCodeBlocks() {
        if (!vocabularyMap || vocabularyMap.size === 0) {
            console.warn('[VocabularyTooltip] No vocabulary loaded, skipping scan');
            return;
        }

        const selector = CONFIG.contentSelectors.join(', ');
        const elements = document.querySelectorAll(selector);

        console.log('[VocabularyTooltip] Scanning', elements.length, 'content elements');

        elements.forEach(element => {
            // Skip if already processed
            if (element.dataset.vocabProcessed) return;

            // Skip if element matches skip selectors
            if (shouldSkipElement(element)) return;

            element.dataset.vocabProcessed = 'true';
            processContentElement(element);
        });
    }

    /**
     * Check if an element should be skipped
     * @param {HTMLElement} element
     * @returns {boolean}
     */
    function shouldSkipElement(element) {
        const skipSelector = CONFIG.skipSelectors.join(', ');

        // Check if element itself matches skip selector
        if (element.matches && element.matches(skipSelector)) {
            return true;
        }

        // Check if any parent matches skip selector
        if (element.closest && element.closest(skipSelector)) {
            return true;
        }

        return false;
    }

    /**
     * Process a single content element
     * @param {HTMLElement} element
     */
    function processContentElement(element) {
        // Get text nodes using TreeWalker
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip text inside already processed triggers
                    if (node.parentElement?.classList.contains(CONFIG.triggerClass)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Skip empty text nodes
                    if (!node.textContent.trim()) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Skip nodes inside elements we should skip
                    const skipSelector = CONFIG.skipSelectors.join(', ');
                    if (node.parentElement?.closest(skipSelector)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        // Process text nodes in reverse to avoid offset issues
        textNodes.reverse().forEach(textNode => {
            processTextNode(textNode);
        });
    }

    /**
     * Check if a character is a Korean character
     * @param {string} char
     * @returns {boolean}
     */
    function isKorean(char) {
        if (!char) return false;
        const code = char.charCodeAt(0);
        // Hangul syllables (AC00-D7AF) and Hangul Jamo (1100-11FF, 3130-318F)
        return (code >= 0xAC00 && code <= 0xD7AF) ||
               (code >= 0x1100 && code <= 0x11FF) ||
               (code >= 0x3130 && code <= 0x318F);
    }

    /**
     * Check if a character is an ASCII word character
     * @param {string} char
     * @returns {boolean}
     */
    function isAsciiWord(char) {
        if (!char) return false;
        return /[a-zA-Z0-9_]/.test(char);
    }

    /**
     * Process a text node and wrap keywords
     * @param {Text} textNode
     */
    function processTextNode(textNode) {
        const text = textNode.textContent;
        if (!text || text.trim().length === 0) return;

        // Skip if inside a tooltip trigger already
        if (textNode.parentElement?.classList.contains(CONFIG.triggerClass)) return;

        // Separate Korean and English terms
        const allTerms = Array.from(vocabularyMap.keys())
            .filter(term => {
                return term.length >= CONFIG.minKeywordLength &&
                       !CONFIG.skipKeywords.has(term.toLowerCase());
            });

        const koreanTerms = allTerms.filter(term => isKorean(term.charAt(0)));
        const englishTerms = allTerms.filter(term => !isKorean(term.charAt(0)));

        // Sort by length (longer first) to match longest terms first
        koreanTerms.sort((a, b) => b.length - a.length);
        englishTerms.sort((a, b) => b.length - a.length);

        const matches = [];

        // Match English terms with word boundaries
        if (englishTerms.length > 0) {
            const englishPattern = new RegExp(
                '\\b(' + englishTerms.map(escapeRegex).join('|') + ')\\b',
                'gi'
            );
            let match;
            while ((match = englishPattern.exec(text)) !== null) {
                matches.push({
                    term: match[1],
                    index: match.index,
                    length: match[1].length
                });
            }
        }

        // Match Korean terms - check for natural word boundaries
        // Korean words typically start after non-Korean chars (spaces, punctuation)
        // but can be followed by particles (를, 을, 이, 가, 는, 은, etc.)
        if (koreanTerms.length > 0) {
            koreanTerms.forEach(term => {
                let searchStart = 0;
                let idx;
                while ((idx = text.indexOf(term, searchStart)) !== -1) {
                    // Check if this is a natural boundary (start of Korean word)
                    const charBefore = text[idx - 1];

                    // Valid start: nothing before, or non-Korean char before
                    // (we're at the beginning of a Korean word)
                    const validStart = !charBefore || !isKorean(charBefore);

                    if (validStart) {
                        // Check this doesn't overlap with existing matches
                        const overlaps = matches.some(m =>
                            (idx >= m.index && idx < m.index + m.length) ||
                            (idx + term.length > m.index && idx + term.length <= m.index + m.length) ||
                            (idx <= m.index && idx + term.length >= m.index + m.length)
                        );

                        if (!overlaps) {
                            matches.push({
                                term: term,
                                index: idx,
                                length: term.length
                            });
                        }
                    }

                    searchStart = idx + 1;
                }
            });
        }

        if (matches.length === 0) return;

        // Sort matches by index for proper text reconstruction
        matches.sort((a, b) => a.index - b.index);

        // Create fragment with wrapped keywords
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        matches.forEach(m => {
            // Add text before match
            if (m.index > lastIndex) {
                fragment.appendChild(
                    document.createTextNode(text.slice(lastIndex, m.index))
                );
            }

            // Create trigger span
            const trigger = document.createElement('span');
            trigger.className = CONFIG.triggerClass;
            trigger.textContent = m.term;
            trigger.dataset.term = m.term.toLowerCase();

            // Add event listeners
            trigger.addEventListener('mouseenter', handleTriggerEnter);
            trigger.addEventListener('mouseleave', handleTriggerLeave);
            trigger.addEventListener('focus', handleTriggerEnter);
            trigger.addEventListener('blur', handleTriggerLeave);
            trigger.setAttribute('tabindex', '0');

            fragment.appendChild(trigger);
            lastIndex = m.index + m.length;
        });

        // Add remaining text
        if (lastIndex < text.length) {
            fragment.appendChild(
                document.createTextNode(text.slice(lastIndex))
            );
        }

        // Replace text node with fragment
        textNode.parentNode.replaceChild(fragment, textNode);
    }

    /**
     * Escape special regex characters
     * @param {string} str
     * @returns {string}
     */
    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================

    /**
     * Handle mouse enter on trigger
     * @param {Event} e
     */
    function handleTriggerEnter(e) {
        const trigger = e.target;
        const term = trigger.dataset.term;
        const definition = lookupTerm(term);

        if (!definition) return;

        clearTimeout(hideTimeout);

        showTimeout = setTimeout(() => {
            showTooltip(trigger, definition);
        }, CONFIG.showDelay);
    }

    /**
     * Handle mouse leave on trigger
     * @param {Event} e
     */
    function handleTriggerLeave(e) {
        clearTimeout(showTimeout);

        hideTimeout = setTimeout(() => {
            hideTooltip();
        }, CONFIG.hideDelay);
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /**
     * Initialize the vocabulary tooltip system
     */
    async function init() {
        if (initialized) {
            // Re-scan for new code blocks (after navigation)
            scanCodeBlocks();
            return;
        }

        console.log('[VocabularyTooltip] Initializing...');

        // Load vocabulary
        await loadVocabulary();

        if (!vocabularyMap) {
            console.warn('[VocabularyTooltip] No vocabulary available');
            return;
        }

        // Create tooltip element
        createTooltipElement();

        // Initial scan
        scanCodeBlocks();

        initialized = true;
        console.log('[VocabularyTooltip] Initialized');
    }

    /**
     * Reset state for navigation
     */
    function reset() {
        // Clear timeouts
        clearTimeout(showTimeout);
        clearTimeout(hideTimeout);

        // Hide tooltip
        hideTooltip();

        // Re-scan will happen on next init call
    }

    // ========================================================================
    // MKDOCS INTEGRATION
    // ========================================================================

    // Initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // MkDocs Material instant navigation support
    if (typeof document$ !== 'undefined') {
        document$.subscribe(function() {
            reset();
            // Delay to ensure DOM is updated
            setTimeout(init, 100);
        });
    }

    // Fallback: MutationObserver for URL changes
    let lastUrl = location.href;
    const observer = new MutationObserver(function() {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            reset();
            setTimeout(init, 200);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // ========================================================================
    // EXPORTS
    // ========================================================================

    window.VocabularyTooltip = {
        init: init,
        reset: reset,
        loadVocabulary: loadVocabulary,
        scanCodeBlocks: scanCodeBlocks,
        lookupTerm: lookupTerm
    };

})();
