/**
 * Course Switcher for MkDocs Material Theme
 * @version 2.0.0
 *
 * Loads track configuration from courses/tracks.json (SSOT)
 * Implements multi-track navigation with automatic track detection.
 */

(function() {
    'use strict';

    // ========================================================================
    // CONFIGURATION - Loaded from tracks.json
    // ========================================================================

    let TRACKS = {};
    let STORAGE_KEY = 'cit_course_track';
    let DEFAULT_TRACK = 'basics';
    let _configLoaded = false;

    // ========================================================================
    // STATE
    // ========================================================================

    let _currentTrack = null;
    let _switcherElement = null;
    let _initialized = false;
    let _dropdownOpen = false;
    let _clickOutsideHandler = null;

    // ========================================================================
    // CONFIGURATION LOADING
    // ========================================================================

    /**
     * Get the base URL for the site (handles subdirectory deployments)
     */
    function getBaseUrl() {
        // Try to get base from <base> element (set by MkDocs)
        const baseElement = document.querySelector('base[href]');
        if (baseElement) {
            return baseElement.getAttribute('href').replace(/\/$/, '');
        }

        // Try to detect from canonical link
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            try {
                const url = new URL(canonical.getAttribute('href'));
                // Extract path without the current page
                const path = url.pathname.replace(/\/[^\/]*\.html$/, '').replace(/\/[^\/]*\/$/, '');
                return url.origin + path;
            } catch (e) {}
        }

        // Fallback: use current origin
        return window.location.origin;
    }

    /**
     * Load track configuration from JSON file
     */
    async function loadTracksConfig() {
        if (_configLoaded) return true;

        try {
            const baseUrl = getBaseUrl();

            // Try multiple paths for different environments
            const paths = [
                baseUrl + '/courses/tracks.json',
                './courses/tracks.json',
                '../courses/tracks.json',
                '/courses/tracks.json',
                'courses/tracks.json'
            ];

            let config = null;
            for (const path of paths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        config = await response.json();
                        console.log('Course Switcher: Loaded config from', path);
                        break;
                    }
                } catch (e) {
                    // Try next path
                }
            }

            if (!config) {
                console.warn('Course Switcher: Could not load tracks.json from any path, using fallback');
                console.warn('Course Switcher: Tried paths:', paths);
                return false;
            }

            // Apply configuration
            TRACKS = config.tracks || {};
            if (config.defaults) {
                STORAGE_KEY = config.defaults.storageKey || STORAGE_KEY;
                DEFAULT_TRACK = config.defaults.defaultTrack || DEFAULT_TRACK;
            }

            // Convert navPatterns to patterns for backward compatibility
            for (const [id, track] of Object.entries(TRACKS)) {
                track.patterns = track.navPatterns || [];
            }

            console.log('Course Switcher: Loaded', Object.keys(TRACKS).length, 'tracks:', Object.keys(TRACKS));
            _configLoaded = true;
            return true;

        } catch (error) {
            console.error('Course Switcher: Error loading config:', error);
            return false;
        }
    }

    /**
     * Fallback configuration if JSON fails to load
     */
    function useFallbackConfig() {
        if (_configLoaded) return;

        console.log('Course Switcher: Using embedded fallback config');

        TRACKS = {
            basics: {
                id: 'basics',
                label: 'Python Basics I',
                displayName: '🐢 Python Basics I',
                icon: '🐢',
                patterns: ['시작', '1. 🐢', '2. 🎨', '3. 🧙', '4. 🐢', '5. ♾️', '6. 🎆', '7. 🐢', '8. 🌌'],
                urlPatterns: ['/pre_basics/intro', '/pre_basics/01_turtle/', '/pre_basics/02_colors/', '/pre_basics/03_range/', '/pre_basics/04_loop/', '/pre_basics/05_variable_i/', '/pre_basics/07_functions/', '/pre_basics/06_spiral/'],
                hideHome: true
            },
            visual: {
                id: 'visual',
                label: 'Visual Python 3D',
                displayName: '🎮 Visual Python 3D',
                icon: '🎮',
                patterns: ['1. 시작하기', '2. 제어문', '3. 데이터', '4. 중첩', '5. 함수', '6. 클래스', '7. 2D 배열', '8. 고급'],
                urlPatterns: ['/one_basics/', '/two_flow/', '/three_ursina/', '/four_data/', '/five_functions/', '/six_classes/', '/seven_2d/', '/eight_advanced/'],
                hideHome: false
            },
            basics2: {
                id: 'basics2',
                label: 'Python Basics II',
                displayName: '🐍 Python Basics II',
                icon: '🐍',
                patterns: ['1. 🖨️', '2. 🧱', '3. ➗', '4. ⚖️', '5. 🧠', '6. 🔁', '7. 🧭', '8. 📝', '9. ⌨️', '10. 🛠️', '11. 🐢'],
                urlPatterns: ['/pre_basics/00_python_basics/01_print/', '/pre_basics/00_python_basics/02_datatypes/', '/turtle_grader_test'],
                hideHome: true
            },
            problems: {
                id: 'problems',
                label: 'Python 문제풀이',
                displayName: '📐 Python 문제풀이',
                icon: '📐',
                patterns: ['Python 문제풀이'],
                urlPatterns: ['/pre_basics/07_shape_quiz/', '/pre_basics/08_text_exercises/'],
                hideHome: true
            },
            dataviz: {
                id: 'dataviz',
                label: '데이터와 시각화 I',
                displayName: '📊 데이터와 시각화 I',
                icon: '📊',
                patterns: ['1. 📊 거북이', '2. 📋 리스트', '3. 🎨 Matplotlib', '4. 🎵 음악', '5. 👟 스니커봇'],
                urlPatterns: ['/data_viz/01_', '/data_viz/02_', '/data_viz/04_', '/data_viz/05_', '/data_viz/06_'],
                hideHome: true
            },
            dataviz2: {
                id: 'dataviz2',
                label: '데이터와 시각화 II',
                displayName: '📈 데이터와 시각화 II',
                icon: '📈',
                patterns: ['0. 🗺️ 지도', '1. 🐼 pandas', '2. 👽 UFO', '3. 🎮 포켓몬', '4. 🎬 할리우드'],
                urlPatterns: ['/pre_basics/09_maps/', '/data_viz/pandas_intro/', '/data_viz/07_', '/data_viz/08_', '/data_viz/09_'],
                hideHome: true
            }
        };

        _configLoaded = true;
    }

    // ========================================================================
    // UTILITY FUNCTIONS
    // ========================================================================

    /**
     * Get stored track preference or detect from URL
     * @returns {{ trackId: string, source: 'url'|'storage'|'default' }}
     */
    function getInitialTrack() {
        const path = window.location.pathname;

        for (const [trackId, track] of Object.entries(TRACKS)) {
            for (const pattern of (track.urlPatterns || [])) {
                if (path.includes(pattern)) {
                    return { trackId, source: 'url' };
                }
            }
        }

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && TRACKS[stored]) {
            return { trackId: stored, source: 'storage' };
        }

        return { trackId: DEFAULT_TRACK, source: 'default' };
    }

    /**
     * Save track preference
     */
    function saveTrackPreference(trackId) {
        localStorage.setItem(STORAGE_KEY, trackId);
    }

    /**
     * Get track ID from nav label
     */
    function getTrackFromNavLabel(navLabel) {
        for (const [trackId, track] of Object.entries(TRACKS)) {
            if ((track.patterns || []).some(pattern => navLabel.startsWith(pattern))) {
                return trackId;
            }
        }
        return null;
    }

    /**
     * Get the first lesson URL for a given track
     */
    function getFirstLessonUrl(trackId) {
        const track = TRACKS[trackId];
        if (!track) return null;

        const navItems = document.querySelectorAll('.md-nav--primary > .md-nav__list > .md-nav__item');

        for (const item of navItems) {
            const label = item.querySelector('.md-nav__link')?.textContent?.trim() || '';

            if ((track.patterns || []).some(pattern => label.startsWith(pattern))) {
                const directLink = item.querySelector(':scope > .md-nav__link[href]');
                if (directLink) {
                    const href = directLink.getAttribute('href');
                    if (href && href !== '#') return href;
                }

                const nestedLink = item.querySelector('.md-nav__list .md-nav__link[href]');
                if (nestedLink) {
                    const href = nestedLink.getAttribute('href');
                    if (href && href !== '#') return href;
                }
            }
        }

        return null;
    }

    // ========================================================================
    // DOM MANIPULATION
    // ========================================================================

    /**
     * Create the Course Switcher UI element (Dropdown)
     */
    function createSwitcherElement() {
        const container = document.createElement('div');
        container.className = 'course-switcher';

        const trackCount = Object.keys(TRACKS).length;
        console.log('Course Switcher: Creating dropdown with', trackCount, 'tracks');

        const currentTrack = TRACKS[_currentTrack] || TRACKS[DEFAULT_TRACK] || Object.values(TRACKS)[0];

        container.innerHTML = `
            <label class="dropdown-label">Current Course:</label>
            <div class="course-dropdown">
                <button class="dropdown-trigger" aria-expanded="false" aria-haspopup="listbox" aria-label="Select course track">
                    <span class="dropdown-trigger-text">${currentTrack?.displayName || 'Select Course'}</span>
                    <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6,9 12,15 18,9" />
                    </svg>
                </button>
                <div class="dropdown-menu" role="listbox" style="display: none;">
                    ${Object.entries(TRACKS).map(([id, track]) => `
                        <button class="dropdown-option" data-track="${id}" role="option" aria-selected="${id === _currentTrack}">
                            ${track.displayName}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        const trigger = container.querySelector('.dropdown-trigger');
        const menu = container.querySelector('.dropdown-menu');
        const chevron = container.querySelector('.chevron-icon');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });

        container.querySelectorAll('.dropdown-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const trackId = option.dataset.track;
                setActiveTrack(trackId, false);
                closeDropdown();
            });
        });

        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                if (!_dropdownOpen) openDropdown();
                else focusFirstOption();
            } else if (e.key === 'Escape' && _dropdownOpen) {
                e.preventDefault();
                closeDropdown();
            }
        });

        menu.addEventListener('keydown', (e) => {
            const options = Array.from(menu.querySelectorAll('.dropdown-option'));
            const currentIndex = options.findIndex(opt => opt === document.activeElement);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    options[(currentIndex + 1) % options.length].focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    options[(currentIndex - 1 + options.length) % options.length].focus();
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (document.activeElement.classList.contains('dropdown-option')) {
                        setActiveTrack(document.activeElement.dataset.track, false);
                        closeDropdown();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    closeDropdown();
                    trigger.focus();
                    break;
            }
        });

        if (_clickOutsideHandler) {
            document.removeEventListener('click', _clickOutsideHandler);
        }
        _clickOutsideHandler = function(e) {
            if (_dropdownOpen && !container.contains(e.target)) {
                closeDropdown();
            }
        };
        document.addEventListener('click', _clickOutsideHandler);

        function toggleDropdown() {
            _dropdownOpen ? closeDropdown() : openDropdown();
        }

        function openDropdown() {
            _dropdownOpen = true;
            menu.style.display = 'block';
            trigger.setAttribute('aria-expanded', 'true');
            chevron.classList.add('open');
            focusFirstOption();
        }

        function closeDropdown() {
            _dropdownOpen = false;
            menu.style.display = 'none';
            trigger.setAttribute('aria-expanded', 'false');
            chevron.classList.remove('open');
        }

        function focusFirstOption() {
            const firstOption = menu.querySelector('.dropdown-option');
            if (firstOption) firstOption.focus();
        }

        return container;
    }

    /**
     * Insert switcher into the sidebar
     * @param {boolean} forceRecreate - Force recreation of the switcher
     */
    function insertSwitcher(forceRecreate = false) {
        const sidebar = document.querySelector('.md-sidebar--primary .md-sidebar__inner');
        if (!sidebar) {
            console.warn('Course Switcher: Sidebar not found');
            return false;
        }

        const existingSwitcher = sidebar.querySelector('.course-switcher');

        // If exists and not forcing recreate, just reuse
        if (existingSwitcher && !forceRecreate) {
            _switcherElement = existingSwitcher;
            return true;
        }

        // Remove existing if forcing recreate
        if (existingSwitcher) {
            existingSwitcher.remove();
        }

        _switcherElement = createSwitcherElement();
        sidebar.insertBefore(_switcherElement, sidebar.firstChild);
        return true;
    }

    /**
     * Update dropdown display and option states
     */
    function updateSwitcherTabs(activeTrackId) {
        if (!_switcherElement) return;

        const currentTrack = TRACKS[activeTrackId];
        if (!currentTrack) return;

        const triggerText = _switcherElement.querySelector('.dropdown-trigger-text');
        if (triggerText) {
            triggerText.textContent = currentTrack.displayName;
        }

        _switcherElement.querySelectorAll('.dropdown-option').forEach(option => {
            const isActive = option.dataset.track === activeTrackId;
            option.classList.toggle('active', isActive);
            option.setAttribute('aria-selected', isActive);
        });
    }

    /**
     * Filter navigation items based on active track
     */
    function filterNavigation(trackId) {
        const track = TRACKS[trackId];
        const navItems = document.querySelectorAll('.md-nav--primary > .md-nav__list > .md-nav__item');

        navItems.forEach(item => {
            const label = item.querySelector('.md-nav__link')?.textContent?.trim() || '';

            if (label === '홈') {
                if (track && track.hideHome) {
                    item.style.display = 'none';
                    item.classList.add('nav-hidden');
                } else {
                    item.style.display = '';
                    item.classList.remove('nav-hidden');
                }
                return;
            }

            const itemTrack = getTrackFromNavLabel(label);

            if (itemTrack === trackId) {
                item.style.display = '';
                item.classList.remove('nav-hidden');
            } else if (itemTrack !== null) {
                item.style.display = 'none';
                item.classList.add('nav-hidden');
            } else {
                item.style.display = '';
            }
        });
    }

    /**
     * Update breadcrumb to include track name
     */
    function updateBreadcrumb(trackId) {
        const track = TRACKS[trackId];
        if (!track) return;

        const headerTitle = document.querySelector('.md-header__title');
        if (!headerTitle) return;

        let trackIndicator = headerTitle.querySelector('.track-indicator');
        if (!trackIndicator) {
            trackIndicator = document.createElement('span');
            trackIndicator.className = 'track-indicator';
            headerTitle.insertBefore(trackIndicator, headerTitle.firstChild);
        }

        trackIndicator.innerHTML = `<span class="track-badge">${track.icon} ${track.label}</span>`;
    }

    // ========================================================================
    // MAIN FUNCTIONS
    // ========================================================================

    /**
     * Set the active track
     * @param {string} trackId - Track to activate
     * @param {boolean} navigate - Whether to navigate to the track's first lesson
     * @param {boolean} persist - Whether to save the preference to localStorage
     */
    function setActiveTrack(trackId, navigate = false, persist = true) {
        if (!TRACKS[trackId]) {
            console.warn('Course Switcher: Invalid track ID:', trackId);
            return;
        }

        const previousTrack = _currentTrack;
        _currentTrack = trackId;
        if (persist) {
            saveTrackPreference(trackId);
        }

        updateSwitcherTabs(trackId);
        filterNavigation(trackId);
        updateBreadcrumb(trackId);

        document.dispatchEvent(new CustomEvent('trackChange', {
            detail: { trackId, track: TRACKS[trackId], previousTrack }
        }));

        if (navigate && previousTrack !== trackId) {
            const firstLessonUrl = getFirstLessonUrl(trackId);
            if (firstLessonUrl) {
                console.log('Course Switcher: Navigating to first lesson:', firstLessonUrl);
                window.location.href = firstLessonUrl;
            }
        }
    }

    /**
     * Initialize the Course Switcher
     */
    async function init() {
        // Always ensure config is loaded first
        if (!_configLoaded) {
            const loaded = await loadTracksConfig();
            if (!loaded) {
                useFallbackConfig();
            }
            console.log('Course Switcher: Config loaded, tracks:', Object.keys(TRACKS));
        }

        if (_initialized) {
            filterNavigation(_currentTrack);
            updateSwitcherTabs(_currentTrack);
            return;
        }

        // Force recreate switcher to ensure all tracks are shown
        if (!insertSwitcher(true)) {
            setTimeout(init, 100);
            return;
        }

        const initial = getInitialTrack();
        _currentTrack = initial.trackId;
        setActiveTrack(_currentTrack, false, initial.source !== 'url');

        _initialized = true;
        console.log('Course Switcher: Initialized with track:', _currentTrack, '(source:', initial.source + ')');
    }

    /**
     * Re-initialize on instant navigation
     */
    function reinit() {
        const path = window.location.pathname;
        let urlIndicatesTrack = null;

        for (const [trackId, track] of Object.entries(TRACKS)) {
            for (const pattern of (track.urlPatterns || [])) {
                if (path.includes(pattern)) {
                    urlIndicatesTrack = trackId;
                    break;
                }
            }
            if (urlIndicatesTrack) break;
        }

        if (urlIndicatesTrack && urlIndicatesTrack !== _currentTrack) {
            _currentTrack = urlIndicatesTrack;
            // Don't persist URL-detected tracks to localStorage
        }

        _dropdownOpen = false;

        // Check if switcher was removed (e.g., by instant navigation DOM replacement)
        const sidebar = document.querySelector('.md-sidebar--primary .md-sidebar__inner');
        const existingSwitcher = sidebar?.querySelector('.course-switcher');
        const needsRecreate = !existingSwitcher || (_switcherElement && !sidebar?.contains(_switcherElement));

        insertSwitcher(needsRecreate);
        updateSwitcherTabs(_currentTrack);
        filterNavigation(_currentTrack);
        updateBreadcrumb(_currentTrack);
    }

    // ========================================================================
    // EVENT LISTENERS
    // ========================================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    if (typeof document$ !== 'undefined') {
        document$.subscribe(function() { reinit(); });
    } else {
        window.addEventListener('popstate', reinit);
    }

    // Export for external access
    window.CourseSwitcher = {
        setTrack: setActiveTrack,
        getTrack: () => _currentTrack,
        getTracks: () => TRACKS,
        reload: init
    };

})();
