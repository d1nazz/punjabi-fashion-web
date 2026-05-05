import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import CartContent from '@/components/cart/CartContent';

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { cartCount } = useStore();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200]" aria-label="Cart drawer">
      <button
        type="button"
        className="cart-drawer-overlay absolute inset-0 h-full w-full bg-[#120B0A]/42 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
        aria-label="Close cart"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="cart-drawer-panel absolute bottom-0 right-0 top-0 flex h-[100svh] w-full max-w-full flex-col border-l border-[#D8C8AE] bg-[#FFFDF8] shadow-[0_24px_90px_rgba(18,11,10,0.28)] sm:w-[min(460px,100vw)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E6D8C4] px-5 py-4">
          <div>
            <h2 id="cart-drawer-title" className="font-heading text-3xl leading-none text-[#3A1117]">
              Cart
            </h2>
            <p className="mt-1 text-[12px] text-[#6F6257]">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E6D8C4] text-[#3A1117] hover:border-[#B9904A] hover:text-[#8A1F2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B9904A]/35"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        <CartContent onNavigate={() => onOpenChange(false)} />
      </aside>
    </div>
  );
}
