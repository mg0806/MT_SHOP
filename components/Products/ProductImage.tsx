"use client";

import { useEffect, useState } from "react";
import {
  CartProductType,
  SelectedImgType,
} from "@/app/product/[productId]/ProductDetails";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useRef } from "react";
import SwiperCore from "swiper";
interface ProductImageProps {
  cartProduct: CartProductType;
  product: {
    images: SelectedImgType[];
  };
  handleColorSelect: (value: SelectedImgType) => void;
}

const ProductImage: React.FC<ProductImageProps> = ({
  cartProduct,
  product,
}) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<string>("");
  const swiperRef = useRef<SwiperCore>();
  useEffect(() => {
    const selectedColorObject = product.images.find(
      (item) => item.color === cartProduct.selectedImg.color
    );

    const images =
      selectedColorObject?.images ??
      (selectedColorObject?.image ? [selectedColorObject.image] : []);
    if (images.length > 0) {
      setSelectedImages(images);
      setMainImage(images[0]);
    } else {
      setSelectedImages([]);
      setMainImage("");
    }
  }, [cartProduct.selectedImg, product.images]);

  return (
    <div className="w-full">
      {/* ✅ MOBILE: Swiper Carousel */}
      <div className="block w-full sm:hidden">
        {selectedImages.length > 0 ? (
          <Swiper
            pagination={{ clickable: true }}
            modules={[Pagination, Autoplay]}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            className="h-[320px] w-full min-[420px]:h-[380px]"
          >
            {selectedImages.map((imgUrl, idx) => (
              <SwiperSlide key={idx}>
                <div className="relative h-[320px] w-full min-[420px]:h-[380px]">
                  <Image
                    src={imgUrl}
                    alt={`Image ${idx + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-[var(--color-secondary)] text-sm p-4">No Images Available</div>
        )}
      </div>

      {/* ✅ DESKTOP: Thumbnail Sidebar + Main Image as Swiper */}
      <div className="hidden min-h-[420px] max-h-[560px] grid-cols-[76px_minmax(0,1fr)] gap-4 sm:grid lg:min-h-[500px]">
        {/* Sidebar Thumbnails */}
        <div className="flex h-full w-full flex-col items-center justify-start gap-2 overflow-y-auto border border-[var(--color-border)] bg-[var(--color-surface)]">
          {selectedImages.map((imgUrl, idx) => (
            <div
              key={idx}
              onClick={() => {
                setMainImage(imgUrl);
                swiperRef.current?.slideTo(idx);
              }}
              className={`relative aspect-square w-14 cursor-pointer rounded sm:w-[64px] ${
                mainImage === imgUrl
                  ? "border-2 border-[var(--color-accent)]"
                  : "border-2 border-transparent"
              }`}
            >
              <Image
                src={imgUrl}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-contain p-1"
              />
            </div>
          ))}
        </div>

        {/* Main Image Swiper */}
        <div className="relative h-full w-full min-w-0">
          {selectedImages.length > 0 ? (
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                const currentIndex = selectedImages.indexOf(mainImage);
                if (currentIndex >= 0) swiper.slideTo(currentIndex);
              }}
              onSlideChange={(swiper) => {
                setMainImage(selectedImages[swiper.realIndex]);
              }}
              modules={[Autoplay]}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              loop
              className="w-full h-full"
            >
              {selectedImages.map((imgUrl, idx) => (
                <SwiperSlide key={idx}>
                  <div className="relative w-full h-full">
                    <Image
                      src={imgUrl}
                      alt={`Slide ${idx + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-secondary)]">
              No Image Available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductImage;
