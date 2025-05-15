import {Link, useNavigate} from '@remix-run/react';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {motion, AnimatePresence} from 'framer-motion';
import {useState, useEffect} from 'react';
import {TextScramble} from '~/components/ui/text-scramble'; // Assuming this component exists
import {AddToCartButton} from './AddToCartButton'; // Using the updated AddToCartButton
import {useAside} from './Aside'; // Assuming this hook exists
import type {ProductFragment} from 'storefrontapi.generated'; // Assuming this type exists

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside(); // Context or hook to open a side panel (e.g., cart)
  // Removed addingToCart state as AddToCartButton now handles its internal loading state
  const [scaleButton, setScaleButton] = useState(false); // For AddToCartButton mount animation
  const [activeVariant, setActiveVariant] = useState<string | null>(null); // For option button click animation
  const [scrambleText, setScrambleText] = useState(false); // For AddToCartButton text animation

  // Animation for AddToCartButton on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setScaleButton(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Trigger text scramble effect for AddToCartButton
  useEffect(() => {
    const timer = setTimeout(() => {
      setScrambleText(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Handle opening the cart after a successful addition.
  // The actual "adding" state is managed within AddToCartButton.
  const handleAfterAddToCart = () => {
    setTimeout(() => {
      open('cart');
    }, 600); // Delay to allow user to see "Added" message
  };

  return (
    <div className="space-y-8 font-poppins">
      {/* Product options selection */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.6}}
        className="space-y-8"
      >
        {productOptions.map((option, idx) => {
          // Skip rendering if there's only one value for the option (no choice to make)
          if (option.optionValues.length === 1) return null;

          // Determine if this option is a color option
          const isColorOption =
            option.name.toLowerCase() === 'color' ||
            option.name.toLowerCase().includes('color');

          return (
            <motion.div
              key={option.name}
              className="space-y-4"
              initial={{opacity: 0, y: 15}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5, delay: 0.1 * idx}}
            >
              <div className="flex items-center justify-between">
                {/* Option name */}
                <motion.h5
                  className="text-sm font-medium text-black uppercase tracking-wide"
                  initial={{opacity: 0, x: -20}}
                  animate={{opacity: 1, x: 0}}
                  transition={{duration: 0.5, delay: 0.2 + 0.1 * idx}}
                >
                  {option.name}
                </motion.h5>

                {/* Available options count */}
                <motion.span
                  className="text-xs text-gray-500"
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{duration: 0.5, delay: 0.3 + 0.1 * idx}}
                >
                  {option.optionValues.filter((v) => v.available).length}{' '}
                  {option.optionValues.filter((v) => v.available).length === 1
                    ? 'option'
                    : 'options'}{' '}
                  available
                </motion.span>
              </div>

              {/* Option values grid */}
              <motion.div
                className={`grid ${
                  isColorOption
                    ? 'grid-cols-5 sm:grid-cols-6' // More columns for colors
                    : 'grid-cols-3' // Consistent 3 columns for sizes/other options
                } gap-3`}
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.6, delay: 0.2}}
              >
                {option.optionValues.map((value) => {
                  const {
                    name,
                    handle, // Product handle if this variant is on a different product
                    variantUriQuery, // Query string for this specific variant option
                    selected, // Is this option value currently selected?
                    available, // Is the variant with this option available?
                    exists, // Does a variant with this option exist?
                    isDifferentProduct, // Is this option leading to a different product?
                    swatch, // Color swatch data from Shopify
                  } = value;

                  let buttonStyle = {};
                  // Try to get color from swatch or name
                  const colorValue =
                    swatch?.color ||
                    (/^(#|rgb|hsl|[a-zA-Z]+)$/.test(name) && name !== 'Default'
                      ? name
                      : undefined);

                  // Check if color is white or very light for potential border adjustments if needed
                  const isWhiteColor =
                    colorValue?.toLowerCase() === '#fff' ||
                    colorValue?.toLowerCase() === '#ffffff' ||
                    colorValue?.toLowerCase() === 'white' ||
                    colorValue?.replace(/\s/g, '').toLowerCase() ===
                      'rgb(255,255,255)';

                  if (isColorOption && colorValue) {
                    buttonStyle = {
                      backgroundColor: colorValue,
                    };
                  }

                  // Base classes for option buttons
                  const baseClassName = `
                    group
                    flex
                    items-center 
                    justify-center
                    ${
                      isColorOption
                        ? 'w-8 h-8 rounded-full' // MODIFIED: Smaller color circles
                        : 'py-3 px-2 rounded-lg' // Padding for text options
                    }
                    overflow-hidden
                    relative
                    transition-all
                    duration-300
                    ${
                      !available
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:scale-105'
                    }
                    ${
                      selected
                        ? isColorOption
                          ? `ring-2 ${isWhiteColor ? 'ring-gray-400' : 'ring-black'} ring-offset-2` // Ring for selected color
                          : 'bg-black text-white' // Style for selected text option
                        : isColorOption
                          ? `ring-1 ${isWhiteColor ? 'ring-gray-300' : 'ring-gray-200'} ring-offset-1` // Default ring for color
                          : 'bg-gray-100 text-black hover:bg-gray-200' // Style for unselected text option
                    }
                  `;

                  // Content of the button (color swatch or text)
                  const buttonContent = (
                    <>
                      {isColorOption && colorValue ? (
                        <>
                          <span className="sr-only">{name}</span>{' '}
                          {/* Accessibility */}
                          {/* Animated selection indicator for colors (e.g., a small dot) */}
                          <AnimatePresence>
                            {selected && (
                              <motion.div
                                className="absolute inset-0 flex items-center justify-center z-10"
                                initial={{opacity: 0, scale: 0.5}}
                                animate={{opacity: 1, scale: 1}}
                                exit={{opacity: 0, scale: 0.5}}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${isWhiteColor ? 'bg-black' : 'bg-white'} shadow-md`}
                                ></div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        // Text content for non-color options
                        <div className="relative z-10">
                          <span
                            className={`text-sm font-medium ${selected ? 'font-semibold' : ''}`}
                          >
                            {name}
                          </span>
                          {/* Underline effect for selected text option */}
                          {selected && !isColorOption && (
                            <motion.div
                              className="absolute -bottom-1 left-0 h-0.5 bg-white w-full" // Use w-full for underline
                              initial={{width: '0%'}}
                              animate={{width: '100%'}}
                              transition={{duration: 0.3, delay: 0.1}}
                            />
                          )}
                        </div>
                      )}

                      {/* "Sold out" diagonal line indicator */}
                      {!available && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-20">
                          <div className="w-[120%] h-0.5 bg-red-500 rotate-45 transform origin-center"></div>
                        </div>
                      )}
                    </>
                  );

                  // If the option links to a different product, use a Link component
                  if (isDifferentProduct) {
                    return (
                      <Link
                        className={baseClassName}
                        key={option.name + name}
                        prefetch="intent"
                        preventScrollReset
                        replace // Replace history entry
                        to={`/products/${handle}?${variantUriQuery}`}
                        style={buttonStyle}
                        aria-label={`${name}${!available ? ' (sold out)' : ''}`}
                        onClick={() => {
                          if (!available) return;
                          // Potentially add visual feedback before navigation if desired
                        }}
                      >
                        {buttonContent}
                      </Link>
                    );
                  }

                  // Otherwise, use a button to update the current product's variant
                  return (
                    <motion.button
                      type="button"
                      className={baseClassName}
                      key={option.name + name}
                      disabled={!exists || !available}
                      onClick={() => {
                        if (!selected && available) {
                          setActiveVariant(name); // Trigger click animation
                          navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                          // Reset animation state after a short delay
                          setTimeout(() => {
                            setActiveVariant(null);
                          }, 800);
                        }
                      }}
                      style={buttonStyle}
                      aria-label={`${name}${!available ? ' (sold out)' : ''}`}
                      whileHover={available ? {scale: 1.05} : {}}
                      whileTap={available ? {scale: 0.95} : {}}
                      animate={{
                        scale: activeVariant === name ? [1, 1.1, 1] : 1, // Pop animation on click
                      }}
                      transition={{
                        duration: 0.4,
                        ease: 'easeInOut',
                      }}
                    >
                      {buttonContent}
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Add to Cart Button Section */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{
          opacity: 1,
          y: 0,
          scale: scaleButton ? 1 : 0.95, // Initial scale animation
        }}
        transition={{
          duration: 0.6,
          delay: 0.5, // Delay to animate after options
          scale: {
            duration: 0.5,
            ease: 'easeOut',
          },
        }}
        className="relative"
      >
        <AddToCartButton
          afterAddToCart={handleAfterAddToCart}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                    // Remove selectedVariant field; attributes are optional
                    attributes: [{key: 'someKey', value: 'someValue'}], // Optional
                  },
                ]
              : []
          }
        >
          {selectedVariant?.availableForSale ? (
            <TextScramble trigger={scrambleText} speed={0.2} duration={0.8}>
              ADD TO CART
            </TextScramble>
          ) : (
            <TextScramble trigger={scrambleText} speed={0.2} duration={0.8}>
              SOLD OUT
            </TextScramble>
          )}
        </AddToCartButton>
      </motion.div>
    </div>
  );
}
