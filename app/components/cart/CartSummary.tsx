import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/cart/CartMain';
import {
  CartForm,
  Money,
  type OptimisticCart,
  useAnalytics,
} from '@shopify/hydrogen';
import {useRef} from 'react';
import {Link, type FetcherWithComponents} from '@remix-run/react';
import {ArrowRight, X} from 'lucide-react';
import {useAside} from '../Aside';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const {close} = useAside();
  const isPage = layout === 'page';

  return (
    <div className="px-4 py-4">
      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-base font-medium">
          <span className="text-black/70">Subtotal</span>
          <span className="font-semibold">
            {cart.cost?.subtotalAmount?.amount ? (
              <Money data={cart.cost?.subtotalAmount} />
            ) : (
              '-'
            )}
          </span>
        </div>

        {/* Shipping note */}
        <p className="text-sm text-black/60 italic">
          Shipping and taxes calculated at checkout
        </p>

        {/* Checkout Button */}
        <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />

        {/* Continue Shopping */}
        <Link
          to="/collections/all"
          onClick={close}
          className="flex items-center justify-center gap-2 w-full text-sm font-medium text-black/80 hover:text-black transition-colors py-2"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  const {publish, shop, cart} = useAnalytics();

  if (!checkoutUrl) return null;

  const handleCheckout = (e: React.MouseEvent) => {
    // Publish checkout started event
    publish('custom_checkout_started', {
      cart,
      shop,
      url: window.location.href || '',
      checkoutUrl,
    });
  };

  return (
    <a
      href={checkoutUrl}
      target="_self"
      onClick={handleCheckout}
      className="block w-full bg-black text-white text-center py-3 px-4 rounded-md hover:bg-black/90 transition-all duration-300 uppercase tracking-wider font-medium"
    >
      Checkout
    </a>
  );
}
