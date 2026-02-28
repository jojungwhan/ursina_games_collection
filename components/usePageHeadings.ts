/**
 * Custom React Hook to Extract Page Headings (H2/H3)
 * 
 * Scans the rendered content area for H2 and H3 elements,
 * extracts their text and IDs, and maintains hierarchy.
 */

import { useState, useEffect } from 'react';

export interface PageHeading {
  id: string;
  text: string;
  level: 2 | 3;
  element: HTMLElement;
}

/**
 * Generate a URL-friendly ID from heading text
 */
function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract headings from the content area
 */
function extractHeadings(): PageHeading[] {
  const contentArea = document.querySelector('.content-area');
  if (!contentArea) return [];

  const headings = contentArea.querySelectorAll('h2, h3');
  const result: PageHeading[] = [];

  headings.forEach((heading) => {
    const element = heading as HTMLElement;
    const text = element.textContent?.trim() || '';
    if (!text) return;

    // Use existing ID or generate one
    let id = element.id;
    if (!id) {
      id = generateHeadingId(text);
      element.id = id;
    }

    const level = heading.tagName === 'H2' ? 2 : 3;
    result.push({
      id,
      text,
      level,
      element,
    });
  });

  return result;
}

/**
 * Hook to get page headings
 * Re-runs when currentPath changes or content is updated
 */
export function usePageHeadings(currentPath: string): PageHeading[] {
  const [headings, setHeadings] = useState<PageHeading[]>([]);

  useEffect(() => {
    // Wait for content to be rendered
    const timeoutId = setTimeout(() => {
      const extracted = extractHeadings();
      setHeadings(extracted);
    }, 100);

    // Also listen for content changes (e.g., dynamic content loading)
    const observer = new MutationObserver(() => {
      const extracted = extractHeadings();
      setHeadings(extracted);
    });

    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      observer.observe(contentArea, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [currentPath]);

  return headings;
}
