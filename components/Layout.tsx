/**
 * Layout Component with Breadcrumb Navigation
 *
 * Features:
 * - Responsive layout with sidebar and main content
 * - Dynamic breadcrumb based on current track and chapter
 * - Mobile-friendly navigation toggle
 */

import React, { useState, useMemo } from 'react';
import Sidebar from './Sidebar';
import { curriculum, getNavigationStateFromUrl, getTrackById } from './curriculum';
import { BreadcrumbItem, TrackId } from './types';

// Icons
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const ChevronRightSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,6 15,12 9,18" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ============================================================================
// BREADCRUMB COMPONENT
// ============================================================================

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {index > 0 && (
              <span className="breadcrumb-separator">
                <ChevronRightSmall />
              </span>
            )}
            {item.href ? (
              <a href={item.href} className="breadcrumb-link">
                {index === 0 && <HomeIcon />}
                <span>{item.label}</span>
              </a>
            ) : (
              <span className="breadcrumb-current">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// ============================================================================
// BREADCRUMB GENERATOR
// ============================================================================

function generateBreadcrumbs(currentPath: string): BreadcrumbItem[] {
  const navState = getNavigationStateFromUrl(currentPath);
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];

  if (!navState) return items;

  const track = getTrackById(navState.trackId);
  if (!track) return items;

  // Add track name
  items.push({
    label: track.shortTitle,
    href: track.id === 'track_basics' ? '/pre_basics/' : '/one_basics/',
  });

  // Add chapter if present
  if (navState.chapterId !== null) {
    const chapter = track.chapters.find(c => c.id === navState.chapterId);
    if (chapter) {
      // Get first item href from chapter as chapter link
      const firstSection = chapter.sections[0];
      const firstItem = firstSection?.items[0];
      items.push({
        label: chapter.title,
        href: firstItem?.href,
      });

      // Add section if present
      if (navState.sectionId) {
        const section = chapter.sections.find(s => s.id === navState.sectionId);
        if (section) {
          const sectionFirstItem = section.items[0];
          items.push({
            label: section.title,
            href: sectionFirstItem?.href,
          });

          // Add current item (no href - it's the current page)
          if (navState.itemId) {
            const item = section.items.find(i => i.id === navState.itemId);
            if (item) {
              items.push({
                label: item.title,
              });
            }
          }
        }
      }
    }
  }

  return items;
}

// ============================================================================
// MAIN LAYOUT COMPONENT
// ============================================================================

interface LayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPath = '' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const breadcrumbItems = useMemo(() => {
    return generateBreadcrumbs(currentPath);
  }, [currentPath]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button
          className="menu-toggle"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        <div className="mobile-title">Python Learning</div>
      </header>

      {/* Sidebar Overlay (mobile) */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar currentPath={currentPath} />
      </div>

      {/* Main Content */}
      <main className="main-content">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Content */}
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

// ============================================================================
// STYLES
// ============================================================================

export const layoutStyles = `
  .layout {
    display: flex;
    min-height: 100vh;
  }

  /* Mobile Header */
  .mobile-header {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 56px;
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 0 16px;
    align-items: center;
    gap: 12px;
    z-index: 100;
  }

  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    color: #374151;
  }

  .menu-toggle:hover {
    background-color: #f3f4f6;
  }

  .mobile-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  /* Sidebar Container */
  .sidebar-container {
    flex-shrink: 0;
  }

  .sidebar-overlay {
    display: none;
  }

  /* Main Content */
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  /* Breadcrumb */
  .breadcrumb {
    padding: 12px 24px;
    background-color: #fafafa;
    border-bottom: 1px solid #e5e7eb;
  }

  .breadcrumb-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .breadcrumb-separator {
    display: flex;
    align-items: center;
    color: #9ca3af;
  }

  .breadcrumb-link {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #6b7280;
    text-decoration: none;
    font-size: 13px;
    transition: color 0.15s ease;
  }

  .breadcrumb-link:hover {
    color: #4f46e5;
  }

  .breadcrumb-current {
    color: #1f2937;
    font-size: 13px;
    font-weight: 500;
  }

  /* Content Area */
  .content-area {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .mobile-header {
      display: flex;
    }

    .layout {
      padding-top: 56px;
    }

    .sidebar-container {
      position: fixed;
      top: 56px;
      left: 0;
      bottom: 0;
      width: 280px;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: 90;
      background-color: white;
    }

    .sidebar-container.open {
      transform: translateX(0);
    }

    .sidebar-overlay {
      display: block;
      position: fixed;
      top: 56px;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 80;
    }

    .breadcrumb {
      padding: 12px 16px;
    }

    .content-area {
      padding: 16px;
    }
  }
`;
