import type {
  FacebookCustomData,
  FacebookStandardEvent,
  FacebookUserData,
} from '~/lib/facebook/types';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type FacebookDedupeState = {
  lastSentAt: number;
};

const dedupeState = globalThis as typeof globalThis & {
  __mokoiFacebookDedupeState?: Record<string, FacebookDedupeState>;
};

function getDedupeKey(eventName: string, key: string) {
  return `${eventName}:${key}`;
}

export function shouldSendFacebookEvent(eventName: string, key: string, ttlMs = 3000) {
  if (typeof window === 'undefined') return false;

  const dedupeKey = getDedupeKey(eventName, key);
  const now = Date.now();

  if (!dedupeState.__mokoiFacebookDedupeState) {
    dedupeState.__mokoiFacebookDedupeState = {};
  }

  const current = dedupeState.__mokoiFacebookDedupeState[dedupeKey];
  if (current && now - current.lastSentAt < ttlMs) {
    return false;
  }

  dedupeState.__mokoiFacebookDedupeState[dedupeKey] = {lastSentAt: now};
  return true;
}

function generateEventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Fires a Meta Pixel browser event and the matching Conversions API event
 * with the same `event_id`, so Meta dedupes them into a single event.
 * Safe to call even if the pixel hasn't loaded or tracking is disabled
 * (the caller is expected to check `canTrack()` first).
 */
export function trackFacebookEvent(
  eventName: FacebookStandardEvent,
  options?: {
    customData?: FacebookCustomData;
    userData?: FacebookUserData;
  },
) {
  if (typeof window === 'undefined') return;

  const eventId = generateEventId();
  const eventSourceUrl = window.location.href;

  if (typeof window.fbq === 'function') {
    window.fbq('track', eventName, options?.customData ?? {}, {
      eventID: eventId,
    });
  }

  // keepalive ensures this still fires if the user is mid-navigation
  // (e.g. clicking through to Shopify checkout for InitiateCheckout).
  fetch('/api/fb-events', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    keepalive: true,
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl,
      userData: options?.userData,
      customData: options?.customData,
    }),
  }).catch(() => {
    // Analytics relay failures should never surface to the shopper.
  });
}
