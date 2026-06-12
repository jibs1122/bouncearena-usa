import { getAllBrands } from '@/lib/products';
import type { SearchItem } from '@/components/SearchBox';
import Header from './Header';
import { getApprovedComparisons } from '@/lib/comparisons';
import { getApprovedModelComparisons } from '@/lib/modelComparisons';

export default function HeaderWrapper() {
  const brands = getAllBrands();
  const comparisons = getApprovedComparisons();
  const modelComparisons = getApprovedModelComparisons();

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
    ...modelComparisons.map((comparison) => ({
      title: comparison.title,
      href: `/compare/${comparison.slug}/`,
      category: 'comparison' as const,
      description: comparison.metaDescription,
    })),
  ];

  return <Header searchItems={searchItems} />;
}
