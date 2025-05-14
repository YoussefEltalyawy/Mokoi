import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

import {CartLineItem} from '~/components/cart/CartLineItem';
import {CartSummary} from './CartSummary';
import CartEmpty from './CartEmpty';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''} font-poppins`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const isAside = layout === 'aside';

  return (
    <div className="flex flex-col h-full min-h-full">
      {cartHasItems ? (
        <div className="flex flex-col h-full relative">
          {/* Header */}
          <div className="border-b border-black/10 py-4">
            <h2 className="text-xl font-semibold uppercase tracking-wide text-center">
              Your Cart
            </h2>
            <p className="text-sm text-center text-black/60 mt-1">
              {cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'}{' '}
              in your cart
            </p>
          </div>

          {/* Cart Items - with fixed height */}
          <div className="h-[calc(100vh-300px)] overflow-y-auto">
            {(cart?.lines?.nodes ?? []).map((line) => (
              <CartLineItem key={line.id} line={line} layout={layout} />
            ))}
          </div>

          {/* Summary - fixed to bottom */}
          <div className="absolute left-0 right-0 bottom-0 bg-white border-t border-black/10 z-10">
            <CartSummary cart={cart} layout={layout} />
          </div>
        </div>
      ) : (
        <CartEmpty hidden={false} layout={layout} />
      )}
    </div>
  );
}
