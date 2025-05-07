'use client';

import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import {useRef, useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import type {NewArrivalsProductFragment} from 'storefrontapi.generated';
import {TextScramble} from '~/components/ui/text-scramble';

type NewArrivalsProps = {
  products: NewArrivalsProductFragment[];
};

export function NewArrivals({products}: NewArrivalsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Marquee animation for title
  const marqueeVariants = {
    animate: {
      x: [0, -1000],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: 20,
          ease: 'linear',
        },
      },
    },
  };

  // Set up intersection observer to detect when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only need to trigger once
        }
      },
      {threshold: 0.1}, // Trigger when 10% of the element is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!products?.length) return null;

  return (
    <div className="mt-16 mb-12 overflow-hidden" ref={sectionRef}>
      {/* Marquee Title */}
      <div className="overflow-hidden py-6 mb-4">
        <motion.div
          className="whitespace-nowrap"
          variants={marqueeVariants}
          animate="animate"
        >
          <h2 className="text-[80px] text-[#7604e1] font-bold tracking-tight uppercase inline-block pr-8">
            <TextScramble
              trigger={isVisible}
              speed={0.4}
              duration={1.8}
              className="inline-block"
            >
              NEW ARRIVALS
            </TextScramble>
            <span> NEW ARRIVALS </span>
            <span> NEW ARRIVALS </span>
            <span> NEW ARRIVALS </span>
          </h2>
        </motion.div>
      </div>

      {/* Products */}
      <div className="px-4">
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6"
          aria-label="New arrivals gallery"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="relative flex-none w-[80vw] md:w-auto snap-center"
              initial={{opacity: 0}}
              animate={{opacity: isVisible ? 1 : 0}}
              transition={{duration: 0.6}}
            >
              <Link to={`/products/${product.handle}`} className="block">
                <div className="aspect-[3/4] overflow-hidden mb-2">
                  <motion.div
                    whileHover={{scale: 1.015}}
                    transition={{duration: 0.5}}
                    className="h-full w-full"
                  >
                    {product.featuredImage && (
                      <Image
                        data={{
                          altText:
                            product.featuredImage.altText || product.title,
                          url: product.featuredImage.url,
                          width: product.featuredImage.width || 0,
                          height: product.featuredImage.height || 0,
                        }}
                        aspectRatio="3/4"
                        sizes="(min-width:1024px)25vw,(min-width:768px)33vw,80vw"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </motion.div>
                </div>
                <div className="mt-1">
                  <h3 className="text-sm font-medium uppercase">
                    {product.title}
                  </h3>
                  <div className="text-sm mt-1 text-[#7604e1] font-medium">
                    <Money
                      data={{
                        amount: product.priceRange.minVariantPrice.amount,
                        currencyCode:
                          product.priceRange.minVariantPrice.currencyCode,
                      }}
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
