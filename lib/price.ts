export function formatUsd(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}
