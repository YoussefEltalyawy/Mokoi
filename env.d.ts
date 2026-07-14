/// <reference types="vite/client" />
/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@shopify/oxygen-workers-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

import type {
  HydrogenContext,
  HydrogenSessionData,
  HydrogenEnv,
} from '@shopify/hydrogen';
import type {createAppLoadContext} from '~/lib/context';

declare global {
  /**
   * A global `process` object is only available during build to access NODE_ENV.
   */
  const process: {env: {NODE_ENV: 'production' | 'development'}};

  interface Env extends HydrogenEnv {
    // declare additional Env parameter use in the fetch handler and Remix loader context here

    /** Public Meta Pixel ID, safe to expose to the browser. */
    PUBLIC_FACEBOOK_PIXEL_ID?: string;
    /** Legacy local env fallback used by this project. */
    FB_PIXEL_ID?: string;
    /** Server-only Conversions API access token. Never expose to the client. */
    FACEBOOK_CAPI_ACCESS_TOKEN: string;
    /** Optional: Meta Events Manager "Test Events" code, for verifying delivery while testing. */
    FACEBOOK_TEST_EVENT_CODE?: string;
    /** Secret used to verify the `orders/paid` webhook HMAC signature for server-side Purchase events. */
    SHOPIFY_WEBHOOK_SECRET?: string;
  }
}

declare module '@shopify/remix-oxygen' {
  interface AppLoadContext
    extends Awaited<ReturnType<typeof createAppLoadContext>> {
    // to change context type, change the return of createAppLoadContext() instead
  }

  interface SessionData extends HydrogenSessionData {
    // declare local additions to the Remix session data here
  }
}
