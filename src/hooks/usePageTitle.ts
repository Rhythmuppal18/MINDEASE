import { useEffect } from 'react';

/** Updates document.title per page with the MindEase suffix. */
export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — MindEase` : 'MindEase';
    return () => {
      document.title = prev;
    };
  }, [title]);
}
