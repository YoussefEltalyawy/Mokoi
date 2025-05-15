'use client';

import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import {useState, useRef, useEffect} from 'react';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import {TextScramble} from '~/components/ui/text-scramble';
import {motion, AnimatePresence} from 'framer-motion';

type Product = {
  id: string;
  title: string;
  handle: string;
  featuredImage: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: CurrencyCode;
    };
  };
};

export type CollectionWithProductsFragment = {
  id: string;
  title: string;
  handle: string;
  products: {
    nodes: Product[];
  };
};

export function FeaturedCollections({
  collections,
  isBestSellers = false,
}: {
  collections: CollectionWithProductsFragment[];
  isBestSellers?: boolean;
}) {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection observer for section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {threshold: 0.1},
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!collections?.length) return null;

  // Use the first collection (Best Sellers)
  const collection = collections[0];

  if (!collection?.products?.nodes?.length) return null;

  return (
    <motion.div
      className="mt-8 px-4 md:px-8"
      ref={sectionRef}
      initial={{opacity: 0}}
      animate={{opacity: isVisible ? 1 : 0}}
      transition={{duration: 0.8}}
    >
      {/* Black bar with marquee text */}
      <div className="w-full py-3 overflow-hidden mb-4">
        <div className="animate-marquee">
          {Array(20)
            .fill(0)
            .map((_, i) => (
              <span
                key={i}
                className="text-black uppercase font-bold mx-2 text-6xl md:text-8xl"
              >
                BEST SELLERS
              </span>
            ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={collection.id}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.5}}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
            onMouseLeave={() => setHoveredProduct(null)}
          >
            {collection.products.nodes.map((p) => (
              <motion.div
                key={p.id}
                layoutId={p.id}
                className="relative"
                onMouseEnter={() => setHoveredProduct(p.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
              >
                <div className="block group">
                  <div className="aspect-[3/4] overflow-hidden mb-2 relative">
                    <motion.div
                      animate={{scale: hoveredProduct === p.id ? 1.05 : 1}}
                      transition={{duration: 0.5}}
                      className="h-full w-full"
                    >
                      <Image
                        data={p.featuredImage}
                        aspectRatio="3/4"
                        sizes="(min-width:1024px)25vw,(min-width:768px)33vw,50vw"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 flex items-end justify-center pb-6"
                      initial={{opacity: 0}}
                      animate={{opacity: hoveredProduct === p.id ? 1 : 0}}
                      transition={{duration: 0.3}}
                    >
                      <motion.div
                        className="px-4 py-2 border border-white text-white rounded-sm"
                        initial={{y: 20, opacity: 0}}
                        animate={{
                          y: hoveredProduct === p.id ? 0 : 20,
                          opacity: hoveredProduct === p.id ? 1 : 0,
                        }}
                        transition={{duration: 0.3, delay: 0.1}}
                      >
                        {hoveredProduct === p.id && (
                          <TextScramble
                            trigger={hoveredProduct === p.id}
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
                      <h3 className="text-sm font-medium uppercase">
                        {p.title}
                      </h3>
                      <div className="text-sm mt-1 text-black font-medium">
                        <Money
                          data={{
                            amount: p.priceRange.minVariantPrice.amount,
                            currencyCode:
                              p.priceRange.minVariantPrice.currencyCode,
                          }}
                        />
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
                    to={`/products/${p.handle}`}
                    className="absolute inset-0 z-10"
                    aria-label={`View ${p.title} product`}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
