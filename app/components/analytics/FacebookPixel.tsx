import {useEffect, useRef} from 'react';
import {useAnalytics, useNonce} from '@shopify/hydrogen';
import {shouldSendFacebookEvent, trackFacebookEvent} from '~/lib/facebook/client';

const facebookPixelInitState = globalThis as typeof globalThis & {
  __mokoiFacebookPixelInitialized?: boolean;
};

/**
 * Injects the Meta Pixel base script and fires PageView on the initial
 * load and every client-side navigation. Mount once, inside
 * <Analytics.Provider>, e.g. in root.tsx's <Layout>.
 */
export function FacebookPixel({pixelId}: {pixelId?: string}) {
  const {subscribe, canTrack} = useAnalytics();
  const nonce = useNonce();
  const hasSubscribed = useRef(false);
  const canTrackRef = useRef(canTrack);
  canTrackRef.current = canTrack;

  useEffect(() => {
    if (!pixelId || hasSubscribed.current || facebookPixelInitState.__mokoiFacebookPixelInitialized) return;
    hasSubscribed.current = true;
    facebookPixelInitState.__mokoiFacebookPixelInitialized = true;

    subscribe('page_viewed', () => {
      if (!canTrackRef.current()) return;

      const pageKey = `${window.location.pathname}${window.location.search}`;
      if (!shouldSendFacebookEvent('PageView', pageKey)) return;

      trackFacebookEvent('PageView');
    });
  }, [pixelId, subscribe]);

  if (!pixelId) return null;

  return (
    <>
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{display: 'none'}}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
