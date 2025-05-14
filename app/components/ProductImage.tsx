import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';
import {useState, useEffect} from 'react';
import {ChevronLeft, ChevronRight, X, ZoomIn} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';
import {TextScramble} from '~/components/ui/text-scramble';

type GalleryImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

type ProductImageProps = {
  selectedVariantImage: ProductVariantFragment['image'];
  images: GalleryImage[];
};

function ProductImage({selectedVariantImage, images}: ProductImageProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalIndex, setModalIndex] = useState<number>(0);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [textScramble, setTextScramble] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  // Track if user has manually navigated images
  const [userNavigated, setUserNavigated] = useState<boolean>(false);

  const allImages = selectedVariantImage
    ? [
        selectedVariantImage,
        ...images.filter((img) => img.id !== selectedVariantImage.id),
      ]
    : images;

  // Synchronize selectedIndex with selectedVariantImage
  useEffect(() => {
    if (!userNavigated && selectedVariantImage) {
      // Always set to 0 since selectedVariantImage is always first in allImages
      setSelectedIndex(0);
    }
    if (!selectedVariantImage && selectedIndex !== 0 && !userNavigated) {
      setSelectedIndex(0);
    }
    // Reset userNavigated when variant changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariantImage]);

  // Reset userNavigated when variant changes
  useEffect(() => {
    setUserNavigated(false);
  }, [selectedVariantImage]);

  // Reset image loaded state when selected index changes
  useEffect(() => {
    setImageLoaded(false);
    const timer = setTimeout(() => setImageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [selectedIndex]);

  // Trigger text scramble effect on hover
  useEffect(() => {
    if (isHovering) {
      setTextScramble(true);
    } else {
      setTextScramble(false);
    }
  }, [isHovering]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const currentTouch = e.targetTouches[0].clientX;
    const offset = currentTouch - touchStart;
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const minSwipeDistance = 50;
    if (Math.abs(dragOffset) > minSwipeDistance) {
      if (dragOffset > 0 && selectedIndex > 0) {
        setSelectedIndex((prev) => prev - 1);
        if (modalOpen) setModalIndex((prev) => prev - 1);
      } else if (dragOffset < 0 && selectedIndex < allImages.length - 1) {
        setSelectedIndex((prev) => prev + 1);
        if (modalOpen) setModalIndex((prev) => prev + 1);
      }
    }
    setIsDragging(false);
    setDragOffset(0);
  };

  const getImagePosition = (index: number) => {
    const baseTranform = isDragging ? dragOffset : 0;
    const diff = index - (modalOpen ? modalIndex : selectedIndex);
    return `translate3d(calc(${diff * 100}% + ${baseTranform}px),0,0)`;
  };

  const openModal = (index: number) => {
    setModalIndex(index);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = '';
  };

  if (allImages.length < 1) {
    return (
      <div className="aspect-[4/5] bg-gradient-to-tr from-black/20 to-black/5 rounded-xl animate-pulse"></div>
    );
  }

  return (
    <>
      {/* Main Image Container with angled design */}
      <div className="space-y-6">
        <motion.div
          className="relative overflow-hidden rounded-xl bg-gradient-to-b from-gray-50 to-gray-100"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)',
            aspectRatio: '4/5',
          }}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.5}}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          role="button"
          tabIndex={0}
          onClick={() => !isDragging && openModal(selectedIndex)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              !isDragging && openModal(selectedIndex);
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-transparent z-10"></div>

          {/* Images with transitions */}
          <div className="absolute inset-0">
            {allImages.map((image, index) => (
              <motion.div
                key={`${image.id || index}`}
                className="absolute inset-0 w-full h-full"
                style={{transform: getImagePosition(index)}}
                initial={{opacity: 0}}
                animate={{
                  opacity: selectedIndex === index ? 1 : 0,
                  scale:
                    selectedIndex === index ? (isHovering ? 1.05 : 1) : 0.95,
                }}
                transition={{
                  opacity: {duration: 0.4},
                  scale: {duration: 0.6, ease: 'easeInOut'},
                }}
              >
                <Image
                  alt={image.altText || 'Product Image'}
                  data={image}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="w-full h-full object-cover"
                  onLoad={() => index === selectedIndex && setImageLoaded(true)}
                />
              </motion.div>
            ))}
          </div>

          {/* Zoom overlay */}
          <AnimatePresence>
            {isHovering && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center z-20 bg-black/30 backdrop-blur-sm"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.3}}
              >
                <motion.div
                  className="px-6 py-3 border border-white text-white rounded flex items-center gap-2"
                  initial={{y: 20, opacity: 0}}
                  animate={{y: 0, opacity: 1}}
                  exit={{y: 20, opacity: 0}}
                  transition={{duration: 0.3, delay: 0.1}}
                >
                  <ZoomIn size={18} />
                  <TextScramble
                    trigger={textScramble}
                    speed={0.2}
                    duration={0.8}
                  >
                    ZOOM IMAGE
                  </TextScramble>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls - Desktop */}
          <div className="absolute inset-y-0 left-0 right-0 z-30 hidden md:flex items-center justify-between px-4 opacity-0 hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{scale: 1.1}}
              whileTap={{scale: 0.95}}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedIndex > 0) {
                  setSelectedIndex((prev) => prev - 1);
                  setUserNavigated(true);
                }
              }}
              disabled={selectedIndex === 0}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md"
            >
              <ChevronLeft className="w-5 h-5 text-black" />
            </motion.button>
            <motion.button
              whileHover={{scale: 1.1}}
              whileTap={{scale: 0.95}}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedIndex < allImages.length - 1) {
                  setSelectedIndex((prev) => prev + 1);
                  setUserNavigated(true);
                }
              }}
              disabled={selectedIndex === allImages.length - 1}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md"
            >
              <ChevronRight className="w-5 h-5 text-black" />
            </motion.button>
          </div>
        </motion.div>

        {/* Thumbnail Navigation */}
        {allImages.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {allImages.map((image, index) => (
              <motion.button
                key={`thumb-${image.id || index}`}
                className={`h-2 relative overflow-hidden ${
                  selectedIndex === index ? 'w-8' : 'w-2'
                } rounded-full transition-all duration-300 ease-in-out`}
                onClick={() => {
                  setSelectedIndex(index);
                  setUserNavigated(true);
                }}
                whileHover={{scale: 1.2}}
                whileTap={{scale: 0.9}}
              >
                <span
                  className={`absolute inset-0 ${
                    selectedIndex === index ? 'bg-black' : 'bg-black/40'
                  }`}
                ></span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.3}}
          >
            <div className="absolute inset-0 overflow-hidden">
              {/* Close Button */}
              <motion.button
                className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center"
                whileHover={{scale: 1.1, backgroundColor: 'rgba(0,0,0,0.5)'}}
                whileTap={{scale: 0.95}}
                onClick={closeModal}
              >
                <X className="w-6 h-6 text-white" />
              </motion.button>

              {/* Image Counter */}
              <div className="absolute top-4 left-4 z-50 px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full">
                <p className="text-white/90 text-sm font-medium">
                  {modalIndex + 1} / {allImages.length}
                </p>
              </div>

              {/* Modal Image */}
              <div
                className="w-full h-full flex items-center justify-center p-4"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="relative w-full h-full">
                  {allImages.map((image, index) => (
                    <motion.div
                      key={`modal-image-${image.id || index}`}
                      className="absolute inset-0 w-full h-full"
                      style={{transform: getImagePosition(index)}}
                      initial={{opacity: 0}}
                      animate={{
                        opacity: modalIndex === index ? 1 : 0,
                      }}
                      transition={{
                        opacity: {duration: 0.3},
                      }}
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        <motion.div
                          initial={{scale: 0.9, opacity: 0}}
                          animate={{
                            scale: modalIndex === index ? 1 : 0.9,
                            opacity: modalIndex === index ? 1 : 0,
                          }}
                          transition={{duration: 0.4}}
                        >
                          <Image
                            alt={image.altText || 'Product Image'}
                            data={image}
                            sizes="90vw"
                            className="max-w-full max-h-[85vh] object-contain"
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <motion.button
                  whileHover={{scale: 1.1}}
                  whileTap={{scale: 0.95}}
                  onClick={() => {
                    if (modalIndex > 0) {
                      setModalIndex((prev) => prev - 1);
                    }
                  }}
                  disabled={modalIndex === 0}
                  className={`w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm ${
                    modalIndex === 0
                      ? 'opacity-30 cursor-not-allowed'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{scale: 1.1}}
                  whileTap={{scale: 0.95}}
                  onClick={() => {
                    if (modalIndex < allImages.length - 1) {
                      setModalIndex((prev) => prev + 1);
                    }
                  }}
                  disabled={modalIndex === allImages.length - 1}
                  className={`w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm ${
                    modalIndex === allImages.length - 1
                      ? 'opacity-30 cursor-not-allowed'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ProductImage;
