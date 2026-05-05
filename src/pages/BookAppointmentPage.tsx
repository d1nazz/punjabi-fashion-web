import Layout from '@/components/Layout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useEffect, useState } from 'react';
import {
  Baby,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Gem,
  Heart,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Shirt,
  Sparkles,
  Star,
  User,
  Users,
} from 'lucide-react';
import { businessInfo } from '@/data/businessInfo';
import { catalogProducts, type Product } from '@/data/products';

const appointmentTypes = [
  'Everyday Wear',
  'Family Event',
  'Festive Occasion',
  'Wedding Guest',
  'Bridal / Special Occasion',
  'Men’s Wear',
  'Kids’ Outfit',
  'Accessories / Jewelry',
  'Alterations / Fitting Question',
  'Other',
];

const categoryInterests = [
  'Punjabi Suits',
  'Lehengas',
  'Party Wear',
  'Shararas',
  'Men’s Punjabi Suits',
  'Kurtas',
  'Kids Punjabi Suits',
  'Bangles',
  'Earrings',
  'Necklaces',
];

const normalizeCategoryValue = (value: string): string =>
  value.toLowerCase().replace(/&/g, '').replace(/\s+/g, '-');

const productMatches = (product: Product, categorySlug: string) => {
  const normalizedSlug = normalizeCategoryValue(categorySlug);
  const category = normalizeCategoryValue(product.category);
  const subcategory = product.subcategory ? normalizeCategoryValue(product.subcategory) : '';
  const tags = product.tags.map(normalizeCategoryValue);

  return category === normalizedSlug || subcategory === normalizedSlug || tags.includes(normalizedSlug);
};

const firstProduct = (categorySlug: string) => catalogProducts.find((product) => productMatches(product, categorySlug));

const appointmentHelp = [
  {
    icon: Sparkles,
    title: 'Occasion Styling',
    desc: 'Get help choosing outfits for family events, festive nights, and celebrations.',
  },
  {
    icon: Gem,
    title: 'Colour & Matching Help',
    desc: 'Compare suits, dupattas, jewelry, bangles, earrings, and necklaces.',
  },
  {
    icon: MapPin,
    title: 'In-Store Boutique Visit',
    desc: 'Visit our Brampton location for sizing, selection, and styling support.',
  },
  {
    icon: Clock,
    title: 'Open Daily',
    desc: businessInfo.hoursDisplay,
  },
];

const appointmentTypesCards = [
  {
    icon: Heart,
    title: 'Women’s Styling',
    desc: 'Punjabi suits, lehengas, party wear, and shararas.',
    product: firstProduct('punjabi-suits'),
  },
  {
    icon: Shirt,
    title: 'Men’s Styling',
    desc: 'Men’s Punjabi suits and kurtas for events and gatherings.',
  },
  {
    icon: Baby,
    title: 'Kids’ Outfits',
    desc: 'Kids Punjabi suits for celebrations and family functions.',
  },
  {
    icon: Gem,
    title: 'Accessories Matching',
    desc: 'Bangles, earrings, and necklaces to complete the look.',
    product: firstProduct('earrings') ?? firstProduct('necklaces'),
  },
];

type AppointmentForm = {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  type: string;
  categoryInterest: string[];
  notes: string;
};

export default function BookAppointmentPage() {
  const [form, setForm] = useState<AppointmentForm>({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    type: '',
    categoryInterest: [],
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Book Appointment | Punjabi Fashion Brampton';
    const description =
      'Request a Punjabi Fashion appointment in Brampton for styling help with Punjabi suits, lehengas, party wear, shararas, men’s wear, kids’ outfits, jewelry, and accessories.';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const toggleCategoryInterest = (interest: string) => {
    setForm((current) => ({
      ...current,
      categoryInterest: current.categoryInterest.includes(interest)
        ? current.categoryInterest.filter((item) => item !== interest)
        : [...current.categoryInterest, interest],
    }));
  };

  const inputClass =
    'h-14 w-full rounded-none border border-[#E6D8C4] bg-[#FFFDF8] px-4 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/45 focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/15';
  const iconInputClass = `${inputClass} pl-11`;
  const labelClass = 'mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6F5548]';

  return (
    <Layout>
      <section className="border-b border-[#E6D8C4] bg-[#FFFDF8]">
        <div className="mx-auto max-w-[1240px] px-6 py-12 lg:px-12 lg:py-16">
          <div className="mb-6">
            <Breadcrumbs items={[{ name: 'Book Appointment' }]} />
          </div>
          <div className="max-w-3xl">
            <p className="label-editorial mb-3 text-[#5C1B24]">Private Styling Appointments</p>
            <h1 className="heading-editorial text-4xl leading-tight text-[#1A120F] md:text-5xl">
              Book Your Appointment
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-[#6F6257] md:text-[16px]">
              Request a Punjabi Fashion appointment in Brampton for styling help with Punjabi suits, lehengas, party wear, shararas, men’s wear, kids’ outfits, jewelry, and accessories.
            </p>
            <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-[#8A7666]">
              Brampton Boutique · Open Daily · Styling Help Available
            </p>
            <div className="mt-6 h-px w-20 bg-[#C6A15B]" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="bg-[#FBF7EF] py-8">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: FileText, title: 'Tell Us Your Occasion', desc: 'Share what you’re shopping for and any colour, size, or styling preferences.' },
              { icon: Calendar, title: 'Choose Preferred Date & Time', desc: 'Send us your preferred visit details so the store can review availability.' },
              { icon: CheckCircle, title: 'Store Confirms Details', desc: 'Appointment requests are not confirmed until Punjabi Fashion contacts you.' },
            ].map((item) => (
              <div key={item.title} className="border border-[#E6D8C4] bg-[#FFFDF8] p-5 shadow-[0_12px_35px_rgba(58,17,23,0.05)]">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#C6A15B]/14 text-[#9A6A25]">
                  <item.icon className="h-4 w-4" strokeWidth={1.6} />
                </div>
                <h2 className="font-heading text-[18px] text-[#3A1117]">{item.title}</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-[#6F5548]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-14 md:py-20">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.38fr)_minmax(340px,0.82fr)]">
            <div id="appointment-form" className="scroll-mt-28 rounded-[18px] border border-[#E6D8C4] bg-[#FFFDF8] p-6 shadow-[0_22px_70px_rgba(58,17,23,0.08)] md:p-10 lg:p-12">
              <p className="label-editorial mb-3 text-gold">Appointment Request</p>
              <h2 className="heading-editorial text-3xl text-[#3A1117]">Request Your Appointment</h2>
              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
                Share a few details and the Punjabi Fashion team will follow up to confirm availability.
              </p>

              {submitted ? (
                <div className="mt-8 border border-[#E6D8C4] bg-[#FBF7EF] px-6 py-12 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#C6A15B]/15 text-gold">
                    <CheckCircle className="h-5 w-5" strokeWidth={1.7} />
                  </div>
                  <h3 className="font-heading text-2xl text-[#3A1117]">Thank You</h3>
                  <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
                    Thank you — your appointment request has been received. Punjabi Fashion will contact you to confirm details.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div>
                    <label htmlFor="appointment-name" className={labelClass}>Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/55" strokeWidth={1.5} />
                      <input id="appointment-name" name="name" required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={iconInputClass} placeholder="Enter your full name" />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="appointment-phone" className={labelClass}>Phone *</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/55" strokeWidth={1.5} />
                        <input id="appointment-phone" name="phone" required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={iconInputClass} placeholder="Your phone number" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="appointment-email" className={labelClass}>Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/55" strokeWidth={1.5} />
                        <input id="appointment-email" name="email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={iconInputClass} placeholder="you@email.com" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="appointment-date" className={labelClass}>Preferred Date *</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/55" strokeWidth={1.5} />
                        <input id="appointment-date" name="date" required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={iconInputClass} />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="appointment-time" className={labelClass}>Preferred Time *</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/55" strokeWidth={1.5} />
                        <input id="appointment-time" name="time" required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={iconInputClass} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="appointment-type" className={labelClass}>Shopping For / Occasion *</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/55" strokeWidth={1.5} />
                      <select id="appointment-type" name="type" required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={`${iconInputClass} appearance-none`}>
                        <option value="">Select what you’re shopping for...</option>
                        {appointmentTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                  </div>

                  <fieldset>
                    <legend className={labelClass}>Category Interest</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {categoryInterests.map((interest) => (
                        <label key={interest} className="flex min-h-[48px] cursor-pointer items-center gap-3 border border-[#E6D8C4] bg-[#FBF7EF] px-4 py-3 text-[13px] text-[#3A1117] transition-colors hover:border-[#C6A15B]">
                          <input
                            type="checkbox"
                            name="categoryInterest"
                            value={interest}
                            checked={form.categoryInterest.includes(interest)}
                            onChange={() => toggleCategoryInterest(interest)}
                            className="h-4 w-4 accent-[#C6A15B]"
                          />
                          {interest}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <label htmlFor="appointment-notes" className={labelClass}>Message / Notes</label>
                    <textarea
                      id="appointment-notes"
                      name="notes"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="min-h-[140px] w-full resize-none border border-[#E6D8C4] bg-[#FFFDF8] px-4 py-4 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/45 focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/15"
                      placeholder="Tell us what you’re looking for, preferred colours, sizes, or event details."
                    />
                  </div>

                  <div className="rounded-[10px] border border-[#E6D8C4] bg-[#FBF7EF] p-4 text-[12px] leading-relaxed text-[#6F5548]">
                    Appointment requests are not confirmed until Punjabi Fashion contacts you.
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="submit" className="btn-luxury btn-luxury-gold flex-1 py-4">
                      Request Appointment
                    </button>
                    <a href={businessInfo.phone.href} className="btn-luxury flex-1 border border-[#C6A15B]/35 bg-transparent py-4 text-center text-[#3A1117] hover:bg-[#3A1117] hover:text-[#FFFDF8]">
                      Call Store
                    </a>
                  </div>
                </form>
              )}
            </div>

            <aside className="self-start rounded-[18px] border border-[#C6A15B]/25 bg-[#3A1117] p-6 text-[#F7F1E6] shadow-[0_22px_70px_rgba(58,17,23,0.16)] md:p-8">
              <p className="label-editorial mb-3 !text-[#D5B98A]">Boutique Support</p>
              <h2 className="font-heading text-3xl leading-tight">The Punjabi Fashion Experience</h2>
              <p className="mt-4 text-[14px] leading-relaxed text-[#E9DDCB]/78">
                Every appointment is designed to help you find the right look for your occasion, preferences, and timeline.
              </p>

              <div className="mt-8 space-y-5">
                {appointmentHelp.map((item) => (
                  <div key={item.title} className="flex gap-4 border-b border-[#C6A15B]/18 pb-5 last:border-0 last:pb-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C6A15B]/15 text-[#D5B98A]">
                      <item.icon className="h-4 w-4" strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3 className="font-heading text-[17px] text-[#FFFDF8]">{item.title}</h3>
                      <p className="mt-1 text-[12px] leading-relaxed text-[#C9BCAE]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[12px] border border-[#C6A15B]/22 bg-[#FFFDF8]/7 p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#D5B98A]">Visit Punjabi Fashion</p>
                <p className="mt-3 text-[13px] leading-relaxed text-[#F7F1E6]">{businessInfo.address.short}</p>
                <p className="mt-2 text-[13px] text-[#C9BCAE]">{businessInfo.phone.display}</p>
                <p className="mt-2 text-[13px] text-[#C9BCAE]">{businessInfo.hoursDisplay}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <a href={businessInfo.phone.href} className="btn-luxury btn-luxury-gold text-center">Call Store</a>
                  <a href={businessInfo.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-luxury border border-[#C6A15B]/40 bg-transparent text-center text-[#F7F1E6] hover:bg-[#FFFDF8]/10">
                    Get Directions
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-[#FBF7EF] py-14 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="label-editorial mb-3 text-gold">Styling Support</p>
            <h2 className="heading-editorial text-3xl text-[#3A1117] md:text-4xl">What We Can Help With</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {appointmentTypesCards.map((card) => (
              <div key={card.title} className="overflow-hidden border border-[#E6D8C4] bg-[#FFFDF8] shadow-[0_14px_42px_rgba(58,17,23,0.06)]">
                {card.product ? (
                  <div className="h-48 border-b border-[#E6D8C4] bg-[#3A1117]">
                    <img src={card.product.images[0]} alt={card.product.name} className="h-full w-full object-contain p-4" />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center border-b border-[#E6D8C4] bg-[#3A1117]">
                    <card.icon className="h-10 w-10 text-[#D5B98A]" strokeWidth={1.4} />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-heading text-xl text-[#3A1117]">{card.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#6F5548]">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#3A1117] py-12 md:py-16">
        <div className="container">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="label-editorial mb-3 !text-[#D5B98A]">Need Help Now?</p>
              <h2 className="heading-editorial text-3xl text-[#FFFDF8]">Prefer to speak with us directly?</h2>
              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[#C9BCAE]">
                Call Punjabi Fashion or visit the Brampton boutique during store hours.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={businessInfo.phone.href} className="btn-luxury btn-luxury-gold text-center">
                <Phone className="mr-2 inline h-4 w-4" strokeWidth={1.6} />
                Call Store
              </a>
              <a href={businessInfo.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-luxury border border-[#C6A15B]/40 bg-transparent text-center text-[#F7F1E6] hover:bg-[#FFFDF8]/10">
                <Navigation className="mr-2 inline h-4 w-4" strokeWidth={1.6} />
                Get Directions
              </a>
              <a href="/visit-store" className="btn-luxury border border-[#C6A15B]/40 bg-transparent text-center text-[#F7F1E6] hover:bg-[#FFFDF8]/10">
                Visit Store
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
