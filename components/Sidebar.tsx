/**
 * Sidebar Component with Course Track Switcher
 *
 * Features:
 * - Two-track navigation (Python Basics / Visual Coding)
 * - Segmented control for track switching
 * - Accordion-style chapter expansion
 * - Active item highlighting
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { curriculum, getTrackFromUrl, getNavigationStateFromUrl } from './curriculum';
import { TrackId, Track, Chapter, SubSection, ChapterItem, PageHeading } from './types';
import { usePageHeadings } from './usePageHeadings';

// Icons (inline SVG components)
const ChevronDown = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const ChevronRight = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,6 15,12 9,18" />
  </svg>
);

// ============================================================================
// COURSE SWITCHER COMPONENT
// ============================================================================

interface CourseSwitcherProps {
  activeTrack: TrackId;
  onTrackChange: (trackId: TrackId) => void;
}

const CourseSwitcher: React.FC<CourseSwitcherProps> = ({ activeTrack, onTrackChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tracks = curriculum.tracks;

  // Track display names mapping
  const trackDisplayNames: Record<TrackId, string> = {
    track_basics: '🐢 Python Basics (1~4시간)',
    track_visual: '🎮 Visual Python (12~36시간)',
  };

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
    setFocusedIndex(-1);
  }, []);

  // Handle track selection
  const handleSelect = useCallback((trackId: TrackId) => {
    onTrackChange(trackId);
    setIsOpen(false);
    setFocusedIndex(-1);
  }, [onTrackChange]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setFocusedIndex(-1);
      return;
    }

    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => (prev < tracks.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < tracks.length) {
          handleSelect(tracks[focusedIndex].id as TrackId);
        }
        break;
    }
  }, [isOpen, focusedIndex, tracks, handleSelect]);

  // Update focused index when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const activeIndex = tracks.findIndex(t => t.id === activeTrack);
      setFocusedIndex(activeIndex >= 0 ? activeIndex : 0);
    }
  }, [isOpen, activeTrack, tracks]);

  return (
    <div className="course-switcher">
      <label className="dropdown-label">Current Course:</label>
      <div className="course-dropdown" ref={dropdownRef}>
        <button
          className="dropdown-trigger"
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Select course track"
        >
          <span className="dropdown-trigger-text">{trackDisplayNames[activeTrack]}</span>
          <ChevronDown className={`chevron-icon ${isOpen ? 'open' : ''}`} />
        </button>
        {isOpen && (
          <div className="dropdown-menu" role="listbox">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                className={`dropdown-option ${activeTrack === track.id ? 'active' : ''} ${focusedIndex === index ? 'focused' : ''}`}
                onClick={() => handleSelect(track.id as TrackId)}
                role="option"
                aria-selected={activeTrack === track.id}
              >
                {trackDisplayNames[track.id as TrackId]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// NAVIGATION ITEM COMPONENT
// ============================================================================

interface NavItemProps {
  item: ChapterItem;
  isActive: boolean;
  onClick?: () => void;
  pageHeadings?: PageHeading[];
  activeHeadingId?: string | null;
  currentPath?: string;
}

const NavItem: React.FC<NavItemProps> = ({ 
  item, 
  isActive, 
  onClick,
  pageHeadings = [],
  activeHeadingId = null,
  currentPath = '',
}) => {
  const hasHeadings = isActive && pageHeadings.length > 0;

  return (
    <>
      <a
        href={item.href}
        className={`nav-item ${isActive ? 'active' : ''}`}
        onClick={onClick}
      >
        <span className="nav-item-title">{item.title}</span>
      </a>
      {hasHeadings && (
        <div className="nav-sub-items">
          {pageHeadings.map((heading) => {
            // Ensure proper URL format (handle trailing slash)
            const baseHref = item.href.endsWith('/') ? item.href.slice(0, -1) : item.href;
            const href = `${baseHref}#${heading.id}`;
            const isHeadingActive = activeHeadingId === heading.id;
            const indentClass = heading.level === 3 ? 'nav-sub-item-level-3' : 'nav-sub-item-level-2';
            
            return (
              <a
                key={heading.id}
                href={href}
                className={`nav-sub-item ${indentClass} ${isHeadingActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  const targetElement = document.getElementById(heading.id);
                  if (targetElement) {
                    targetElement.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    });
                    // Update URL hash without reload
                    window.history.pushState(null, '', href);
                  }
                }}
              >
                <span className="nav-sub-item-title">{heading.text}</span>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
};

// ============================================================================
// SECTION COMPONENT (SUBSECTIONS WITHIN CHAPTERS)
// ============================================================================

interface SectionProps {
  section: SubSection;
  activeItemId: string | null;
  isExpanded: boolean;
  onToggle: () => void;
}

interface SectionPropsExtended extends SectionProps {
  pageHeadings?: PageHeading[];
  activeHeadingId?: string | null;
  currentPath?: string;
}

const Section: React.FC<SectionPropsExtended> = ({ 
  section, 
  activeItemId, 
  isExpanded, 
  onToggle,
  pageHeadings = [],
  activeHeadingId = null,
  currentPath = '',
}) => {
  const hasActiveItem = section.items.some(item => item.id === activeItemId);

  return (
    <div className={`nav-section ${hasActiveItem ? 'has-active' : ''}`}>
      <button
        className={`section-header ${isExpanded ? 'expanded' : ''}`}
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <span className="section-icon">
          {isExpanded ? <ChevronDown /> : <ChevronRight />}
        </span>
        <span className="section-title">{section.title}</span>
      </button>

      {isExpanded && (
        <div className="section-items">
          {section.items.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={item.id === activeItemId}
              pageHeadings={pageHeadings}
              activeHeadingId={activeHeadingId}
              currentPath={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CHAPTER ACCORDION COMPONENT
// ============================================================================

interface ChapterAccordionProps {
  chapter: Chapter;
  isExpanded: boolean;
  activeItemId: string | null;
  activeSectionId: string | null;
  onToggle: () => void;
  pageHeadings?: PageHeading[];
  activeHeadingId?: string | null;
  currentPath?: string;
}

const ChapterAccordion: React.FC<ChapterAccordionProps> = ({
  chapter,
  isExpanded,
  activeItemId,
  activeSectionId,
  onToggle,
  pageHeadings = [],
  activeHeadingId = null,
  currentPath = '',
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Auto-expand section containing active item
  useEffect(() => {
    if (activeSectionId && isExpanded) {
      setExpandedSections(new Set([activeSectionId]));
    }
  }, [activeSectionId, isExpanded]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const hasActiveContent = chapter.sections.some(
    section => section.items.some(item => item.id === activeItemId)
  );

  return (
    <div className={`chapter-accordion ${hasActiveContent ? 'has-active' : ''}`}>
      <button
        className={`chapter-header ${isExpanded ? 'expanded' : ''}`}
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <span className="chapter-icon">
          {isExpanded ? <ChevronDown /> : <ChevronRight />}
        </span>
        <span className="chapter-title">{chapter.title}</span>
      </button>

      {isExpanded && (
        <div className="chapter-content">
          {chapter.sections.map((section) => (
            <Section
              key={section.id}
              section={section}
              activeItemId={activeItemId}
              isExpanded={expandedSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              pageHeadings={pageHeadings}
              activeHeadingId={activeHeadingId}
              currentPath={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN SIDEBAR COMPONENT
// ============================================================================

interface SidebarProps {
  currentPath?: string;
  onNavigate?: (href: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPath = '' }) => {
  // Determine initial track from current URL
  const initialState = useMemo(() => {
    const navState = getNavigationStateFromUrl(currentPath);
    return {
      trackId: (navState?.trackId || 'track_basics') as TrackId,
      chapterId: navState?.chapterId ?? null,
      sectionId: navState?.sectionId ?? null,
      itemId: navState?.itemId ?? null,
    };
  }, [currentPath]);

  const [activeTrack, setActiveTrack] = useState<TrackId>(initialState.trackId);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set(initialState.chapterId !== null ? [initialState.chapterId] : [])
  );
  const [activeItemId, setActiveItemId] = useState<string | null>(initialState.itemId);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(initialState.sectionId);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  // Extract page headings
  const pageHeadings = usePageHeadings(currentPath);

  // Get current track data
  const currentTrack = useMemo(() => {
    return curriculum.tracks.find(t => t.id === activeTrack);
  }, [activeTrack]);

  // Handle track change
  const handleTrackChange = useCallback((trackId: TrackId) => {
    setActiveTrack(trackId);
    // Reset expanded chapters when switching tracks
    setExpandedChapters(new Set());
  }, []);

  // Toggle chapter expansion (accordion behavior - only one open at a time)
  const toggleChapter = useCallback((chapterId: number) => {
    setExpandedChapters(prev => {
      if (prev.has(chapterId)) {
        return new Set();
      }
      return new Set([chapterId]);
    });
  }, []);

  // Update state when path changes
  useEffect(() => {
    const navState = getNavigationStateFromUrl(currentPath);
    if (navState) {
      setActiveTrack(navState.trackId as TrackId);
      if (navState.chapterId !== null) {
        setExpandedChapters(new Set([navState.chapterId]));
      }
      setActiveItemId(navState.itemId);
      setActiveSectionId(navState.sectionId);
    }
    // Reset active heading on path change
    setActiveHeadingId(null);
  }, [currentPath]);

  // Handle initial hash from URL
  useEffect(() => {
    if (pageHeadings.length === 0) return;

    // Check if URL has a hash that matches a heading
    const hash = window.location.hash.slice(1); // Remove #
    if (hash) {
      const matchingHeading = pageHeadings.find(h => h.id === hash);
      if (matchingHeading) {
        setActiveHeadingId(hash);
        // Scroll to the heading after a short delay to ensure content is rendered
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
        return;
      }
    }
  }, [pageHeadings]);

  // IntersectionObserver for scroll tracking
  useEffect(() => {
    if (pageHeadings.length === 0) return;

    const observerOptions = {
      rootMargin: '-100px 0px -66% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    };

    const headingElements = new Map<string, { element: HTMLElement; ratio: number }>();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        if (id) {
          headingElements.set(id, {
            element: entry.target as HTMLElement,
            ratio: entry.intersectionRatio,
          });
        }
      });

      // Find the heading with the highest intersection ratio
      let maxRatio = -1;
      let activeId: string | null = null;

      headingElements.forEach((data, id) => {
        if (data.ratio > maxRatio) {
          maxRatio = data.ratio;
          activeId = id;
        }
      });

      // Handle edge cases: top of page or no intersection
      if (maxRatio === 0 && headingElements.size > 0) {
        // Check if we're at the top of the page
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop < 200) {
          // Use first heading if near top
          activeId = pageHeadings[0]?.id || null;
        } else {
          // Find the last heading that's above viewport
          const sortedHeadings = [...pageHeadings].reverse();
          for (const heading of sortedHeadings) {
            const rect = heading.element.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
              activeId = heading.id;
              break;
            }
          }
        }
      }

      if (activeId !== activeHeadingId) {
        setActiveHeadingId(activeId);
      }
    }, observerOptions);

    // Observe all heading elements
    pageHeadings.forEach((heading) => {
      observer.observe(heading.element);
    });

    return () => {
      observer.disconnect();
      headingElements.clear();
    };
  }, [pageHeadings, activeHeadingId]);

  return (
    <aside className="sidebar" role="navigation" aria-label="Course Navigation">
      {/* Course Track Switcher */}
      <CourseSwitcher
        activeTrack={activeTrack}
        onTrackChange={handleTrackChange}
      />

      {/* Chapter Navigation */}
      <nav className="chapter-nav">
        {currentTrack?.chapters.map((chapter) => (
          <ChapterAccordion
            key={chapter.id}
            chapter={chapter}
            isExpanded={expandedChapters.has(chapter.id)}
            activeItemId={activeItemId}
            activeSectionId={activeSectionId}
            onToggle={() => toggleChapter(chapter.id)}
            pageHeadings={pageHeadings}
            activeHeadingId={activeHeadingId}
            currentPath={currentPath}
          />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

// ============================================================================
// STYLES (CSS-in-JS or can be extracted to CSS file)
// ============================================================================

export const sidebarStyles = `
  .sidebar {
    width: 280px;
    height: 100vh;
    overflow-y: auto;
    background-color: #fafafa;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
  }

  /* Course Switcher */
  .course-switcher {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
    padding: 12px;
  }

  .dropdown-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .course-dropdown {
    position: relative;
    width: 100%;
  }

  .dropdown-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: #1f2937;
    transition: all 0.2s ease;
    text-align: left;
  }

  .dropdown-trigger:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
  }

  .dropdown-trigger:focus {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
    border-color: #4f46e5;
  }

  .dropdown-trigger-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chevron-icon {
    flex-shrink: 0;
    margin-left: 8px;
    color: #6b7280;
    transition: transform 0.2s ease;
  }

  .chevron-icon.open {
    transform: rotate(180deg);
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 20;
    max-height: 200px;
    overflow-y: auto;
    animation: dropdownFadeIn 0.15s ease;
  }

  @keyframes dropdownFadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-option {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: #1f2937;
    text-align: left;
    transition: background-color 0.15s ease;
  }

  .dropdown-option:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  .dropdown-option:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  .dropdown-option:hover,
  .dropdown-option.focused {
    background-color: #f3f4f6;
  }

  .dropdown-option.active {
    background-color: #eef2ff;
    color: #4f46e5;
    font-weight: 600;
  }

  .dropdown-option:focus {
    outline: 2px solid #4f46e5;
    outline-offset: -2px;
  }

  /* Chapter Navigation */
  .chapter-nav {
    flex: 1;
    padding: 8px 0;
  }

  /* Chapter Accordion */
  .chapter-accordion {
    margin-bottom: 2px;
  }

  .chapter-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    text-align: left;
    transition: background-color 0.15s ease;
  }

  .chapter-header:hover {
    background-color: #f3f4f6;
  }

  .chapter-header.expanded {
    background-color: #e5e7eb;
  }

  .chapter-accordion.has-active > .chapter-header {
    color: #4f46e5;
  }

  .chapter-icon {
    flex-shrink: 0;
    color: #9ca3af;
    transition: transform 0.2s ease;
  }

  .chapter-content {
    padding-left: 8px;
  }

  /* Section */
  .nav-section {
    margin: 4px 0;
  }

  .section-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px 8px 24px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: #6b7280;
    text-align: left;
    transition: all 0.15s ease;
  }

  .section-header:hover {
    background-color: #f9fafb;
    color: #374151;
  }

  .section-header.expanded {
    color: #374151;
  }

  .nav-section.has-active > .section-header {
    color: #4f46e5;
  }

  .section-icon {
    flex-shrink: 0;
    color: #d1d5db;
  }

  .section-items {
    padding-left: 16px;
  }

  /* Navigation Item */
  .nav-item {
    display: block;
    padding: 6px 16px 6px 40px;
    font-size: 13px;
    color: #6b7280;
    text-decoration: none;
    border-radius: 4px;
    margin: 1px 8px;
    transition: all 0.15s ease;
  }

  .nav-item:hover {
    background-color: #f3f4f6;
    color: #374151;
  }

  .nav-item.active {
    background-color: #eef2ff;
    color: #4f46e5;
    font-weight: 500;
  }

  .nav-item-title {
    display: block;
    line-height: 1.4;
  }

  /* Nested Sub-Items (Page Headings) */
  .nav-sub-items {
    padding-left: 0;
    margin-top: 2px;
  }

  .nav-sub-item {
    display: block;
    padding: 4px 16px 4px 48px;
    font-size: 12px;
    color: #9ca3af;
    text-decoration: none;
    border-radius: 4px;
    margin: 1px 8px;
    transition: all 0.15s ease;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-sub-item-level-3 {
    padding-left: 64px;
    font-size: 11px;
  }

  .nav-sub-item:hover {
    background-color: #f3f4f6;
    color: #374151;
  }

  .nav-sub-item.active {
    background-color: #eef2ff;
    color: #4f46e5;
    font-weight: 500;
  }

  .nav-sub-item-title {
    display: block;
    line-height: 1.4;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar {
      width: 100%;
      height: auto;
      max-height: 50vh;
    }

    .dropdown-trigger {
      padding: 8px 10px;
      font-size: 12px;
    }

    .dropdown-option {
      padding: 8px 10px;
      font-size: 12px;
    }
  }
`;
