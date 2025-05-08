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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Check scroll position
  const checkScrollPosition = () => {
    if (!scrollRef.current) return;

    const {scrollLeft, scrollWidth, clientWidth} = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  };

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

  // Check scroll position on mount and when scrolling
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      checkScrollPosition();
      scrollContainer.addEventListener('scroll', checkScrollPosition);
      return () =>
        scrollContainer.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  // Scroll functions
  const scrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({left: -300, behavior: 'smooth'});
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({left: 300, behavior: 'smooth'});
  };

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
          <h2 className="text-[80px] text-black font-bold tracking-tight uppercase inline-block pr-8">
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
      <div className="px-4 relative">
        {/* Scroll indicators/buttons - only visible on mobile/tablet */}
        <div className="md:hidden flex absolute top-1/2 -translate-y-1/2 left-0 right-0 z-10 px-2 pointer-events-none">
          {/* Left arrow container */}
          <div className="flex-1">
            {canScrollLeft && (
              <motion.button
                onClick={scrollLeft}
                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md pointer-events-auto"
                initial={{opacity: 0, x: -10}}
                animate={{opacity: 1, x: 0}}
                whileHover={{scale: 1.1}}
                whileTap={{scale: 0.95}}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 19L8 12L15 5"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            )}
          </div>

          {/* Right arrow container */}
          <div className="flex-1 flex justify-end">
            {canScrollRight && (
              <motion.button
                onClick={scrollRight}
                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md pointer-events-auto"
                initial={{opacity: 0, x: 10}}
                animate={{opacity: 1, x: 0}}
                whileHover={{scale: 1.1}}
                whileTap={{scale: 0.95}}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 5L16 12L9 19"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            )}
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 scroll-smooth"
          aria-label="New arrivals gallery"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="relative flex-none w-[80vw] md:w-auto snap-center"
              initial={{opacity: 0}}
              animate={{opacity: isVisible ? 1 : 0}}
              transition={{duration: 0.6}}
              onHoverStart={() => setHoveredProduct(product.id)}
              onHoverEnd={() => setHoveredProduct(null)}
            >
              <Link to={`/products/${product.handle}`} className="block group">
                <div className="aspect-[3/4] overflow-hidden mb-2 relative">
                  <motion.div
                    animate={{
                      scale: hoveredProduct === product.id ? 1.05 : 1,
                    }}
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

                  {/* Gradient overlay on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 flex items-end justify-center pb-6"
                    initial={{opacity: 0}}
                    animate={{opacity: hoveredProduct === product.id ? 1 : 0}}
                    transition={{duration: 0.3}}
                  >
                    <motion.div
                      className="px-4 py-2 border border-white text-white rounded-sm"
                      initial={{y: 20, opacity: 0}}
                      animate={{
                        y: hoveredProduct === product.id ? 0 : 20,
                        opacity: hoveredProduct === product.id ? 1 : 0,
                      }}
                      transition={{duration: 0.3, delay: 0.1}}
                    >
                      {hoveredProduct === product.id && (
                        <TextScramble
                          trigger={hoveredProduct === product.id}
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
                      {product.title}
                    </h3>
                    <div className="text-sm mt-1 text-black font-medium">
                      <Money
                        data={{
                          amount: product.priceRange.minVariantPrice.amount,
                          currencyCode:
                            product.priceRange.minVariantPrice.currencyCode,
                        }}
                      />
                    </div>
                  </div>

                  {/* Animated underline on hover */}
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-black w-0 origin-left"
                    initial={{width: 0}}
                    whileHover={{width: '100%'}}
                    transition={{duration: 0.3}}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Scroll indicator for desktop - visual cue only */}
        <div className="hidden md:flex mt-4 justify-center space-x-1">
          <span className="text-xs text-gray-500">Scroll to see more</span>
          <svg
            className="w-4 h-4 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
