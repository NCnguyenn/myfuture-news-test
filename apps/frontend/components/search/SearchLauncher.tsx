'use client';

import { useEffect, useRef, useState } from 'react';
import { SearchOverlay } from './SearchOverlay';
import styles from './SearchOverlay.module.css';

export function SearchLauncher() {
  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  function closeSearch() {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className={styles.launcher}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m21 21-4.35-4.35m2.35-5.4A7.75 7.75 0 1 1 3.5 11.25a7.75 7.75 0 0 1 15.5 0Z" />
        </svg>
        <span>Tìm kiếm</span>
        <kbd>Ctrl K</kbd>
      </button>
      {open ? <SearchOverlay onClose={closeSearch} /> : null}
    </>
  );
}
