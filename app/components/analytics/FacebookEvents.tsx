import {useEffect, useRef} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import {shouldSendFacebookEvent, trackFacebookEvent} from '~/lib/facebook/client';

const facebookEventsInitState = globalThis as typeof globalThis & {
  __mokoiFacebookEventsInitialized?: boolean;
};

/**
 * Bridges Hydrogen's built-in Analytics.subscribe events to Meta
 * ViewContent / Search / AddToCart / InitiateCheckout events.
 * Mount once, inside <Analytics.Provider> (e.g. in root.tsx's <Layout>),
 * alongside <FacebookPixel />.
 */
export function FacebookEvents({pixelId}: {pixelId?: string}) {
  const {subscribe, canTrack, shop} = useAnalytics();
  const hasSubscribed = useRef(false);
  const canTrackRef = useRef(canTrack);
  canTrackRef.current = canTrack;
  const currencyRef = useRef(shop?.currency);
  currencyRef.current = shop?.currency;

  useEffect(() => {
    if (!pixelId || hasSubscribed.current || facebookEventsInitState.__mokoiFacebookEventsInitialized) return;
    hasSubscribed.current = true;
    facebookEventsInitState.__mokoiFacebookEventsInitialized = true;

    subscribe('product_viewed', (payload) => {
      if (!canTrackRef.current()) return;
      const products = payload.products ?? [];
      const productIds = products.map((p) => p.id).join('|');
      const viewContentKey = `${window.location.pathname}${window.location.search}:${productIds}`;
      if (!shouldSendFacebookEvent('ViewContent', viewContentKey)) return;

      const value = products.reduce(
        (sum, p) => sum + Number(p.price || 0) * (p.quantity || 1),
        0,
      );
      trackFacebookEvent('ViewContent', {
        customData: {
          currency: currencyRef.current,
          value,
          content_ids: products.map((p) => p.id),
          content_type: 'product',
          contents: products.map((p) => ({
            id: p.id,
            quantity: p.quantity || 1,
            item_price: Number(p.price || 0),
          })),
        },
      });
    });

    subscribe('search_viewed', (payload) => {
      if (!canTrackRef.current()) return;
      trackFacebookEvent('Search', {
        customData: {
          search_string: payload.searchTerm,
        },
      });
    });

    subscribe('product_added_to_cart', (payload) => {
      if (!canTrackRef.current()) return;
      const line = payload.currentLine;
      if (!line) return;
      const price = Number(line.cost?.totalAmount?.amount || 0);
      const productId =
        (line.merchandise as {product?: {id?: string}})?.product?.id ||
        line.merchandise?.id;
      trackFacebookEvent('AddToCart', {
        customData: {
          currency: line.cost?.totalAmount?.currencyCode || currencyRef.current,
          value: price,
          content_ids: productId ? [productId] : [],
          content_type: 'product',
          contents: productId
            ? [{id: productId, quantity: line.quantity || 1, item_price: price}]
            : [],
        },
      });
    });

    // Custom event published from CartSummary.tsx when the shopper clicks
    // "Checkout" (checkout itself happens off-app on Shopify's domain).
    subscribe('custom_checkout_started', (payload) => {
      if (!canTrackRef.current()) return;
      const cart = (payload as {cart?: any}).cart;
      const lines = cart?.lines?.nodes ?? [];
      const contentIds = lines
        .map((l: any) => l.merchandise?.product?.id || l.merchandise?.id || null)
        .filter(Boolean);
      trackFacebookEvent('InitiateCheckout', {
        customData: {
          currency: cart?.cost?.totalAmount?.currencyCode || currencyRef.current,
          value: Number(cart?.cost?.totalAmount?.amount || 0),
          num_items: lines.length,
          content_ids: contentIds,
          content_type: 'product',
        },
      });
    });
  }, [pixelId, subscribe]);

  return null;
}
