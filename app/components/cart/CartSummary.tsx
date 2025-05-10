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
  // fixed bottom-4 left-4 z-50 w-full pr-8
  return (
    <div
      className={`
      fixed bottom-4 left-4 z-50 w-full pr-8
      bg-white
    `}
    >
      <div className="p-4">
        <div className="space-y-3">
          {/* Continue Shopping */}
          <Link
            to="/collections/all"
            onClick={close}
            className="flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors bg-brandBeige rounded-md hover:bg-brandBeige/80"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">
              {cart.cost?.subtotalAmount?.amount ? (
                <Money data={cart.cost?.subtotalAmount} />
              ) : (
                '-'
              )}
            </span>
          </div>
          {/* Checkout Button */}
          <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
        </div>
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
      className="block w-full bg-black text-white text-center py-2.5 px-4 rounded-md hover:bg-gray-800 transition-colors mt-4"
    >
      <p className='text-white'>Continue to Checkout</p>
    </a>
  );
}

