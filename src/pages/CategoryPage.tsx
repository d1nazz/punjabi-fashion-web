import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import CollectionHeader from '@/components/CollectionHeader';
import { getCategoryBySlug, getProductsByCategory, getPartyWearProducts, getFestiveProducts, getBridalProducts, type Product } from '@/data/products';
import { useState, useMemo } from 'react';
import { isShopifyEnabled } from '@/config/commerce';
import { getShopifyCollectionHandleForCategorySlug } from '@/config/shopifyCollections';
import { useShopifyCollectionProducts } from '@/hooks/useShopifyCollectionProducts';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const womenTabs = [
  { label: 'New Arrivals', path: '/new-arrivals' },
  { label: 'Lehengas', path: '/category/lehengas' },
  { label: 'Party Wear', path: '/category/party-wear' },
  { label: 'Shararas', path: '/category/sharara-gharara' },
  { label: 'Punjabi Suits', path: '/category/punjabi-suits' },
  { label: 'Women’s Kurti’s', path: '/category/womens-kurtis' },
  { label: 'Blouses', path: '/category/blouses' },
  { label: 'Ready to Ship', path: '/ready-to-ship' },
];

const womenCategorySlugs = new Set([
  'lehengas',
  'party-wear',
  'sharara-gharara',
  'punjabi-suits',
  'womens-kurtis',
  'blouses',
]);

const menTabs = [
  { label: 'New Arrivals', path: '/new-arrivals' },
  { label: 'Men Punjabi Suits', path: '/category/sherwanis' },
  { label: 'Kurtas', path: '/category/kurta-pajama' },
  { label: 'Ready to Ship', path: '/ready-to-ship' },
];

const kidsTabs = [
  { label: 'Kids Punjabi Suits', path: '/category/kids' },
  { label: 'New Arrivals', path: '/new-arrivals' },
];

const accessoriesTabs = [
  { label: 'Bangles', path: '/category/bangles' },
  { label: 'Earrings', path: '/category/earrings' },
  { label: 'Necklaces', path: '/category/necklaces' },
  { label: 'New Arrivals', path: '/new-arrivals' },
];

const categoryMeta: Record<string, { parent: string; label: string; tabs: typeof womenTabs }> = {
  lehengas: { parent: 'Women', label: 'Lehengas', tabs: [{ label: 'Women', path: '/women' }, ...womenTabs.filter((tab) => tab.label !== 'Lehengas')] },
  'party-wear': { parent: 'Women', label: 'Party Wear', tabs: [{ label: 'Women', path: '/women' }, ...womenTabs.filter((tab) => tab.label !== 'Party Wear')] },
  'sharara-gharara': { parent: 'Women', label: 'Shararas', tabs: [{ label: 'Women', path: '/women' }, ...womenTabs.filter((tab) => tab.label !== 'Shararas')] },
  'punjabi-suits': { parent: 'Women', label: 'Punjabi Suits', tabs: [{ label: 'Women', path: '/women' }, ...womenTabs.filter((tab) => tab.label !== 'Punjabi Suits')] },
  'womens-kurtis': { parent: 'Women', label: 'Women’s Kurti’s', tabs: [{ label: 'Women', path: '/women' }, ...womenTabs.filter((tab) => tab.label !== 'Women’s Kurti’s')] },
  blouses: { parent: 'Women', label: 'Blouses', tabs: [{ label: 'Women', path: '/women' }, ...womenTabs.filter((tab) => tab.label !== 'Blouses')] },
  sherwanis: { parent: 'Men', label: 'Men Punjabi Suits', tabs: [{ label: 'Men', path: '/men' }, ...menTabs.filter((tab) => tab.label !== 'Men Punjabi Suits')] },
  'kurta-pajama': { parent: 'Men', label: 'Kurtas', tabs: [{ label: 'Men', path: '/men' }, ...menTabs.filter((tab) => tab.label !== 'Kurtas')] },
  kids: { parent: 'Kids', label: 'Kids', tabs: kidsTabs },
  accessories: { parent: 'Accessories', label: 'Accessories', tabs: accessoriesTabs },
  bangles: { parent: 'Accessories', label: 'Bangles', tabs: accessoriesTabs },
  earrings: { parent: 'Accessories', label: 'Earrings', tabs: accessoriesTabs },
  necklaces: { parent: 'Accessories', label: 'Necklaces', tabs: accessoriesTabs },
  jewelry: { parent: 'Accessories', label: 'Jewelry', tabs: accessoriesTabs },
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);

  const shopifyCollectionHandle = useMemo(
    () => (slug ? getShopifyCollectionHandleForCategorySlug(slug) : null),
    [slug],
  );
  const { data: shopifyListingProducts, isSuccess: shopifyListOk, isError: shopifyListErr } =
    useShopifyCollectionProducts(shopifyCollectionHandle);

  const category = slug ? getCategoryBySlug(slug) : null;
  
  let allProducts: Product[] = [];
  let title = '';
  let description = '';
  let editorialIntro = '';

  if (slug === 'party-wear') {
    allProducts = getPartyWearProducts();
    title = 'Party Wear';
    description = 'Statement pieces for every celebration';
    editorialIntro = 'From sangeet nights to cocktail evenings, our party wear collection is designed to make you the centre of attention. Discover striking silhouettes, bold embellishments, and contemporary cuts that celebrate your individuality.';
  } else if (slug === 'festive') {
    allProducts = getFestiveProducts();
    title = 'Festive Wear';
    description = 'Celebrate in style with our festive collection';
    editorialIntro = 'Dress for the moments that bring families together. Our festive collection captures the joy of Eid, Diwali, Vaisakhi, and every celebration in between — with elegance that feels effortless.';
  } else if (slug === 'bridal') {
    allProducts = getBridalProducts();
    title = 'The Bridal Collection';
    description = 'Luxurious bridal wear for your most cherished day';
    editorialIntro = 'Every bride deserves to feel extraordinary. Our bridal collection brings together the finest fabrics, hand-embroidered artistry, and timeless silhouettes — curated to honour tradition while embracing the modern bride.';
  } else if (slug === 'accessories') {
    allProducts = getProductsByCategory('accessories');
    title = 'Accessories';
    description = category?.description ?? 'Complete your look with premium accessories';
  } else if (category) {
    allProducts = getProductsByCategory(slug!);
    title = category.name;
    description = category.description;
  } else {
    title = slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Collection';
    description = 'Explore our curated collection';
  }

  const listingSource = useMemo(() => {
    if (!isShopifyEnabled || !shopifyCollectionHandle) return allProducts;
    if (shopifyListErr) return allProducts;
    if (shopifyListOk && shopifyListingProducts?.length) {
      if (slug && womenCategorySlugs.has(slug)) {
        const shopifyProductKeys = new Set(
          shopifyListingProducts.flatMap((product) => [product.id, product.slug, product.sku]),
        );
        const localOnlyProducts = allProducts.filter(
          (product) => !shopifyProductKeys.has(product.id) && !shopifyProductKeys.has(product.slug) && !shopifyProductKeys.has(product.sku),
        );
        return [...shopifyListingProducts, ...localOnlyProducts];
      }
      return shopifyListingProducts;
    }
    return allProducts;
  }, [
    allProducts,
    shopifyCollectionHandle,
    shopifyListOk,
    shopifyListErr,
    shopifyListingProducts,
    slug,
  ]);

  const sortedProducts = useMemo(() => {
    let filtered = [...listingSource];
    if (selectedOccasion) {
      filtered = filtered.filter(p => p.occasion.includes(selectedOccasion));
    }
    switch (sortBy) {
      case 'newest': return filtered.filter(p => p.isNew).concat(filtered.filter(p => !p.isNew));
      case 'price-asc': return [...filtered].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...filtered].sort((a, b) => b.price - a.price);
      default: return filtered;
    }
  }, [listingSource, sortBy, selectedOccasion]);

  const meta = slug ? categoryMeta[slug] : undefined;
  const displayTitle = meta?.label ?? title;
  const parentPath =
    meta?.parent === 'Women' ? '/women' :
    meta?.parent === 'Men' ? '/men' :
    meta?.parent === 'Accessories' ? '/category/accessories' :
    meta?.parent === 'Kids' ? '/category/kids' :
    undefined;
  const breadcrumbItems = meta?.parent
    ? meta.parent === displayTitle
      ? [{ name: 'Shop' }, { name: displayTitle }]
      : [{ name: 'Shop' }, { name: meta.parent, path: parentPath }, { name: displayTitle }]
    : [{ name: 'Shop' }, { name: displayTitle }];
  const isBanglesPage = slug === 'bangles';

  return (
    <Layout>
      <CollectionHeader
        breadcrumbItems={breadcrumbItems}
        title={displayTitle}
        description={editorialIntro || description}
        tabs={meta?.tabs ?? womenTabs}
        activeTab={displayTitle}
        productCount={listingSource.length}
        visibleCount={sortedProducts.length}
        onFilterClick={() => setFiltersOpen(!filtersOpen)}
        filterLabel={filtersOpen ? 'Hide Filter' : 'Filter'}
        sortValue={sortBy}
        sortOptions={sortOptions}
        onSortChange={setSortBy}
      />

      <div className="container py-8 md:py-10">
        <div className="flex flex-col gap-8 md:flex-row md:gap-10">
          {/* Filters Sidebar */}
          {filtersOpen && (
            <div className="w-full flex-shrink-0 border border-border bg-card p-5 md:w-56">
              <div className="flex items-center justify-between mb-5">
                <h3 className="label-luxury text-foreground">Refine By</h3>
                <button onClick={() => setSelectedOccasion(null)} className="text-[10px] text-gold uppercase tracking-wider hover:underline">Clear</button>
              </div>

              <div className="mb-8">
                <h4 className="label-luxury text-muted-foreground mb-3 pb-2 border-b border-border">Occasion</h4>
                <div className="space-y-0.5">
                  {['Bridal', 'Wedding', 'Party', 'Festive', 'Casual', 'Reception', 'Sangeet', 'Mehndi', 'Eid'].map(occ => (
                    <button key={occ} onClick={() => setSelectedOccasion(selectedOccasion === occ ? null : occ)}
                      className={`block w-full text-left py-2 px-2 text-[13px] rounded-sm transition-all ${
                        selectedOccasion === occ ? 'text-gold bg-gold/5 font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}>
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="label-luxury text-muted-foreground mb-3 pb-2 border-b border-border">Size</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <button key={s} className="w-10 h-10 border border-border text-[11px] hover:border-gold hover:text-gold transition-colors">{s}</button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="label-luxury text-muted-foreground mb-3 pb-2 border-b border-border">Availability</h4>
                <label className="flex items-center gap-2.5 py-1.5 text-[13px] cursor-pointer text-muted-foreground hover:text-foreground">
                  <input type="checkbox" className="accent-gold w-3.5 h-3.5" />Ready to Ship
                </label>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {sortedProducts.length > 0 ? (
              <div className={`grid grid-cols-2 ${filtersOpen ? 'md:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4'} gap-4 md:gap-6`}>
                {sortedProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : isBanglesPage ? (
              <div className="border border-[#E6D8C4] bg-[#FFFDF8] px-6 py-16 text-center shadow-[0_22px_70px_rgba(58,17,23,0.06)] md:px-10 md:py-20">
                <div className="divider-ornament mb-6"><span className="text-gold/40 text-[8px]">◆</span></div>
                <p className="label-editorial mb-3 text-[#5C1B24]">Collection Update</p>
                <h3 className="heading-editorial text-3xl text-[#3A1117] md:text-4xl">Bangles</h3>
                <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-muted-foreground md:text-[15px]">
                  Our bangle collection is being updated with new pieces.
                </p>
                <p className="mx-auto mt-3 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
                  New bangle styles will be added soon. Visit our Brampton boutique or contact us for current in-store availability.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link to="/visit-store" className="btn-luxury btn-luxury-gold justify-center">Visit Store</Link>
                  <Link to="/contact" className="btn-luxury btn-luxury-outline justify-center">Contact Us</Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="divider-ornament mb-6"><span className="text-gold/30 text-[8px]">◆</span></div>
                <h3 className="font-heading text-2xl text-foreground mb-3">No pieces found</h3>
                <p className="text-muted-foreground text-[13px] mb-6">Try adjusting your filters or explore other collections.</p>
                <Link to="/women" className="btn-luxury btn-luxury-outline">Browse All Collections</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
