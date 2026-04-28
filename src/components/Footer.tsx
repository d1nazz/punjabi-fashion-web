import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useState } from 'react';
import { businessInfo } from '@/data/businessInfo';

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="bg-espresso text-cream/75 border-t border-gold/10">
      {/* Newsletter */}
      <div className="border-b border-gold/8">
        <div className="container py-16 text-center">
          <div className="divider-ornament mb-6">
            <span className="text-gold/40 text-xs">✦</span>
          </div>
          <p className="label-editorial mb-3">Exclusive Access</p>
          <h3 className="font-heading text-2xl md:text-3xl text-cream mb-3 font-light">Join the Punjabi Fashion Family</h3>
          <p className="text-[13px] text-cream/45 mb-8 max-w-md mx-auto leading-relaxed">
            Receive early access to new arrivals, bridal collection launches, exclusive offers, and styling inspiration — delivered to your inbox.
          </p>
          <form onSubmit={e => { e.preventDefault(); setEmail(''); }} className="flex max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-5 py-3.5 bg-input/40 border border-gold/15 text-ivory placeholder:text-muted-foreground/60 text-[13px] focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/15 transition-colors"
            />
            <button type="submit" className="px-7 py-3.5 bg-gold-gradient text-charcoal text-[10px] font-semibold tracking-[0.18em] uppercase hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div>
          <div className="mb-5 flex h-16 w-16 items-center justify-center border border-[#C6A15B]/25 bg-[#FBF7EF] p-2 shadow-[0_14px_35px_-28px_rgba(0,0,0,0.8)]">
            <img src={logo} alt="Punjabi Fashion" className="h-full w-full object-contain" />
          </div>
          <p className="text-[13px] leading-relaxed text-cream/45 mb-5">
            {businessInfo.shortDescription}
          </p>
          <div className="flex gap-2.5 mt-5">
            <a href="#" className="w-9 h-9 rounded-full border border-cream/15 flex items-center justify-center hover:border-gold hover:text-gold transition-all duration-300" aria-label="Instagram">
              <Instagram className="w-4 h-4" strokeWidth={1.5} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full border border-cream/15 flex items-center justify-center hover:border-gold hover:text-gold transition-all duration-300" aria-label="Facebook">
              <Facebook className="w-4 h-4" strokeWidth={1.5} />
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="label-luxury text-cream/60 mb-5 pb-3 border-b border-cream/8">Shop</h4>
          <div className="space-y-2.5 text-[13px]">
            {[
              ['New Arrivals', '/new-arrivals'],
              ['Punjabi Suits', '/category/punjabi-suits'],
              ['Lehengas', '/category/lehengas'],
              ['Sarees', '/category/sarees'],
              ['Bridal Collection', '/category/bridal'],
              ['Party Wear', '/category/party-wear'],
              ['Men\'s Collection', '/men'],
              ['Sale & Offers', '/sale'],
            ].map(([name, path]) => (
              <Link key={path} to={path} className="block text-cream/50 hover:text-gold transition-colors duration-300">{name}</Link>
            ))}
          </div>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="label-luxury text-cream/60 mb-5 pb-3 border-b border-cream/8">Customer Care</h4>
          <div className="space-y-2.5 text-[13px]">
            {[
              ['Book Appointment', '/book-appointment'],
              ['Size Guide', '/size-guide'],
              ['Shipping & Delivery', '/shipping-policy'],
              ['Returns & Exchanges', '/returns-policy'],
              ['Frequently Asked Questions', '/faq'],
              ['Track Your Order', '/track-order'],
              ['Contact Us', '/contact'],
            ].map(([name, path]) => (
              <Link key={path} to={path} className="block text-cream/50 hover:text-gold transition-colors duration-300">{name}</Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="label-luxury text-cream/60 mb-5 pb-3 border-b border-cream/8">Visit Us</h4>
          <div className="space-y-4 text-[13px]">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-0.5 text-gold/60 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-cream/50">
                {businessInfo.name}<br />
                {businessInfo.address.street}<br />
                {businessInfo.address.city}, {businessInfo.address.province} {businessInfo.address.postalCode}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gold/60 flex-shrink-0" strokeWidth={1.5} />
              <a href={businessInfo.phone.href} className="text-cream/50 hover:text-gold transition-colors">
                {businessInfo.phone.display}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gold/60 flex-shrink-0" strokeWidth={1.5} />
              <a href={`mailto:${businessInfo.email}`} className="text-cream/50 hover:text-gold transition-colors">
                {businessInfo.email}
              </a>
            </div>
            <div className="mt-5 pt-4 border-t border-cream/8 text-[12px] text-cream/35 space-y-1">
              <p>Hours: {businessInfo.hoursDisplay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream/8">
        <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-cream/30">© {new Date().getFullYear()} Punjabi Fashion. All rights reserved. Brampton, Ontario.</p>
          <div className="flex gap-5 text-[11px] text-cream/30">
            <Link to="/privacy-policy" className="hover:text-cream/60 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-cream/60 transition-colors">Terms</Link>
            <Link to="/shipping-policy" className="hover:text-cream/60 transition-colors">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
