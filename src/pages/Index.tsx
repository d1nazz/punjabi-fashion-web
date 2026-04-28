import { FormEvent, type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Heart, MapPin, Phone, Sparkles, Star, Store, Truck } from 'lucide-react';
import heroBridal from '@/assets/hero-bridal.jpg';
import carpetFrame from '@/assets/punjabi-carpet-frame.png';
import Layout from '@/components/Layout';
import { formatPrice, getNewArrivals, getReadyToShip, products, type Product } from '@/data/products';
import { businessInfo } from '@/data/businessInfo';

const normalize = (value: string) => value.toLowerCase().replace(/&/g, '').replace(/\s+/g, '-');

const productMatches = (product: Product, slug: string) => {
  const normalizedSlug = normalize(slug);
  return (
    normalize(product.category) === normalizedSlug ||
    (product.subcategory ? normalize(product.subcategory) === normalizedSlug : false) ||
    product.tags.some((tag) => normalize(tag) === normalizedSlug)
  );
};

const firstProduct = (slug: string) => products.find((product) => productMatches(product, slug));
const productsFor = (slug: string) => products.filter((product) => productMatches(product, slug));

const uniqueProducts = (items: (Product | undefined)[]) => {
  const seen = new Set<string>();
  return items.filter((item): item is Product => {
    if (!item || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const productImageFit = (product: Product) =>
  ['Bangles', 'Earrings', 'Necklaces'].includes(product.subcategory ?? '') || ['bangles', 'necklaces'].includes(product.category)
    ? 'object-contain'
    : 'object-contain';

const isAccessoryProduct = (product: Product) => {
  const values = [
    product.category,
    product.subcategory,
    ...product.tags,
  ]
    .filter(Boolean)
    .map((value) => normalize(String(value)));

  return values.some((value) => ['accessories', 'bangles', 'earrings', 'necklaces', 'jewelry'].includes(value));
};

function HomeProductFrame({ children, className = '', product }: { children: ReactNode; className?: string; product?: Product }) {
  const useSimpleFrame = product ? isAccessoryProduct(product) : false;

  return (
    <div
      className={`relative overflow-hidden ${className} ${
        useSimpleFrame
          ? '!border-[#E6D8C4] bg-[#FFFDF8] shadow-[0_12px_30px_rgba(58,17,23,0.06)]'
          : 'bg-[#3A1117]'
      }`}
      style={
        useSimpleFrame
          ? undefined
          : {
              backgroundImage: `url(${carpetFrame})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
      }
    >
      {useSimpleFrame ? (
        <div className="pointer-events-none absolute inset-2 border border-[#C6A15B]/15" aria-hidden="true" />
      ) : (
        <div className="absolute inset-0 bg-[#120B0A]/10" aria-hidden="true" />
      )}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

function HomepageProductTile({ product, tone = 'light' }: { product: Product; tone?: 'light' | 'dark' }) {
  const isDark = tone === 'dark';

  return (
    <Link
      to={`/product/${product.slug}`}
      className={`group block border p-2 transition-all duration-300 hover:-translate-y-0.5 ${
        isDark
          ? 'border-gold/20 bg-[#FFFDF8] shadow-[0_18px_55px_-40px_rgba(0,0,0,0.7)] hover:border-gold/60'
          : 'border-[#E6D8C4] bg-[#FFFDF8] shadow-[0_18px_45px_-36px_rgba(26,18,15,0.35)] hover:border-gold/60'
      }`}
    >
      <HomeProductFrame product={product} className="aspect-[3/4] border border-[#C6A15B]/30 p-2 shadow-[0_18px_50px_rgba(58,17,23,0.12)] md:p-3">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNew && <span className="bg-[#5C1B24]/90 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-cream">New</span>}
          {product.isReadyToShip && <span className="bg-gold/95 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-charcoal">Ready</span>}
        </div>
      </HomeProductFrame>
      <div className="px-1 pb-1 pt-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#5C1B24]/70">{product.subcategory ?? product.category}</p>
        <h3 className="mt-1 line-clamp-2 font-heading text-[15px] leading-snug text-[#1A120F] transition-colors group-hover:text-[#5C1B24]">
          {product.name}
        </h3>
        <p className="mt-1.5 text-[13px] font-semibold tracking-wide text-[#1A120F]">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

function StoreCollectionCard({
  title,
  desc,
  path,
  product,
  featured = false,
}: {
  title: string;
  desc: string;
  path: string;
  product: Product;
  featured?: boolean;
}) {
  return (
    <Link
      to={path}
      className={`group flex h-full flex-col overflow-hidden border border-[#E6D8C4] bg-[#FFFDF8] shadow-[0_18px_45px_-38px_rgba(26,18,15,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 ${
        featured ? 'p-2' : 'p-1.5'
      }`}
    >
      <HomeProductFrame
        product={product}
        className={`${featured ? 'h-[310px] md:h-[360px] lg:h-[420px]' : 'h-[170px] sm:h-[190px] lg:h-[175px] xl:h-[190px]'} border border-[#C6A15B]/30 p-3 shadow-none`}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full ${productImageFit(product)} transition-transform duration-700 group-hover:scale-[1.02]`}
        />
      </HomeProductFrame>
      <div className={`${featured ? 'p-5 md:p-6' : 'p-3.5'} flex flex-1 flex-col`}>
        <h3 className={`font-heading leading-tight text-[#1A120F] transition-colors group-hover:text-[#5C1B24] ${featured ? 'text-3xl' : 'text-xl'}`}>
          {title}
        </h3>
        <p className={`mt-2 text-muted-foreground ${featured ? 'text-[13px] leading-relaxed' : 'line-clamp-2 text-[12px] leading-relaxed'}`}>
          {desc}
        </p>
        <span className="mt-auto inline-flex pt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5C1B24]">
          Shop Now <ArrowRight className="ml-2 h-3 w-3" strokeWidth={1.6} />
        </span>
      </div>
    </Link>
  );
}

const trustPoints = [
  { icon: MapPin, label: 'Local Store', title: 'Brampton Boutique', desc: 'Shop locally at Punjabi Fashion in Brampton for clothing, jewelry, and accessories.' },
  { icon: Store, label: 'Flexible Shopping', title: 'In-Store & Online', desc: 'Browse online, then visit the boutique for sizing, colour matching, and styling support.' },
  { icon: Sparkles, label: 'Boutique Care', title: 'Styling Help Available', desc: 'Get help pairing suits, lehengas, bangles, earrings, and necklaces for your occasion.' },
  { icon: Heart, label: 'Full Looks', title: 'Clothing + Accessories', desc: 'Find Punjabi suits, party wear, shararas, lehengas, men’s styles, kids’ outfits, and finishing pieces.' },
  { icon: Clock, label: 'Store Hours', title: 'Open Daily', desc: businessInfo.hoursDisplay },
  { icon: Truck, label: 'Quick Browse', title: 'Ready-to-Ship Options', desc: 'Explore selected pieces available for faster browsing, pickup, or delivery options.' },
];

const googleProfileUrl =
  'https://www.google.com/maps/search/?api=1&query=Punjabi%20Fashion%2080%20Pertosa%20Dr%20Unit%2010%20Brampton%20ON%20L6X%205E9';

const googleReviewSnippets = [
  {
    initial: 'K',
    name: 'Kamalpreet Kaur',
    time: '4 months ago',
    text: 'I had a great experience with suit fitting at this Punjabi fashion boutique...',
  },
  {
    initial: 'G',
    name: 'Gurasees Dhaliwal',
    time: '7 months ago',
    text: 'This place has great suits, accessories, jaggo items, and more!',
  },
  {
    initial: 'M',
    name: 'Mahima Sharma',
    time: '8 months ago',
    text: 'I have always had a great experience at Punjabi Fashion.',
  },
  {
    initial: 'S',
    name: 'Sukh Entertainment',
    time: '5 months ago',
    text: 'I visit first time in this store I finalised very good service...',
  },
  {
    initial: 'J',
    name: 'Jas Birdi',
    time: '8 months ago',
    text: 'This fabric store is wonderful! The staff are always friendly, helpful, and welcoming.',
  },
  {
    initial: 'B',
    name: 'Bandana',
    time: '8 months ago',
    text: 'I got my pants fixed here and they did a really great job.',
  },
];

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const categoryCards = [
    { title: 'Lehengas', path: '/category/lehengas', desc: 'Celebration-ready lehengas for festive events and wedding guest looks.', product: firstProduct('lehengas') },
    { title: 'Party Wear', path: '/category/party-wear', desc: 'Polished occasion styles for receptions, festive evenings, and family events.', product: firstProduct('party-wear') },
    { title: 'Shararas', path: '/category/sharara-gharara', desc: 'Traditional sharara sets with statement silhouettes and graceful styling.', product: firstProduct('sharara-gharara') },
    { title: 'Punjabi Suits', path: '/category/punjabi-suits', desc: 'Everyday and occasion Punjabi suits with coordinated styling.', product: firstProduct('punjabi-suits') },
    { title: 'Bangles', path: '/category/bangles', desc: 'Festive bangle sets to finish South Asian outfits with colour and shine.', product: firstProduct('bangles') },
    { title: 'Earrings', path: '/category/earrings', desc: 'Traditional and statement earrings for festive and occasion styling.', product: firstProduct('earrings') },
    { title: 'Necklaces', path: '/category/necklaces', desc: 'Necklace sets selected to complete Punjabi suits, lehengas, and party looks.', product: firstProduct('necklaces') },
  ].filter((card): card is { title: string; path: string; desc: string; product: Product } => Boolean(card.product));

  const signatureFeatureCard = categoryCards.find((card) => card.title === 'Lehengas') ?? categoryCards[0];
  const signatureSideCards = [
    categoryCards.find((card) => card.title === 'Party Wear'),
    categoryCards.find((card) => card.title === 'Shararas'),
    categoryCards.find((card) => card.title === 'Punjabi Suits'),
    {
      title: 'Accessories',
      path: '/category/accessories',
      desc: 'Bangles, earrings, and necklaces selected to finish the full look.',
      product: firstProduct('bangles') ?? firstProduct('earrings') ?? firstProduct('necklaces'),
    },
  ].filter((card): card is { title: string; path: string; desc: string; product: Product } => Boolean(card?.product));

  const newArrivals = uniqueProducts([
    ...productsFor('punjabi-suits').filter((product) => product.isNew).slice(0, 2),
    ...productsFor('lehengas').filter((product) => product.isNew).slice(0, 2),
    ...productsFor('party-wear').filter((product) => product.isNew).slice(0, 1),
    ...productsFor('bangles').filter((product) => product.isNew).slice(0, 1),
    ...productsFor('earrings').filter((product) => product.isNew).slice(0, 1),
    ...productsFor('necklaces').filter((product) => product.isNew).slice(0, 1),
    ...getNewArrivals(),
  ]).slice(0, 8);

  const womenEditCards = [
    { title: 'Lehengas', path: '/category/lehengas', product: firstProduct('lehengas') },
    { title: 'Party Wear', path: '/category/party-wear', product: firstProduct('party-wear') },
    { title: 'Shararas', path: '/category/sharara-gharara', product: firstProduct('sharara-gharara') },
    { title: 'Punjabi Suits', path: '/category/punjabi-suits', product: firstProduct('punjabi-suits') },
  ].filter((card): card is { title: string; path: string; product: Product } => Boolean(card.product));

  const accessoryCards = [
    { title: 'Bangles', path: '/category/bangles', desc: 'Colourful finishing pieces for suits, lehengas, and festive wear.', product: firstProduct('bangles') },
    { title: 'Earrings', path: '/category/earrings', desc: 'Statement pairs for family events, parties, and special occasions.', product: firstProduct('earrings') },
    { title: 'Necklaces', path: '/category/necklaces', desc: 'Complete-look necklace sets for polished South Asian styling.', product: firstProduct('necklaces') },
  ].filter((card): card is { title: string; path: string; desc: string; product: Product } => Boolean(card.product));

  const readyToShip = uniqueProducts([
    ...getReadyToShip().slice(0, 4),
    ...products.filter((product) => product.isReadyToShip).slice(0, 4),
  ]).slice(0, 4);

  const visitStoreCollectionCards = [
    {
      title: 'Lehengas',
      path: '/category/lehengas',
      desc: 'Celebration-ready lehengas for festive events and special occasions.',
      product: firstProduct('lehengas'),
    },
    {
      title: 'Party Wear',
      path: '/category/party-wear',
      desc: 'Polished occasion styles for receptions, festive evenings, and family events.',
      product: firstProduct('party-wear'),
    },
    {
      title: 'Shararas',
      path: '/category/sharara-gharara',
      desc: 'Traditional sharara sets with statement silhouettes and graceful styling.',
      product: firstProduct('sharara-gharara'),
    },
    {
      title: 'Punjabi Suits',
      path: '/category/punjabi-suits',
      desc: 'Classic Punjabi suits for everyday wear, family events, and celebrations.',
      product: firstProduct('punjabi-suits'),
    },
    {
      title: 'Accessories',
      path: '/category/accessories',
      desc: 'Bangles, earrings, and necklaces to complete the look.',
      product: firstProduct('bangles') ?? firstProduct('earrings') ?? firstProduct('necklaces'),
    },
  ].filter((card): card is { title: string; path: string; desc: string; product: Product } => Boolean(card.product));

  const visitStoreFeatureCard = visitStoreCollectionCards[0];
  const visitStoreSmallCards = visitStoreCollectionCards.slice(1, 5);

  const handleNewsletterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      setNewsletterMessage('Please enter your email address.');
      return;
    }
    setNewsletterMessage('Thanks! You are on our new arrivals update list.');
    setEmail('');
  };

  return (
    <Layout>
      <section className="relative h-[80vh] min-h-[620px] overflow-hidden md:h-[90vh]">
        <img src={heroBridal} alt="Punjabi Fashion South Asian boutique fashion" className="absolute inset-0 h-full w-full scale-105 object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A120F]/88 via-[#3A1117]/58 to-[#1A120F]/18" aria-hidden="true" />
        <div className="absolute inset-0 hero-boutique-vignette pointer-events-none" aria-hidden="true" />
        <div className="absolute left-6 top-1/2 hidden h-36 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-gold/55 to-transparent md:block" aria-hidden="true" />

        <div className="relative container flex h-full items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-2xl"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="label-editorial mb-5 text-gold-light/90"
            >
              Brampton Boutique · South Asian Fashion
            </motion.p>

            <h1 className="heading-editorial mb-5 text-4xl leading-[1.08] text-cream md:text-5xl lg:text-[3.75rem]">
              Where Heritage Meets Modern South Asian Fashion
            </h1>
            <div className="mb-6 h-px w-24 bg-gold/65" />
            <p className="mb-9 max-w-xl font-body text-[15px] leading-relaxed text-cream/68 md:text-base">
              {businessInfo.shortDescription}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/new-arrivals" className="btn-luxury btn-luxury-gold justify-center">
                Shop New Arrivals
              </Link>
              <Link to="/visit-store" className="btn-luxury btn-luxury-cream justify-center">
                Visit Our Store
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="mt-9 grid max-w-xl grid-cols-2 gap-2.5 text-[10px] uppercase tracking-[0.12em] text-cream/55 sm:grid-cols-4"
            >
              {[
                ['Personalized Care', Sparkles],
                ['In-Store & Online', Store],
                ['Ready-to-Ship Available', Truck],
                ['Styling Help Available', Calendar],
              ].map(([label, Icon]) => (
                <span key={label as string} className="flex items-center gap-1.5 border border-cream/10 bg-cream/5 px-2.5 py-2">
                  <Icon className="h-3 w-3 text-gold" strokeWidth={1.5} />
                  {label as string}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="bg-background py-14 md:py-20">
        <div className="container">
          <div className="mb-10 flex flex-col gap-4 border-b border-[#E6D8C4] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label-editorial mb-3">Shop By Collection</p>
              <h2 className="heading-editorial text-foreground text-3xl md:text-4xl">Shop Signature Collections</h2>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground/75">
                Explore curated South Asian fashion for everyday wear, family events, festive nights, and celebrations.
              </p>
            </div>
            <Link to="/women" className="label-luxury inline-flex items-center gap-2 text-[#5C1B24] transition-colors hover:text-gold">
              Shop Collections <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr] lg:items-stretch">
            {signatureFeatureCard && (
              <Link
                to={signatureFeatureCard.path}
                className="group overflow-hidden border border-[#E6D8C4] bg-[#FFFDF8] shadow-[0_18px_45px_-36px_rgba(26,18,15,0.38)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/60"
              >
                <HomeProductFrame product={signatureFeatureCard.product} className="aspect-[4/5] border-b border-[#C6A15B]/30 p-3 shadow-[0_18px_50px_rgba(58,17,23,0.12)]">
                  <img src={signatureFeatureCard.product.images[0]} alt={signatureFeatureCard.product.name} loading="lazy" className={`h-full w-full ${productImageFit(signatureFeatureCard.product)} transition-transform duration-700 group-hover:scale-[1.02]`} />
                </HomeProductFrame>
                <div className="p-5 md:p-6">
                  <h3 className="font-heading text-3xl text-foreground">{signatureFeatureCard.title}</h3>
                  <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">{signatureFeatureCard.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#5C1B24]">
                    Shop Now <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
              {signatureSideCards.map((card) => (
                <Link
                  key={card.title}
                  to={card.path}
                  className="group overflow-hidden border border-[#E6D8C4] bg-[#FFFDF8] shadow-[0_18px_45px_-36px_rgba(26,18,15,0.38)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/60"
                >
                  <HomeProductFrame product={card.product} className="h-[230px] border-b border-[#C6A15B]/30 p-3 shadow-[0_18px_50px_rgba(58,17,23,0.12)] md:h-[260px] lg:h-[255px] xl:h-[290px]">
                    <img src={card.product.images[0]} alt={card.product.name} loading="lazy" className={`h-full w-full ${productImageFit(card.product)} transition-transform duration-700 group-hover:scale-[1.02]`} />
                  </HomeProductFrame>
                  <div className="p-4">
                    <h3 className="font-heading text-xl text-foreground md:text-2xl">{card.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">{card.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#5C1B24]">
                      Shop Now <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#E6D8C4] bg-section-muted py-14 texture-subtle md:py-20">
        <div className="container relative z-10">
          <div className="mb-10 flex flex-col gap-4 border-b border-[#E6D8C4] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label-editorial mb-3">Just Arrived</p>
              <h2 className="heading-editorial text-foreground text-3xl md:text-4xl">New to the Collection</h2>
              <p className="mt-2 text-[13px] text-muted-foreground/75">Fresh pieces added across clothing, jewelry, and accessories.</p>
            </div>
            <Link to="/new-arrivals" className="label-luxury hidden items-center gap-2 text-[#5C1B24] transition-colors hover:text-gold md:flex">
              View New Arrivals <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {newArrivals.map((product) => <HomepageProductTile key={product.id} product={product} />)}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/new-arrivals" className="btn-luxury btn-luxury-outline">View New Arrivals</Link>
          </div>
        </div>
      </section>

      <section className="bg-background py-14 md:py-20">
        <div className="container max-w-[1360px]">
          <div className="grid items-center gap-8 lg:grid-cols-[0.38fr_0.62fr] lg:gap-10 xl:gap-14">
            <div className="max-w-[420px]">
              <p className="label-editorial mb-3 text-[#5C1B24]">Women’s Edit</p>
              <h2 className="heading-editorial mb-5 text-3xl leading-tight text-foreground md:text-4xl lg:text-5xl">The Women’s Edit</h2>
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                Explore lehengas, party wear, shararas, and Punjabi suits curated for everyday styling and celebrations.
              </p>
              <div className="my-7 h-px w-20 bg-gold/60" />
              <Link to="/women" className="btn-luxury btn-luxury-gold w-full justify-center sm:w-auto">Shop Women</Link>
              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.16em] text-[#5C1B24]/75">
                {womenEditCards.map((card) => (
                  <Link key={card.title} to={card.path} className="transition-colors hover:text-gold">
                    {card.title}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
                {womenEditCards.map((card) => (
                  <Link key={card.title} to={card.path} className="group relative overflow-hidden border border-[#E6D8C4] bg-[#FFFDF8] p-2 shadow-[0_18px_48px_-38px_rgba(26,18,15,0.42)] transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60">
                    <HomeProductFrame product={card.product} className="h-[250px] border border-[#C6A15B]/30 p-3 shadow-inner sm:h-[280px] lg:h-[330px]">
                      <img src={card.product.images[0]} alt={card.product.name} loading="lazy" className="relative z-10 h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]" />
                    </HomeProductFrame>
                    <div className="pointer-events-none absolute inset-x-2 bottom-2 z-20 h-[42%] bg-gradient-to-t from-[#120B0A]/88 via-[#120B0A]/45 to-transparent" aria-hidden="true" />
                    <div className="absolute inset-x-2 bottom-2 z-30 px-5 pb-5 md:px-6 md:pb-6">
                      <p
                        className="font-heading text-xl leading-tight text-[#FFFDF8] md:text-2xl"
                        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.45)' }}
                      >
                        {card.title}
                      </p>
                      <span
                        className="mt-2 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#E8D8B8] md:text-[11px]"
                        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.45)' }}
                      >
                        Shop Now <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-gold/10 bg-[#F8F1E7] py-14 md:py-20">
        <div className="container">
          <div className="mb-10 text-center">
            <p className="label-editorial mb-3">Accessories</p>
            <h2 className="heading-editorial text-foreground text-3xl md:text-4xl">Complete the Look</h2>
            <p className="mx-auto mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground/75">
              Pair your outfit with bangles, earrings, and necklaces selected to finish the look.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {accessoryCards.map((card) => (
              <Link key={card.title} to={card.path} className="group overflow-hidden border border-[#E6D8C4] bg-[#FFFDF8] shadow-[0_18px_45px_-36px_rgba(26,18,15,0.38)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/60">
                <HomeProductFrame product={card.product} className="aspect-[4/3] border-b border-[#C6A15B]/30 p-4 shadow-[0_18px_50px_rgba(58,17,23,0.12)]">
                  <img src={card.product.images[0]} alt={card.product.name} loading="lazy" className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]" />
                </HomeProductFrame>
                <div className="p-5">
                  <h3 className="font-heading text-2xl text-foreground">{card.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{card.desc}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/category/accessories" className="btn-luxury btn-luxury-outline">Shop Accessories</Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-gold/20 bg-[#3A1117] py-14 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5C1B24]/80 via-[#3A1117] to-[#1A120F]" aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.07] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M20%200L40%2020L20%2040L0%2020z%22%20fill%3D%22%23B9904A%22%2F%3E%3C%2Fsvg%3E')]" aria-hidden="true" />
        <div className="container relative z-10">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="label-editorial mb-3 text-gold-light/80">
                <Clock className="mr-1.5 inline h-3 w-3" /> Quick Shop
              </p>
              <h2 className="heading-editorial text-cream text-3xl md:text-4xl">Ready-to-Ship Styles</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-cream/62">
                Need something sooner? Explore pieces available for faster browsing, pickup, or delivery options.
              </p>
              <Link to="/ready-to-ship" className="btn-luxury btn-luxury-gold mt-7">Shop Ready to Ship</Link>
            </div>
            <div className="lg:col-span-8">
              {readyToShip.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {readyToShip.map((product) => <HomepageProductTile key={product.id} product={product} tone="dark" />)}
                </div>
              ) : (
                <div className="border border-gold/25 bg-cream/10 p-8 text-center text-cream/65">
                  <p className="font-heading text-2xl text-cream">Ready-to-ship pieces are updated regularly.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#F8F1E7] py-16 md:py-24">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B9904A]/35 to-transparent" aria-hidden="true" />
        <div className="container relative z-10 max-w-[1400px]">
          <div className="grid gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-stretch lg:gap-10 xl:gap-14">
            <div className="relative overflow-hidden border border-[#C6A15B]/35 bg-[#3A1117] p-7 text-cream shadow-[0_28px_80px_-48px_rgba(58,17,23,0.85)] md:p-10 lg:p-12">
              <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_18%_15%,rgba(198,161,91,0.9),transparent_28%),linear-gradient(135deg,rgba(255,253,248,0.14),transparent_44%)]" aria-hidden="true" />
              <div className="absolute right-0 top-0 h-24 w-24 border-l border-b border-gold/20" aria-hidden="true" />
              <div className="relative z-10 flex h-full flex-col">
                <p className="label-editorial mb-4 !text-[#D5B98A] opacity-100">Local Boutique Trust</p>
                <h2 className="heading-editorial text-3xl leading-tight text-cream md:text-4xl">
                  A Brampton Boutique Built on Personal Care
                </h2>
                <div className="my-7 h-px w-24 bg-gold/60" />
                <p className="text-[14px] leading-relaxed text-cream/72 md:text-[15px]">
                  Punjabi Fashion helps local shoppers find South Asian clothing, accessories, and styling support for everyday wear, family events, festive nights, and special occasions.
                </p>

                <div className="mt-8 border-y border-gold/20 py-6">
                  <p className="mb-4 text-[10px] uppercase tracking-[0.16em] text-gold-light/80">Boutique Details</p>
                  <div className="space-y-4 text-[13px] leading-relaxed text-cream/78">
                    <p className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 flex-none text-gold" strokeWidth={1.6} aria-hidden="true" />
                      <span>{businessInfo.address.short}</span>
                    </p>
                    <p className="flex items-center gap-3">
                      <Phone className="h-4 w-4 flex-none text-gold" strokeWidth={1.6} aria-hidden="true" />
                      <span>{businessInfo.phone.display}</span>
                    </p>
                    <p className="flex items-center gap-3">
                      <Clock className="h-4 w-4 flex-none text-gold" strokeWidth={1.6} aria-hidden="true" />
                      <span>Hours: {businessInfo.hoursDisplay}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={businessInfo.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center bg-gold px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal transition-colors hover:bg-gold-light"
                  >
                    Get Directions
                  </a>
                  <a
                    href={businessInfo.phone.href}
                    className="inline-flex h-12 items-center justify-center border border-gold/45 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-cream hover:text-[#3A1117]"
                  >
                    Call Store
                  </a>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
              {trustPoints.map((point) => (
                <article
                  key={point.title}
                  className="group relative overflow-hidden border border-[#E6D8C4] bg-[#FFFDF8] p-6 shadow-[0_18px_45px_-36px_rgba(26,18,15,0.36)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B9904A]/70 hover:shadow-[0_24px_55px_-38px_rgba(92,27,36,0.34)] md:p-7"
                >
                  <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#5C1B24] via-[#B9904A] to-[#5C1B24]/50" aria-hidden="true" />
                  <span className="absolute right-4 top-4 h-8 w-8 border-r border-t border-[#B9904A]/25" aria-hidden="true" />
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#B9904A]/30 bg-[#FBF7EF] transition-colors duration-300 group-hover:bg-[#5C1B24]">
                      <point.icon className="h-5 w-5 text-[#B9904A] transition-colors group-hover:text-cream" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <p className="text-right text-[9px] font-semibold uppercase tracking-[0.16em] text-[#5C1B24]/65">{point.label}</p>
                  </div>
                  <h3 className="font-heading text-2xl leading-tight tracking-wide text-foreground">{point.title}</h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground md:text-[14px]">{point.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-gold/10 bg-[#F6EFE4] py-16 md:py-24">
        <div className="container max-w-[1400px]">
          <div className="mb-10 text-center">
            <p className="label-editorial mb-3">Customer Trust</p>
            <h2 className="heading-editorial text-foreground text-3xl md:text-4xl">Customer Reviews on Google</h2>
            <p className="mx-auto mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground/70">
              See what local shoppers are saying about Punjabi Fashion in Brampton.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.38fr_0.62fr] lg:items-stretch">
            <div className="relative overflow-hidden border border-[#B9904A]/30 bg-[#3A1117] p-7 text-cream shadow-[0_24px_70px_-46px_rgba(58,17,23,0.82)] md:p-9">
              <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_16%_12%,rgba(185,144,74,0.9),transparent_28%),linear-gradient(135deg,rgba(255,253,248,0.12),transparent_42%)]" aria-hidden="true" />
              <div className="relative z-10">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#D5B98A]">Verified Google Profile</p>
                <h3 className="mt-3 font-heading text-3xl leading-tight text-cream">Punjabi Fashion on Google</h3>

                <div className="my-7 border-y border-gold/20 py-6">
                  <p className="font-heading text-5xl leading-none text-cream">3.4 <span className="text-2xl text-cream/65">/ 5</span></p>
                  <p className="mt-2 text-[12px] uppercase tracking-[0.14em] text-gold-light">Based on 101 Google reviews</p>
                </div>

                <div className="space-y-3 text-[13px] leading-relaxed text-cream/72">
                  <p className="font-semibold text-cream">Punjabi Fashion</p>
                  <p>Clothing store in Brampton, Ontario</p>
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-none text-gold" strokeWidth={1.6} aria-hidden="true" />
                    <span>{businessInfo.address.short}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-none text-gold" strokeWidth={1.6} aria-hidden="true" />
                    <span>{businessInfo.phone.display}</span>
                  </p>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                  <a href={googleProfileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center bg-gold px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal transition-colors hover:bg-gold-light">
                    View on Google
                  </a>
                  <a href={googleProfileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center border border-gold/45 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-cream hover:text-[#3A1117]">
                    Get Directions
                  </a>
                </div>

                <p className="mt-5 text-[11px] leading-relaxed text-cream/50">
                  Selected public Google review snippets. View the full profile on Google for complete reviews.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
              {googleReviewSnippets.map((review) => (
                <article key={review.name} className="group relative overflow-hidden border border-[#E6D8C4] bg-[#FFFDF8] p-5 shadow-[0_18px_45px_-36px_rgba(26,18,15,0.36)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B9904A]/70 md:p-6">
                  <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#5C1B24] via-[#B9904A] to-[#5C1B24]/50" aria-hidden="true" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-[#B9904A]/30 bg-[#F8F1E7] font-semibold text-[#5C1B24]">
                        {review.initial}
                      </div>
                      <div>
                        <h3 className="font-heading text-xl leading-tight text-foreground">{review.name}</h3>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{review.time}</p>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.14em] text-[#7A6043]">Google review</span>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-gold" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-3.5 w-3.5 fill-current" strokeWidth={1.4} aria-hidden="true" />
                    ))}
                  </div>
                  <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground md:text-[14px]">“{review.text}”</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#FBF7EF] py-14 md:py-24">
        <div className="container max-w-[1400px]">
          <div className="grid items-center gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:gap-14 xl:gap-16">
            <div className="relative overflow-hidden border border-gold/30 bg-[#3A1117] p-7 text-cream shadow-[0_24px_70px_-48px_rgba(58,17,23,0.78)] md:p-10 lg:p-12">
              <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_18%_15%,rgba(185,144,74,0.8),transparent_26%),linear-gradient(135deg,rgba(255,253,248,0.12),transparent_42%)]" aria-hidden="true" />
              <div className="relative z-10">
                <p className="label-editorial mb-4 text-gold-light/85">Visit Store</p>
                <h2 className="heading-editorial text-3xl leading-tight text-cream md:text-4xl">Visit Punjabi Fashion in Brampton</h2>
                <div className="my-6 h-px w-24 bg-gold/60" />
                <p className="text-[14px] leading-relaxed text-cream/72">
                  Browse new arrivals, compare colours, get styling help, and shop Punjabi suits, lehengas, party wear, jewelry, and accessories in person.
                </p>

                <div className="mt-7 space-y-3 text-[13px] leading-relaxed text-cream/78">
                  <p className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 flex-none text-gold" strokeWidth={1.6} />
                    <span>{businessInfo.address.short}</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Phone className="h-4 w-4 flex-none text-gold" strokeWidth={1.6} />
                    <span>{businessInfo.phone.display}</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Clock className="h-4 w-4 flex-none text-gold" strokeWidth={1.6} />
                    <span>Hours: {businessInfo.hoursDisplay}</span>
                  </p>
                </div>

                <div className="mt-7 flex flex-wrap gap-2.5">
                  {['Brampton Boutique', 'Open Daily', 'Styling Help Available'].map((item) => (
                    <span key={item} className="border border-gold/30 bg-cream/5 px-3 py-2 text-[9px] uppercase tracking-[0.15em] text-gold-light/85">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to="/visit-store" className="inline-flex h-12 items-center justify-center bg-gold px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal transition-colors hover:bg-gold-light">
                    Visit Store
                  </Link>
                  <a href={businessInfo.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center border border-gold/45 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-gold hover:text-charcoal">
                    Get Directions
                  </a>
                  <a href={businessInfo.phone.href} className="inline-flex h-12 items-center justify-center border border-gold/45 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-gold hover:text-charcoal">
                    Call Store
                  </a>
                </div>
              </div>
            </div>

            {visitStoreFeatureCard && (
              <div className="grid gap-5 lg:grid-cols-[1.08fr_1fr] xl:grid-cols-[1.15fr_1fr]">
                <StoreCollectionCard {...visitStoreFeatureCard} featured />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                  {visitStoreSmallCards.map((card) => (
                    <StoreCollectionCard key={card.title} {...card} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-gold/15 bg-[#3A1117] py-14 md:py-18">
        <div className="absolute inset-0 opacity-[0.07] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2244%22%20height%3D%2244%22%20viewBox%3D%220%200%2044%2044%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M22%202L42%2022L22%2042L2%2022z%22%20fill%3D%22none%22%20stroke%3D%22%23B9904A%22%20stroke-width%3D%221%22%2F%3E%3C%2Fsvg%3E')]" aria-hidden="true" />
        <div className="container">
          <div className="relative mx-auto max-w-3xl border border-gold/25 bg-[#FBF7EF] px-6 py-10 text-center shadow-[0_24px_70px_-42px_rgba(0,0,0,0.65)] md:px-10">
            <p className="label-editorial mb-3">Stay Updated</p>
            <h2 className="heading-editorial text-foreground text-3xl">Be First to See New Arrivals</h2>
            <p className="mt-3 text-[14px] text-muted-foreground">
              Get boutique updates, new collection drops, and ready-to-ship alerts.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="home-newsletter" className="sr-only">Email address</label>
              <input
                id="home-newsletter"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="h-11 flex-1 border border-gold/25 bg-background px-4 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none"
              />
              <button type="submit" className="btn-luxury btn-luxury-gold h-11 justify-center px-8">
                Sign Up
              </button>
            </form>
            {newsletterMessage && <p className="mt-3 text-[13px] text-muted-foreground">{newsletterMessage}</p>}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-gold/10 bg-charcoal py-14 md:py-16">
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_20%_20%,rgba(185,144,74,0.35),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(92,27,36,0.45),transparent_28%)]" aria-hidden="true" />
        <div className="container relative z-10 text-center">
          <h2 className="heading-editorial text-cream text-3xl md:text-4xl">Explore Punjabi Fashion Collections</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-relaxed text-cream/60">
            Shop South Asian clothing and accessories curated for everyday wear, family events, festive nights, and special occasions.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/women" className="btn-luxury btn-luxury-gold justify-center">Shop Collections</Link>
            <Link to="/visit-store" className="btn-luxury btn-luxury-cream justify-center">Visit Store</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
