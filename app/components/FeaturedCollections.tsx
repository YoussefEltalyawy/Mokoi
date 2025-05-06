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
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
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
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
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

  // Handle mouse events
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!collections?.length) return null;
  const active = collections[activeTab];

  return (
    <motion.div
      className="my-8 px-4"
      ref={sectionRef}
      initial={{opacity: 0}}
      animate={{opacity: isVisible ? 1 : 0}}
      transition={{duration: 0.8}}
    >
      {/* Header */}
      <h2 className="uppercase text-2xl font-bold tracking-tight">
        <TextScramble trigger={isVisible} speed={0.4} duration={1.8}>
          COLLECTIONS
        </TextScramble>
      </h2>

      {/* Categories */}
      <div className="flex gap-4 -mt-4 mb-4">
        <h3 className="text-md text-black/90">
          <TextScramble trigger={isVisible} speed={0.4} duration={1.5}>
            Best Sellers
          </TextScramble>
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mt-2 mb-6 border-b border-gray-200">
        {collections.map((col, i) => (
          <button
            key={col.id}
            onClick={() => setActiveTab(i)}
            className={`relative pb-2 text-sm uppercase ${
              i === activeTab
                ? 'font-bold text-[#6E08CE]'
                : 'font-medium text-gray-500'
            } transition-colors`}
          >
            {col.title}
            {i === activeTab && (
              <motion.div
                className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6E08CE]"
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

      {/* Products */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.4}}
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6"
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
            >
              <Link to={`/products/${p.handle}`} className="block">
                <div className="aspect-[3/4] overflow-hidden mb-2">
                  <motion.div
                    whileHover={{scale: 1.015}}
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
                </div>
                <div className="mt-1">
                  <h3 className="text-sm font-medium uppercase">{p.title}</h3>
                  <div className="text-sm mt-1 text-[#6E08CE] font-medium">
                    <Money
                      data={{
                        amount: p.priceRange.minVariantPrice.amount,
                        currencyCode: p.priceRange.minVariantPrice.currencyCode,
                      }}
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
