import type {ActionFunctionArgs} from '@shopify/remix-oxygen';
import {data} from '@shopify/remix-oxygen';
import {sendFacebookCapiEvent} from '~/lib/facebook/capi.server';
import type {FacebookEventRelayPayload} from '~/lib/facebook/types';

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('Cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function getClientIp(request: Request): string | null {
  return (
    request.headers.get('oxygen-buyer-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip') ||
    null
  );
}

export async function action({request, context}: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const {env} = context;
  const pixelId = env.PUBLIC_FACEBOOK_PIXEL_ID || env.FB_PIXEL_ID;
  const accessToken = env.FACEBOOK_CAPI_ACCESS_TOKEN;

  // Fail quietly — analytics should never break the storefront.
  if (!pixelId || !accessToken) {
    return data({skipped: true}, {status: 200});
  }

  let payload: FacebookEventRelayPayload;
  try {
    payload = (await request.json()) as FacebookEventRelayPayload;
  } catch {
    return data({error: 'Invalid JSON'}, {status: 400});
  }

  if (!payload?.eventName || !payload?.eventId || !payload?.eventSourceUrl) {
    return data({error: 'Missing required fields'}, {status: 400});
  }

  const fbp = getCookie(request, '_fbp');
  const fbc = getCookie(request, '_fbc');

  const result = await sendFacebookCapiEvent({
    pixelId,
    accessToken,
    eventName: payload.eventName,
    eventId: payload.eventId,
    eventSourceUrl: payload.eventSourceUrl,
    testEventCode: env.FACEBOOK_TEST_EVENT_CODE || undefined,
    userData: {
      ...payload.userData,
      fbp: payload.userData?.fbp ?? fbp,
      fbc: payload.userData?.fbc ?? fbc,
      clientIpAddress: getClientIp(request),
      clientUserAgent: request.headers.get('user-agent'),
    },
    customData: payload.customData,
  });

  return data(result, {status: result.ok ? 200 : 502});
}
