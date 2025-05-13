import {Link, useNavigate} from '@remix-run/react';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();

  return (
    <div className="space-y-6 font-poppins">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        // Determine if this option is a color option
        const isColorOption =
          option.name.toLowerCase() === 'color' ||
          option.name.toLowerCase().includes('color');

        return (
          <div key={option.name} className="space-y-4">
            <h5 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
              {option.name}
            </h5>
            <div className="grid grid-cols-3 gap-4">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                // For color options, determine style and behavior
                let buttonStyle = {};
                let showText = true;
                let colorValue =
                  swatch?.color ||
                  (/^(#|rgb|hsl|[a-zA-Z]+)$/.test(name) && name !== 'Default'
                    ? name
                    : undefined);

                // Check if color is white or very light
                const isWhiteColor =
                  colorValue?.toLowerCase() === '#fff' ||
                  colorValue?.toLowerCase() === '#ffffff' ||
                  colorValue?.toLowerCase() === 'white' ||
                  colorValue?.replace(/\s/g, '').toLowerCase() ===
                    'rgb(255,255,255)';

                // Check if color is black
                const isBlackColor =
                  colorValue?.toLowerCase() === '#000' ||
                  colorValue?.toLowerCase() === '#000000' ||
                  colorValue?.toLowerCase() === 'black' ||
                  colorValue?.replace(/\s/g, '').toLowerCase() === 'rgb(0,0,0)';

                if (isColorOption && colorValue) {
                  buttonStyle = {
                    backgroundColor: colorValue,
                    transition: 'all 0.2s ease-in-out',
                  };
                  showText = false;
                }

                // Determine border class based on color and selection state
                let borderClass = '';
                if (isWhiteColor) {
                  // White color always needs a visible border
                  borderClass = selected ? 'border-black' : 'border-gray-300';
                } else if (isBlackColor && selected) {
                  // Black color needs a visible border when selected
                  borderClass = 'border-gray-300';
                } else if (selected) {
                  // Standard selected state for other colors
                  borderClass = 'border-black';
                } else {
                  // Default unselected state
                  borderClass = 'border-transparent';
                }

                // Determine availability styling
                const availabilityClass = !available
                  ? 'relative opacity-70 cursor-not-allowed bg-gray-200 hover:bg-gray-200'
                  : '';

                const baseClassName = `
                  relative
                  flex
                  w-full
                  h-12
                  items-center
                  justify-center
                  p-3
                  rounded-lg
                  border-2
                  transition-all duration-200
                  ${
                    selected
                      ? 'bg-white text-gray-900'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }
                  ${borderClass}
                  ${availabilityClass}
                `;

                // Create component content
                const buttonContent = (
                  <>
                    {isColorOption && colorValue ? (
                      <span className="sr-only">{name}</span>
                    ) : (
                      <span className="text-sm text-gray-700">{name}</span>
                    )}
                    {/* Add soldout indicator */}
                    {!available && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                        <div className="w-full h-0.5 bg-red-500 rotate-45 transform origin-center"></div>
                      </div>
                    )}
                  </>
                );

                if (isDifferentProduct) {
                  return (
                    <Link
                      className={baseClassName}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      style={buttonStyle}
                      aria-label={`${name}${!available ? ' (sold out)' : ''}`}
                    >
                      {buttonContent}
                    </Link>
                  );
                }

                return (
                  <button
                    type="button"
                    className={baseClassName}
                    key={option.name + name}
                    disabled={!exists}
                    onClick={() => {
                      if (!selected) {
                        navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                    style={buttonStyle}
                    aria-label={`${name}${!available ? ' (sold out)' : ''}`}
                  >
                    {buttonContent}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Add to cart button */}
      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        afterAddToCart={() => open('cart')}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  // Check if the name is a valid CSS color (basic check)
  const isColor =
    color || (/^(#|rgb|hsl|[a-zA-Z]+)$/.test(name) && name !== 'Default');
  const colorValue = color || (isColor ? name : undefined);

  if (!image && !colorValue) {
    return <span className="text-sm text-gray-700">{name}</span>;
  }

  // Check if color is white to add special border styling
  const isWhiteColor =
    colorValue?.toLowerCase() === '#fff' ||
    colorValue?.toLowerCase() === '#ffffff' ||
    colorValue?.toLowerCase() === 'white' ||
    colorValue?.replace(/\s/g, '').toLowerCase() === 'rgb(255,255,255)';

  return (
    <div
      aria-label={name}
      className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ${
        isWhiteColor ? 'ring-1 ring-gray-300' : 'ring-1 ring-gray-200'
      }`}
      style={{
        backgroundColor: colorValue || 'transparent',
      }}
    >
      {image ? (
        <img src={image} alt={name} className="w-full h-full object-cover" />
      ) : null}
      {!image && colorValue && <span className="sr-only">{name}</span>}
    </div>
  );
}
