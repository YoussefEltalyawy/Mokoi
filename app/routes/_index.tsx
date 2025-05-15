import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {HeroSection} from '~/components/HeroSection';
import {
  FeaturedCollections,
  type CollectionWithProductsFragment,
} from '~/components/FeaturedCollections';
import {CollectionsShowcase} from '~/components/CollectionsShowcase';

export const meta: MetaFunction = () => {
  return [{title: 'MOKOI | Home'}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
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

const COLLECTIONS_WITH_IMAGES_QUERY = `#graphql
  fragment CollectionWithImage on Collection {
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
  query CollectionsWithImages($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 30, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...CollectionWithImage
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

function loadDeferredData({context}: LoaderFunctionArgs) {
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

  // Fetch collections with images for the secondary showcase
  const collectionsWithImages = context.storefront
    .query(COLLECTIONS_WITH_IMAGES_QUERY)
    .then((response) => {
      // Filter to only include collections with images and sort by updatedAt
      if (response?.collections?.nodes) {
        const filtered = response.collections.nodes
          .filter((collection) => collection.image?.url)
          .sort((a, b) => {
            // Sort by updatedAt, newest first
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          });

        return {
          collections: {
            nodes: filtered,
          },
        };
      }
      return response;
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    bestSellersCollection,
    recommendedProducts,
    newArrivalsProducts,
    collectionsWithImages,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      {/* Hero Section */}
      <HeroSection />

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
        <Await resolve={data.collectionsWithImages}>
          {(response: any) => {
            if (!response?.collections?.nodes?.length) {
              return null;
            }

            return (
              <div className="w-full overflow-hidden">
                <CollectionsShowcase collections={response.collections.nodes} />
              </div>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}
