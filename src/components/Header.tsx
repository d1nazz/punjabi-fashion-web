import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useStore, type WishlistItem } from '@/contexts/StoreContext';
import { products } from '@/data/products';

const announcements = [
  'Visit Our Brampton Boutique — Open 7 Days a Week',
  'New Bridal & Festive Arrivals — Explore the Collection',
  'Book Your Private Styling Appointment Today',
  'Over 15 Years of Trust — Premium South Asian Fashion',
  'Canada-Wide Shipping on All Orders',
];

type MegaMenuLink = {
  name: string;
  desc: string;
  path: string;
};

type MegaMenuSection = {
  heading: string;
  links: MegaMenuLink[];
};

type MegaMenuConfig = {
  key: string;
  title: string;
  columns: MegaMenuSection[];
  feature: {
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
    href: string;
    image?: string;
  };
};

const normalizeCategoryValue = (value: string): string =>
  value.toLowerCase().replace(/&/g, '').replace(/\s+/g, '-');

const firstHeaderProductImage = (categorySlug: string) => {
  const normalizedSlug = normalizeCategoryValue(categorySlug);
  const product = products.find((item) => {
    const category = normalizeCategoryValue(item.category);
    const subcategory = item.subcategory ? normalizeCategoryValue(item.subcategory) : '';
    const tags = item.tags.map(normalizeCategoryValue);

    return category === normalizedSlug || subcategory === normalizedSlug || tags.includes(normalizedSlug);
  });

  return product?.images[0];
};

const womenFeatureImage =
  firstHeaderProductImage('lehengas') ??
  firstHeaderProductImage('party-wear') ??
  firstHeaderProductImage('sharara-gharara') ??
  firstHeaderProductImage('punjabi-suits');

const accessoriesFeatureImage =
  firstHeaderProductImage('bangles') ??
  firstHeaderProductImage('earrings') ??
  firstHeaderProductImage('necklaces') ??
  firstHeaderProductImage('accessories');

const headerCategoryMenus: MegaMenuConfig[] = [
  {
    key: 'women',
    title: 'Women',
    columns: [
      {
        heading: 'Shop Women',
        links: [
          { name: 'All Women', desc: 'Explore the women’s floor', path: '/women' },
          { name: 'Lehengas', desc: 'Statement pieces for celebrations', path: '/category/lehengas' },
          { name: 'Party Wear', desc: 'Evening and festive outfits', path: '/category/party-wear' },
          { name: 'Shararas', desc: 'Sharara sets for special occasions', path: '/category/sharara-gharara' },
          { name: 'Punjabi Suits', desc: 'Classic suits for everyday and events', path: '/category/punjabi-suits' },
        ],
      },
      {
        heading: 'More',
        links: [
          { name: 'New Arrivals', desc: 'Fresh pieces just added', path: '/new-arrivals' },
          { name: 'Ready to Ship', desc: 'Faster turnaround styles', path: '/ready-to-ship' },
          { name: 'Visit Store', desc: 'Shop in-person in Brampton', path: '/visit-store' },
          { name: 'Book Appointment', desc: 'Get help choosing the right look', path: '/book-appointment' },
        ],
      },
    ],
    feature: {
      eyebrow: 'Curated Edit',
      title: 'Women’s Collections',
      description:
        'Lehengas, party wear, shararas, and Punjabi suits curated for everyday styling and celebrations.',
      cta: 'Explore Women',
      href: '/women',
      image: womenFeatureImage,
    },
  },
  {
    key: 'men',
    title: 'Men',
    columns: [
      {
        heading: 'Shop Men',
        links: [
          { name: 'All Men', desc: 'Explore men’s clothing', path: '/men' },
          { name: 'Men Punjabi Suits', desc: 'Traditional sets for events', path: '/category/sherwanis' },
          { name: 'Kurtas', desc: 'Classic kurtas for every occasion', path: '/category/kurta-pajama' },
        ],
      },
      {
        heading: 'More',
        links: [
          { name: 'New Arrivals', desc: 'Fresh additions for this season', path: '/new-arrivals' },
          { name: 'Ready to Ship', desc: 'Styles available sooner', path: '/ready-to-ship' },
          { name: 'Visit Store', desc: 'In-person shopping in Brampton', path: '/visit-store' },
          { name: 'Book Appointment', desc: 'Get help choosing the right look', path: '/book-appointment' },
        ],
      },
    ],
    feature: {
      eyebrow: 'Men’s Edit',
      title: 'Men’s Wear',
      description:
        'Punjabi suits and kurtas selected for cultural events, family gatherings, and festive days.',
      cta: 'Explore Men',
      href: '/men',
    },
  },
  {
    key: 'kids',
    title: 'Kids',
    columns: [
      {
        heading: 'Shop Kids',
        links: [
          { name: 'All Kids', desc: 'Explore kids clothing', path: '/category/kids' },
          { name: 'Kids Punjabi Suits', desc: 'Traditional outfits for celebrations', path: '/category/kids' },
        ],
      },
      {
        heading: 'More',
        links: [
          { name: 'New Arrivals', desc: 'Fresh pieces just added', path: '/new-arrivals' },
          { name: 'Visit Store', desc: 'See sizing and styles in person', path: '/visit-store' },
          { name: 'Book Appointment', desc: 'Get help choosing the right look', path: '/book-appointment' },
        ],
      },
    ],
    feature: {
      eyebrow: 'Kids Edit',
      title: 'Kids Punjabi Suits',
      description: 'Traditional styles for little ones, made for family events and celebrations.',
      cta: 'Explore Kids',
      href: '/category/kids',
    },
  },
  {
    key: 'accessories',
    title: 'Accessories',
    columns: [
      {
        heading: 'Shop Accessories',
        links: [
          { name: 'All Accessories', desc: 'Explore finishing pieces', path: '/category/accessories' },
          { name: 'Bangles', desc: 'Traditional and festive bangles', path: '/category/bangles' },
          { name: 'Earrings', desc: 'Statement and everyday earrings', path: '/category/earrings' },
          { name: 'Necklaces', desc: 'Jewelry to complete the look', path: '/category/necklaces' },
        ],
      },
      {
        heading: 'More',
        links: [
          { name: 'New Arrivals', desc: 'Fresh pieces just added', path: '/new-arrivals' },
          { name: 'Ready to Ship', desc: 'Faster turnaround styles', path: '/ready-to-ship' },
          { name: 'Visit Store', desc: 'Shop in-person in Brampton', path: '/visit-store' },
          { name: 'Book Appointment', desc: 'Get help choosing the right look', path: '/book-appointment' },
        ],
      },
    ],
    feature: {
      eyebrow: 'Complete The Look',
      title: 'Accessories',
      description: 'Bangles, earrings, and necklaces to finish your outfit with detail and shine.',
      cta: 'Explore Accessories',
      href: '/category/accessories',
      image: accessoriesFeatureImage,
    },
  },
];

/** Desktop top nav: single line, never overlaps right cluster (Visit Store in mega + mobile only) */
const navText =
  'whitespace-nowrap text-[12.5px] font-semibold leading-none tracking-[0.075em] text-[#0B1B33] transition-colors duration-200 hover:text-[#8A1F2D] xl:text-[13px]';

const navItemWrap = 'inline-flex shrink-0 items-center';
const chev = 'h-3.5 w-3.5 shrink-0 text-[#0B1B33]/45';

const iconBtn =
  'inline-flex shrink-0 items-center justify-center text-[#0B1B33] transition-colors duration-200 hover:text-[#B9904A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B9904A]/30';

const megaPanelClass =
  'overflow-hidden rounded-2xl border border-[#C6A15B]/25 bg-[linear-gradient(135deg,rgba(50,15,22,0.97),rgba(18,10,8,0.97))] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-[3px]';
const megaHeading =
  'mb-5 border-b border-[#C6A15B]/22 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D5B98A]';
const megaLink =
  'group/link block rounded-md py-1.5 text-left transition';
const megaMuted = 'text-[#6B5E54]';

const BP = 1024;

function Wordmark({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={[
        'block w-full min-w-0 max-w-full whitespace-nowrap text-center font-heading font-semibold uppercase not-italic text-[#0B1B33] antialiased',
        'leading-[1] tracking-[0.18em]',
        compact
          ? 'text-[0.9rem] tracking-[0.12em] sm:text-[0.95rem]'
          : 'lg:w-[11.75rem] lg:min-w-[11.25rem] lg:max-w-[12.25rem] lg:shrink-0 lg:text-left lg:text-[1.16rem] lg:tracking-[0.15em] xl:w-[12.5rem] xl:min-w-[12rem] xl:max-w-[13.5rem] xl:text-[1.28rem] xl:tracking-[0.16em]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      PUNJABI FASHION
    </span>
  );
}

function NavLinksDesktop() {
  return (
    <>
      <Link to="/new-arrivals" className={navItemWrap}>
        <span className={navText}>New Arrivals</span>
      </Link>
      <Link to="/ready-to-ship" className={navItemWrap}>
        <span className={navText}>Ready to Ship</span>
      </Link>
      <Link to="/visit-store" className={navItemWrap}>
        <span className={navText}>Visit Store</span>
      </Link>
      <Link to="/contact" className={navItemWrap}>
        <span className={navText}>Contact</span>
      </Link>
    </>
  );
}

function CategoryMegas({
  activeMegaMenu,
  openMegaMenu,
  scheduleCloseMegaMenu,
  navText,
  chev,
}: {
  activeMegaMenu: string | null;
  openMegaMenu: (key: string) => void;
  scheduleCloseMegaMenu: () => void;
  navText: string;
  chev: string;
}) {
  return (
    <>
      {headerCategoryMenus.map((menu) => (
        <div
          key={menu.title}
          className={`${navItemWrap} group shrink-0`}
          onMouseEnter={() => openMegaMenu(menu.key)}
          onMouseLeave={scheduleCloseMegaMenu}
          onFocusCapture={() => openMegaMenu(menu.key)}
        >
          <button
            type="button"
            className={`${navText} flex cursor-pointer items-center gap-0.5`}
            aria-expanded={activeMegaMenu === menu.key}
            aria-haspopup="true"
          >
            <span>{menu.title}</span>
            <ChevronDown
              className={`${chev} transition-transform duration-200 ${
                activeMegaMenu === menu.key ? 'rotate-180' : ''
              }`}
              strokeWidth={1.5}
              aria-hidden
            />
          </button>
        </div>
      ))}
    </>
  );
}

function DesktopMegaMenuPanel({
  menu,
  megaTopPx,
  clearMegaCloseTimer,
  scheduleCloseMegaMenu,
  setActiveMegaMenu,
}: {
  menu: MegaMenuConfig;
  megaTopPx: number;
  clearMegaCloseTimer: () => void;
  scheduleCloseMegaMenu: () => void;
  setActiveMegaMenu: (v: string | null) => void;
}) {
  return (
    <div
      className="pointer-events-auto fixed left-1/2 z-[100] hidden -translate-x-1/2 lg:block"
      style={{
        top: megaTopPx > 0 ? megaTopPx - 1 : 120,
        width: 'min(calc(100vw - 96px), 1120px)',
        maxWidth: '1120px',
      }}
      onMouseEnter={clearMegaCloseTimer}
      onMouseLeave={scheduleCloseMegaMenu}
      onFocusCapture={clearMegaCloseTimer}
      onBlurCapture={scheduleCloseMegaMenu}
    >
      <div className="absolute -top-5 left-0 h-5 w-full" aria-hidden="true" />
      <div
        className={`${megaPanelClass} w-full px-7 py-7`}
        style={{
          animation: 'megaMenuIn 180ms ease-out both',
        }}
      >
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px] items-start gap-8 max-[1180px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_250px] max-[1180px]:gap-6">
          <div className="min-w-0">
            <h4 className={megaHeading}>{menu.columns[0].heading}</h4>
            <div className="space-y-3.5">
              {menu.columns[0].links.map((link) => (
                <Link key={link.name} to={link.path} className={megaLink} onClick={() => setActiveMegaMenu(null)}>
                  <p className="text-[15px] leading-tight text-[#F7F1E6] transition-colors group-hover/link:text-[#C6A15B]">
                    {link.name}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-[#B8A99A]">{link.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <h4 className={megaHeading}>{menu.columns[1].heading}</h4>
            <div className="space-y-3.5">
              {menu.columns[1].links.map((link) => (
                <Link key={link.name} to={link.path} className={megaLink} onClick={() => setActiveMegaMenu(null)}>
                  <p className="text-[15px] leading-tight text-[#F7F1E6] transition-colors group-hover/link:text-[#C6A15B]">
                    {link.name}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-[#B8A99A]">{link.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="min-w-0 max-w-full">
            {menu.feature.image ? (
              <Link
                to={menu.feature.href}
                className="group/feature relative block h-[320px] overflow-hidden rounded-[10px] border border-[#C6A15B]/25 max-[1180px]:h-[300px]"
                onClick={() => setActiveMegaMenu(null)}
              >
                <img
                  src={menu.feature.image}
                  alt={menu.feature.title}
                  className="h-full w-full bg-[#21100F] object-contain transition-transform duration-500 group-hover/feature:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120B0A]/90 via-[#120B0A]/42 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#D5B98A]">
                    {menu.feature.eyebrow}
                  </p>
                  <h5 className="mt-2 font-heading text-[1.55rem] leading-none text-[#F7F1E6]">
                    {menu.feature.title}
                  </h5>
                  <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-[#C9BCAE]">
                    {menu.feature.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#D5B98A]">
                    {menu.feature.cta}
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                to={menu.feature.href}
                className="group/feature relative flex h-[320px] flex-col justify-end overflow-hidden rounded-[10px] border border-[#C6A15B]/30 bg-[#3A1117] p-6 max-[1180px]:h-[300px]"
                onClick={() => setActiveMegaMenu(null)}
              >
                <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_20%_20%,rgba(198,161,91,0.32),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(255,253,248,0.14),transparent_26%),linear-gradient(135deg,rgba(92,27,36,0.75),rgba(18,10,8,0.95))]" aria-hidden="true" />
                <div className="absolute right-4 top-4 h-10 w-10 border-r border-t border-[#C6A15B]/35" aria-hidden="true" />
                <div className="relative z-10">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#D5B98A]">
                    {menu.feature.eyebrow}
                  </p>
                  <h5 className="mt-3 font-heading text-[1.65rem] leading-none text-[#F7F1E6]">
                    {menu.feature.title}
                  </h5>
                  <div className="my-4 h-px w-16 bg-[#C6A15B]/50" />
                  <p className="line-clamp-4 text-[12px] leading-relaxed text-[#C9BCAE]">
                    {menu.feature.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#D5B98A]">
                    {menu.feature.cta}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RightClusterDesktop({
  searchVal,
  setSearchVal,
  handleSearch,
  wishlist,
  cartCount,
  megaMuted,
}: {
  searchVal: string;
  setSearchVal: (s: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  wishlist: WishlistItem[];
  cartCount: number;
  megaMuted: string;
}) {
  return (
    <div className="ml-auto flex w-auto shrink-0 items-center gap-4 pl-2 min-[1200px]:gap-5 min-[1200px]:pl-3 2xl:gap-6">
      <form
        onSubmit={handleSearch}
        className="relative hidden w-[13rem] shrink-0 lg:block xl:w-[15rem] 2xl:w-[17.25rem]"
      >
        <input
          type="search"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Try searching for..."
          className="h-9 w-full min-w-0 max-w-full border-0 border-b border-[#1A2433]/25 bg-transparent py-1.5 pl-0.5 pr-9 text-[13px] text-[#0B1B33] [font-kerning:normal] placeholder:font-normal placeholder:text-[#7A6F64] transition-[border-color] focus:border-0 focus:border-b focus:border-b-[#B9904A] focus:outline-none focus:ring-0 min-[1200px]:h-10 min-[1200px]:pr-10 2xl:text-[14px]"
          aria-label="Search products"
        />
        <button
          type="submit"
          className="absolute right-0 top-1/2 z-[1] flex h-9 w-8 -translate-y-1/2 items-center justify-center text-[#0B1B33] transition-colors hover:text-[#B9904A] min-[1200px]:h-10 min-[1200px]:w-9"
          aria-label="Submit search"
        >
          <Search className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </form>

      <div
        className="ml-0 inline-flex h-8 shrink-0 select-none items-center justify-center gap-0.5 whitespace-nowrap pl-1 min-[1200px]:pl-0"
        role="text"
        title="Currency"
        aria-label="Selected currency: Canadian dollars"
      >
        <span
          className={`${megaMuted} inline text-[13px] font-medium tabular-nums leading-none text-[#0B1B33] whitespace-nowrap`}
        >
          CAD&#8239;$
        </span>
        <ChevronDown
          className="h-2.5 w-2.5 flex-none -translate-y-px text-[#0B1B33]/50"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>

      <div className="ml-0 flex min-w-0 items-center justify-end gap-3.5 min-[1200px]:ml-1 min-[1200px]:gap-4 2xl:gap-[1.05rem]">
        <Link
          to="/account"
          className={`${iconBtn} hidden h-8 w-8 min-w-8 min-[800px]:inline-flex sm:min-w-9 lg:h-9 lg:w-9`}
          aria-label="Account"
        >
          <User className="h-[20px] w-[20px] min-[1200px]:h-[22px] min-[1200px]:w-[22px]" strokeWidth={1.5} />
        </Link>
        <Link to="/wishlist" className={`${iconBtn} relative`} aria-label="Wishlist">
          <Heart className="h-[20px] w-[20px] min-[1200px]:h-[22px] min-[1200px]:w-[22px]" strokeWidth={1.5} />
          {wishlist.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#8A1F2D] text-[6.5px] font-bold text-white">
              {wishlist.length}
            </span>
          )}
        </Link>
        <Link to="/cart" className={`${iconBtn} relative`} aria-label="Cart">
          <ShoppingBag
            className="h-[20px] w-[20px] min-[1200px]:h-[22px] min-[1200px]:w-[22px]"
            strokeWidth={1.5}
          />
          {cartCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#8A1F2D] text-[6.5px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [megaTopPx, setMegaTopPx] = useState(0);
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const { cartCount, wishlist } = useStore();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement | null>(null);
  const megaCloseTimer = useRef<number | null>(null);

  const updateMegaTop = useCallback(() => {
    const el = headerRef.current;
    if (el) {
      setMegaTopPx(Math.round(el.getBoundingClientRect().bottom));
    }
  }, []);

  const clearMegaCloseTimer = useCallback(() => {
    if (megaCloseTimer.current) {
      window.clearTimeout(megaCloseTimer.current);
      megaCloseTimer.current = null;
    }
  }, []);

  const openMegaMenu = useCallback((key: string) => {
    clearMegaCloseTimer();
    setActiveMegaMenu(key);
  }, [clearMegaCloseTimer]);

  const scheduleCloseMegaMenu = useCallback(() => {
    clearMegaCloseTimer();
    megaCloseTimer.current = window.setTimeout(() => {
      setActiveMegaMenu(null);
      megaCloseTimer.current = null;
    }, 180);
  }, [clearMegaCloseTimer]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => () => clearMegaCloseTimer(), [clearMegaCloseTimer]);

  useLayoutEffect(() => {
    if (!activeMegaMenu) {
      return;
    }
    updateMegaTop();
    const on = () => updateMegaTop();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, [activeMegaMenu, updateMegaTop]);

  useEffect(() => {
    const t = setInterval(() => setAnnouncementIdx((i) => (i + 1) % announcements.length), 4500);
    return () => clearInterval(t);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal('');
    }
  };

  const activeMegaMenuConfig = headerCategoryMenus.find((menu) => menu.key === activeMegaMenu) ?? null;

  return (
    <>
      <div className="announcement-bar relative overflow-hidden text-center">
        <div className="transition-all duration-700 ease-in-out" key={announcementIdx}>
          {announcements[announcementIdx]}
        </div>
      </div>

      <header
        ref={headerRef}
        onMouseEnter={clearMegaCloseTimer}
        onMouseLeave={scheduleCloseMegaMenu}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            scheduleCloseMegaMenu();
          }
        }}
        className={`sticky top-0 z-50 w-full border-b text-[#0B1B33] transition-all duration-300 ${
          scrolled
            ? 'border-[#E6D8C4] bg-[#FBF7EF] shadow-[0_1px_0_0_#E7DCCB]'
            : 'border-[#E6D8C4]/60 bg-[#FBF7EF]/80 backdrop-blur-sm'
        }`}
      >
        <div className="w-full text-[#0B1B33]">
          <div
            className={[
              'w-full',
              'px-5 min-[800px]:px-8',
              'lg:px-12',
            ].join(' ')}
          >
            <div
              className="flex w-full min-w-0 flex-col lg:h-[62px] lg:min-h-[60px] lg:max-h-[64px] lg:flex-row lg:items-center"
              style={{ minHeight: 0 }}
            >
              {/* ——— Compact row: tablet/phone ——— */}
              <div
                className="flex w-full min-w-0 max-w-full items-center justify-between gap-2 border-[#E7DCCB] lg:hidden"
                style={{ height: 64, minHeight: 64, maxHeight: 72 }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <button
                    type="button"
                    className={`${iconBtn} -ml-1.5 flex`}
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                  <Link
                    to="/"
                    className="min-w-0 flex-1 pl-0.5 text-left"
                    aria-label="Punjabi Fashion home"
                  >
                    <Wordmark compact />
                  </Link>
                </div>
                <div className="flex flex-none shrink-0 items-center gap-0.5 sm:gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSearchOpen((o) => !o)}
                    className={iconBtn}
                    aria-label="Search"
                    aria-expanded={searchOpen}
                  >
                    <Search className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                  <Link to="/account" className={`${iconBtn} hidden h-8 w-8 min-[500px]:inline-flex`} aria-label="Account">
                    <User className="h-5 w-5" strokeWidth={1.5} />
                  </Link>
                  <Link to="/wishlist" className={`${iconBtn} relative`} aria-label="Wishlist">
                    <Heart className="h-5 w-5" strokeWidth={1.5} />
                    {wishlist.length > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#8A1F2D] text-[6.5px] font-bold text-white">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>
                  <Link to="/cart" className={`${iconBtn} relative`} aria-label="Cart">
                    <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                    {cartCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#8A1F2D] text-[6.5px] font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* ——— Desktop: wordmark + nav | spacer | search + utilities ——— */}
              <div className="hidden w-full min-w-0 lg:flex lg:h-[62px] lg:min-h-[60px] lg:max-h-[64px] lg:shrink-0 lg:items-center lg:pr-0">
                <div className="flex min-w-0 shrink-0 items-center pr-0">
                  <Link
                    to="/"
                    className="block shrink-0 pl-0 pr-0 text-left"
                    aria-label="Punjabi Fashion home"
                  >
                    <Wordmark />
                  </Link>
                </div>

                <nav
                  className="ml-7 flex min-w-0 shrink-0 flex-nowrap items-center justify-start overflow-visible border-0 pl-0 [gap:0.75rem] min-[1200px]:ml-8 min-[1200px]:[gap:1rem] xl:[gap:1.2rem] 2xl:[gap:1.5rem]"
                  aria-label="Main"
                >
                  <CategoryMegas
                    activeMegaMenu={activeMegaMenu}
                  openMegaMenu={openMegaMenu}
                  scheduleCloseMegaMenu={scheduleCloseMegaMenu}
                    navText={navText}
                    chev={chev}
                  />
                  <NavLinksDesktop />
                </nav>

                <RightClusterDesktop
                  searchVal={searchVal}
                  setSearchVal={setSearchVal}
                  handleSearch={handleSearch}
                  wishlist={wishlist}
                  cartCount={cartCount}
                  megaMuted={megaMuted}
                />
              </div>
            </div>
          </div>

          {searchOpen && (
            <div className="border-t border-[#E7DCCB] bg-[#FBF7EF] py-2.5 lg:hidden lg:border-t-0 lg:p-0">
              <form
                onSubmit={handleSearch}
                className="mx-auto flex w-full max-w-[1600px] min-w-0 items-center gap-2 px-5"
              >
                <input
                  type="search"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Try searching for…"
                  className="h-9 min-w-0 flex-1 border-0 border-b border-[#1A2433]/25 bg-transparent py-1.5 pl-0.5 pr-2 text-[#0B1B33] [font-size:1rem] placeholder:text-[#7A6F64] focus:border-b focus:border-b-[#B9904A] focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 text-[#5C534C] hover:text-[#0B1B33]"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </form>
            </div>
          )}

          {activeMegaMenuConfig && (
            <DesktopMegaMenuPanel
              menu={activeMegaMenuConfig}
              megaTopPx={megaTopPx}
              clearMegaCloseTimer={clearMegaCloseTimer}
              scheduleCloseMegaMenu={scheduleCloseMegaMenu}
              setActiveMegaMenu={setActiveMegaMenu}
            />
          )}
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-[#0B1B33]/35 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div
            className="animate-slide-in absolute left-0 top-0 bottom-0 w-[min(22.5rem,92vw)] max-w-[24rem] overflow-y-auto border-r border-[#E7DCCB] bg-[#FBF7EF] shadow-lg"
            role="dialog"
            aria-modal
            aria-label="Main navigation"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#E7DCCB] px-4 py-3.5">
              <Link to="/" onClick={() => setMobileOpen(false)} className="min-w-0 flex-1 pr-1">
                <Wordmark compact className="!text-left" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-[#0B1B33] hover:opacity-70"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </div>
            <nav
              className="space-y-0.5 px-3 py-2 text-[#0B1B33] sm:px-4"
              onClick={(e) => e.stopPropagation()}
            >
              {[
                { name: '— Women —', path: '/women', bold: true },
                { name: 'All Women', path: '/women' },
                { name: 'Lehengas', path: '/category/lehengas' },
                { name: 'Party Wear', path: '/category/party-wear' },
                { name: 'Shararas', path: '/category/sharara-gharara' },
                { name: 'Punjabi Suits', path: '/category/punjabi-suits' },
                { name: '— Men —', path: '/men', bold: true },
                { name: 'All Men', path: '/men' },
                { name: 'Men Punjabi Suits', path: '/category/sherwanis' },
                { name: 'Kurtas', path: '/category/kurta-pajama' },
                { name: '— Kids —', path: '/category/kids', bold: true },
                { name: 'All Kids', path: '/category/kids' },
                { name: 'Kids Punjabi Suits', path: '/category/kids' },
                { name: '— Accessories —', path: '/category/accessories', bold: true },
                { name: 'All Accessories', path: '/category/accessories' },
                { name: 'Bangles', path: '/category/bangles' },
                { name: 'Earrings', path: '/category/earrings' },
                { name: 'Necklaces', path: '/category/necklaces' },
                { name: 'New Arrivals', path: '/new-arrivals' },
                { name: 'Ready to Ship', path: '/ready-to-ship' },
                { name: 'Visit Store', path: '/visit-store' },
                { name: 'Contact', path: '/contact' },
              ].map((l, i) => (
                <Link
                  key={i}
                  to={l.path}
                  onClick={() => setMobileOpen(false)}
                  className={
                    (l as { bold?: boolean }).bold
                      ? 'pointer-events-none mt-3 block py-1.5 pl-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5C1B24]/90 first:mt-0'
                      : 'block rounded-sm px-2.5 py-2.5 text-[15px] text-[#172033] transition hover:bg-[#F0E3D0]/90'
                  }
                >
                  {l.name}
                </Link>
              ))}
            </nav>
            <div className="border-t border-[#E7DCCB] p-4">
              <Link
                to="/account"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 py-2.5 text-[15px] text-[#172033] hover:text-[#8A1F2D]"
              >
                <User className="h-5 w-5" strokeWidth={1.5} /> My Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
