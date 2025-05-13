import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, type MetaFunction} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  type MappedProductOptions,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import ProductImage from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {Suspense} from 'react';
import type {
  ProductFragment,
  ProductVariantFragment,
} from 'storefrontapi.generated';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `MOKOI | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return defer({...deferredData, ...criticalData});
}

async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {product};
}

function loadDeferredData({context, params}: LoaderFunctionArgs) {
  return {};
}

export default function Product() {
  const {product} = useLoaderData<{product: ProductFragment}>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  ) as ProductVariantFragment;

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions: MappedProductOptions[] = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  // Find the color option (case-insensitive)
  const colorOption = product.options.find(
    (option) => option.name.toLowerCase() === 'color',
  );

  // Create a map from color to image using firstSelectableVariant
  const colorToImage = colorOption
    ? new Map<string, ProductVariantFragment['image']>(
        colorOption.optionValues.map((value) => [
          value.name,
          value.firstSelectableVariant?.image || null,
        ]),
      )
    : new Map<string, ProductVariantFragment['image']>();

  // Get the selected color from the variant's options
  const selectedColor = selectedVariant.selectedOptions.find(
    (option) => option.name.toLowerCase() === 'color',
  )?.value;

  // Select the image for the current color, fallback to selectedVariant.image
  const selectedColorImage: ProductVariantFragment['image'] = selectedColor
    ? colorToImage.get(selectedColor) || selectedVariant.image || null
    : selectedVariant.image || null;

  return (
    <div key={product.id} className="py-16 font-poppins">
      <div className="mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-16">
          {/* Left Side - Image */}
          <div className="space-y-8">
            <ProductImage
              images={product.images.nodes.map((node) => ({
                id: node.id,
                url: node.url,
                altText: node.altText,
                width: node.width,
                height: node.height,
              }))}
              selectedVariantImage={selectedColorImage}
            />
          </div>

          {/* Right Side - Details */}
          <div className="space-y-10">
            <div className="space-y-4 pb-0">
              <h1 className="text-2xl font-semibold md:text-4xl lg:text-5xl text-black/90">
                {product.title}
              </h1>
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant.compareAtPrice}
                className="text-black/80"
              />
            </div>

            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />

            <div className="font-poppins text-black/90 max-w-none">
              <div
                dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
