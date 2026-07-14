import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
  className,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  className?: string;
}) {
  const isOnSale =
    !!(
      compareAtPrice &&
      price &&
      Number(compareAtPrice.amount) > Number(price.amount) &&
      Number(compareAtPrice.amount) > 0
    );

  return (
    <div className={`product-price ${className}`}>
      {isOnSale ? (
        <div className="product-price-on-sale">
          {price ? <Money data={price} /> : null}
          <s>
            <Money data={compareAtPrice as MoneyV2} />
          </s>
        </div>
      ) : price ? (
        <Money data={price} />
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
