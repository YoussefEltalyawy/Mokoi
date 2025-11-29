import { type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { Await, useLoaderData, Link, type MetaFunction } from '@remix-run/react';
import { Suspense } from 'react';
import { Image, Money } from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import { ProductItem } from '~/components/ProductItem';
import { HeroSection } from '~/components/HeroSection';
import {
  FeaturedCollections,
  type CollectionWithProductsFragment,
} from '~/components/FeaturedCollections';
import { CollectionsShowcase } from '~/components/CollectionsShowcase';

export const meta: MetaFunction = () => {
  return [{ title: 'MOKOI | Home' }];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return { ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({ context }: LoaderFunctionArgs) {
  const [featuredCollectionsResponse, homeMetaobjectResponse] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    context.storefront.query(HOME_METAOBJECT_QUERY, {
      variables: { handle: 'in-mokoi-we-trust' },
    }).catch((error) => {
      console.error(error);
      return null;
    }),
  ]);

  const featuredCollection = featuredCollectionsResponse.collections.nodes[0];

  // Extract metaobject fields safely
  const metaobjectNode = (homeMetaobjectResponse as any)?.metaobject ?? null;
  // Debug log removed per user request
  const fieldsArray: Array<{
    key: string;
    type: string;
    value: string | null;
    reference?: any;
  }> = metaobjectNode?.fields ?? [];

  const fieldMap = new Map<string, any>();
  for (const f of fieldsArray) {
    fieldMap.set(f.key, f);
  }

  const heroVideoField = fieldMap.get('hero_video');
  const heroTextField = fieldMap.get('hero_text');
  const shopNowCollectionField = fieldMap.get('shop_now_collection');
  const bestSellersTextField = fieldMap.get('best_sellers_text');
  const shopByCollectionMarqueeField = fieldMap.get('shop_by_collection_marquee');

  // Normalize hero media (video or image)
  let heroMedia: null | {
    kind: 'video' | 'image';
    video?: { url: string | null; previewImageUrl?: string | null };
    image?: { url: string | null; altText?: string | null; width?: number | null; height?: number | null };
  } = null;

  if (heroVideoField?.reference) {
    const ref = heroVideoField.reference;
    if (ref.__typename === 'Video') {
      const sources = ref.sources ?? [];
      const mp4Source = sources.find((s: any) => s.mimeType === 'video/mp4');
      const selectedSource = mp4Source ?? sources[0] ?? null;

      if (selectedSource) {
        console.log('Selected hero video source:', selectedSource.url, 'Mime:', selectedSource.mimeType);
      } else {
        console.warn('No suitable hero video source found');
      }

      heroMedia = {
        kind: 'video',
        video: {
          url: selectedSource?.url ?? null,
          previewImageUrl: ref.previewImage?.url ?? null,
        },
      };
    } else if (ref.__typename === 'MediaImage' || ref.__typename === 'Image') {
      heroMedia = {
        kind: 'image',
        image: {
          url: ref.image?.url ?? ref.url ?? null,
          altText: ref.image?.altText ?? ref.altText ?? null,
          width: ref.image?.width ?? ref.width ?? null,
          height: ref.image?.height ?? ref.height ?? null,
        },
      };
    }
  }

  // Normalize collection handle from reference
  let shopNowCollectionHandle: string | null = null;
  if (shopNowCollectionField?.reference && shopNowCollectionField.reference.__typename === 'Collection') {
    shopNowCollectionHandle = shopNowCollectionField.reference.handle ?? null;
  } else if (typeof shopNowCollectionField?.value === 'string') {
    // Fallback if field is a plain string handle
    shopNowCollectionHandle = shopNowCollectionField.value;
  }

  const homeContent = {
    heroMedia,
    heroText: typeof heroTextField?.value === 'string' ? heroTextField.value : null,
    shopNowCollectionHandle,
    bestSellersText:
      typeof bestSellersTextField?.value === 'string' ? bestSellersTextField.value : 'BEST SELLERS',
    shopByCollectionMarquee:
      typeof shopByCollectionMarqueeField?.value === 'string'
        ? shopByCollectionMarqueeField.value
        : 'SHOP BY COLLECTION',
  };

  return {
    featuredCollection,
    homeContent,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const BEST_SELLERS_QUERY = `#graphql
  fragment BestSellerCollection on Collection {
    id
    title
    handle
    products(first: 8, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        handle
        featuredImage {
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
  query BestSellersCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, query: "title:Best Sellers") {
      nodes {
        ...BestSellerCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;

const NEW_ARRIVALS_QUERY = `#graphql
  fragment NewArrivalsProduct on Product {
    id
    title
    handle
    createdAt
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query NewArrivalsProducts($country: CountryCode, $language: LanguageCode, $first: Int = 4)
    @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...NewArrivalsProduct
      }
    }
  }
` as const;

const MENU_COLLECTIONS_QUERY = `#graphql
  fragment CollectionForMenu on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
    updatedAt
  }
  query MenuCollections(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    menu(handle: $handle) {
      items {
        id
        resource {
          ... on Collection {
            ...CollectionForMenu
          }
        }
      }
    }
  }
` as const;

const HOME_METAOBJECT_QUERY = `#graphql
  query HomeMetaobject($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    metaobject(handle: {type: "home_page", handle: $handle}) {
      id
      handle
      fields {
        key
        type
        value
        reference {
          __typename
          ... on Collection {
            id
            handle
            title
          }
          ... on Video {
            id
            previewImage { url }
            sources { url mimeType }
          }
          ... on MediaImage {
            id
            image { url altText width height }
          }
        }
      }
    }
  }
` as const;

// Define a type for the collection with image and updatedAt
type CollectionWithImage = {
  id: string;
  title: string;
  handle: string;
  image?: {
    id: string;
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
  updatedAt: string;
};

function loadDeferredData({ context }: LoaderFunctionArgs) {
  // Fetch best sellers collection with products
  const bestSellersCollection = context.storefront
    .query(BEST_SELLERS_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });

  // Keep the recommended products query for fallback
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });

  // Fetch new arrivals (recently created products)
  const newArrivalsProducts = context.storefront
    .query(NEW_ARRIVALS_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });

  // Fetch collections from the home screen menu by handle
  const menuCollections = context.storefront
    .query(MENU_COLLECTIONS_QUERY, {
      variables: { handle: 'home-screen-shop-by-collection' },
    })
    .then((response) => {
      const items = response?.menu?.items ?? [];
      const collections = items
        .map((item: any) => item?.resource)
        .filter((resource: any) => Boolean(resource && resource.image?.url));

      return {
        collections: {
          nodes: collections,
        },
      };
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    bestSellersCollection,
    recommendedProducts,
    newArrivalsProducts,
    menuCollections,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      {/* Hero Section */}
      <HeroSection
        heroMedia={data.homeContent?.heroMedia}
        heroText={data.homeContent?.heroText ?? undefined}
        shopNowCollectionHandle={data.homeContent?.shopNowCollectionHandle ?? undefined}
      />

      {/* Best Sellers Collection */}
      <Suspense
        fallback={
          <div className="my-16 px-4 text-center">Loading best sellers...</div>
        }
      >
        <Await resolve={data.bestSellersCollection}>
          {(response: any) => {
            return (
              <FeaturedCollections
                collections={response.collections.nodes as any}
                isBestSellers={true}
                marqueeText={data.homeContent?.bestSellersText}
              />
            );
          }}
        </Await>
      </Suspense>

      {/* Collections Showcase - 50/50 split section */}
      <Suspense
        fallback={
          <div className="my-8 text-center">
            Loading collections showcase...
          </div>
        }
      >
        <Await resolve={data.menuCollections}>
          {(response: any) => {
            if (!response?.collections?.nodes?.length) {
              return null;
            }

            return (
              <div className="w-full overflow-hidden">
                <CollectionsShowcase
                  collections={response.collections.nodes}
                  marqueeText={data.homeContent?.shopByCollectionMarquee}
                />
              </div>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}
