/**
 * Dynamic Lesson Navigation
 *
 * Automatically generates prev/next navigation links based on MkDocs nav structure.
 * No more hardcoded links that break when files are renamed!
 */

(function() {
    'use strict';

    // ========================================================================
    // CONFIGURATION
    // ========================================================================

    const NAV_SELECTOR = '.md-nav--primary';
    const LESSON_NAV_CLASS = 'lesson-nav';
    const AUTO_NAV_CLASS = 'lesson-nav-auto';

    // ========================================================================
    // NAVIGATION EXTRACTION
    // ========================================================================

    /**
     * Extract all navigation links from the sidebar in order
     * Returns flat array of { title, href, compareKey, element } objects
     *
     * - `href` is the real navigable URL (keeps `.html` etc.)
     * - `compareKey` is a normalized path used only for matching
     */
    function extractNavLinks() {
        const links = [];
        const nav = document.querySelector(NAV_SELECTOR);
        if (!nav) return links;

        // Get all navigation links recursively
        const allLinks = nav.querySelectorAll('.md-nav__link[href]');

        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Skip empty hrefs, anchors, and external links
            if (!href || href === '#' || href.startsWith('http') || href.startsWith('javascript')) {
                return;
            }

            // Get the title text (excluding any nested elements like icons)
            let title = link.textContent.trim();

            // Clean up title - remove any trailing arrows or extra whitespace
            title = title.replace(/[→←]/g, '').trim();

            // Keep the original href for real navigation, but derive a compare key
            // that is safe for matching regardless of `.html` vs `.md` etc.
            const compareKey = normalizeUrl(href);

            links.push({
                title: title,
                href: href,
                compareKey: compareKey,
                element: link
            });
        });

        return links;
    }

    /**
     * Normalize URL for comparison
     */
    function normalizeUrl(url) {
        // Remove trailing slashes and index.html
        let normalized = url.replace(/\/index\.html$/, '/').replace(/\/$/, '');

        // Handle relative URLs
        if (!url.startsWith('/') && !url.startsWith('http')) {
            // Make relative to current directory
            const base = window.location.pathname.replace(/\/[^\/]*$/, '/');
            normalized = new URL(url, window.location.origin + base).pathname;
        }

        // Remove .html extension for comparison
        normalized = normalized.replace(/\.html$/, '').replace(/\.md$/, '');

        return normalized;
    }

    /**
     * Get current page URL normalized (used only for comparison)
     */
    function getCurrentPageCompareKey() {
        return normalizeUrl(window.location.pathname);
    }

    /**
     * Find current page index in nav links
     */
    function findCurrentPageIndex(links) {
        const currentKey = getCurrentPageCompareKey();

        for (let i = 0; i < links.length; i++) {
            const linkKey = links[i].compareKey;
            if (linkKey === currentKey ||
                currentKey.endsWith(linkKey) ||
                linkKey.endsWith(currentKey.split('/').pop())) {
                return i;
            }
        }

        // Try matching by page name only (last path segment of compareKey)
        const currentPage = currentKey.split('/').pop();
        for (let i = 0; i < links.length; i++) {
            const linkPage = links[i].compareKey.split('/').pop();
            if (linkPage === currentPage) {
                return i;
            }
        }

        return -1;
    }

    // ========================================================================
    // NAVIGATION RENDERING
    // ========================================================================

    /**
     * Create navigation element
     */
    function createNavElement(prevLink, nextLink, timeEstimate) {
        const nav = document.createElement('div');
        nav.className = `${LESSON_NAV_CLASS} ${AUTO_NAV_CLASS}`;

        let html = '';

        // Previous button
        if (prevLink) {
            html += `<a href="${prevLink.url}" class="nav-btn nav-prev">← ${prevLink.title}</a>`;
        } else {
            html += '<span class="nav-btn nav-prev nav-disabled"></span>';
        }

        // Time estimate (keep existing if available)
        if (timeEstimate) {
            html += `<span class="nav-time">${timeEstimate}</span>`;
        }

        // Next button
        if (nextLink) {
            html += `<a href="${nextLink.url}" class="nav-btn nav-next">${nextLink.title} →</a>`;
        } else {
            html += '<span class="nav-btn nav-next nav-disabled"></span>';
        }

        nav.innerHTML = html;
        return nav;
    }

    /**
     * Get time estimate from existing nav element
     */
    function getExistingTimeEstimate(navElement) {
        const timeSpan = navElement?.querySelector('.nav-time');
        return timeSpan ? timeSpan.textContent : null;
    }

    /**
     * Convert .md links to .html in button href (fallback when sidebar update fails)
     */
    function convertMdToHtml(href) {
        if (!href) return href;
        // Convert .md extension to .html
        return href.replace(/\.md($|#)/, '.html$1');
    }

    /**
     * Apply fallback: convert any .md links in nav buttons to .html
     */
    function applyMdToHtmlFallback() {
        const navElements = document.querySelectorAll(`.${LESSON_NAV_CLASS}`);
        navElements.forEach(nav => {
            const buttons = nav.querySelectorAll('a[href$=".md"]');
            buttons.forEach(btn => {
                const originalHref = btn.getAttribute('href');
                const newHref = convertMdToHtml(originalHref);
                if (newHref !== originalHref) {
                    btn.setAttribute('href', newHref);
                    console.log('Lesson Nav: Converted .md to .html:', originalHref, '->', newHref);
                }
            });
        });
    }

    /**
     * Update existing navigation with dynamic links
     */
    function updateNavigation() {
        const links = extractNavLinks();
        if (links.length === 0) {
            console.warn('Lesson Nav: No navigation links found');
            // Still apply .md to .html fallback
            applyMdToHtmlFallback();
            return;
        }

        const currentIndex = findCurrentPageIndex(links);
        if (currentIndex === -1) {
            console.warn('Lesson Nav: Current page not found in navigation');
            // Still apply .md to .html fallback
            applyMdToHtmlFallback();
            return;
        }

        const prevLink = currentIndex > 0 ? links[currentIndex - 1] : null;
        const nextLink = currentIndex < links.length - 1 ? links[currentIndex + 1] : null;

        // Find all lesson-nav elements and update them
        const navElements = document.querySelectorAll(`.${LESSON_NAV_CLASS}`);

        navElements.forEach(nav => {
            // Skip if already auto-generated
            if (nav.classList.contains(AUTO_NAV_CLASS)) return;

            const timeEstimate = getExistingTimeEstimate(nav);

            // Update prev link
            const prevBtn = nav.querySelector('.nav-prev');
            if (prevBtn && prevLink) {
                // Use the original href from the sidebar for real navigation.
                prevBtn.href = prevLink.href;
                // Preserve arrow icon structure
                prevBtn.innerHTML = `← ${prevLink.title}`;
            } else if (prevBtn && !prevLink) {
                prevBtn.classList.add('nav-disabled');
                prevBtn.removeAttribute('href');
                prevBtn.innerHTML = '';
            }

            // Update next link
            const nextBtn = nav.querySelector('.nav-next');
            if (nextBtn && nextLink) {
                // Use the original href from the sidebar for real navigation.
                nextBtn.href = nextLink.href;
                // Preserve arrow icon structure
                nextBtn.innerHTML = `${nextLink.title} →`;
            } else if (nextBtn && !nextLink) {
                nextBtn.classList.add('nav-disabled');
                nextBtn.removeAttribute('href');
                nextBtn.innerHTML = '';
            }

            // Mark as updated
            nav.classList.add('nav-updated');
        });

        // If no nav elements exist, create one at the bottom
        if (navElements.length === 0) {
            const content = document.querySelector('.md-content__inner');
            if (content) {
                const nav = createNavElement(prevLink, nextLink, null);
                content.appendChild(nav);
            }
        }

        console.log('Lesson Nav: Updated navigation', {
            current: links[currentIndex]?.title,
            prev: prevLink?.title,
            next: nextLink?.title
        });
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    function init() {
        // Wait a bit for MkDocs to fully render navigation
        setTimeout(updateNavigation, 100);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Handle MkDocs Material instant navigation
    if (typeof document$ !== 'undefined') {
        document$.subscribe(function() {
            setTimeout(updateNavigation, 100);
        });
    }

    // Export for external access
    window.LessonNav = {
        update: updateNavigation,
        getLinks: extractNavLinks
    };

})();
