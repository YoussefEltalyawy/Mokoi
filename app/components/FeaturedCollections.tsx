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

type CollectionWithProductsFragment = {
  id: string;
  title: string;
  handle: string;
  products: {
    nodes: Product[];
  };
};

export function FeaturedCollections({
  collections,
}: {
  collections: CollectionWithProductsFragment[];
}) {
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeftPos(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeftPos - walk;
    }
  };

  // Check scroll position to determine arrow visibility
  const checkScrollPosition = () => {
    if (!scrollRef.current) return;
    const {scrollLeft, scrollWidth, clientWidth} = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Call checkScrollPosition on component mount
  useEffect(() => {
    checkScrollPosition();
  }, []);

  // Call checkScrollPosition when active tab changes
  useEffect(() => {
    checkScrollPosition();
  }, [activeTab]);

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

  // Global mouseup event listener
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Scroll event listener
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollPosition);
      return () =>
        scrollContainer.removeEventListener('scroll', checkScrollPosition);
    }
  }, [activeTab]);

  // Window resize event listener
  useEffect(() => {
    const handleResize = () => checkScrollPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll functions
  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({left: -300, behavior: 'smooth'});
      // Check position after animation completes
      setTimeout(checkScrollPosition, 500);
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({left: 300, behavior: 'smooth'});
      // Check position after animation completes
      setTimeout(checkScrollPosition, 500);
    }
  };

  if (!collections?.length) return null;
  const active = collections[activeTab];

  return (
    <motion.div
      className="mt-8 px-8"
      ref={sectionRef}
      initial={{opacity: 0}}
      animate={{opacity: isVisible ? 1 : 0}}
      transition={{duration: 0.8}}
    >
      <h2 className="uppercase text-2xl font-bold tracking-tight">
        <TextScramble trigger={isVisible} speed={0.4} duration={1.8}>
          COLLECTIONS
        </TextScramble>
      </h2>

      <div className="flex gap-4 mb-4">
        <h3 className="text-md text-black/90">
          <TextScramble trigger={isVisible} speed={0.4} duration={1.5}>
            Best Sellers
          </TextScramble>
        </h3>
      </div>

      <div className="flex gap-4 mt-2 mb-6 border-b border-gray-200">
        {collections.map((col, i) => (
          <button
            key={col.id}
            onClick={() => setActiveTab(i)}
            className={`relative pb-2 text-sm uppercase ${
              i === activeTab
                ? 'font-bold text-black'
                : 'font-medium text-gray-500'
            } transition-colors`}
          >
            {col.title}
            {i === activeTab && (
              <motion.div
                className="absolute bottom-0 left-0 w-full h-0.5 bg-black"
                layoutId="activeTab"
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  duration: 0.4,
                }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="md:hidden flex absolute top-1/2 -translate-y-1/2 left-0 right-0 z-10 px-2 pointer-events-none">
          <div className="flex-1">
            {canScrollLeft && (
              <motion.button
                onClick={handleScrollLeft}
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
          <div className="flex-1 flex justify-end">
            {canScrollRight && (
              <motion.button
                onClick={handleScrollRight}
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

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.4}}
            onAnimationComplete={checkScrollPosition}
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 scroll-smooth"
            aria-label="Product gallery"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {active.products.nodes.map((p) => (
              <motion.div
                key={p.id}
                className="relative flex-none w-[80vw] md:w-auto snap-center"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.6}}
                onHoverStart={() => setHoveredProduct(p.id)}
                onHoverEnd={() => setHoveredProduct(null)}
              >
                <Link to={`/products/${p.handle}`} className="block group">
                  <div className="aspect-[3/4] overflow-hidden mb-2 relative">
                    <motion.div
                      animate={{scale: hoveredProduct === p.id ? 1.05 : 1}}
                      transition={{duration: 0.5}}
                      className="h-full w-full"
                    >
                      <Image
                        data={p.featuredImage}
                        aspectRatio="3/4"
                        sizes="(min-width:1024px)25vw,(min-width:768px)33vw,80vw"
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
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
