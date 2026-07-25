'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ArticleListItem, ArticleListResponse } from '../../types/news';
import { splitSearchHighlight } from '../../lib/search-highlight';
import { NewsImage } from '../news/NewsImage';
import styles from './SearchOverlay.module.css';

type SearchOverlayProps = {
  onClose: () => void;
};

type SearchState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  results: ArticleListItem[];
  message?: string;
};

const copy = {
  guidance: 'Nhập ít nhất 2 ký tự để tìm trong toàn bộ Bản tin.',
  loading: 'Đang tìm những bài viết phù hợp…',
  empty: 'Chưa tìm thấy bài viết phù hợp với từ khóa này.',
  error: 'Tìm kiếm đang tạm thời gián đoạn. Vui lòng thử lại.',
};

function HighlightedText({ text, query }: { text: string; query: string }) {
  return splitSearchHighlight(text, query).map((segment, index) =>
    segment.highlighted ? (
      <mark key={`${segment.text}-${index}`}>{segment.text}</mark>
    ) : (
      <span key={`${segment.text}-${index}`}>{segment.text}</span>
    ),
  );
}

export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [state, setState] = useState<SearchState>({
    status: 'idle',
    results: [],
  });
  const trimmedQuery = query.trim();

  useEffect(() => {
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setState({ status: 'idle', results: [] });
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setState((current) => ({
        status: 'loading',
        results: current.results,
      }));
      try {
        const response = await fetch(
          `/api/news-search?q=${encodeURIComponent(trimmedQuery)}&limit=6`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`Search failed: ${response.status}`);
        const payload = (await response.json()) as ArticleListResponse;
        setState({ status: 'success', results: payload.data });
        setActiveIndex(payload.data.length > 0 ? 0 : -1);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState({ status: 'error', results: [], message: copy.error });
        setActiveIndex(-1);
      }
    }, 275);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [retryToken, trimmedQuery]);

  function openResult(article: ArticleListItem) {
    onClose();
    router.push(`/ban-tin/${article.slug}`);
  }

  function openAllResults() {
    if (trimmedQuery.length < 2) return;
    onClose();
    router.push(`/ban-tin/tim-kiem?q=${encodeURIComponent(trimmedQuery)}`);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selected = state.results[activeIndex];
    if (selected) {
      openResult(selected);
      return;
    }
    openAllResults();
  }

  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled])',
      ),
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === 'ArrowDown' && state.results.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % state.results.length);
      return;
    }
    if (event.key === 'ArrowUp' && state.results.length > 0) {
      event.preventDefault();
      setActiveIndex(
        (current) =>
          (current - 1 + state.results.length) % state.results.length,
      );
      return;
    }
    if (
      event.key === 'Enter' &&
      document.activeElement === inputRef.current &&
      state.results[activeIndex]
    ) {
      event.preventDefault();
      openResult(state.results[activeIndex]);
      return;
    }
    trapFocus(event);
  }

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-dialog-title"
        onKeyDown={handleKeyDown}
      >
        <div className={styles.dialogHeader}>
          <div>
            <p className={styles.eyebrow}>KHÁM PHÁ MYFUTURE NEWS</p>
            <h2 id="search-dialog-title">Tìm điều bạn quan tâm</h2>
          </div>
          <button
            type="button"
            className={styles.close}
            aria-label="Đóng tìm kiếm"
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <form className={styles.searchForm} onSubmit={submit}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m21 21-4.35-4.35m2.35-5.4A7.75 7.75 0 1 1 3.5 11.25a7.75 7.75 0 0 1 15.5 0Z" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={state.results.length > 0}
            aria-controls="quick-search-results"
            aria-activedescendant={
              activeIndex >= 0 ? `quick-search-result-${activeIndex}` : undefined
            }
            value={query}
            maxLength={100}
            placeholder="Tìm pháp lý, quy hoạch, lãi suất…"
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            type="submit"
            className={styles.submit}
            disabled={trimmedQuery.length < 2}
          >
            Tìm
          </button>
        </form>

        <div className={styles.content} aria-live="polite">
          {trimmedQuery.length < 2 ? (
            <div className={styles.guidance}>
              <span aria-hidden="true">✦</span>
              <p>{copy.guidance}</p>
              <div className={styles.suggestions}>
                {['Bất động sản', 'Quy hoạch', 'Lãi suất'].map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {state.status === 'loading' ? (
            <div className={styles.status}>
              <span className={styles.spinner} aria-hidden="true" />
              <p>{copy.loading}</p>
            </div>
          ) : null}

          {state.status === 'error' ? (
            <div className={styles.status}>
              <p>{state.message ?? copy.error}</p>
              <button type="button" onClick={() => setRetryToken((v) => v + 1)}>
                Thử lại
              </button>
            </div>
          ) : null}

          {state.status === 'success' && state.results.length === 0 ? (
            <div className={styles.status}>
              <span aria-hidden="true">⌕</span>
              <p>{copy.empty}</p>
            </div>
          ) : null}

          {state.results.length > 0 ? (
            <>
              <div className={styles.resultsHeading}>
                <span>Kết quả phù hợp</span>
                <small>{state.results.length} gợi ý nhanh</small>
              </div>
              <div
                id="quick-search-results"
                className={styles.results}
                role="listbox"
                aria-label="Kết quả tìm kiếm"
              >
                {state.results.map((article, index) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    id={`quick-search-result-${index}`}
                    className={`${styles.result} ${
                      index === activeIndex ? styles.activeResult : ''
                    }`}
                    key={article.id}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => openResult(article)}
                  >
                    <span className={styles.resultImage}>
                      <NewsImage
                        src={article.thumbnailUrl}
                        alt={article.imageAlt}
                      />
                    </span>
                    <span className={styles.resultBody}>
                      <small>{article.category.name}</small>
                      <strong>
                        <HighlightedText text={article.title} query={trimmedQuery} />
                      </strong>
                      <span>
                        <HighlightedText
                          text={article.searchSnippet ?? article.excerpt}
                          query={trimmedQuery}
                        />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <Link
                className={styles.viewAll}
                href={`/ban-tin/tim-kiem?q=${encodeURIComponent(trimmedQuery)}`}
                onClick={onClose}
              >
                Xem tất cả kết quả
                <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : null}
        </div>

        <div className={styles.keyboardHelp} aria-hidden="true">
          <span><kbd>↑</kbd><kbd>↓</kbd> chọn</span>
          <span><kbd>Enter</kbd> mở</span>
          <span><kbd>Esc</kbd> đóng</span>
        </div>
      </div>
    </div>
  );
}
