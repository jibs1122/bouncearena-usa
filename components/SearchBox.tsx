'use client';

import Link from 'next/link';
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export type SearchItem = {
  title: string;
  href: string;
  category: 'brand' | 'comparison';
  description?: string;
};

function getCategoryLabel(category: SearchItem['category']): string {
  return category === 'brand' ? 'Brand' : 'Comparison';
}

function normalizeSearchText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getSearchResults(query: string, items: SearchItem[]) {
  const q = normalizeSearchText(query);
  if (!q) return [];
  const terms = q.split(' ').filter(Boolean);

  return items
    .map((item) => {
      const title = normalizeSearchText(item.title);
      const hay = normalizeSearchText(`${item.title} ${item.description ?? ''}`);
      const allTermsInTitle = terms.every((term) => title.includes(term));
      const allTermsInHay = terms.every((term) => hay.includes(term));
      const score =
        (title.startsWith(q) ? 3 : 0) +
        (title.includes(q) ? 2 : 0) +
        (allTermsInTitle ? 2 : 0) +
        (allTermsInHay ? 1 : 0);
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

export default function SearchBox({ items, mobile = false }: { items: SearchItem[]; mobile?: boolean }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const results = useMemo(() => getSearchResults(deferredQuery, items), [deferredQuery, items]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const firstResult = getSearchResults(q, items)[0]?.item;
    if (!firstResult) {
      setOpen(true);
      return;
    }

    setOpen(false);
    router.push(firstResult.href);
  }

  return (
    <div ref={rootRef} className={`relative ${mobile ? 'w-full' : 'w-full max-w-md'}`}>
      <form onSubmit={onSubmit} role="search" aria-label="Site search">
        <div
          className={`flex items-center gap-2 rounded-2xl border border-black/10 bg-[#f7f8f8] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors focus-within:border-[#38b1ab]/45 focus-within:bg-white ${mobile ? 'h-12' : 'h-11'}`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-black/35" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search brands and comparisons…"
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={open}
            className="w-full bg-transparent text-sm text-black placeholder:text-black/35 focus:outline-none"
          />
        </div>
      </form>

      {open && query.trim() && (
        <div
          id={listId}
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_22px_54px_-34px_rgba(0,0,0,0.45)]"
        >
          {results.length > 0 ? (
            <div className="py-2">
              {results.map(({ item }) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 transition-colors hover:bg-[#38b1ab]/[0.06]"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#38b1ab]">
                    {getCategoryLabel(item.category)}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-black">{item.title}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-4 text-sm text-black/45">
              No matches. Try a brand name like &ldquo;Springfree&rdquo; or &ldquo;Vuly&rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
