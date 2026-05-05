export function parseWarrantyYears(val: string): number | null {
  if (!val || val.trim() === "") return null;
  const normalized = val.trim().toLowerCase();
  if (normalized.includes("lifetime")) return Number.POSITIVE_INFINITY;

  const n = parseFloat(val.replace(/,/g, ""));
  return Number.isNaN(n) ? null : n;
}

export function formatWarrantyYears(years: number | null): string {
  if (years === null) return "—";
  if (!Number.isFinite(years)) return "Lifetime";
  return `${years} yr`;
}
