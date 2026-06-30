import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllProducts } from '@/lib/products';
import { getPreferredProductUrl } from '@/lib/productLinks';
import { getModelImage } from '@/lib/modelImages';
import { formatUsd } from '@/lib/price';

export const metadata: Metadata = {
  title: 'Products CSV — Admin',
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

function getString(searchParams: SearchParams, key: string): string {
  const v = searchParams[key];
  return typeof v === 'string' ? v.trim() : '';
}

export default async function ProductsCsvPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const sp = await searchParams;
  const q = getString(sp, 'q').toLowerCase();
  const brand = getString(sp, 'brand');
  const onlyNoUrl = getString(sp, 'noUrl') === '1';
  const onlyNoImage = getString(sp, 'noImage') === '1';

  const allProducts = getAllProducts();
  const brands = Array.from(new Set(allProducts.map((p) => p.brand))).sort();

  const rows = allProducts
    .map((p, _i) => {
      const url = getPreferredProductUrl(p);
      const image = getModelImage(p.brand, p.model);
      return { product: p, url, image };
    })
    .filter(({ product, url, image }) => {
      if (brand && product.brand !== brand) return false;
      if (onlyNoUrl && url) return false;
      if (onlyNoImage && image) return false;
      if (q) {
        const hay = [product.brand, product.model, product.size, product.shape, url ?? '']
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

  const noUrlCount = allProducts.filter((p) => !getPreferredProductUrl(p)).length;
  const noImageCount = allProducts.filter((p) => !getModelImage(p.brand, p.model)).length;

  return (
    <div className="mx-auto max-w-[1700px] px-5 py-10 sm:px-8">
      <nav className="mb-6 text-sm text-black/40">
        <Link href="/" className="transition-colors hover:text-black">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/admin/" className="transition-colors hover:text-black">Admin</Link>
        <span className="mx-2">/</span>
        <span className="text-black">Products CSV</span>
      </nav>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-black">Products CSV</h1>
          <p className="text-black/60">
            Live view of <code className="rounded bg-black/[0.06] px-1.5 py-0.5 text-sm">data/products-us.csv</code> — {allProducts.length} rows, {brands.length} brands.
          </p>
        </div>
        <a
          href="/admin/products-csv/download"
          className="rounded-xl border border-black/[0.1] bg-white px-4 py-2.5 text-sm font-medium text-black/70 transition-colors hover:border-[#38b1ab]/40 hover:text-black"
        >
          Download CSV ↓
        </a>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Total rows</p>
          <p className="mt-2 text-2xl font-bold text-black">{allProducts.length}</p>
          <p className="mt-1 text-sm text-black/50">Across {brands.length} brands</p>
        </div>
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Missing URL</p>
          <p className="mt-2 text-2xl font-bold text-black">{noUrlCount}</p>
          <p className="mt-1 text-sm text-black/50">No outbound link</p>
        </div>
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Missing image</p>
          <p className="mt-2 text-2xl font-bold text-black">{noImageCount}</p>
          <p className="mt-1 text-sm text-black/50">No model image in manifest</p>
        </div>
      </div>

      <section className="mb-6 rounded-2xl border border-black/[0.08] bg-white p-5">
        <form method="get" action="/admin/products-csv" className="flex flex-wrap gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search brand, model, size, URL…"
            className="min-w-[220px] flex-1 rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-[#38b1ab]"
          />
          <select
            name="brand"
            defaultValue={brand}
            className="rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors focus:border-[#38b1ab]"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 rounded-xl border border-black/[0.08] px-3 py-2.5 text-sm text-black/70">
            <input type="checkbox" name="noUrl" value="1" defaultChecked={onlyNoUrl} />
            No URL only
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-black/[0.08] px-3 py-2.5 text-sm text-black/70">
            <input type="checkbox" name="noImage" value="1" defaultChecked={onlyNoImage} />
            No image only
          </label>
          <button
            type="submit"
            className="rounded-xl bg-[#38b1ab] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2f9893]"
          >
            Filter
          </button>
          <Link
            href="/admin/products-csv"
            className="rounded-xl border border-black/[0.08] px-4 py-2.5 text-sm text-black/60 transition-colors hover:text-black"
          >
            Reset
          </Link>
        </form>
        <p className="mt-3 text-xs text-black/40">Showing {rows.length} of {allProducts.length} rows</p>
      </section>

      <section className="rounded-2xl border border-black/[0.08] bg-white p-6">
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] border-separate border-spacing-0 text-xs">
            <thead>
              <tr className="text-left text-black/40">
                <th className="sticky left-0 z-30 w-10 bg-white px-2 py-2 font-semibold">#</th>
                <th className="sticky left-10 z-30 min-w-[120px] bg-white px-2 py-2 font-semibold shadow-[1px_0_0_rgba(0,0,0,0.06)]">Brand</th>
                <th className="min-w-[300px] px-2 py-2 font-semibold">Model</th>
                <th className="px-2 py-2 font-semibold">Size</th>
                <th className="px-2 py-2 font-semibold">Shape</th>
                <th className="px-2 py-2 font-semibold">Ground</th>
                <th className="px-2 py-2 font-semibold">Spring</th>
                <th className="px-2 py-2 font-semibold">Price</th>
                <th className="px-2 py-2 font-semibold">Img</th>
                <th className="min-w-[320px] px-2 py-2 font-semibold">URL</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ product, url, image }) => {
                const price = product.exactSizePriceUsd ?? product.modelFromPriceUsd;
                return (
                  <tr key={product.sourceRowIndex} className="border-t border-black/[0.04] align-middle hover:bg-black/[0.015]">
                    <td className="sticky left-0 z-20 bg-white px-2 py-2 font-mono text-[11px] text-black/35">
                      {product.sourceRowIndex}
                    </td>
                    <td className="sticky left-10 z-20 bg-white px-2 py-2 font-medium text-black shadow-[1px_0_0_rgba(0,0,0,0.06)]">
                      {product.brand}
                    </td>
                    <td className="px-2 py-2 text-black/75">{product.model}</td>
                    <td className="px-2 py-2 text-black/60">{product.size || '—'}</td>
                    <td className="px-2 py-2 text-black/60">{product.shape || '—'}</td>
                    <td className="px-2 py-2 text-black/60">{product.groundType}</td>
                    <td className="px-2 py-2 text-black/60">{product.springSystem || '—'}</td>
                    <td className="px-2 py-2 text-black/70">
                      {price !== null ? formatUsd(price) : <span className="text-black/30">—</span>}
                    </td>
                    <td className="px-2 py-2">
                      {image ? (
                        <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">✓</span>
                      ) : (
                        <span className="inline-flex rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">✗</span>
                      )}
                    </td>
                    <td className="max-w-[360px] px-2 py-2">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer nofollow sponsored"
                          className="break-all text-[#238985] underline decoration-[#238985]/35 underline-offset-2"
                        >
                          {url}
                        </a>
                      ) : (
                        <span className="text-rose-400">No URL</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
