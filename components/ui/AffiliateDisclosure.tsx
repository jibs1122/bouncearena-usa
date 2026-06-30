type AffiliateDisclosureProps = {
  className?: string;
  variant?: "general" | "amazon";
};

const AMAZON_DISCLOSURE = "As an Amazon Associate we earn from qualifying purchases.";

export default function AffiliateDisclosure({
  className = "",
  variant = "general",
}: AffiliateDisclosureProps) {
  const disclosureText = variant === "amazon"
    ? AMAZON_DISCLOSURE
    : `This page contains affiliate links and we may earn a commission on purchases. ${AMAZON_DISCLOSURE}`;

  return (
    <p className={`text-xs text-black/40 leading-relaxed ${className}`}>
      <strong className="text-black/50">Affiliate disclosure:</strong> {disclosureText}
    </p>
  );
}
