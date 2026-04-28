import Layout from '@/components/Layout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { businessInfo } from '@/data/businessInfo';

type PolicyPlaceholderPageProps = {
  title: string;
  note: string;
  metaTitle: string;
  metaDescription: string;
};

function PolicyPlaceholderPage({ title, note, metaTitle, metaDescription }: PolicyPlaceholderPageProps) {
  useEffect(() => {
    document.title = metaTitle;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = metaDescription;
  }, [metaDescription, metaTitle]);

  return (
    <Layout>
      <section className="bg-[#FBF7EF] py-14 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[960px] px-6 lg:px-8">
          <div className="mb-7">
            <Breadcrumbs items={[{ name: title }]} />
          </div>

          <div className="border border-[#E6D8C4] bg-[#FFFDF8] p-7 shadow-[0_22px_70px_rgba(58,17,23,0.07)] md:p-10 lg:p-12">
            <p className="label-editorial mb-3 text-[#5C1B24]">Customer Information</p>
            <h1 className="heading-editorial text-3xl text-[#1A120F] md:text-5xl">{title}</h1>
            <div className="mt-5 h-px w-20 bg-[#C6A15B]" aria-hidden="true" />

            <div className="mt-8 rounded-[12px] border border-[#E6D8C4] bg-[#FBF7EF] p-5 md:p-6">
              <span className="inline-flex border border-[#C6A15B]/35 bg-[#FFFDF8] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C1B24]">
                In Progress
              </span>
              <p className="mt-4 text-[15px] leading-relaxed text-[#6F6257]">{note}</p>
              <p className="mt-3 text-[13px] leading-relaxed text-[#8A7666]">
                This page is currently being finalized. For the most accurate information, please contact Punjabi Fashion directly or visit our Brampton boutique.
              </p>
            </div>

            <div className="mt-8 grid gap-6 border-t border-[#E6D8C4] pt-8 md:grid-cols-[1fr_auto]">
              <div>
                <h2 className="font-heading text-2xl text-[#3A1117]">Contact Punjabi Fashion</h2>
                <div className="mt-5 space-y-4 text-[14px] text-[#6F6257]">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
                    <address className="not-italic">
                      <span className="block font-semibold text-[#1A120F]">{businessInfo.name}</span>
                      {businessInfo.address.street}
                      <br />
                      {businessInfo.address.city}, {businessInfo.address.province} {businessInfo.address.postalCode}
                    </address>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 flex-shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
                    <a href={businessInfo.phone.href} className="transition-colors hover:text-gold">{businessInfo.phone.display}</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 flex-shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
                    <a href={`mailto:${businessInfo.email}`} className="transition-colors hover:text-gold">{businessInfo.email}</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 flex-shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
                    <span>Hours: {businessInfo.hoursDisplay}</span>
                  </div>
                </div>
              </div>

              <div className="flex min-w-[190px] flex-col gap-3">
                <a href={businessInfo.phone.href} className="btn-luxury btn-luxury-gold justify-center">
                  Call Store
                </a>
                <Link to="/contact" className="btn-luxury btn-luxury-outline justify-center">
                  Contact Us
                </Link>
                <Link to="/visit-store" className="btn-luxury btn-luxury-outline justify-center">
                  Visit Store
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export function ShippingPolicyPage() {
  return (
    <PolicyPlaceholderPage
      title="Shipping"
      note="Shipping information is currently being finalized. For current delivery, pickup, or order questions, please contact Punjabi Fashion directly."
      metaTitle="Shipping | Punjabi Fashion"
      metaDescription="Shipping information for Punjabi Fashion is being finalized. Contact Punjabi Fashion for current delivery, pickup, or order questions."
    />
  );
}

export function ShippingDeliveryPage() {
  return (
    <PolicyPlaceholderPage
      title="Shipping & Delivery"
      note="Shipping and delivery details are currently being finalized. For current delivery, pickup, or order questions, please contact Punjabi Fashion directly."
      metaTitle="Shipping & Delivery | Punjabi Fashion"
      metaDescription="Shipping and delivery details for Punjabi Fashion are being finalized. Contact Punjabi Fashion for current delivery, pickup, or order questions."
    />
  );
}

export function ReturnsPolicyPage() {
  return (
    <PolicyPlaceholderPage
      title="Returns & Exchanges"
      note="Return and exchange information is currently being finalized. For questions about a recent purchase or store policy, please contact Punjabi Fashion directly."
      metaTitle="Returns & Exchanges | Punjabi Fashion"
      metaDescription="Return and exchange information for Punjabi Fashion is being finalized. Contact Punjabi Fashion for current store policy questions."
    />
  );
}

export function PrivacyPolicyPage() {
  return (
    <PolicyPlaceholderPage
      title="Privacy Policy"
      note="Our privacy policy is currently being finalized. For questions about how customer information is handled, please contact Punjabi Fashion directly."
      metaTitle="Privacy Policy | Punjabi Fashion"
      metaDescription="Punjabi Fashion's privacy policy is being finalized. Contact Punjabi Fashion for questions about customer information."
    />
  );
}

export function TermsPage() {
  return (
    <PolicyPlaceholderPage
      title="Terms & Conditions"
      note="Our terms and conditions are currently being finalized. Please contact Punjabi Fashion directly for questions about orders, services, or store policies."
      metaTitle="Terms & Conditions | Punjabi Fashion"
      metaDescription="Punjabi Fashion's terms and conditions are being finalized. Contact Punjabi Fashion for questions about orders, services, or store policies."
    />
  );
}
