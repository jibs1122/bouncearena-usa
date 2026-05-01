export default function AffiliateDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-black/40 leading-relaxed ${className}`}>
      <strong className="text-black/50">Affiliate Disclosure:</strong> This page contains affiliate links. If you click through and purchase, we may earn a commission at no additional cost to you.
    </p>
  );
}
