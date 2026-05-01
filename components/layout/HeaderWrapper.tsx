import { getAllBrands } from '@/lib/products';
import type { SearchItem } from '@/components/SearchBox';
import Header from './Header';
import { getApprovedComparisons } from '@/lib/comparisons';

export default function HeaderWrapper() {
  const brands = getAllBrands();
  const comparisons = getApprovedComparisons();

  const searchItems: SearchItem[] = [
    ...brands.map((b) => ({
      title: b.name,
      href: `/brands/${b.slug}/`,
      category: 'brand' as const,
    })),
    ...comparisons.map((comparison) => ({
      title: comparison.title,
      href: comparison.href,
      category: 'comparison' as const,
    })),
  ];

  return <Header searchItems={searchItems} />;
}
