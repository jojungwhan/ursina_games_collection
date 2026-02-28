/**
 * Components Index
 * Export all navigation components and utilities
 */

// Components
export { default as Sidebar, sidebarStyles } from './Sidebar';
export { default as Layout, layoutStyles } from './Layout';

// Data and utilities
export { curriculum, getTrackById, getTrackFromUrl, getNavigationStateFromUrl } from './curriculum';

// Types
export type {
  ChapterItem,
  SubSection,
  Chapter,
  Track,
  Curriculum,
  TrackId,
  NavigationState,
  BreadcrumbItem,
} from './types';
