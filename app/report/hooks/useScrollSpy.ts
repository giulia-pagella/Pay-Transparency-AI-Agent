'use client';

import { useEffect, useMemo, useState, type RefObject } from 'react';

export function useScrollSpy<T extends HTMLElement>(
  sectionIds: string[],
  rootRef: RefObject<T | null>,
  fallbackSectionId = '',
): string {
  const sectionKey = useMemo(() => sectionIds.join('|'), [sectionIds]);
  const [activeSection, setActiveSection] = useState(fallbackSectionId || sectionIds[0] || '');

  useEffect(() => {
    setActiveSection((current) => {
      if (sectionIds.includes(current)) return current;
      return fallbackSectionId || sectionIds[0] || '';
    });
  }, [fallbackSectionId, sectionIds, sectionKey]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (intersecting[0]?.target.id) {
          setActiveSection(intersecting[0].target.id);
        }
      },
      {
        root,
        rootMargin: '-96px 0px -68% 0px',
        threshold: [0, 0.01, 0.1],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [rootRef, sectionIds, sectionKey]);

  return activeSection;
}
