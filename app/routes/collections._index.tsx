import {useLoaderData, Link} from '@remix-run/react';
import {type LoaderFunctionArgs, type MetaFunction} from '@shopify/remix-oxygen';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {TextScramble} from '~/components/ui/text-scramble';
import {useState, useEffect, useRef} from 'react';
import {motion} from 'framer-motion';

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
async function loadCriticalData({context, request}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {collections};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export const meta: MetaFunction = () => {
  return [{title: `MOKOI | Collections`}];
};

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();
  const [triggerScramble, setTriggerScramble] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTriggerScramble(true);
          observer.disconnect();
        }
      },
      {threshold: 0.1}
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="collections w-full py-8 px-4 md:px-8 lg:px-12">
      <motion.div 
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.6}}
        className="mb-8 text-center"
      >
        <h1 
          ref={titleRef} 
          className="text-3xl md:text-5xl font-semibold mb-4"
        >
          <TextScramble trigger={triggerScramble}>
            Collections
          </TextScramble>
        </h1>
        <div className="w-24 h-1 bg-black mx-auto my-4"></div>
        <p className="text-black/70 max-w-2xl mx-auto">
          Browse our curated collections of premium products
        </p>
      </motion.div>
      
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 md:p-8">
        <PaginatedResourceSection
          connection={collections}
          resourcesClassName="collections-grid gap-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {({node: collection, index}) => (
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.4, delay: index * 0.1}}
              key={collection.id}
            >
              <CollectionItem
                key={collection.id}
                collection={collection}
                index={index}
              />
            </motion.div>
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

function CollectionItem({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  return (
    <Link
      className="collection-item group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg"
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      <div className="relative aspect-square overflow-hidden">
        {collection?.image && (
          <Image
            alt={collection.image.altText || collection.title}
            aspectRatio="1/1"
            data={collection.image}
            loading={index < 3 ? 'eager' : undefined}
            sizes="(min-width: 45em) 400px, 100vw"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70 transition-opacity group-hover:opacity-90"></div>
      </div>
      <div className="absolute bottom-0 left-0 w-full p-4 text-white">
        <h5 className="text-xl font-semibold">{collection.title}</h5>
        <div className="mt-2 h-0.5 w-12 bg-white/70 transition-all duration-300 group-hover:w-20"></div>
      </div>
    </Link>
  );

}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
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
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
