'use client';

import { useState, useMemo, useCallback, Fragment, type ReactNode } from 'react';
import type { GroundType, Product } from '@/lib/types';
import {
  getPreferredModelUrl,
  getPreferredProductUrl,
  getShopDestinationLabel,
} from '@/lib/productLinks';
import { formatUsd } from '@/lib/price';
import { formatWarrantyYears } from '@/lib/warranty';

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

function normalizeShapeFilterValue(shape: string): string {
  const normalized = shape.trim().toLowerCase();
  if (!normalized || normalized === 'custom') return '';
  if (normalized === 'rectangle' || normalized === 'rectangular') return 'rectangle';
  return normalized;
}

function shapeFilterLabel(shape: string): string {
  if (shape === 'rectangle') return 'Rectangle';
  return shape.charAt(0).toUpperCase() + shape.slice(1);
}

function groundTypeLabel(groundType: GroundType): string {
  if (groundType === 'above-ground') return 'Above-ground';
  if (groundType === 'in-ground') return 'In-ground';
  return 'Both';
}

function shopCtaLabel(url: string | null, brand: string) {
  return `View at ${getShopDestinationLabel(url, brand)} \u2192`;
}

// ─── brand colours ───────────────────────────────────────────────────────────

type BrandColour = { bg: string; text: string; chipText?: string };

const BRAND_COLOURS: Record<string, BrandColour> = {
  ACON:                     { bg: '#1d9ed8', text: '#fff' },
  AGame:                    { bg: '#d62828', text: '#fff' },
  Akrobat:                  { bg: '#99e047', text: '#17310d', chipText: '#4f7f16' },
  AlleyOOP:                 { bg: '#54575a', text: '#fff' },
  Avyna:                    { bg: '#f58220', text: '#1f1305', chipText: '#b95409' },
  BCAN:                     { bg: '#c8102e', text: '#fff' },
  Beast:                    { bg: '#262626', text: '#fff' },
  'Capital Play':           { bg: '#00a7a7', text: '#fff', chipText: '#007575' },
  'Crazy Ape':              { bg: '#00a8e2', text: '#fff', chipText: '#0078a1' },
  JUMPZYLLA:                { bg: '#f08a00', text: '#211000', chipText: '#a95d00' },
  'Jump Yeti':              { bg: '#0077c8', text: '#fff' },
  JumpKing:                 { bg: '#f5c400', text: '#221a00', chipText: '#8a6b00' },
  Jumpflex:                 { bg: '#6f8f2f', text: '#fff', chipText: '#557020' },
  'Little Tikes':           { bg: '#ed1c24', text: '#fff' },
  MaxAir:                   { bg: '#d7192a', text: '#fff' },
  North:                    { bg: '#68727c', text: '#fff' },
  ORCC:                     { bg: '#4ca000', text: '#fff', chipText: '#367600' },
  Skywalker:                { bg: '#2b78bd', text: '#fff' },
  Sportspower:              { bg: '#c90000', text: '#fff' },
  'Sportspower / Bounce Pro': { bg: '#c90000', text: '#fff' },
  Springfree:               { bg: '#008bd2', text: '#fff' },
  'Texas Trampolines':      { bg: '#162a8c', text: '#fff' },
  'Upper Bounce':           { bg: '#5ec3ff', text: '#04283a', chipText: '#187cad' },
  Vuly:                     { bg: '#e65f1e', text: '#fff' },
  'West Coast Jump':        { bg: '#0076ff', text: '#fff' },
  'Zero Gravity':           { bg: '#5f6368', text: '#fff' },
  Zupapa:                   { bg: '#f7b500', text: '#221900', chipText: '#8d6600' },
};

function brandBadge(name: string): BrandColour {
  return BRAND_COLOURS[name] ?? { bg: '#38b1ab', text: '#fff' };
}

function selectedBrandFilterChipStyle(name: string) {
  const badge = brandBadge(name);
  return {
    backgroundColor: badge.bg,
    borderColor: badge.bg,
    color: badge.text,
  };
}

// ─── types ───────────────────────────────────────────────────────────────────

type SortKey = 'price' | 'size' | 'weight' | 'warranty';
type SortDir = 'asc' | 'desc';

interface ModelRow {
  brand: string;
  model: string;
  shape: string;
  groundType: GroundType;
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
  function snapToStep(v: number) {
    const precision = step.toString().split('.')[1]?.length ?? 0;
    return Number((Math.round(v / step) * step).toFixed(precision));
  }

  function clamp(value: number, minValue: number, maxValue: number) {
    if (!Number.isFinite(value)) return minValue;
    return Math.min(maxValue, Math.max(minValue, snapToStep(value)));
  }

  function setLowValue(value: number) {
    onLow(clamp(value, min, high - step));
  }

  function setHighValue(value: number) {
    onHigh(clamp(value, low + step, max));
  }

  return (
    <div>
      <div className="mb-2 flex justify-between gap-3 text-xs">
        <span className="font-semibold uppercase tracking-wide text-[11px] text-black/40">{label}</span>
        <span className="font-bold text-black text-xs">
          {fmt(low)}{low !== high || high !== max ? ` – ${high >= max ? 'Any' : fmt(high)}` : ''}
        </span>
      </div>
      <div className="space-y-2">
        <label className="block">
          <span className="sr-only">Minimum {label.toLowerCase()}</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={low}
            onChange={(e) => setLowValue(e.currentTarget.valueAsNumber)}
            className="h-11 w-full accent-[#38b1ab]"
          />
        </label>
        <label className="block">
          <span className="sr-only">Maximum {label.toLowerCase()}</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={high}
            onChange={(e) => setHighValue(e.currentTarget.valueAsNumber)}
            className="h-11 w-full accent-[#38b1ab]"
          />
        </label>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-black/35">Min</span>
          <input
            type="number"
            min={min}
            max={high - step}
            step={step}
            value={low}
            onChange={(e) => setLowValue(e.currentTarget.valueAsNumber)}
            className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-black"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-black/35">Max</span>
          <input
            type="number"
            min={low + step}
            max={max}
            step={step}
            value={high}
            onChange={(e) => setHighValue(e.currentTarget.valueAsNumber)}
            className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-black"
          />
        </label>
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
    const groundTypes = new Set(ps.map((p) => p.groundType));
    const groundType: GroundType =
      groundTypes.has('both') || (groundTypes.has('above-ground') && groundTypes.has('in-ground'))
        ? 'both'
        : groundTypes.has('in-ground')
          ? 'in-ground'
          : 'above-ground';
    const springSystem = ps[0].springSystem || '';
    const springless = ps.some(p =>
      p.springSystem?.toLowerCase().includes('springless') ||
      p.springSystem?.toLowerCase().includes('rod') ||
      p.springSystem?.toLowerCase().includes('bungee') ||
      p.springSystem?.toLowerCase().includes('leaf')
    );
    const astmCertified = ps.some(p => p.meetsUsStandard === true) ? true
      : ps.every(p => p.meetsUsStandard === false) ? false : null;
    const prices = ps.map(p => p.exactSizePriceUsd ?? p.modelFromPriceUsd).filter((p): p is number => p !== null);
    const weights = ps.map(p => p.maxSingleUserWeightLb).filter((w): w is number => w !== null);
    const warranties = ps.map(p => p.warrantyFrameYears).filter((w): w is number => w !== null);
    const sizes = ps.map(p => sizeFt(p)).filter((s): s is number => s !== null);
    const shopUrl = getPreferredModelUrl(brand, ps);

    return {
      brand, model, shape, groundType, springSystem, springless, astmCertified,
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
  const allShapes = useMemo(
    () =>
      [...new Set(allRows.map((r) => normalizeShapeFilterValue(r.shape)).filter(Boolean))].sort(),
    [allRows]
  );

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
  const [selectedGroundTypes, setSelectedGroundTypes] = useState<Set<GroundType>>(new Set());
  const [springlessOnly, setSpringlessOnly] = useState(false);
  const [astmOnly, setAstmOnly] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(globalMaxPrice);
  const [minSize, setMinSize] = useState(4);
  const [maxSize, setMaxSize] = useState(globalMaxSize);
  const [sortKey, setSortKey] = useState<SortKey>('price');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleBrand = useCallback((b: string) =>
    setSelectedBrands(prev => { const n = new Set(prev); n.has(b) ? n.delete(b) : n.add(b); return n; }), []);
  const toggleShape = useCallback((s: string) =>
    setSelectedShapes(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; }), []);
  const toggleGroundType = useCallback((groundType: GroundType) =>
    setSelectedGroundTypes(prev => { const n = new Set(prev); n.has(groundType) ? n.delete(groundType) : n.add(groundType); return n; }), []);
  const toggleExpanded = useCallback((key: string) =>
    setExpandedKeys(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; }), []);

  const cycleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let rows = allRows;
    if (selectedBrands.size > 0) rows = rows.filter(r => selectedBrands.has(r.brand));
    if (selectedShapes.size > 0) {
      rows = rows.filter((r) => selectedShapes.has(normalizeShapeFilterValue(r.shape)));
    }
    if (selectedGroundTypes.size > 0) {
      rows = rows.filter((r) => r.groundType === 'both' || selectedGroundTypes.has(r.groundType));
    }
    if (springlessOnly) rows = rows.filter(r => r.springless);
    if (astmOnly) rows = rows.filter(r => r.astmCertified === true);
    if (minPrice > 0 || maxPrice < globalMaxPrice) {
      rows = rows.filter(
        (r) => r.minPrice !== null && r.minPrice >= minPrice && r.minPrice <= maxPrice
      );
    }
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
    selectedGroundTypes,
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
  const activeFilterCount =
    selectedBrands.size +
    selectedShapes.size +
    selectedGroundTypes.size +
    (springlessOnly ? 1 : 0) +
    (astmOnly ? 1 : 0) +
    (minPrice > 0 || maxPrice < globalMaxPrice ? 1 : 0) +
    (minSize > 4 || maxSize < globalMaxSize ? 1 : 0);

  function onMobileSortChange(value: string) {
    const [key, dir] = value.split(':') as [SortKey, SortDir];
    setSortKey(key);
    setSortDir(dir);
  }

  const SortTh = ({
    col,
    label,
    tip,
    className = '',
    labelClassName = '',
  }: {
    col: SortKey;
    label: ReactNode;
    tip?: string;
    className?: string;
    labelClassName?: string;
  }) => (
    <th className={`text-left px-3 py-3 whitespace-nowrap ${className}`}>
      <button onClick={() => cycleSort(col)}
        className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${sortKey === col ? 'text-black' : 'text-black/40'} hover:text-black transition-colors ${labelClassName}`}>
        {label}
        {tip && <Tip text={tip} />}
        <span className="ml-0.5 text-[10px]">{sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
      </button>
    </th>
  );

  return (
    <div className="mx-auto max-w-[1360px] px-5 pb-16 sm:px-8 lg:px-10">

      {/* ── filter panel ─────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setFiltersOpen((open) => !open)}
        className="mb-3 flex w-full items-center justify-between rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-left text-sm font-semibold text-black shadow-sm lg:hidden"
        aria-expanded={filtersOpen}
      >
        <span>
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </span>
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`text-black/35 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
        >
          <path d="M4.5 7 9 11.5 13.5 7" />
        </svg>
      </button>
      <div className={`${filtersOpen ? 'grid' : 'hidden'} rounded-2xl border border-black/[0.08] bg-white p-5 mb-6 grid-cols-1 gap-6 lg:grid lg:grid-cols-[1fr_280px]`}>
        {/* left: chips */}
        <div className="space-y-4">
          {/* brands */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40 mb-2">Brand</p>
            <div className="flex flex-wrap gap-1.5">
              {allBrands.map(b => (
                <button key={b} onClick={() => toggleBrand(b)}
                  className={`min-h-11 rounded-full px-3 py-2 text-xs font-medium border transition-colors ${selectedBrands.has(b) ? 'border-transparent hover:brightness-95' : 'border-black/15 text-black/60 hover:border-black/30 bg-white'}`}
                  style={selectedBrands.has(b) ? selectedBrandFilterChipStyle(b) : {}}>
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
                    className={`min-h-11 rounded-full px-3 py-2 text-xs font-medium border transition-colors ${selectedShapes.has(s) ? 'bg-[#38b1ab] border-[#38b1ab] text-white' : 'border-black/15 text-black/60 hover:border-black/30 bg-white'}`}>
                    {shapeFilterLabel(s)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40 mb-2">Ground type</p>
            <div className="flex flex-wrap gap-1.5">
              {([
                { id: 'above-ground', label: 'Above-ground' },
                { id: 'in-ground', label: 'In-ground' },
              ] as const).map((option) => (
                <button key={option.id} onClick={() => toggleGroundType(option.id)}
                  className={`min-h-11 rounded-full px-3 py-2 text-xs font-medium border transition-colors ${selectedGroundTypes.has(option.id) ? 'bg-[#38b1ab] border-[#38b1ab] text-white' : 'border-black/15 text-black/60 hover:border-black/30 bg-white'}`}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* type toggles */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40 mb-2">Type</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setSpringlessOnly(o => !o)}
                className={`min-h-11 rounded-full px-3 py-2 text-xs font-medium border transition-colors ${springlessOnly ? 'bg-[#38b1ab] border-[#38b1ab] text-white' : 'border-black/15 text-black/60 hover:border-black/30 bg-white'}`}>
                Springless only
              </button>
              <button onClick={() => setAstmOnly(o => !o)}
                className={`min-h-11 rounded-full px-3 py-2 text-xs font-medium border transition-colors ${astmOnly ? 'bg-[#38b1ab] border-[#38b1ab] text-white' : 'border-black/15 text-black/60 hover:border-black/30 bg-white'}`}>
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

      <label className="mb-4 block md:hidden">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-black/40">Sort results</span>
        <select
          value={`${sortKey}:${sortDir}`}
          onChange={(e) => onMobileSortChange(e.currentTarget.value)}
          className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-black"
        >
          <option value="price:asc">Price: low to high</option>
          <option value="price:desc">Price: high to low</option>
          <option value="size:asc">Size: small to large</option>
          <option value="size:desc">Size: large to small</option>
          <option value="weight:desc">Max weight: high to low</option>
          <option value="warranty:desc">Frame warranty: high to low</option>
        </select>
      </label>

      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-black/[0.08] bg-white px-4 py-10 text-center text-sm text-black/40">
            No models match your filters.
          </div>
        ) : (
          filtered.map((row) => {
            const key = `${row.brand}|||${row.model}`;
            const canExpand = row.variants.length > 1;
            const isExpanded = canExpand && expandedKeys.has(key);
            const badge = brandBadge(row.brand);

            return (
              <article key={key} className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-sm">
                <div className="mb-3">
                  <span
                    className="mb-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    {row.brand}
                  </span>
                  <h2 className="text-base font-semibold leading-snug text-black">{row.model}</h2>
                  {row.variants.length > 1 && (
                    <p className="mt-0.5 text-xs text-black/40">{row.variants.length} matching sizes</p>
                  )}
                </div>

                <div className="mb-3 flex flex-wrap gap-1">
                  {row.variants.map((v, i) => (
                    <span key={i} className="rounded border border-black/15 px-2 py-1 text-xs text-black/60">
                      {variantLabel(v)}
                    </span>
                  ))}
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-black/35">Price</dt>
                    <dd className="mt-0.5 font-semibold text-black">
                      {row.minPrice !== null ? (
                        <>
                          {fmtPrice(row.minPrice)}
                          {row.maxPrice !== null && row.maxPrice !== row.minPrice ? (
                            <span className="font-normal text-black/40"> to {fmtPrice(row.maxPrice)}</span>
                          ) : null}
                        </>
                      ) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-black/35">Max weight</dt>
                    <dd className="mt-0.5 text-black/70">{row.maxWeightLb !== null ? `${row.maxWeightLb} lb` : '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-black/35">Warranty</dt>
                    <dd className="mt-0.5 text-black/70">{formatWarrantyYears(row.warrantyFrameYrs)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-black/35">Ground</dt>
                    <dd className="mt-0.5 text-black/70">{groundTypeLabel(row.groundType)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-black/35">Spring</dt>
                    <dd className="mt-0.5 text-black/70">{row.springSystem || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-black/35">ASTM</dt>
                    <dd className="mt-0.5 text-black/70">{row.astmCertified === true ? 'Certified' : 'Not listed'}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-col gap-2">
                  {row.shopUrl && (
                    <a
                      href={row.shopUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#38b1ab] px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      {shopCtaLabel(row.shopUrl, row.brand)}
                    </a>
                  )}
                  {canExpand && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(key)}
                      aria-expanded={isExpanded}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-black/65"
                    >
                      {isExpanded ? 'Hide sizes' : 'Show sizes'}
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-3 divide-y divide-black/[0.06] rounded-xl bg-black/[0.02] px-3">
                    {row.variants.map((v, i) => {
                      const variantUrl = getPreferredProductUrl(v);
                      return (
                        <div key={`${key}-${i}`} className="py-3 text-xs text-black/55">
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-semibold text-black/70">{variantLabel(v)}</span>
                            <span>{(v.exactSizePriceUsd ?? v.modelFromPriceUsd) != null ? fmtPrice((v.exactSizePriceUsd ?? v.modelFromPriceUsd)!) : '—'}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                            <span>{v.maxSingleUserWeightLb ? `${v.maxSingleUserWeightLb} lb max` : 'Max weight —'}</span>
                            <span>{formatWarrantyYears(v.warrantyFrameYears)}</span>
                            <span>{v.meetsUsStandard === true ? 'ASTM certified' : 'ASTM not listed'}</span>
                          </div>
                          {variantUrl && (
                            <a
                              href={variantUrl}
                              target="_blank"
                              rel="noopener noreferrer nofollow sponsored"
                              className="mt-2 inline-flex min-h-10 items-center text-xs font-semibold text-[#38b1ab]"
                            >
                              {shopCtaLabel(variantUrl, row.brand)}
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* ── table ────────────────────────────────────────────────────────── */}
      <div className="hidden rounded-2xl border border-black/[0.08] overflow-hidden md:block">
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
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wide text-black/40 hidden md:table-cell min-w-[120px]">Ground type</th>
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wide text-black/40 hidden md:table-cell min-w-[88px]">
                  <span className="inline-flex flex-col leading-tight">
                    <span>Spring</span>
                    <span>type</span>
                  </span>
                </th>
                <SortTh col="price" label="Price" />
                <SortTh col="weight" label="Max weight" tip="Max single-user weight in lb" />
                <SortTh
                  col="warranty"
                  label={
                    <span className="inline-flex flex-col leading-tight">
                      <span>Frame</span>
                      <span>warranty</span>
                    </span>
                  }
                  className="min-w-[88px]"
                  labelClassName="whitespace-normal"
                />
                <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wide text-black/40 min-w-[60px]">
                  ASTM <Tip text="ASTM F381/F2225 certified per official brand documentation" />
                </th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-black/40 text-sm">
                    No models match your filters.
                  </td>
                </tr>
              )}
              {filtered.map(row => {
                const key = `${row.brand}|||${row.model}`;
                const canExpand = row.variants.length > 1;
                const isExpanded = canExpand && expandedKeys.has(key);
                const badge = brandBadge(row.brand);

                return (
                  <Fragment key={key}>
                    <tr
                      className={`border-t border-black/[0.06] transition-colors ${canExpand ? 'cursor-pointer hover:bg-black/[0.012]' : ''}`}
                      onClick={canExpand ? () => toggleExpanded(key) : undefined}>

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
                        {row.groundType === 'above-ground' ? 'Above-ground' : row.groundType === 'in-ground' ? 'In-ground' : 'Both'}
                      </td>

                      {/* spring type */}
                      <td className="px-3 py-3 align-top text-sm text-black/50 hidden md:table-cell">
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
                                {shopCtaLabel(row.shopUrl, row.brand)}
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
                        {formatWarrantyYears(row.warrantyFrameYrs)}
                      </td>

                      {/* ASTM */}
                      <td className="px-3 py-3 align-top text-center text-sm">
                        {row.astmCertified === true
                          ? <span className="text-emerald-600 font-semibold">✓</span>
                          : <span className="text-black/20">✗</span>}
                      </td>

                      {/* expand arrow */}
                      <td className="px-4 py-3 align-top text-right">
                        {canExpand ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                            className={`text-black/25 transition-transform inline-block ${isExpanded ? 'rotate-180' : ''}`}>
                            <path d="M4 6l4 4 4-4" />
                          </svg>
                        ) : null}
                      </td>
                    </tr>

                    {/* expanded variant rows */}
                    {isExpanded && row.variants.map((v, i) => {
                      const variantUrl = getPreferredProductUrl(v);
                      return (
                      <tr key={`${key}-${i}`} className="border-t border-black/[0.04] bg-black/[0.015]">
                        <td className="pl-8 pr-3 py-2 text-xs text-black/50">↳ {variantLabel(v)}</td>
                        <td className="px-3 py-2 text-xs text-black/40">{v.shape}</td>
                        <td className="px-3 py-2 text-xs text-black/40 hidden md:table-cell">
                          {v.groundType === 'above-ground' ? 'Above-ground' : v.groundType === 'in-ground' ? 'In-ground' : 'Both'}
                        </td>
                        <td className="px-3 py-2 text-xs text-black/40 hidden md:table-cell">{v.springSystem || '—'}</td>
                        <td className="px-3 py-2 text-xs font-medium text-black/70 whitespace-nowrap">
                          {(v.exactSizePriceUsd ?? v.modelFromPriceUsd) != null
                            ? fmtPrice((v.exactSizePriceUsd ?? v.modelFromPriceUsd)!)
                            : '—'}
                          {variantUrl && (
                            <a href={variantUrl} target="_blank" rel="noopener noreferrer nofollow sponsored"
                              className="block text-[#38b1ab] hover:underline text-[10px] font-medium mt-0.5">
                              {shopCtaLabel(variantUrl, row.brand)}
                            </a>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-black/50">{v.maxSingleUserWeightLb ? `${v.maxSingleUserWeightLb} lb` : '—'}</td>
                        <td className="px-3 py-2 text-xs text-black/50">{formatWarrantyYears(v.warrantyFrameYears)}</td>
                        <td className="px-3 py-2 text-center text-xs">
                          {v.meetsUsStandard === true
                            ? <span className="text-emerald-600">✓</span>
                            : <span className="text-black/15">✗</span>}
                        </td>
                        <td />
                      </tr>
                    )})}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-black/30">
        We&apos;ve done our best to source these specifications accurately, but details can change and may be incomplete or incorrect. Always verify key specs, pricing, and warranty terms directly with the manufacturer or retailer before buying.
      </p>
    </div>
  );
}
