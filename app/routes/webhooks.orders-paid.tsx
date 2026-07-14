import type {ActionFunctionArgs} from '@shopify/remix-oxygen';
import {data} from '@shopify/remix-oxygen';
import {sendFacebookCapiEvent} from '~/lib/facebook/capi.server';

/**
 * Shopify Admin > Settings > Notifications > Webhooks, or via the
 * Admin GraphQL `webhookSubscriptionCreate` mutation:
 *   topic: ORDERS_PAID
 *   url:   https://<your-domain>/webhooks/orders-paid
 *   format: JSON
 *
 * The signing secret shown when you create the webhook goes in
 * SHOPIFY_WEBHOOK_SECRET. Checkout happens on Shopify's checkout domain,
 * outside this Hydrogen app, so this webhook is the only reliable place
 * to fire a server-side Purchase event.
 */

async function verifyShopifyHmac(
  rawBody: string,
  hmacHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!hmacHeader) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(rawBody),
  );
  const computedBase64 = btoa(
    String.fromCharCode(...new Uint8Array(signature)),
  );

  // Constant-time-ish comparison.
  if (computedBase64.length !== hmacHeader.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computedBase64.length; i++) {
    mismatch |= computedBase64.charCodeAt(i) ^ hmacHeader.charCodeAt(i);
  }
  return mismatch === 0;
}

type ShopifyOrderLineItem = {
  product_id?: number | string;
  variant_id?: number | string;
  quantity?: number;
  price?: string;
};

type ShopifyOrderWebhookPayload = {
  id: number | string;
  email?: string;
  currency?: string;
  current_total_price?: string;
  total_price?: string;
  customer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  billing_address?: {
    phone?: string;
    city?: string;
    province_code?: string;
    zip?: string;
    country_code?: string;
  };
  line_items?: ShopifyOrderLineItem[];
};

export async function action({request, context}: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const {env} = context;
  const webhookSecret = env.SHOPIFY_WEBHOOK_SECRET;
  const pixelId = env.PUBLIC_FACEBOOK_PIXEL_ID || env.FB_PIXEL_ID;
  const accessToken = env.FACEBOOK_CAPI_ACCESS_TOKEN;

  if (!webhookSecret || !pixelId || !accessToken) {
    console.error(
      '[webhooks.orders-paid] Missing SHOPIFY_WEBHOOK_SECRET, PUBLIC_FACEBOOK_PIXEL_ID, or FACEBOOK_CAPI_ACCESS_TOKEN',
    );
    return data({error: 'Not configured'}, {status: 500});
  }

  const rawBody = await request.text();
  const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256');

  const isValid = await verifyShopifyHmac(rawBody, hmacHeader, webhookSecret);
  if (!isValid) {
    return data({error: 'Invalid signature'}, {status: 401});
  }

  let order: ShopifyOrderWebhookPayload;
  try {
    order = JSON.parse(rawBody) as ShopifyOrderWebhookPayload;
  } catch {
    return data({error: 'Invalid JSON'}, {status: 400});
  }

  const lineItems = order.line_items ?? [];
  const value = Number(order.current_total_price ?? order.total_price ?? 0);
  const currency = order.currency;
  const email = order.email || order.customer?.email;
  const phone = order.customer?.phone || order.billing_address?.phone;

  const result = await sendFacebookCapiEvent({
    pixelId,
    accessToken,
    eventName: 'Purchase',
    eventId: `purchase_${order.id}`,
    eventSourceUrl: `https://${context.env.PUBLIC_STORE_DOMAIN}`,
    actionSource: 'website',
    testEventCode: env.FACEBOOK_TEST_EVENT_CODE || undefined,
    userData: {
      email,
      phone,
      firstName: order.customer?.first_name,
      lastName: order.customer?.last_name,
      city: order.billing_address?.city,
      state: order.billing_address?.province_code,
      zip: order.billing_address?.zip,
      country: order.billing_address?.country_code,
      externalId: order.customer ? String(order.id) : undefined,
    },
    customData: {
      currency,
      value,
      order_id: String(order.id),
      num_items: lineItems.length,
      content_type: 'product',
      content_ids: lineItems.map((li) => String(li.product_id ?? li.variant_id)),
      contents: lineItems.map((li) => ({
        id: String(li.product_id ?? li.variant_id),
        quantity: li.quantity ?? 1,
        item_price: Number(li.price ?? 0),
      })),
    },
  });

  return data(result, {status: result.ok ? 200 : 502});
}
