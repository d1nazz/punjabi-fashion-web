import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { businessInfo } from '@/data/businessInfo';
import { useStore } from '@/contexts/StoreContext';

export function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const { clearCart } = useStore();
  const didClearRef = useRef(false);

  useEffect(() => {
    if (didClearRef.current) return;
    if (!sessionId) return;
    clearCart();
    didClearRef.current = true;
  }, [clearCart, sessionId]);

  return (
    <Layout>
      <section className="border-b border-[#E6D8C4] bg-[#FBF7EF] py-10 md:py-12">
        <div className="container mx-auto max-w-2xl text-center">
          <Breadcrumbs items={[{ name: 'Checkout', path: '/cart' }, { name: 'Success' }]} />
          <h1 className="mt-6 font-heading text-3xl text-[#3A1117] md:text-4xl">Thank You</h1>
          <p className="mt-4 text-[14px] leading-relaxed text-[#6F6257]">
            {sessionId ? (
              <>
                Stripe returned you here after checkout. If you completed payment there, confirmation is usually emailed
                within a few minutes — check inbox and spam folder.
              </>
            ) : (
              <>Your checkout reached this confirmation page.</>
            )}{' '}
            Taxes and shipping (if applicable) remain subject to Stripe and store policies shown at checkout.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/women" className="btn-luxury btn-luxury-gold justify-center">
              Continue Shopping
            </Link>
            <Link to="/contact" className="btn-luxury btn-luxury-outline justify-center border-[#5C1B24]/35 text-[#5C1B24] hover:bg-[#5C1B24]/06">
              Contact Store
            </Link>
          </div>
          <p className="mt-10 text-[12px] leading-relaxed text-[#7A6F64]">
            Need Help?{' '}
            <a href={businessInfo.phone.href} className="font-semibold text-[#8A1F2D] underline-offset-4 hover:underline">
              {businessInfo.phone.display}
            </a>
          </p>
          {!sessionId && (
            <p className="mt-6 border border-[#E6D8C4] bg-[#FFFDF8] p-4 text-left text-[12px] leading-relaxed text-[#6F6257]">
              If you reached this URL without Stripe redirect, your order confirmation may still be emailed by Stripe —
              verify your inbox before placing another checkout.
            </p>
          )}
        </div>
      </section>
    </Layout>
  );
}

export function CheckoutCancelPage() {
  return (
    <Layout>
      <section className="border-b border-[#E6D8C4] bg-[#FBF7EF] py-10 md:py-12">
        <div className="container mx-auto max-w-2xl text-center">
          <Breadcrumbs items={[{ name: 'Checkout', path: '/cart' }, { name: 'Cancelled' }]} />
          <h1 className="mt-6 font-heading text-3xl text-[#3A1117] md:text-4xl">Checkout Cancelled</h1>
          <p className="mt-4 text-[14px] leading-relaxed text-[#6F6257]">
            Your selections are saved in your cart. You can safely continue shopping anytime.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/cart" className="btn-luxury btn-luxury-gold justify-center">
              Return to Cart
            </Link>
            <Link to="/women" className="btn-luxury btn-luxury-outline justify-center border-[#5C1B24]/35 text-[#5C1B24] hover:bg-[#5C1B24]/06">
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
