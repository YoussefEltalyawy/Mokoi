'use client';

import { Link } from '@remix-run/react';
import { Image } from '@shopify/hydrogen';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TextScramble } from '~/components/ui/text-scramble';

type Collection = {
  id: string;
  title: string;
  handle: string;
  image?: {
    id?: string;
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
};

export function CollectionsShowcase({
  collections,
  marqueeText,
}: {
  collections: Collection[];
  marqueeText?: string;
}) {
  // If there are no collections, don't render the component
  if (!collections || collections.length === 0) return null;

  return (
    <div className="w-full mt-10 mb-8 mx-0">
      {/* Black bar with marquee text */}
      <div className="bg-black w-full py-3 overflow-hidden">
        <div className="animate-marquee">
          {Array(20)
            .fill(0)
            .map((_, i) => (
              <span key={i} className="text-white uppercase font-bold mx-2">
                {marqueeText ?? 'SHOP BY COLLECTION'}
                <span className="mx-2 opacity-60">•</span>
              </span>
            ))}
        </div>
      </div>

      {/* Collection Images - 50/50 split grid */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {collections.map((collection) => (
          <div key={collection.id} className="relative">
            <Link
              to={`/collections/${collection.handle}`}
              className="block relative group overflow-hidden"
            >
              {collection.image && (
                <div className="relative h-[40vh] md:h-[50vh] w-full">
                  <Image
                    data={collection.image}
                    className="w-full h-full object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                  {/* Permanent black overlay */}
                  <div className="absolute inset-0 bg-black/30"></div>
                  {/* Additional hover overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              )}

              {/* Text overlay - aligned to corners on both mobile and desktop */}
              <div className="absolute inset-0 flex items-stretch justify-end p-4 md:p-8">
                <div className="w-full flex flex-row justify-between items-end">
                  <ObservableTextScramble
                    text={collection.title}
                    className="text-white text-xl md:text-2xl font-bold uppercase drop-shadow-md order-1 text-left"
                    speed={0.3}
                    duration={1.8}
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="text-white text-sm uppercase tracking-wide font-bold order-2 hover:opacity-80 transition-opacity flex items-center"
                  >
                    <ObservableTextScramble
                      text="Shop Now"
                      speed={0.3}
                      duration={1.9}
                    />
                    <span className="inline-block ml-1">→</span>
                  </motion.div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// Custom component that wraps TextScramble with IntersectionObserver
function ObservableTextScramble({
  text,
  className,
  speed,
  duration,
}: {
  text: string;
  className?: string;
  speed?: number;
  duration?: number;
}) {
  const [triggerScramble, setTriggerScramble] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggerScramble(true);
          observer.disconnect(); // Only trigger once
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the text element is visible
        rootMargin: '0px', // No margin
      },
    );

    // Start observing
    if (textRef.current) {
      observer.observe(textRef.current);
    }

    // Cleanup
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={textRef} className={className}>
      <TextScramble trigger={triggerScramble} speed={speed} duration={duration}>
        {text}
      </TextScramble>
    </div>
  );
}
