'use client';

import { useState, useMemo, useCallback, Fragment, useRef } from 'react';
import type { Product } from '@/lib/types';
import { BRAND_SHOP_URLS } from '@/lib/brandLogos';
import { formatUsd } from '@/lib/price';

// ─── helpers ─────────────────────────────────────────────────────────────────

function brandSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function inToFt(inches: number | null): number | null {
  if (inches === null) return null;
  return Math.round((inches / 12) * 10) / 10;
}

function sizeFt(p: Product): number | null {
  return inToFt(p.maxDiameterIn ?? p.overallLengthIn ?? p.overallWidthIn);
}

function variantLabel(p: Product): string {
  const ft = sizeFt(p);
  if (ft !== null) return `${ft} ft`;
  return p.size || '—';
}

function fmtPrice(n: number) {
  return formatUsd(n);
}

// ─── brand colours ───────────────────────────────────────────────────────────

const BRAND_COLOURS: Record<string, { bg: string; text: string }> = {
  Springfree:               { bg: '#00563b', text: '#fff' },
  ACON:                     { bg: '#0055a5', text: '#fff' },
  Vuly:                     { bg: '#e31837', text: '#fff' },
  Skywalker:                { bg: '#1d3f73', text: '#fff' },
  'Upper Bounce':           { bg: '#ff6b00', text: '#fff' },
  Zupapa:                   { bg: '#5b2d8e', text: '#fff' },
  JumpKing:                 { bg: '#c8102e', text: '#fff' },
  Jumpflex:                 { bg: '#ff6600', text: '#fff' },
  'Little Tikes':           { bg: '#ffc72c', text: '#000' },
  ORCC:                     { bg: '#2e7d32', text: '#fff' },
  JUMPZYLLA:                { bg: '#1565c0', text: '#fff' },
  BCAN:                     { bg: '#00838f', text: '#fff' },
};

function brandBadge(name: string) {
  return BRAND_COLOURS[name] ?? { bg: '#38b1ab', text: '#fff' };
}

// ─── types ───────────────────────────────────────────────────────────────────

type SortKey = 'price' | 'size' | 'weight' | 'warranty';
type SortDir = 'asc' | 'desc';

interface ModelRow {
  brand: string;
  model: string;
  shape: string;
  springSystem: string;
  springless: boolean;
  astmCertified: boolean | null;
  minPrice: number | null;
  maxPrice: number | null;
  maxWeightLb: number | null;
  minSizeFt: number | null;
  maxSizeFt: number | null;
  warrantyFrameYrs: number | null;
  shopUrl: string | null;
  brandPage: string;
  variants: Product[];
}

// ─── dual-range slider ────────────────────────────────────────────────────────

function DualRangeSlider({
  label, min, max, low, high, step = 1, fmt, onLow, onHigh,
}: {
  label: string; min: number; max: number; low: number; high: number;
  step?: number; fmt: (v: number) => string;
  onLow: (v: number) => void; onHigh: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<'low' | 'high' | null>(null);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  function snapToStep(v: number) {
    return Math.round(v / step) * step;
  }

  function valFromClientX(clientX: number): number {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return min;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return snapToStep(min + ratio * (max - min));
  }

  function startDrag(clientX: number) {
    const val = valFromClientX(clientX);
    const distLow = Math.abs(val - low);
    const distHigh = Math.abs(val - high);
    dragging.current = distLow <= distHigh ? 'low' : 'high';
  }

  function moveDrag(clientX: number) {
    if (!dragging.current) return;
    const val = valFromClientX(clientX);
    if (dragging.current === 'low') onLow(Math.min(val, high - step));
    else onHigh(Math.max(val, low + step));
  }

  function endDrag() { dragging.current = null; }

  // mouse
  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    startDrag(e.clientX);
    moveDrag(e.clientX);
    const move = (ev: MouseEvent) => moveDrag(ev.clientX);
    const up = () => { endDrag(); window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }

  // touch
  function onTouchStart(e: React.TouchEvent) {
    startDrag(e.touches[0].clientX);
    moveDrag(e.touches[0].clientX);
  }
  function onTouchMove(e: React.TouchEvent) { moveDrag(e.touches[0].clientX); }

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-semibold uppercase tracking-wide text-[11px] text-black/40">{label}</span>
        <span className="font-bold text-black text-xs">
          {fmt(low)}{low !== high || high !== max ? ` – ${high >= max ? 'Any' : fmt(high)}` : ''}
        </span>
      </div>
      <div
        ref={trackRef}
        className="relative h-5 flex items-center cursor-pointer select-none"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-black/10" />
        <div className="absolute h-1.5 rounded-full bg-[#38b1ab]"
          style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }} />
        {/* low thumb */}
        <div className="absolute w-4 h-4 rounded-full bg-white border-2 border-[#38b1ab] shadow-sm"
          style={{ left: `calc(${pct(low)}% - 8px)` }} />
        {/* high thumb */}
        <div className="absolute w-4 h-4 rounded-full bg-white border-2 border-[#38b1ab] shadow-sm"
          style={{ left: `calc(${pct(high)}% - 8px)` }} />
      </div>
      <div className="flex justify-between text-[10px] text-black/30 mt-0.5">
        <span>{fmt(min)}</span>
        <span>Any</span>
      </div>
    </div>
  );
}

// ─── tooltip ─────────────────────────────────────────────────────────────────

function Tip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block ml-0.5 align-middle"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-black/10 text-black/40 text-[9px] cursor-default select-none">?</span>
      {show && (
        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-48 px-2 py-1.5 bg-black/80 text-white text-[10px] leading-snug rounded-lg pointer-events-none z-50 whitespace-normal">
          {text}
        </span>
      )}
    </span>
  );
}

// ─── data builder ────────────────────────────────────────────────────────────

function buildRows(products: Product[]): ModelRow[] {
  const grouped = new Map<string, Product[]>();
  for (const p of products) {
    const key = `${p.brand}|||${p.model}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  }

  return Array.from(grouped.entries()).map(([key, ps]) => {
    const [brand, model] = key.split('|||');
    const shape = ps[0].shape || '';
    const springSystem = ps[0].springSystem || '';
    const springless = ps.some(p =>
      p.springSystem?.toLowerCase().includes('springless') ||
      p.springSystem?.toLowerCase().includes('rod') ||
      p.springSystem?.toLowerCase().includes('bungee')
    );
    const astmCertified = ps.some(p => p.meetsUsStandard === true) ? true
      : ps.every(p => p.meetsUsStandard === false) ? false : null;
    const prices = ps.map(p => p.exactSizePriceUsd ?? p.modelFromPriceUsd).filter((p): p is number => p !== null);
    const weights = ps.map(p => p.maxSingleUserWeightLb).filter((w): w is number => w !== null);
    const warranties = ps.map(p => p.warrantyFrameYears).filter((w): w is number => w !== null);
    const sizes = ps.map(p => sizeFt(p)).filter((s): s is number => s !== null);
    const allSourceUrls = ps.flatMap(p => p.sourceUrls);
    const shopUrl = BRAND_SHOP_URLS[brand] ?? (allSourceUrls[0] || null);

    return {
      brand, model, shape, springSystem, springless, astmCertified,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      maxWeightLb: weights.length ? Math.max(...weights) : null,
      minSizeFt: sizes.length ? Math.min(...sizes) : null,
      maxSizeFt: sizes.length ? Math.max(...sizes) : null,
      warrantyFrameYrs: warranties.length ? Math.max(...warranties) : null,
      shopUrl,
      brandPage: `/brands/${brandSlug(brand)}/`,
      variants: ps,
    };
  });
}

// ─── main component ───────────────────────────────────────────────────────────

export default function CompareClient({ products }: { products: Product[] }) {
  const allRows = useMemo(() => buildRows(products), [products]);

  const allBrands = useMemo(() => [...new Set(allRows.map(r => r.brand))].sort(), [allRows]);
  const allShapes = useMemo(() => [...new Set(allRows.map(r => r.shape).filter(Boolean))].sort(), [allRows]);

  const globalMaxPrice = useMemo(() => {
    const prices = allRows.map(r => r.maxPrice).filter((p): p is number => p !== null);
    return prices.length ? Math.ceil(Math.max(...prices) / 100) * 100 : 4000;
  }, [allRows]);
  const globalMaxSize = useMemo(() => {
    const sizes = allRows.map(r => r.maxSizeFt).filter((s): s is number => s !== null);
    return sizes.length ? Math.ceil(Math.max(...sizes)) : 17;
  }, [allRows]);

  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedShapes, setSelectedShapes] = useState<Set<string>>(new Set());
  const [springlessOnly, setSpringlessOnly] = useState(false);
  const [astmOnly, setAstmOnly] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(globalMaxPrice);
  const [minSize, setMinSize] = useState(4);
  const [maxSize, setMaxSize] = useState(globalMaxSize);
  const [sortKey, setSortKey] = useState<SortKey>('price');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggleBrand = useCallback((b: string) =>
    setSelectedBrands(prev => { const n = new Set(prev); n.has(b) ? n.delete(b) : n.add(b); return n; }), []);
  const toggleShape = useCallback((s: string) =>
    setSelectedShapes(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; }), []);
  const toggleExpanded = useCallback((key: string) =>
    setExpandedKeys(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; }), []);

  const cycleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let rows = allRows;
    if (selectedBrands.size > 0) rows = rows.filter(r => selectedBrands.has(r.brand));
    if (selectedShapes.size > 0) rows = rows.filter(r => selectedShapes.has(r.shape));
    if (springlessOnly) rows = rows.filter(r => r.springless);
    if (astmOnly) rows = rows.filter(r => r.astmCertified === true);
    if (minPrice > 0 || maxPrice < globalMaxPrice) rows = rows.filter(r => r.minPrice === null || (r.minPrice >= minPrice && r.minPrice <= maxPrice));
    if (minSize > 4 || maxSize < globalMaxSize) rows = rows.filter(r => r.maxSizeFt === null || (r.maxSizeFt >= minSize && r.minSizeFt !== null && r.minSizeFt <= maxSize));

    return [...rows].sort((a, b) => {
      let va: number | null = null, vb: number | null = null;
      if (sortKey === 'price') { va = a.minPrice; vb = b.minPrice; }
      else if (sortKey === 'size') { va = a.maxSizeFt; vb = b.maxSizeFt; }
      else if (sortKey === 'weight') { va = a.maxWeightLb; vb = b.maxWeightLb; }
      else if (sortKey === 'warranty') { va = a.warrantyFrameYrs; vb = b.warrantyFrameYrs; }
      if (va === null && vb === null) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [
    allRows,
    selectedBrands,
    selectedShapes,
    springlessOnly,
    astmOnly,
    minPrice,
    maxPrice,
    minSize,
    maxSize,
    sortKey,
    sortDir,
    globalMaxPrice,
    globalMaxSize,
  ]);

  const matchingSizes = useMemo(() =>
    filtered.reduce((sum, r) => sum + r.variants.length, 0), [filtered]);

  const SortTh = ({ col, label, tip }: { col: SortKey; label: string; tip?: string }) => (
    <th className="text-left px-3 py-3 whitespace-nowrap">
      <button onClick={() => cycleSort(col)}
        className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${sortKey === col ? 'text-black' : 'text-black/40'} hover:text-black transition-colors`}>
        {label}
        {tip && <Tip text={tip} />}
        <span className="ml-0.5 text-[10px]">{sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
      </button>
    </th>
  );

  return (
    <div className="mx-auto max-w-[1360px] px-5 pb-16 sm:px-8 lg:px-10">

      {/* ── filter panel ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-black/[0.08] bg-white p-5 mb-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* left: chips */}
        <div className="space-y-4">
          {/* brands */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40 mb-2">Brand</p>
            <div className="flex flex-wrap gap-1.5">
              {allBrands.map(b => (
                <button key={b} onClick={() => toggleBrand(b)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedBrands.has(b) ? 'text-white border-transparent' : 'border-black/15 text-black/60 hover:border-black/30 bg-white'}`}
                  style={selectedBrands.has(b) ? { backgroundColor: brandBadge(b).bg, borderColor: brandBadge(b).bg, color: brandBadge(b).text } : {}}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* shapes */}
          {allShapes.length > 1 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40 mb-2">Shape</p>
              <div className="flex flex-wrap gap-1.5">
                {allShapes.map(s => (
                  <button key={s} onClick={() => toggleShape(s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedShapes.has(s) ? 'bg-[#38b1ab] border-[#38b1ab] text-white' : 'border-black/15 text-black/60 hover:border-black/30 bg-white'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* type toggles */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40 mb-2">Type</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setSpringlessOnly(o => !o)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${springlessOnly ? 'bg-[#38b1ab] border-[#38b1ab] text-white' : 'border-black/15 text-black/60 hover:border-black/30 bg-white'}`}>
                Springless only
              </button>
              <button onClick={() => setAstmOnly(o => !o)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${astmOnly ? 'bg-[#38b1ab] border-[#38b1ab] text-white' : 'border-black/15 text-black/60 hover:border-black/30 bg-white'}`}>
                ASTM certified
              </button>
            </div>
          </div>
        </div>

        {/* right: sliders */}
        <div className="space-y-5 border-t lg:border-t-0 lg:border-l border-black/[0.07] pt-4 lg:pt-0 lg:pl-6">
          <DualRangeSlider label="Price range" min={0} max={globalMaxPrice}
            low={minPrice} high={maxPrice} step={50}
            fmt={formatUsd}
            onLow={setMinPrice} onHigh={setMaxPrice} />
          <DualRangeSlider label="Trampoline size" min={4} max={globalMaxSize}
            low={minSize} high={maxSize} step={0.5}
            fmt={v => `${v} ft`}
            onLow={setMinSize} onHigh={setMaxSize} />
          <p className="text-[10px] text-black/30">Uses the model&apos;s largest available size.</p>
        </div>
      </div>

      {/* ── results count ────────────────────────────────────────────────── */}
      <p className="text-sm text-black/50 mb-4">
        <span className="font-medium text-black">{filtered.length} model{filtered.length !== 1 ? 's' : ''}</span>
        {' '}from{' '}
        <span className="font-medium text-black">{matchingSizes} matching size{matchingSizes !== 1 ? 's' : ''}</span>
      </p>

      {/* ── table ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-black/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] w-full">
            <thead className="bg-black/[0.03] border-b border-black/[0.08]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black/40 min-w-[220px]">Model</th>
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wide text-black/40 min-w-[140px]">
                  <button onClick={() => cycleSort('size')} className={`flex items-center gap-1 ${sortKey === 'size' ? 'text-black' : 'text-black/40'} hover:text-black transition-colors`}>
                    Size <span className="text-[10px]">{sortKey === 'size' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
                  </button>
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wide text-black/40 hidden md:table-cell min-w-[110px]">Spring type</th>
                <SortTh col="price" label="Price" />
                <SortTh col="weight" label="Max weight" tip="Max single-user weight in lb" />
                <SortTh col="warranty" label="Frame warranty" />
                <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wide text-black/40 min-w-[60px]">
                  ASTM <Tip text="ASTM F381/F2225 certified per official brand documentation" />
                </th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-black/40 text-sm">
                    No models match your filters.
                  </td>
                </tr>
              )}
              {filtered.map(row => {
                const key = `${row.brand}|||${row.model}`;
                const isExpanded = expandedKeys.has(key);
                const badge = brandBadge(row.brand);

                return (
                  <Fragment key={key}>
                    <tr
                      className="border-t border-black/[0.06] hover:bg-black/[0.012] transition-colors cursor-pointer"
                      onClick={() => toggleExpanded(key)}>

                      {/* model */}
                      <td className="px-4 py-3 align-top">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-1"
                          style={{ backgroundColor: badge.bg, color: badge.text }}>
                          {row.brand}
                        </span>
                        <p className="text-[13px] font-medium text-black leading-snug sm:text-sm">{row.model}</p>
                        {row.variants.length > 1 && (
                          <p className="text-[11px] text-black/35 mt-0.5">{row.variants.length} matching sizes</p>
                        )}
                      </td>

                      {/* size chips */}
                      <td className="px-3 py-3 align-top">
                        <div className="flex flex-wrap gap-1">
                          {row.variants.map((v, i) => (
                            <span key={i} className="px-2 py-0.5 rounded border border-black/15 text-xs text-black/60 whitespace-nowrap">
                              {variantLabel(v)}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* spring type */}
                      <td className="px-3 py-3 align-top text-sm text-black/50 hidden md:table-cell whitespace-nowrap">
                        {row.springSystem || '—'}
                      </td>

                      {/* price */}
                      <td className="px-3 py-3 align-top whitespace-nowrap">
                        {row.minPrice !== null ? (
                          <>
                            <span className="text-[14px] font-semibold text-black sm:text-[15px]">{fmtPrice(row.minPrice)}</span>
                            {row.maxPrice !== null && row.maxPrice !== row.minPrice && (
                              <span className="text-[12px] text-black/40 sm:text-[13px]"> to {fmtPrice(row.maxPrice)}</span>
                            )}
                            {row.shopUrl && (
                              <a href={row.shopUrl} target="_blank" rel="noopener noreferrer nofollow sponsored"
                                onClick={e => e.stopPropagation()}
                                className="block text-[#38b1ab] hover:underline text-xs mt-0.5 font-medium">
                                View best price →
                              </a>
                            )}
                          </>
                        ) : '—'}
                      </td>

                      {/* weight */}
                      <td className="px-3 py-3 align-top text-sm text-black/60 whitespace-nowrap">
                        {row.maxWeightLb !== null ? `${row.maxWeightLb} lb` : '—'}
                      </td>

                      {/* warranty */}
                      <td className="px-3 py-3 align-top text-sm text-black/60 whitespace-nowrap">
                        {row.warrantyFrameYrs !== null ? `${row.warrantyFrameYrs} yr` : '—'}
                      </td>

                      {/* ASTM */}
                      <td className="px-3 py-3 align-top text-center text-sm">
                        {row.astmCertified === true
                          ? <span className="text-emerald-600 font-semibold">✓</span>
                          : <span className="text-black/20">✗</span>}
                      </td>

                      {/* expand arrow */}
                      <td className="px-4 py-3 align-top text-right">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                          className={`text-black/25 transition-transform inline-block ${isExpanded ? 'rotate-180' : ''}`}>
                          <path d="M4 6l4 4 4-4" />
                        </svg>
                      </td>
                    </tr>

                    {/* expanded variant rows */}
                    {isExpanded && row.variants.map((v, i) => (
                      <tr key={`${key}-${i}`} className="border-t border-black/[0.04] bg-black/[0.015]">
                        <td className="pl-8 pr-3 py-2 text-xs text-black/50">↳ {variantLabel(v)}</td>
                        <td className="px-3 py-2 text-xs text-black/40">{v.shape}</td>
                        <td className="px-3 py-2 text-xs text-black/40 hidden md:table-cell">{v.springSystem || '—'}</td>
                        <td className="px-3 py-2 text-xs font-medium text-black/70 whitespace-nowrap">
                          {(v.exactSizePriceUsd ?? v.modelFromPriceUsd) != null
                            ? fmtPrice((v.exactSizePriceUsd ?? v.modelFromPriceUsd)!)
                            : '—'}
                          {v.sourceUrls[0] && (
                            <a href={v.sourceUrls[0]} target="_blank" rel="noopener noreferrer nofollow sponsored"
                              className="block text-[#38b1ab] hover:underline text-[10px] font-medium mt-0.5">
                              View →
                            </a>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-black/50">{v.maxSingleUserWeightLb ? `${v.maxSingleUserWeightLb} lb` : '—'}</td>
                        <td className="px-3 py-2 text-xs text-black/50">{v.warrantyFrameYears ? `${v.warrantyFrameYears} yr` : '—'}</td>
                        <td className="px-3 py-2 text-center text-xs">
                          {v.meetsUsStandard === true
                            ? <span className="text-emerald-600">✓</span>
                            : <span className="text-black/15">✗</span>}
                        </td>
                        <td />
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-black/30 mt-4 text-center">
        Prices are approximate. Click &ldquo;View best price&rdquo; for current pricing from the brand.
      </p>
    </div>
  );
}
