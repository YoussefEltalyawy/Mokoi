import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({request, context}: LoaderFunctionArgs) {
  const checkoutDomain = context.env.PUBLIC_CHECKOUT_DOMAIN;

  if (!checkoutDomain) {
    throw new Response('Checkout domain not configured', {status: 500});
  }

  const url = new URL(request.url);
  url.hostname = checkoutDomain;
  url.protocol = 'https:';
  url.port = ''; // Clear local port (e.g., 3000) if running in dev mode

  return redirect(url.toString(), 302);
}

export default function CheckoutFallback() {
  return null;
}
