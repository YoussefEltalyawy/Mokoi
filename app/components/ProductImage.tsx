import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';
import {useState} from 'react';
import {ChevronLeft, ChevronRight, X} from 'lucide-react';
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

  const allImages = selectedVariantImage
    ? [
        selectedVariantImage,
        ...images.filter((img) => img.id !== selectedVariantImage.id),
      ]
    : images;

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
      <div className="aspect-square bg-brandBeige rounded-lg animate-pulse"></div>
    );
  }

  return (
    <>
      {/* Image Carousel */}
      <div className="space-y-4">
        {/* Main Image Container */}
        <div
          className="aspect-square relative rounded-lg overflow-hidden bg-brandBeige cursor-zoom-in"
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
          {/* Image Container */}
          <div className="absolute inset-0">
            {allImages.map((image, index) => (
              <div
                key={`${image.id || index}`}
                className={`absolute inset-0 w-full h-full transition-transform duration-300 ease-in-out ${
                  !isDragging
                    ? 'transition-transform duration-300'
                    : 'transition-none'
                }`}
                style={{transform: getImagePosition(index)}}
              >
                <Image
                  alt={image.altText || 'Product Image'}
                  data={image}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          {/* Navigation Arrows - Desktop */}
          <div className="absolute inset-0 hidden opacity-0 md:flex item-center justify-between hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (selectedIndex > 0) {
                  setSelectedIndex((prev) => prev - 1);
                }
              }}
              disabled={selectedIndex === 0}
              className=" text-[#3f3f3f] hover:text-[#3f3f3fcd] transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (selectedIndex < allImages.length - 1) {
                  setSelectedIndex((prev) => prev + 1);
                }
              }}
              disabled={selectedIndex === allImages.length - 1}
              className=" text-[#3f3f3f] hover:text-[#3f3f3fcd] transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
        {/* Dot Indicator */}
        <div className="dot flex md:hidden justify-center space-x-2 mt-4">
          {allImages.map((_, index) => (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={`$dot-${index}`}
              onClick={() => setSelectedIndex(index)}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                selectedIndex === index
                  ? 'bg-brandBeige w-4'
                  : 'bg-black/70 hover:bg-black/40'
              }`}
            ></button>
          ))}
        </div>
      </div>
      {/* Modal / PopUp */}
      {modalOpen && (
        <div className="fixed top-0 left-0 !my-0 inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0 overflow-hidden">
            {/* Close Button */}
            <button>
              <X
                onClick={closeModal}
                className="absolute top-4 right-4 w-6 h-6 z-50  text-white/80 hover:text-white transition-colors"
              />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-50">
              <p className="text-white/80 font-poppins text-sm">
                {modalIndex + 1} / {allImages.length}
              </p>
            </div>

            {/* Modal Image */}
            <div
              className="w-full h-full flex items-center justify-center p-0 md:p-8"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative w-full h-full">
                {allImages.map((image, index) => (
                  <div
                    key={`modal-image-${image.id || 'x'}-$`}
                    className={`absolute inset-0 w-full h-full transition-transform duration-300 ease-in-out ${
                      !isDragging
                        ? 'transition-transform duration-300'
                        : 'transition-none'
                    }`}
                    style={{transform: getImagePosition(index)}}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        alt={image.altText || 'Product Image'}
                        data={image}
                        sizes="90vw"
                        className="max-w-full max-h-[85vh] object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute inset-0 hidden md:flex items-center justify-between px-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (modalIndex > 0) {
                    setModalIndex((prev) => prev - 1);
                  }
                }}
                disabled={modalIndex === 0}
                className=" text-white/80 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (modalIndex < allImages.length - 1) {
                    setModalIndex((prev) => prev + 1);
                  }
                }}
                disabled={modalIndex === allImages.length - 1}
                className=" text-white/80 hover:text-white transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default ProductImage;
