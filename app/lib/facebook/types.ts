// Shared types for Meta Pixel + Conversions API integration.

export type FacebookStandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase';

export type FacebookContentItem = {
  id: string;
  quantity: number;
  item_price?: number;
};

/** Raw (unhashed) user data we may have available on client or server.
 *  Hashing happens server-side in capi.server.ts before it ever leaves
 *  for Meta — never send raw PII to Meta directly. */
export type FacebookUserData = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  externalId?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
};

export type FacebookCustomData = {
  currency?: string;
  value?: number;
  content_ids?: string[];
  content_type?: 'product' | 'product_group';
  contents?: FacebookContentItem[];
  num_items?: number;
  search_string?: string;
  order_id?: string;
};

/** Body shape posted from the browser to our /api/fb-events relay route. */
export type FacebookEventRelayPayload = {
  eventName: FacebookStandardEvent;
  eventId: string;
  eventSourceUrl: string;
  userData?: FacebookUserData;
  customData?: FacebookCustomData;
};
