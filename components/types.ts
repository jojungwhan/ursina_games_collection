/**
 * Navigation Types for Course-based Learning Platform
 */

export interface ChapterItem {
  id: string;
  title: string;
  href: string;
}

export interface SubSection {
  id: string;
  title: string;
  items: ChapterItem[];
}

export interface Chapter {
  id: number;
  title: string;
  sections: SubSection[];
}

export interface Track {
  id: string;
  title: string;
  shortTitle: string;
  chapters: Chapter[];
}

export interface Curriculum {
  tracks: Track[];
}

export type TrackId = 'track_basics' | 'track_visual';

export interface NavigationState {
  activeTrack: TrackId;
  activeChapterId: number | null;
  activeSectionId: string | null;
  activeItemId: string | null;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeading {
  id: string;
  text: string;
  level: 2 | 3;
  element: HTMLElement;
}
