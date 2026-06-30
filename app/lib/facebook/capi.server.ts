// Server-only. Never import this from a client component — it uses the
// Conversions API access token, which must stay on the server.
import type {
  FacebookCustomData,
  FacebookStandardEvent,
  FacebookUserData,
} from '~/lib/facebook/types';

const GRAPH_API_VERSION = 'v23.0';

async function sha256Hex(value: string): Promise<string> {
  const normalized = value.trim().toLowerCase();
  const data = new TextEncoder().encode(normalized);
  // Web Crypto is available in the Oxygen worker runtime.
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function buildHashedUserData(userData?: FacebookUserData) {
  if (!userData) return {};

  const [em, ph, fn, ln, ct, st, zp, country, externalId] = await Promise.all(
    [
      userData.email ? sha256Hex(userData.email) : undefined,
      userData.phone ? sha256Hex(userData.phone.replace(/[^\d]/g, '')) : undefined,
      userData.firstName ? sha256Hex(userData.firstName) : undefined,
      userData.lastName ? sha256Hex(userData.lastName) : undefined,
      userData.city ? sha256Hex(userData.city.replace(/\s/g, '')) : undefined,
      userData.state ? sha256Hex(userData.state.replace(/\s/g, '')) : undefined,
      userData.zip ? sha256Hex(userData.zip.replace(/\s/g, '')) : undefined,
      userData.country ? sha256Hex(userData.country) : undefined,
      userData.externalId ? sha256Hex(userData.externalId) : undefined,
    ],
  );

  return {
    ...(em && {em: [em]}),
    ...(ph && {ph: [ph]}),
    ...(fn && {fn: [fn]}),
    ...(ln && {ln: [ln]}),
    ...(ct && {ct: [ct]}),
    ...(st && {st: [st]}),
    ...(zp && {zp: [zp]}),
    ...(country && {country: [country]}),
    ...(externalId && {external_id: [externalId]}),
    // These three are sent unhashed per Meta's spec.
    ...(userData.fbp && {fbp: userData.fbp}),
    ...(userData.fbc && {fbc: userData.fbc}),
    ...(userData.clientIpAddress && {
      client_ip_address: userData.clientIpAddress,
    }),
    ...(userData.clientUserAgent && {
      client_user_agent: userData.clientUserAgent,
    }),
  };
}

export type SendFacebookCapiEventArgs = {
  pixelId: string;
  accessToken: string;
  eventName: FacebookStandardEvent;
  eventId: string;
  eventSourceUrl: string;
  actionSource?: 'website' | 'system_generated';
  userData?: FacebookUserData;
  customData?: FacebookCustomData;
  testEventCode?: string;
};

export async function sendFacebookCapiEvent({
  pixelId,
  accessToken,
  eventName,
  eventId,
  eventSourceUrl,
  actionSource = 'website',
  userData,
  customData,
  testEventCode,
}: SendFacebookCapiEventArgs) {
  const hashedUserData = await buildHashedUserData(userData);

  const body = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: actionSource,
        user_data: hashedUserData,
        ...(customData && {custom_data: customData}),
      },
    ],
    ...(testEventCode && {test_event_code: testEventCode}),
  };

  const endpoint = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${accessToken}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error(
      `[facebook-capi] ${eventName} failed (${response.status}): ${errorText}`,
    );
    return {ok: false as const, status: response.status};
  }

  return {ok: true as const, status: response.status};
}
