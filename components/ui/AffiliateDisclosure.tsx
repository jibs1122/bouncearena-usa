export default function AffiliateDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-black/40 leading-relaxed ${className}`}>
      <strong className="text-black/50">Affiliate disclosure:</strong> This page contains affiliate links and we may earn a commission on purchases.
    </p>
  );
}
