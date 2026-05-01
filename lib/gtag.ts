declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

function fire(eventName: string, params?: Record<string, string | number | boolean | undefined>) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

export function trackOutboundClick({
  url,
  label,
  location,
}: {
  url: string;
  label: string;
  location: string;
}) {
  fire('outbound_click', { link_url: url, link_text: label, source_location: location });
}
