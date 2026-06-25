import type { ReactNode } from "react";
import type { Product } from "@/lib/types";
import { formatUsd } from "@/lib/price";
import { isAconBrand } from "@/lib/vuly";
import { formatWarrantyYears } from "@/lib/warranty";

interface SpecRow {
  label: string;
  getValue: (p: Product) => ReactNode;
}

function hasMeaningfulValue(value: ReactNode) {
  return !(typeof value === "string" && (value.trim() === "" || value.trim() === "—"));
}

// Serialize a ReactNode to a string key for equality comparison.
function nodeKey(v: ReactNode): string {
  if (v === null || v === undefined) return "\0null";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object" && "props" in (v as object)) {
    const el = v as React.ReactElement;
    const typeName =
      typeof el.type === "function" ? (el.type as (...args: unknown[]) => unknown).name : String(el.type);
    return `${typeName}:${JSON.stringify(el.props)}`;
  }
  return JSON.stringify(v);
}

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex items-center gap-1.5">
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-4 w-4 text-[#38b1ab]"
        fill="none"
      >
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M6.5 10.2 8.8 12.5 13.6 7.7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5">
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-4 w-4 text-black/35"
        fill="none"
      >
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M7.2 7.2 12.8 12.8M12.8 7.2 7.2 12.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      No
    </span>
  );
}

function productPrice(product: Product): number {
  return product.exactSizePriceUsd ?? product.modelFromPriceUsd ?? Number.NEGATIVE_INFINITY;
}

function representativeKey(product: Product): string {
  return [
    product.brand,
    product.size,
    product.shape,
    product.groundType,
    product.maxDiameterIn ?? "",
    product.overallLengthIn ?? "",
    product.overallWidthIn ?? "",
    product.springSystem,
  ]
    .map((part) => String(part).trim().toLowerCase())
    .join("|");
}

function chooseRepresentativeProduct(products: Product[]): Product {
  return [...products].sort((a, b) => {
    const priceDelta = productPrice(b) - productPrice(a);
    if (priceDelta !== 0) return priceDelta;
    return a.model.localeCompare(b.model);
  })[0];
}

function productFootprint(product: Product): number {
  return Math.max(
    product.maxDiameterIn ?? 0,
    product.overallLengthIn ?? 0,
    product.overallWidthIn ?? 0,
  );
}

function reduceProductsForComparison(products: Product[]): Product[] {
  if (products.length <= 12) return products;

  const deduped = new Map<string, Product[]>();
  for (const product of products) {
    const key = representativeKey(product);
    if (!deduped.has(key)) deduped.set(key, []);
    deduped.get(key)!.push(product);
  }

  const representatives = Array.from(deduped.values()).map(chooseRepresentativeProduct);
  const byBrand = new Map<string, Product[]>();
  for (const product of representatives) {
    if (!byBrand.has(product.brand)) byBrand.set(product.brand, []);
    byBrand.get(product.brand)!.push(product);
  }

  const limited: Product[] = [];
  for (const brandProducts of byBrand.values()) {
    limited.push(
      ...brandProducts
        .sort((a, b) => {
          const shapeCompare = a.shape.localeCompare(b.shape);
          if (shapeCompare !== 0) return shapeCompare;
          return productFootprint(a) - productFootprint(b);
        })
        .slice(0, 8),
    );
  }

  return limited;
}

function formatMaxSingleUser(product: Product): ReactNode {
  if (isAconBrand(product.brand)) return "No published limit (≈300 lb rec.)";
  return product.maxSingleUserWeightLb ? `${product.maxSingleUserWeightLb} lb` : "—";
}

const SPEC_ROWS: SpecRow[] = [
  { label: "Size", getValue: (p) => p.size || "—" },
  { label: "Shape", getValue: (p) => p.shape || "—" },
  { label: "Max diameter", getValue: (p) => p.maxDiameterIn ? `${p.maxDiameterIn}"` : "—" },
  { label: "Overall length", getValue: (p) => p.overallLengthIn ? `${p.overallLengthIn}"` : "—" },
  { label: "Overall width", getValue: (p) => p.overallWidthIn ? `${p.overallWidthIn}"` : "—" },
  { label: "Total height", getValue: (p) => p.totalHeightIn ? `${p.totalHeightIn}"` : "—" },
  { label: "Mat height", getValue: (p) => p.matFrameHeightIn ? `${p.matFrameHeightIn}" off ground` : "—" },
  { label: "Safety net height", getValue: (p) => p.safetyNetHeightIn ? `${p.safetyNetHeightIn}"` : "—" },
  { label: "Spring system", getValue: (p) => p.springSystem || "—" },
  { label: "Spring count", getValue: (p) => p.springCount?.toString() ?? "—" },
  { label: "Spring length", getValue: (p) => p.springLengthIn ? `${p.springLengthIn}"` : "—" },
  { label: "Max single user", getValue: formatMaxSingleUser },
  { label: "Combined weight", getValue: (p) => p.combinedTotalWeightRatingLb ? `${p.combinedTotalWeightRatingLb} lb` : "—" },
  { label: "Frame material", getValue: (p) => p.frameMaterial || "—" },
  { label: "Frame tube dia.", getValue: (p) => p.frameTubeDiameterIn ? `${p.frameTubeDiameterIn}"` : "—" },
  { label: "Mat material", getValue: (p) => p.matMaterial || "—" },
  { label: "Net material", getValue: (p) => p.netMaterial || "—" },
  { label: "Padding material", getValue: (p) => p.paddingMaterial || "—" },
  { label: "Made in", getValue: (p) => p.countryMadeIn || "—" },
  {
    label: "ASTM certified",
    getValue: (p) =>
      p.meetsUsStandard === true ? <StatusIcon ok /> : p.meetsUsStandard === false ? <StatusIcon ok={false} /> : "—",
  },
  { label: "Standard details", getValue: (p) => p.usStandardDetails || "—" },
  { label: "Warranty — frame", getValue: (p) => formatWarrantyYears(p.warrantyFrameYears) },
  { label: "Warranty — mat", getValue: (p) => formatWarrantyYears(p.warrantyMatYears) },
  { label: "Warranty — springs", getValue: (p) => formatWarrantyYears(p.warrantySpringsYears) },
  { label: "Warranty — net", getValue: (p) => formatWarrantyYears(p.warrantyNetYears) },
  { label: "Price", getValue: (p) => p.exactSizePriceUsd ? formatUsd(p.exactSizePriceUsd) : p.modelFromPriceUsd ? `From ${formatUsd(p.modelFromPriceUsd)}` : "—" },
];

export default function ComparisonTable({ products, title }: { products: Product[]; title?: string }) {
  if (products.length === 0) return null;
  const tableProducts = reduceProductsForComparison(products);

  // With only one product there are no cross-model differences — show everything.
  const collapsible = tableProducts.length > 1;

  const annotated = SPEC_ROWS.map((row) => {
    const values = tableProducts.map((p) => row.getValue(p));
    const hasData = values.some((v) => hasMeaningfulValue(v));
    const allSame = new Set(values.map(nodeKey)).size === 1;
    return { row, values, hasData, allSame };
  });

  const diffRows = collapsible
    ? annotated.filter(({ hasData, allSame }) => hasData && !allSame)
    : annotated.filter(({ hasData }) => hasData);

  const sharedRows = collapsible
    ? annotated.filter(({ hasData, allSame }) => hasData && allSame)
    : [];

  if (diffRows.length === 0 && sharedRows.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-black/[0.08] shadow-sm">
        {title && (
          <div className="bg-black/[0.02] px-4 py-3 border-b border-black/[0.08]">
            <h3 className="font-semibold text-black">{title}</h3>
          </div>
        )}
        <table className="min-w-max border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-[#38b1ab] text-white">
              <th className="sticky left-0 z-30 w-[180px] min-w-[180px] bg-[#38b1ab] px-4 py-3 text-left font-semibold border-r border-[#2e9a94]">
                Specification
              </th>
              {tableProducts.map((p) => (
                <th
                  key={p.slug}
                  className="w-[150px] min-w-[150px] border-b border-black/[0.08] px-3 py-3 text-left align-top font-semibold"
                >
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-white/70">
                    {p.brand}
                  </span>
                  <span className="block whitespace-normal break-words text-[13px] leading-snug text-white">
                    {p.model}
                  </span>
                  {p.size && <span className="mt-1 block text-[11px] font-normal text-white/70">{p.size}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {diffRows.length > 0 ? (
              diffRows.map(({ row, values }, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-[#f7f8f8]"}>
                  <td
                    className={`sticky left-0 z-20 w-[180px] min-w-[180px] border-r border-black/[0.08] px-4 py-2.5 font-medium text-black/50 ${
                      i % 2 === 0 ? "bg-white" : "bg-[#f7f8f8]"
                    }`}
                  >
                    {row.label}{" "}
                  </td>
                  {values.map((val, j) => (
                    <td key={tableProducts[j].slug} className="w-[150px] min-w-[150px] border-b border-black/[0.05] px-3 py-2.5 text-black/80">
                      {val}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={tableProducts.length + 1}
                  className="px-4 py-6 text-center text-black/30 italic"
                >
                  All specs are identical across these models.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sharedRows.length > 0 && (
        <div className="rounded-xl border border-black/[0.08] bg-[#f7f8f8] px-4 py-4">
          <p className="mb-3 text-sm font-medium text-black/50">Shared across all models</p>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
            {sharedRows.map(({ row, values }) => (
              <div key={row.label}>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-black/40">{row.label}: </dt>
                <dd className="mt-0.5 text-sm text-black/80">{values[0]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
