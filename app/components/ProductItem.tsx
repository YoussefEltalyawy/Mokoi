import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {useState} from 'react';
import {motion} from 'framer-motion';
import {TextScramble} from '~/components/ui/text-scramble';

export function ProductItem({
  product,
  loading,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="block group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      <div className="aspect-[3/4] overflow-hidden mb-2 relative">
        <motion.div
          animate={{scale: isHovered ? 1.05 : 1}}
          transition={{duration: 0.5}}
          className="h-full w-full"
        >
          {image && (
            <Image
              alt={image.altText || product.title}
              aspectRatio="3/4"
              data={image}
              loading={loading}
              sizes="(min-width:1024px)25vw,(min-width:768px)33vw,80vw"
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 flex items-end justify-center pb-6"
          initial={{opacity: 0}}
          animate={{opacity: isHovered ? 1 : 0}}
          transition={{duration: 0.3}}
        >
          <motion.div
            className="px-4 py-2 border border-white text-white rounded-sm"
            initial={{y: 20, opacity: 0}}
            animate={{
              y: isHovered ? 0 : 20,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{duration: 0.3, delay: 0.1}}
          >
            {isHovered && (
              <TextScramble
                trigger={isHovered}
                speed={0.2}
                duration={0.8}
              >
                SHOP NOW
              </TextScramble>
            )}
          </motion.div>
        </motion.div>
      </div>
      <div className="mt-1 relative">
        <div className="flex flex-col">
          <h3 className="text-sm font-medium uppercase">{product.title}</h3>
          <div className="text-sm mt-1 text-black font-medium">
            <Money data={product.priceRange.minVariantPrice} />
          </div>
        </div>
        <motion.div
          className="absolute -bottom-1 left-0 h-0.5 bg-black w-0 origin-left"
          initial={{width: 0}}
          whileHover={{width: '100%'}}
          transition={{duration: 0.3}}
        />
      </div>
      <Link
        to={variantUrl}
        className="absolute inset-0 z-10"
        aria-label={`View ${product.title} product`}
        prefetch="intent"
      />
    </div>
  );
}
