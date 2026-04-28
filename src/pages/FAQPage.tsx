import Layout from '@/components/Layout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqSections = [
  { title: 'Shipping', items: [
    { q: 'Do you ship across Canada?', a: 'Yes, we offer Canada-wide shipping on all orders. Standard shipping typically takes 5-7 business days.' },
    { q: 'Do you offer international shipping?', a: 'We currently ship within Canada. International shipping may be available on request — please contact us for details.' },
    { q: 'How much does shipping cost?', a: 'Shipping rates vary by location and order size. Free shipping is available on orders over $500 CAD.' },
  ]},
  { title: 'Returns & Exchanges', items: [
    { q: 'What is your return policy?', a: 'We accept returns within 14 days of delivery for unworn items with tags attached. Bridal and custom orders are final sale.' },
    { q: 'How do I initiate a return?', a: 'Contact us at info@punjabifashion.ca with your order number and reason for return. We will provide return instructions.' },
  ]},
  { title: 'Sizing', items: [
    { q: 'How do I find my size?', a: 'Refer to our size guide for measurements. Most items are semi-stitched and can be customized. Contact us for personalized sizing help.' },
    { q: 'Can I get custom sizing?', a: 'Yes, many of our items can be customized to your measurements. Please note this may extend delivery time.' },
  ]},
  { title: 'Appointments & In-Store', items: [
    { q: 'Do I need an appointment to visit?', a: 'Walk-ins are always welcome! However, we recommend booking an appointment for bridal consultations to ensure dedicated attention.' },
    { q: 'How long is a bridal appointment?', a: 'Bridal consultations are typically 60-90 minutes, giving you plenty of time to explore our bridal collections.' },
  ]},
  { title: 'Bridal Orders', items: [
    { q: 'How far in advance should I order my bridal outfit?', a: 'We recommend ordering bridal wear at least 8-12 weeks before your event to allow for any customizations or alterations.' },
    { q: 'Do you offer bridal packages?', a: 'Yes, we offer bridal packages that can include outfits for multiple events — mehndi, sangeet, wedding, and reception.' },
  ]},
  { title: 'Payment', items: [
    { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, American Express, Interac, and cash for in-store purchases.' },
    { q: 'Do you offer layaway or payment plans?', a: 'Yes, we offer layaway plans for bridal orders. Contact us for details.' },
  ]},
];

export default function FAQPage() {
  return (
    <Layout>
      <div className="bg-champagne py-12 md:py-16">
        <div className="container"><Breadcrumbs items={[{ name: 'FAQ' }]} />
          <h1 className="font-heading text-3xl md:text-5xl text-foreground mb-2">Frequently Asked Questions</h1>
          <p className="text-muted-foreground font-body">Everything you need to know about shopping with Punjabi Fashion</p>
        </div>
      </div>
      <div className="container py-12 md:py-16 max-w-3xl">
        {faqSections.map(section => (
          <div key={section.title} className="mb-8">
            <h2 className="font-heading text-xl text-foreground mb-4">{section.title}</h2>
            <Accordion type="single" collapsible>
              {section.items.map((item, i) => (
                <AccordionItem key={i} value={`${section.title}-${i}`}>
                  <AccordionTrigger className="text-sm font-body text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </Layout>
  );
}
