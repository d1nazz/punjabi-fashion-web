import Layout from '@/components/Layout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductCard from '@/components/ProductCard';
import CollectionHeader from '@/components/CollectionHeader';
import CartContent from '@/components/cart/CartContent';
import { useStore } from '@/contexts/StoreContext';
import { Link } from 'react-router-dom';
import { catalogProducts, getNewArrivals, getReadyToShip, getSaleProducts, isCatalogProduct, type Product } from '@/data/products';
import { isShopifyEnabled } from '@/config/commerce';
import {
  SHOPIFY_COLLECTION_NEW_ARRIVALS,
  SHOPIFY_COLLECTION_READY_TO_SHIP,
} from '@/config/shopifyCollections';
import { useShopifyCollectionProducts } from '@/hooks/useShopifyCollectionProducts';
import { Heart, HelpCircle, PackageSearch, Phone, Store } from 'lucide-react';
import { businessInfo } from '@/data/businessInfo';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const collectionSortOptions = [
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

const menTabs = [
  { label: 'New Arrivals', path: '/new-arrivals' },
  { label: 'Men Punjabi Suits', path: '/category/sherwanis' },
  { label: 'Kurtas', path: '/category/kurta-pajama' },
  { label: 'Ready to Ship', path: '/ready-to-ship' },
];

const discoveryTabs = [
  { label: 'Women', path: '/women' },
  { label: 'Men', path: '/men' },
  { label: 'Kids', path: '/category/kids' },
  { label: 'Accessories', path: '/category/accessories' },
  { label: 'Ready to Ship', path: '/ready-to-ship' },
];

function sortCollectionProducts(items: Product[], sortBy: string) {
  switch (sortBy) {
    case 'newest':
      return items.filter((p) => p.isNew).concat(items.filter((p) => !p.isNew));
    case 'price-asc':
      return [...items].sort((a, b) => a.price - b.price);
    case 'price-desc':
      return [...items].sort((a, b) => b.price - a.price);
    default:
      return items;
  }
}

function CollectionListingPage({
  title,
  description,
  items,
  breadcrumbItems,
  tabs,
  activeTab,
  shopifyCollectionHandle = null,
}: {
  title: string;
  description: string;
  items: Product[];
  breadcrumbItems: { name: string; path?: string }[];
  tabs: { label: string; path: string }[];
  activeTab: string;
  /** When set and `VITE_COMMERCE_BACKEND=shopify`, load grid from this collection (merged with local). */
  shopifyCollectionHandle?: string | null;
}) {
  const [sortBy, setSortBy] = useState('featured');
  const { data: shopifyListing, isSuccess: shopifyOk, isError: shopifyErr } =
    useShopifyCollectionProducts(shopifyCollectionHandle ?? null);

  const listingSource = useMemo(() => {
    if (!isShopifyEnabled || !shopifyCollectionHandle) return items;
    if (shopifyErr) return items;
    if (shopifyOk && shopifyListing?.length) return shopifyListing;
    return items;
  }, [items, shopifyCollectionHandle, shopifyOk, shopifyErr, shopifyListing]);

  const sortedItems = useMemo(
    () => sortCollectionProducts(listingSource, sortBy),
    [listingSource, sortBy],
  );

  return (
    <Layout>
      <CollectionHeader
        breadcrumbItems={breadcrumbItems}
        title={title}
        description={description}
        tabs={tabs}
        activeTab={activeTab}
        productCount={listingSource.length}
        visibleCount={sortedItems.length}
        filterLabel="Filter"
        sortValue={sortBy}
        sortOptions={collectionSortOptions}
        onSortChange={setSortBy}
      />
      <div className="container py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {sortedItems.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </Layout>
  );
}

export function WishlistPage() {
  const { wishlist } = useStore();
  const visibleWishlist = wishlist.filter((item) => isCatalogProduct(item.product));
  return (
    <Layout>
      <div className="bg-champagne py-12 md:py-16 texture-subtle">
        <div className="container relative z-10"><Breadcrumbs items={[{ name: 'Wishlist' }]} />
          <h1 className="heading-editorial text-foreground">Your Wishlist</h1>
          <p className="text-muted-foreground text-[13px] mt-1">{visibleWishlist.length} {visibleWishlist.length === 1 ? 'item' : 'items'} saved</p>
        </div>
      </div>
      <div className="container py-12">
        {visibleWishlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">{visibleWishlist.map(i => <ProductCard key={i.product.id} product={i.product} />)}</div>
        ) : (
          <div className="text-center py-24">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-border flex items-center justify-center">
              <Heart className="w-6 h-6 text-gold/40" strokeWidth={1.5} />
            </div>
            <h3 className="font-heading text-2xl text-foreground mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground text-[13px] mb-8 max-w-sm mx-auto">Save pieces you love for later. Tap the heart icon on any product to add it here.</p>
            <Link to="/women" className="btn-luxury btn-luxury-gold">Explore Collections</Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

export function CartPage() {
  const { cartCount } = useStore();

  return (
    <Layout>
      <section className="border-b border-[#E6D8C4] bg-[#FBF7EF] py-8 md:py-10">
        <div className="container relative z-10">
          <Breadcrumbs items={[{ name: 'Cart' }]} />
          <p className="label-editorial mb-3 text-[#5C1B24]">Your Selection</p>
          <h1 className="heading-editorial text-3xl text-[#3A1117] md:text-4xl">Cart</h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </section>
      <section className="bg-[#FBF7EF] py-8 md:py-12">
        <div className="container">
          <div className="mx-auto flex min-h-[620px] max-w-[480px] flex-col overflow-hidden border border-[#E6D8C4] bg-[#FFFDF8] shadow-[0_24px_70px_rgba(58,17,23,0.07)]">
            <CartContent />
          </div>
        </div>
      </section>
    </Layout>
  );
}

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return catalogProducts.filter(p => p.name.toLowerCase().includes(q) || p.category.includes(q) || p.description.toLowerCase().includes(q) || p.occasion.some(o => o.toLowerCase().includes(q)));
  }, [query]);
  return (
    <Layout>
      <div className="bg-champagne py-12 md:py-16 texture-subtle">
        <div className="container relative z-10">
          <p className="label-editorial mb-2">Search Results</p>
          <h1 className="heading-editorial text-foreground">"{query}"</h1>
          <p className="text-muted-foreground text-[13px] mt-1">{results.length} {results.length === 1 ? 'piece' : 'pieces'} found</p>
        </div>
      </div>
      <div className="container py-12">
        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">{results.map(p => <ProductCard key={p.id} product={p} />)}</div>
        ) : (
          <div className="text-center py-24">
            <h3 className="font-heading text-2xl text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground text-[13px] mb-6">Try searching for something else — like "bridal lehenga" or "Punjabi suit"</p>
            <Link to="/women" className="btn-luxury btn-luxury-outline">Browse Collections</Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

export function NewArrivalsPage() {
  const items = getNewArrivals();
  return (
    <CollectionListingPage
      title="New Arrivals"
      description="The latest additions to our curated collection — fresh styles for bridal, festive, and everyday elegance."
      items={items}
      breadcrumbItems={[{ name: 'Shop' }, { name: 'New Arrivals' }]}
      tabs={discoveryTabs}
      activeTab="New Arrivals"
      shopifyCollectionHandle={SHOPIFY_COLLECTION_NEW_ARRIVALS}
    />
  );
}

export function ReadyToShipPage() {
  const items = getReadyToShip();
  return (
    <CollectionListingPage
      title="Ready to Ship"
      description="In stock and beautifully packaged — these pieces are ready for your wardrobe."
      items={items}
      breadcrumbItems={[{ name: 'Shop' }, { name: 'Ready to Ship' }]}
      tabs={discoveryTabs}
      activeTab="Ready to Ship"
      shopifyCollectionHandle={SHOPIFY_COLLECTION_READY_TO_SHIP}
    />
  );
}

export function SalePage() {
  const items = getSaleProducts();
  return (
    <CollectionListingPage
      title="Sale & Special Offers"
      description="Premium styles at exceptional value — handpicked for you."
      items={items}
      breadcrumbItems={[{ name: 'Shop' }, { name: 'Sale' }]}
      tabs={discoveryTabs}
      activeTab="Sale"
    />
  );
}

export function SizeGuidePage() {
  useEffect(() => {
    document.title = 'Size Guide | Punjabi Fashion';
    const description =
      'View Punjabi Fashion’s size guide for tops and bottoms with body measurements in inches. Contact the Brampton boutique for sizing help.';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, []);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const topMeasurements = [
    { label: 'Bust', values: ['32', '34', '36', '38', '41', '44'] },
    { label: 'Waist', values: ['26', '28', '30', '32', '35', '38'] },
    { label: 'Hip', values: ['36', '38', '40', '42', '45', '48'] },
  ];
  const bottomMeasurements = [
    { label: 'Waist', values: ['26', '28', '30', '32', '34', '36'] },
    { label: 'Hip', values: ['36', '38', '40', '42', '45', '48'] },
  ];
  const helpCards = [
    {
      title: 'How to Measure',
      desc: 'Use a soft measuring tape and measure close to the body without pulling too tight.',
    },
    {
      title: 'Between Sizes?',
      desc: 'Choose the larger size if you prefer comfort or plan to alter the piece.',
    },
    {
      title: 'Need Help?',
      desc: 'Contact Punjabi Fashion for sizing support before ordering or visiting the boutique.',
    },
  ];

  const renderMeasurementTable = (
    title: string,
    subtitle: string,
    rows: { label: string; values: string[] }[],
  ) => (
    <section className="border border-[#E6D8C4] bg-[#FFFDF8] shadow-[0_18px_50px_-42px_rgba(26,18,15,0.35)]">
      <div className="border-b border-[#E6D8C4] p-5 md:p-6">
        <h2 className="heading-editorial text-2xl text-[#3A1117]">{title}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{subtitle}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[680px] w-full text-[14px]">
          <caption className="sr-only">{title} measurements in inches</caption>
          <thead>
            <tr className="border-b border-[#E6D8C4] bg-[#FBF7EF] text-[#3A1117]">
              <th scope="col" className="px-4 py-4 text-left font-heading text-[16px] font-normal">Measurement</th>
              {sizes.map((size) => (
                <th key={size} scope="col" className="px-4 py-4 text-center font-semibold">{size}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-[#E6D8C4]/80 last:border-0">
                <th scope="row" className="px-4 py-4 text-left font-semibold text-[#1A120F]">{row.label}</th>
                {row.values.map((value, index) => (
                  <td key={`${row.label}-${sizes[index]}`} className="px-4 py-4 text-center text-[#6F6257]">{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <Layout>
      <section className="border-b border-[#E6D8C4] bg-[#FFFDF8] py-12 md:py-16">
        <div className="container relative z-10 text-center">
          <Breadcrumbs items={[{ name: 'Size Guide' }]} />
          <p className="label-editorial mb-3 text-[#5C1B24]">Fit Guide</p>
          <h1 className="heading-editorial text-3xl text-foreground md:text-5xl">Size Guide</h1>
          <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-muted-foreground md:text-[15px]">
            Use this chart as a general guide for body measurements in inches. For the best fit, compare your measurements before ordering or contact Punjabi Fashion for personalized sizing help.
          </p>
          <div className="mx-auto mt-5 h-px w-24 bg-gold/60" aria-hidden="true" />
          <span className="mt-6 inline-flex border border-gold/25 bg-[#FBF7EF] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5C1B24]">
            Measurements shown in inches
          </span>
        </div>
      </section>

      <section className="bg-[#FBF7EF] py-12 md:py-16">
        <div className="container max-w-5xl space-y-8">
          {renderMeasurementTable(
            'Body Measurement for Top',
            'Use this chart for tops, kameez, blouses, and upper-body fit guidance.',
            topMeasurements,
          )}

          {renderMeasurementTable(
            'Body Measurement for Bottom',
            'Use this chart for bottoms, salwar, trousers, skirts, and lower-body fit guidance.',
            bottomMeasurements,
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {helpCards.map((card) => (
              <article key={card.title} className="border border-[#E6D8C4] bg-[#FFFDF8] p-5 shadow-[0_14px_42px_rgba(58,17,23,0.05)]">
                <h2 className="font-heading text-xl text-[#3A1117]">{card.title}</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{card.desc}</p>
              </article>
            ))}
          </div>

          <div className="border border-gold/25 bg-[#3A1117] p-6 text-center text-cream md:p-8">
            <p className="label-editorial mb-3 text-gold-light/85">Sizing Support</p>
            <h2 className="heading-editorial text-2xl text-cream">Need help choosing a size?</h2>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={businessInfo.phone.href} className="btn-luxury btn-luxury-gold justify-center">Call Store</a>
              <Link to="/contact" className="btn-luxury border border-gold/35 text-cream hover:bg-cream hover:text-charcoal justify-center">Contact Us</Link>
              <Link to="/visit-store" className="btn-luxury border border-gold/35 text-cream hover:bg-cream hover:text-charcoal justify-center">Visit Store</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export function TrackOrderPage() {
  const [submitted, setSubmitted] = useState(false);
  const helpCards = [
    {
      icon: HelpCircle,
      title: 'Order Questions',
      desc: 'Contact the store with your order number for help.',
    },
    {
      icon: PackageSearch,
      title: 'Pickup / Delivery',
      desc: 'Ask about pickup, delivery, or item availability.',
    },
    {
      icon: Store,
      title: 'Store Support',
      desc: 'Visit the Brampton boutique for direct assistance.',
    },
  ];

  return (
    <Layout>
      <section className="border-b border-[#E6D8C4] bg-[#FFFDF8] py-12 md:py-16">
        <div className="container relative z-10 text-center">
          <Breadcrumbs items={[{ name: 'Track Order' }]} />
          <p className="label-editorial mb-3 text-[#5C1B24]">Order Support</p>
          <h1 className="heading-editorial text-3xl text-foreground md:text-5xl">Track Your Order</h1>
          <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-muted-foreground md:text-[15px]">
            Enter your order details below. If tracking is not available yet, contact Punjabi Fashion and our team will help you with your order status.
          </p>
          <div className="mx-auto mt-5 h-px w-24 bg-gold/60" aria-hidden="true" />
        </div>
      </section>

      <section className="bg-[#FBF7EF] py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-[640px] border border-[#E6D8C4] bg-[#FFFDF8] p-6 text-center shadow-[0_22px_70px_rgba(58,17,23,0.07)] md:p-10">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-gold/25 bg-[#FBF7EF] text-gold">
              <PackageSearch className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <h2 className="font-heading text-2xl text-[#3A1117]">Check Order Status</h2>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
              Use your order number and email address to check for updates.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="mt-7 space-y-5 text-left"
            >
              <div>
                <label htmlFor="track-order-number" className="label-luxury mb-2 block text-muted-foreground">Order Number</label>
                <input
                  id="track-order-number"
                  name="orderNumber"
                  placeholder="Enter your order number"
                  className="h-14 w-full border border-[#E6D8C4] bg-[#FFFDF8] px-4 text-[13px] text-foreground transition-colors placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/15"
                />
              </div>
              <div>
                <label htmlFor="track-email" className="label-luxury mb-2 block text-muted-foreground">Email Address</label>
                <input
                  id="track-email"
                  name="email"
                  placeholder="you@email.com"
                  type="email"
                  className="h-14 w-full border border-[#E6D8C4] bg-[#FFFDF8] px-4 text-[13px] text-foreground transition-colors placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/15"
                />
              </div>
              <button type="submit" className="w-full btn-luxury btn-luxury-gold py-4">
                Track Order
              </button>
            </form>

            {submitted && (
              <div className="mt-5 border border-gold/25 bg-[#FBF7EF] p-4 text-[13px] leading-relaxed text-[#6F6257]" role="status" aria-live="polite">
                Online tracking is being finalized. Please contact Punjabi Fashion with your order number for the latest update.
              </div>
            )}

            <p className="mt-5 text-[12px] leading-relaxed text-muted-foreground">
              Online order tracking is being finalized. For immediate help, please call Punjabi Fashion or contact the store directly.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <a href={businessInfo.phone.href} className="btn-luxury btn-luxury-outline justify-center text-center">
                Call Store
              </a>
              <Link to="/contact" className="btn-luxury btn-luxury-outline justify-center text-center">
                Contact Us
              </Link>
              <Link to="/visit-store" className="btn-luxury btn-luxury-outline justify-center text-center">
                Visit Store
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
            {helpCards.map((card) => (
              <div key={card.title} className="border border-[#E6D8C4] bg-[#FFFDF8] p-5 text-center shadow-[0_14px_42px_rgba(58,17,23,0.05)]">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gold/12 text-gold">
                  <card.icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="font-heading text-lg text-[#3A1117]">{card.title}</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{card.desc}</p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-[12px] leading-relaxed text-muted-foreground">
            {businessInfo.name} · {businessInfo.address.short} · {businessInfo.phone.display} · Hours: {businessInfo.hoursDisplay}
          </p>
        </div>
      </section>
    </Layout>
  );
}

export function WomenPage() {
  const items = catalogProducts.filter(p => ['punjabi-suits','lehengas','party-wear','sarees','anarkalis','sharara-gharara','gowns','dresses-kaftans','kurtis','womens-kurtis','blouses'].includes(p.category));
  return (
    <CollectionListingPage
      title="Women"
      description="From bridal lehengas to everyday kurtis, explore our full range of women&apos;s South Asian fashion."
      items={items}
      breadcrumbItems={[{ name: 'Shop' }, { name: 'Women' }]}
      tabs={womenTabs}
      activeTab="Women"
    />
  );
}

export function MenPage() {
  const items = catalogProducts.filter(p => ['sherwanis','kurta-pajama','mens-jackets'].includes(p.category));
  return (
    <CollectionListingPage
      title="Men"
      description="Distinguished sherwanis, kurta sets, and jackets for grooms, groomsmen, and gentlemen."
      items={items}
      breadcrumbItems={[{ name: 'Shop' }, { name: 'Men' }]}
      tabs={menTabs}
      activeTab="Men"
    />
  );
}
