import Layout from '@/components/Layout';
import Breadcrumbs from '@/components/Breadcrumbs';
import storeImg from '@/assets/store-interior.jpg';
import heroBridal from '@/assets/hero-bridal.jpg';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Mail, Heart, Star, Award, Navigation, Store, Sparkles, ShoppingBag } from 'lucide-react';
import { businessInfo } from '@/data/businessInfo';

export default function AboutPage() {
  return (
    <Layout>
      {/* Hero */}
      <div className="relative py-20 md:py-28 overflow-hidden">
        <img src={heroBridal} alt="Punjabi Fashion Heritage" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-charcoal/70" />
        <div className="relative container text-center">
          <Breadcrumbs items={[{ name: 'Our Story' }]} />
          <div className="divider-ornament mb-4"><span className="text-gold/40 text-xs">✦</span></div>
          <p className="label-editorial text-gold-light/70 mb-3">{businessInfo.address.city}, {businessInfo.address.provinceName}</p>
          <h1 className="heading-editorial text-cream text-3xl md:text-5xl mb-4">Our Story</h1>
          <p className="text-cream/50 font-body max-w-lg mx-auto text-[14px]">{businessInfo.shortDescription}</p>
        </div>
      </div>

      <div className="container py-14 md:py-18">
        {/* Story */}
        <div className="grid lg:grid-cols-2 gap-14 items-center mb-20">
          <div>
            <p className="label-editorial mb-3">A Family Legacy</p>
            <h2 className="heading-editorial text-foreground text-2xl md:text-3xl mb-5">A Brampton Punjabi Clothing Boutique</h2>
            <div className="space-y-4 text-muted-foreground text-[14px] leading-relaxed">
              <p>{businessInfo.description}</p>
              <p>Visit Punjabi Fashion at {businessInfo.address.short} for Punjabi suits, lehengas, party wear, shararas, jewelry, bangles, and accessories selected for everyday elegance and special occasions.</p>
              <p>Our team focuses on warm, personalized care, helping shoppers find outfits and finishing pieces that feel connected to heritage while fitting modern celebrations.</p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden">
              <img src={storeImg} alt="Punjabi Fashion Boutique" loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 border border-gold/20 hidden lg:block" />
          </div>
        </div>

        {/* Values */}
        <div className="text-center mb-14">
          <p className="label-editorial mb-2">What Sets Us Apart</p>
          <h2 className="heading-editorial text-foreground">Why Families Choose Punjabi Fashion</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: Heart, title: 'Curated with Care', desc: 'Every piece in our collection is handpicked for craftsmanship, fabric quality, and design excellence. We only stock what we truly believe in.' },
            { icon: Star, title: 'Personal Styling', desc: 'Our experienced stylists offer one-on-one consultations, understanding your vision and helping you find pieces that feel perfect for your occasion.' },
            { icon: Award, title: 'Bridal Expertise', desc: 'We specialise in bridal wear, offering an extensive collection of bridal lehengas, sarees, and suits — plus dedicated bridal consultation services.' },
          ].map(item => (
            <div key={item.title} className="text-center p-8 bg-champagne/40 border border-border">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-gold/20 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
              </div>
              <h3 className="font-heading text-lg text-foreground mb-2">{item.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/book-appointment" className="btn-luxury btn-luxury-gold mr-3">Book Appointment</Link>
          <Link to="/visit-store" className="btn-luxury btn-luxury-outline">Visit Our Store</Link>
        </div>
      </div>
    </Layout>
  );
}

export function VisitStorePage() {
  useEffect(() => {
    document.title = 'Visit Punjabi Fashion | Brampton South Asian Clothing Boutique';
    const description =
      'Visit Punjabi Fashion at 80 Pertosa Dr Unit #10 in Brampton for Punjabi suits, lehengas, party wear, shararas, men’s wear, kids’ outfits, jewelry, and accessories.';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, []);

  const inStoreItems = [
    'Punjabi Suits',
    'Lehengas',
    'Party Wear',
    'Shararas',
    'Men’s Wear',
    'Kids’ Outfits',
    'Bangles, Earrings & Necklaces',
    'Styling Help',
  ];

  const visitReasons = [
    {
      icon: Star,
      title: 'Compare Colours In Person',
      desc: 'See shades, fabrics, and details before choosing.',
    },
    {
      icon: Sparkles,
      title: 'Get Styling Help',
      desc: 'Ask for help pairing outfits with bangles, earrings, and necklaces.',
    },
    {
      icon: ShoppingBag,
      title: 'Shop Clothing + Accessories',
      desc: 'Browse South Asian clothing and finishing pieces in one place.',
    },
  ];

  return (
    <Layout>
      <section className="border-b border-[#E6D8C4] bg-[#FFFDF8]">
        <div className="container py-12 text-center md:py-16">
          <Breadcrumbs items={[{ name: 'Visit Our Store' }]} />
          <p className="label-editorial mb-3 text-[#5C1B24]">Brampton Boutique</p>
          <h1 className="heading-editorial mb-4 text-3xl text-[#1A120F] md:text-5xl">
            Visit Punjabi Fashion in Brampton
          </h1>
          <p className="mx-auto max-w-2xl text-[14px] leading-relaxed text-[#6F6257] md:text-[15px]">
            Shop Punjabi suits, lehengas, party wear, shararas, men’s styles, kids’ outfits, jewelry, and accessories in person at our Brampton boutique.
          </p>
          <div className="mx-auto mt-5 h-px w-24 bg-gold/60" aria-hidden="true" />
          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            {['Open Daily', '11:30 AM – 8:00 PM', 'Styling Help Available', 'Clothing + Accessories'].map((item) => (
              <span key={item} className="border border-gold/25 bg-background/70 px-3.5 py-2 text-[10px] uppercase tracking-[0.14em] text-[#5C1B24]">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={businessInfo.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-luxury btn-luxury-gold justify-center">
              Get Directions
            </a>
            <a href={businessInfo.phone.href} className="btn-luxury btn-luxury-outline justify-center">
              Call Store
            </a>
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-18">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="border border-[#E6D8C4] bg-[#FFFDF8] p-6 shadow-[0_18px_50px_-42px_rgba(26,18,15,0.35)] md:p-8">
            <div className="mb-5 h-1 w-20 bg-[#C6A15B]" aria-hidden="true" />
            <p className="label-editorial mb-3 text-[#5C1B24]">In-Store Shopping</p>
            <h2 className="heading-editorial mb-4 text-2xl text-foreground">What You’ll Find In Store</h2>
            <p className="mb-7 text-[14px] leading-relaxed text-muted-foreground">
              Browse colours, compare fabrics, ask about sizing, and get help pairing clothing with jewelry and accessories.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {inStoreItems.map((item) => (
                <div key={item} className="flex items-center gap-3 border border-[#E6D8C4] bg-[#FBF7EF] px-4 py-3 text-[13px] text-[#3A1117]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold" aria-hidden="true">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#E6D8C4] bg-[#FFFDF8] p-6 shadow-[0_18px_50px_-42px_rgba(26,18,15,0.35)] md:p-8">
            <p className="label-editorial mb-3 text-[#5C1B24]">Plan Your Visit</p>
            <h2 className="heading-editorial mb-6 text-2xl text-foreground">Store Details</h2>
            <div className="space-y-5 text-[14px]">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
                <address className="not-italic text-muted-foreground">
                  <strong className="block text-foreground">{businessInfo.address.street}</strong>
                  {businessInfo.address.city}, {businessInfo.address.province} {businessInfo.address.postalCode}
                  <br />
                  {businessInfo.address.country}
                </address>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
                <a href={businessInfo.phone.href} className="text-muted-foreground transition-colors hover:text-gold">{businessInfo.phone.display}</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
                <a href={`mailto:${businessInfo.email}`} className="text-muted-foreground transition-colors hover:text-gold">{businessInfo.email}</a>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-muted-foreground">{businessInfo.hoursDisplay}</span>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href={businessInfo.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-luxury btn-luxury-gold justify-center">
                Get Directions
              </a>
              <a href={businessInfo.phone.href} className="btn-luxury btn-luxury-outline justify-center">
                Call Store
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border border-[#E6D8C4] bg-[#FBF7EF] p-6 md:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="label-editorial mb-3 text-[#5C1B24]">Directions</p>
              <h2 className="heading-editorial text-2xl text-foreground">Find Us in Brampton</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                Punjabi Fashion is located at {businessInfo.address.short}.
              </p>
              <a href={businessInfo.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-luxury btn-luxury-gold mt-6 justify-center">
                Open Google Maps
              </a>
            </div>
            <div className="relative min-h-[220px] overflow-hidden border border-gold/25 bg-[#3A1117] p-6 text-cream">
              <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(#B9904A_1px,transparent_1px),linear-gradient(90deg,#B9904A_1px,transparent_1px)] [background-size:28px_28px]" aria-hidden="true" />
              <div className="relative flex h-full min-h-[180px] flex-col justify-end">
                <Navigation className="mb-5 h-8 w-8 text-gold" strokeWidth={1.5} aria-hidden="true" />
                <p className="label-luxury mb-2 text-gold-light/85">Brampton Boutique</p>
                <p className="font-heading text-2xl text-cream">{businessInfo.name}</p>
                <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-cream/70">{businessInfo.address.short}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 md:mt-18">
          <div className="mb-8 text-center">
            <p className="label-editorial mb-2 text-[#5C1B24]">Why Visit</p>
            <h2 className="heading-editorial text-3xl text-foreground">Why Visit the Boutique?</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {visitReasons.map((item) => (
              <div key={item.title} className="border border-[#E6D8C4] bg-[#FFFDF8] p-6 text-center shadow-[0_16px_45px_-42px_rgba(26,18,15,0.4)]">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 bg-[#FBF7EF] text-gold">
                  <item.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="font-heading text-lg text-foreground">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border border-gold/25 bg-[#3A1117] p-6 text-center text-cream md:p-8">
          <p className="label-editorial mb-3 text-gold-light/85">Need Help Before Visiting?</p>
          <h2 className="heading-editorial text-2xl text-cream">Call Punjabi Fashion during store hours</h2>
          <p className="mx-auto mt-3 max-w-xl text-[13px] leading-relaxed text-cream/65">
            Call Punjabi Fashion during store hours or request an appointment for styling support.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={businessInfo.phone.href} className="btn-luxury btn-luxury-gold justify-center">Call Store</a>
            <Link to="/book-appointment" className="btn-luxury border border-gold/35 text-cream hover:bg-cream hover:text-charcoal justify-center">
              Book Appointment
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export function ContactPage() {
  const helpTopics = [
    { icon: ShoppingBag, title: 'Product Availability', desc: 'Ask about sizes, colours, and new arrivals.' },
    { icon: Sparkles, title: 'Styling Help', desc: 'Get help matching suits, jewelry, bangles, and accessories.' },
    { icon: Store, title: 'Store Visit', desc: 'Plan your visit to the Brampton boutique.' },
    { icon: Heart, title: 'Occasion Shopping', desc: 'Find outfits for family events, festive nights, and celebrations.' },
  ];

  return (
    <Layout>
      <section className="bg-[#FBF7EF] py-14 md:py-18 texture-subtle border-b border-[#E6D8C4]">
        <div className="container relative z-10 text-center">
          <Breadcrumbs items={[{ name: 'Contact' }]} />
          <p className="label-editorial mb-3 text-[#5C1B24]">Visit The Boutique</p>
          <h1 className="heading-editorial text-foreground text-3xl md:text-5xl mb-4">Contact Punjabi Fashion</h1>
          <div className="mx-auto mb-5 h-px w-24 bg-gold/60" />
          <p className="mx-auto max-w-2xl text-muted-foreground font-body text-[14px] md:text-[15px] leading-relaxed">
            Have a question about sizing, availability, styling, or visiting the store? Reach out to Punjabi Fashion in Brampton — our team is here to help you find the right look for your next occasion.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            {['Brampton Boutique', 'In-Store & Online', 'Styling Help Available', 'Open Daily'].map((item) => (
              <span key={item} className="border border-gold/25 bg-background/70 px-3.5 py-2 text-[10px] uppercase tracking-[0.14em] text-[#5C1B24]">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 xl:gap-12">
          <form onSubmit={e => e.preventDefault()} className="border border-[#E6D8C4] bg-[#FFFDF8] p-6 shadow-[0_22px_60px_-44px_rgba(26,18,15,0.45)] md:p-9 lg:p-11">
            <p className="label-editorial mb-3 text-[#5C1B24]">Contact Form</p>
            <h2 className="heading-editorial text-foreground text-2xl md:text-3xl mb-2">Send Us a Message</h2>
            <p className="mb-8 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
              Tell us what you’re looking for and we’ll get back to you as soon as possible.
            </p>

            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="label-luxury text-muted-foreground mb-2 block">Name *</label>
                  <input id="contact-name" name="name" placeholder="Your name" required className="w-full border border-[#E6D8C4] bg-background px-4 py-3.5 text-[13px] text-foreground transition-colors placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20" />
                </div>
                <div>
                  <label htmlFor="contact-email" className="label-luxury text-muted-foreground mb-2 block">Email *</label>
                  <input id="contact-email" name="email" placeholder="you@email.com" type="email" required className="w-full border border-[#E6D8C4] bg-background px-4 py-3.5 text-[13px] text-foreground transition-colors placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20" />
                </div>
              </div>
              <div>
                <label htmlFor="contact-phone" className="label-luxury text-muted-foreground mb-2 block">Phone</label>
                <input id="contact-phone" name="phone" placeholder="Your phone number" type="tel" className="w-full border border-[#E6D8C4] bg-background px-4 py-3.5 text-[13px] text-foreground transition-colors placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20" />
              </div>
              <div>
                <label htmlFor="contact-subject" className="label-luxury text-muted-foreground mb-2 block">Subject</label>
                <input id="contact-subject" name="subject" placeholder="How can we help?" className="w-full border border-[#E6D8C4] bg-background px-4 py-3.5 text-[13px] text-foreground transition-colors placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20" />
              </div>
              <div>
                <label htmlFor="contact-message" className="label-luxury text-muted-foreground mb-2 block">Message *</label>
                <textarea id="contact-message" name="message" placeholder="Tell us more about the outfit, accessory, or store visit you need help with..." rows={7} required className="w-full resize-none border border-[#E6D8C4] bg-background px-4 py-3.5 text-[13px] text-foreground transition-colors placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20" />
              </div>
              <button type="submit" className="btn-luxury btn-luxury-gold w-full sm:w-auto">Send Message</button>
            </div>
          </form>

          <aside className="space-y-5">
            <div className="overflow-hidden border border-gold/25 bg-[#3A1117] text-cream shadow-[0_22px_60px_-44px_rgba(58,17,23,0.75)]">
              <div className="border-b border-gold/20 p-6 md:p-7">
                <p className="label-editorial text-gold-light/80 mb-3">Brampton Boutique</p>
                <h2 className="heading-editorial text-cream text-2xl">Reach Punjabi Fashion</h2>
                <p className="mt-3 text-[13px] leading-relaxed text-cream/60">
                  Visit our Brampton boutique for South Asian clothing, accessories, styling help, and new arrivals.
                </p>
              </div>
              <div className="space-y-5 p-6 text-[14px] md:p-7">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" strokeWidth={1.5} />
                  <address className="not-italic text-cream/75">
                    <span className="block text-cream">{businessInfo.address.street}</span>
                    {businessInfo.address.city}, {businessInfo.address.province} {businessInfo.address.postalCode}
                  </address>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 flex-shrink-0 text-gold" strokeWidth={1.5} />
                  <a href={businessInfo.phone.href} className="text-cream/75 transition-colors hover:text-gold">{businessInfo.phone.display}</a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 flex-shrink-0 text-gold" strokeWidth={1.5} />
                  <a href={`mailto:${businessInfo.email}`} className="text-cream/75 transition-colors hover:text-gold">{businessInfo.email}</a>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" strokeWidth={1.5} />
                  <span className="text-cream/75">{businessInfo.hoursDisplay}</span>
                </div>
              </div>
            </div>

            <div
              className="relative overflow-hidden border border-[#E6D8C4] bg-[#FFFDF8] p-6 shadow-[0_18px_50px_-40px_rgba(26,18,15,0.35)] md:p-7"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(198,161,91,0.12) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(198,161,91,0.12) 1px, transparent 1px),
                  radial-gradient(circle at 58% 34%, rgba(92,27,36,0.13), transparent 22%)
                `,
                backgroundSize: '32px 32px, 32px 32px, cover',
              }}
            >
              <div className="absolute left-[-12%] top-[44%] h-8 w-[130%] -rotate-12 bg-[#C6A15B]/10" aria-hidden="true" />
              <div className="absolute left-[18%] top-0 h-full w-7 rotate-[18deg] bg-[#5C1B24]/6" aria-hidden="true" />
              <div className="absolute right-[8%] top-[-20%] h-[150%] w-px rotate-[32deg] bg-[#C6A15B]/22" aria-hidden="true" />
              <div className="absolute right-7 top-7 z-10 hidden items-start gap-2 rounded-full border border-[#E6D8C4] bg-[#FFFDF8]/92 px-3 py-2 shadow-[0_12px_28px_rgba(58,17,23,0.10)] sm:flex">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5C1B24] text-[#FFFDF8] shadow-[0_8px_18px_rgba(92,27,36,0.28)]">
                  <MapPin className="h-3.5 w-3.5 fill-current text-[#D5B98A]" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="pt-0.5 text-left">
                  <span className="block text-[11px] font-semibold leading-tight text-[#3A1117]">Punjabi Fashion</span>
                  <span className="block text-[9px] uppercase tracking-[0.12em] text-[#7A6043]">Brampton Boutique</span>
                </span>
              </div>
              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-background">
                  <Navigation className="h-5 w-5 text-gold" strokeWidth={1.5} />
                </div>
                <p className="label-luxury mb-2 text-[#5C1B24]">Map / Directions</p>
                <h2 className="font-heading text-2xl text-foreground">Punjabi Fashion — Brampton Boutique</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{businessInfo.address.short}</p>
                <a
                  href={businessInfo.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-luxury btn-luxury-gold mt-6 w-full justify-center"
                >
                  Get Directions
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <a href={businessInfo.phone.href} className="btn-luxury btn-luxury-gold justify-center">Call Store</a>
              <a href={businessInfo.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-luxury btn-luxury-outline justify-center">Get Directions</a>
              <Link to="/visit-store" className="btn-luxury btn-luxury-outline justify-center">Visit Store</Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-section-muted/45 py-12 md:py-16 border-y border-[#E6D8C4]">
        <div className="container">
          <div className="mb-8 text-center">
            <p className="label-editorial mb-3">Boutique Support</p>
            <h2 className="heading-editorial text-foreground text-2xl md:text-3xl">How We Can Help</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {helpTopics.map((item) => (
              <article key={item.title} className="group border border-[#E6D8C4] bg-[#FFFDF8] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-[0_18px_45px_-36px_rgba(92,27,36,0.45)]">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-gold/25 bg-[#FBF7EF] transition-colors group-hover:bg-[#5C1B24]">
                  <item.icon className="h-4 w-4 text-gold group-hover:text-cream" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-xl text-foreground">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#3A1117] py-14 md:py-18">
        <div className="absolute inset-0 opacity-[0.07] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2244%22%20height%3D%2244%22%20viewBox%3D%220%200%2044%2044%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M22%202L42%2022L22%2042L2%2022z%22%20fill%3D%22none%22%20stroke%3D%22%23B9904A%22%20stroke-width%3D%221%22%2F%3E%3C%2Fsvg%3E')]" aria-hidden="true" />
        <div className="container relative z-10 text-center">
          <p className="label-editorial text-gold-light/75 mb-3">Local Shopping</p>
          <h2 className="heading-editorial text-cream text-3xl md:text-4xl">Visit Punjabi Fashion in Brampton</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-relaxed text-cream/60">
            Explore Punjabi suits, lehengas, party wear, men’s styles, kids’ outfits, jewelry, and accessories in-store.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/visit-store" className="btn-luxury btn-luxury-gold justify-center">Visit Store</Link>
            <a href={businessInfo.phone.href} className="btn-luxury btn-luxury-cream justify-center">Call Store</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
