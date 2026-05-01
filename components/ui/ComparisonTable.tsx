import type { Product } from "@/lib/types";
import { formatUsd } from "@/lib/price";

interface SpecRow {
  label: string;
  getValue: (p: Product) => string;
}

function hasMeaningfulValue(value: string) {
  return value.trim() !== "" && value.trim() !== "—";
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
  { label: "Max single user", getValue: (p) => p.maxSingleUserWeightLb ? `${p.maxSingleUserWeightLb} lb` : "—" },
  { label: "Combined weight", getValue: (p) => p.combinedTotalWeightRatingLb ? `${p.combinedTotalWeightRatingLb} lb` : "—" },
  { label: "Frame material", getValue: (p) => p.frameMaterial || "—" },
  { label: "Frame tube dia.", getValue: (p) => p.frameTubeDiameterIn ? `${p.frameTubeDiameterIn}"` : "—" },
  { label: "Mat material", getValue: (p) => p.matMaterial || "—" },
  { label: "Net material", getValue: (p) => p.netMaterial || "—" },
  { label: "Padding material", getValue: (p) => p.paddingMaterial || "—" },
  { label: "Made in", getValue: (p) => p.countryMadeIn || "—" },
  { label: "ASTM certified", getValue: (p) => p.meetsUsStandard === true ? "✅ Yes" : p.meetsUsStandard === false ? "❌ No" : "—" },
  { label: "Standard details", getValue: (p) => p.usStandardDetails || "—" },
  { label: "Warranty — frame", getValue: (p) => p.warrantyFrameYears ? `${p.warrantyFrameYears} yr` : "—" },
  { label: "Warranty — mat", getValue: (p) => p.warrantyMatYears ? `${p.warrantyMatYears} yr` : "—" },
  { label: "Warranty — springs", getValue: (p) => p.warrantySpringsYears ? `${p.warrantySpringsYears} yr` : "—" },
  { label: "Warranty — net", getValue: (p) => p.warrantyNetYears ? `${p.warrantyNetYears} yr` : "—" },
  { label: "Price", getValue: (p) => p.exactSizePriceUsd ? formatUsd(p.exactSizePriceUsd) : p.modelFromPriceUsd ? `From ${formatUsd(p.modelFromPriceUsd)}` : "—" },
];

export default function ComparisonTable({ products, title }: { products: Product[]; title?: string }) {
  if (products.length === 0) return null;

  const visibleRows = SPEC_ROWS.filter((row) =>
    products.some((product) => hasMeaningfulValue(row.getValue(product)))
  );

  if (visibleRows.length === 0) return null;

  return (
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
            {products.map((p) => (
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
          {visibleRows.map((row, i) => (
            <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-[#f7f8f8]"}>
              <td
                className={`sticky left-0 z-20 w-[180px] min-w-[180px] border-r border-black/[0.08] px-4 py-2.5 font-medium text-black/50 ${
                  i % 2 === 0 ? "bg-white" : "bg-[#f7f8f8]"
                }`}
              >
                {row.label}
              </td>
              {products.map((p) => (
                <td key={p.slug} className="w-[150px] min-w-[150px] border-b border-black/[0.05] px-3 py-2.5 text-black/80">
                  {row.getValue(p)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
