import {type FetcherWithComponents} from '@remix-run/react';
import {
  CartForm,
  type OptimisticCartLineInput,
  useAnalytics,
} from '@shopify/hydrogen';
import {time} from 'framer-motion';
import {Check, Loader2} from 'lucide-react';
import {useEffect, useState, useRef} from 'react';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  afterAddToCart,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  afterAddToCart?: () => void;
}) {
  const [addedToCart, setAddedToCart] = useState<boolean>(false);
  const {publish, shop} = useAnalytics();

  // Track fetcher state changes
  const [fetcherState, setFetcherState] = useState<string>('idle');
  const [fetcherData, setFetcherData] = useState<any>(null);
  const [fetcherError, setFetcherError] = useState<boolean>(false);

  // Handle cart add success
  const handleCartAddSuccess = () => {
    setAddedToCart(true);

    // Publish analytics event for product added to cart
    if (analytics) {
      publish('custom_product_added', {
        products: Array.isArray(analytics) ? analytics : [analytics],
        shop,
        url: window.location.href || '',
      });
    }

    if (afterAddToCart) {
      afterAddToCart();
    }
  };

  // Effect for automatic timeout to reset addedToCart
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (addedToCart) {
      timeout = setTimeout(() => {
        setAddedToCart(false);
      }, 2500);
    }
    return () => clearTimeout(timeout);
  }, [addedToCart]);

  // Effect to handle fetcher state changes
  useEffect(() => {
    if (fetcherState === 'idle' && fetcherData && !fetcherError) {
      handleCartAddSuccess();
    }
  }, [fetcherState, fetcherData, fetcherError]);

  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => {
        const isLoading = fetcher.state !== 'idle';

        // Update fetcher state for the effect to work with
        if (fetcherState !== fetcher.state) {
          setFetcherState(fetcher.state);
        }
        if (fetcherData !== fetcher.data) {
          setFetcherData(fetcher.data);
          setFetcherError(!!fetcher.data?.error);
        }

        return (
          <div className="relative">
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <button
              type="submit"
              onClick={onClick}
              disabled={disabled ?? isLoading}
              className={`w-full py-5 px-8 rounded-md text-white text-base tracking-wider uppercase transition-all duration-300 ease-in-out flex items-center justify-center text-center relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-white/10 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 disabled:before:hidden bg-black hover:bg-black/70 
                disabled:bg-black/30 disabled:text-black disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Adding To Cart</span>
                </>
              ) : addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Added To Cart!</span>
                </>
              ) : (
                <>
                  <span className="font-medium">{children}</span>
                </>
              )}
            </button>
          </div>
        );
      }}
    </CartForm>
  );
}
