import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/cart/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from '@remix-run/react';
import {ProductPrice} from '../ProductPrice';
import {useAside} from '../Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import CartLineQuantityAdjustor from './CartLineQuantityAdjustor';
import {useState} from 'react';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex gap-6 py-8 px-4 border-b border-black/10 font-poppins transition-all duration-300 hover:bg-black/[0.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative w-28  bg-gray-50 rounded-md overflow-hidden">
        {image && (
          <div className="h-full w-full overflow-hidden">
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              className={`object-cover w-full h-full transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
              loading="lazy"
              sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
            />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={close}
            className="block"
          >
            <h3 className="text-base font-semibold text-black/90 uppercase tracking-wide mb-2 truncate transition-colors duration-300 hover:text-black">
              {product.title}
            </h3>
          </Link>

          {/* Product Options */}
          <div className="space-y-1">
            {selectedOptions.map((option) => (
              <p
                key={`${product.id}-${option.name}`}
                className="text-sm text-black/60"
              >
                {option.name}:{' '}
                <span className="font-semibold">{option.value}</span>
              </p>
            ))}
          </div>
          <div className="text-base font-semibold text-black/90 transition-all duration-300">
            <ProductPrice price={line?.cost?.totalAmount} />
          </div>
        </div>

        {/* Price & Quantity */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <CartLineQuantityAdjustor line={line} />
        </div>
      </div>
    </div>
  );
}
