"use client";

import { Rating } from "@mui/material";
import Image from "next/image";
import { ReactNode, useCallback, useEffect, useState } from "react";
import SetColor from "@/components/Products/SetColor";
import SetQuantity from "@/components/Products/SetQuantity";
import Button from "@/components/universal/Button";
import ProductImage from "@/components/Products/ProductImage";
import { useCart } from "@/hooks/useCart";
import { MdCheckCircle } from "react-icons/md";
import { useRouter } from "next/navigation";
import Loader from "@/components/universal/Loader";
import { Check } from "lucide-react";
import toast from "react-hot-toast";
import SizeGuideModal from "@/components/product/SizeGuideModal";
import ProductAccordions from "@/components/product/ProductAccordions";
import StickyAddToCart from "@/components/product/StickyAddToCart";

interface ProductDetailsProps {
  product: any;
  reviewSection?: ReactNode;
}

export type CartProductType = {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  selectedImg: SelectedImgType;
  quantity: number;
  price: number;
  size?: string;
  weight?: number;
};

export type SelectedImgType = {
  color: string;
  colorCode: string;
  image?: string;
  images: string[];
};

const HorizontalLine = () => {
  return <hr className="w-[30%] my-2" />;
};

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, reviewSection }) => {
  const { handleAddProductToCart, cartProducts } = useCart();
  const [isProductInCart, setIsProductInCart] = useState(false);
  const [pincode, setPincode] = useState("");
  const [isApiCalled, setIsApiCalled] = useState(false);
  const [selectedSize, setSelectedSize] = useState("M");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // const [shippingCharge, setShippingCharge] = useState<number | null>(null);
  // const [estimatedDays, setEstimatedDays] = useState<string | null>(null);
  const [deliveryCheckLoading, setDeliveryCheckLoading] = useState(false);
  const [deliveryAvailability, setdeliveryAvailability] = useState(false);
  const { shippingData, setShippingData } = useCart();

  const firstImageGroup = product.images?.[0] ?? {};
  const firstImageGroupImages =
    firstImageGroup.images ?? (firstImageGroup.image ? [firstImageGroup.image] : []);

  const hasSalePrice =
    typeof product.finalPrice === "number" &&
    product.finalPrice > 0 &&
    product.finalPrice < product.price;
  const displayPrice = hasSalePrice ? product.finalPrice : product.price;

  const [cartProduct, setCartProduct] = useState<CartProductType>({
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    brand: product.brand,
    selectedImg: {
      color: firstImageGroup.color,
      colorCode: firstImageGroup.colorCode,
      images: firstImageGroupImages,
    },
    quantity: 1,
    price: displayPrice,
    size: "M",
    weight: product.weight,
  });
  const [loading, setLoading] = useState(false); // State to manage loading for "View Cart"
  const router = useRouter();
  useEffect(() => {
    setIsProductInCart(false);

    if (cartProducts) {
      const existingIndex = cartProducts.findIndex(
        (item) => item.id === product.id,
      );

      if (existingIndex > -1) {
        setIsProductInCart(true);
      }
    }
  }, [cartProducts, product.id]);

  const productRating =
    product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) /
    product.reviews.length;

  const handleColorSelect = useCallback((value: SelectedImgType) => {
    setCartProduct((prev) => ({
      ...prev,
      selectedImg: value,
    }));
  }, []);

  useEffect(() => {
    setCartProduct((prev) => ({ ...prev, size: selectedSize }));
  }, [selectedSize]);

  const handleQtyIncrease = useCallback(() => {
    if (typeof product.quantity === "number" && cartProduct.quantity === product.quantity) {
      toast.error("max reached");
      return;
    }
    setdeliveryAvailability(false);
    setIsApiCalled(false);
    setShippingData(null);
    setCartProduct((prev) => ({
      ...prev,
      quantity: prev.quantity + 1,
    }));
  }, [cartProduct, product.quantity, setShippingData]);

  const handleQtyDecrease = useCallback(() => {
    if (cartProduct.quantity === 1) {
      toast.error("min reached");
      return;
    }
    setdeliveryAvailability(false);
    setIsApiCalled(false);
    setShippingData(null);
    setCartProduct((prev) => ({
      ...prev,
      quantity: prev.quantity - 1,
    }));
  }, [cartProduct, setShippingData]);

  const handleViewCartClick = () => {
    // const encodedData = encodeURIComponent(JSON.stringify(shippingData));
    setLoading(true); // Set loading to true when the button is clicked
    setTimeout(() => {
      router.push("/cart");
      // router.push(`/cart?Info=${encodedData}`);
      setLoading(false); // Reset loading state after navigation
    }, 1000); // Optional: Adjust delay as needed
  };

  const weight = product.weight * cartProduct.quantity;
  const handleCheckDelivery = async () => {
    try {
      // console.log("handle check delivery called");
      setDeliveryCheckLoading(true);
      setIsApiCalled(true);

      const res = await fetch("/api/shiprocket/delivery-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup_postcode: "382481",
          delivery_postcode: pincode,
          weight: weight,
          length: 29.7,
          breadth: 21,
          height: 2,
          cod: 0,
        }),
      });

      const data = await res.json();
      // console.log("Shiprocket response:", data);

      // Validate response
      if (
        !data ||
        !data.available_courier_companies ||
        !data.available_courier_companies.length
      ) {
        console.warn("No courier available for this delivery.");
        setdeliveryAvailability(false);
        return;
      }

      const matchedCourier = data.cheapest_road_courier;

      if (!matchedCourier) {
        setdeliveryAvailability(false);
        toast.error("No road transport delivery is available for this pincode");
        return;
      }

      // Update state
      setdeliveryAvailability(true);
      setShippingData({
        shippingCharge: matchedCourier.rate || 0,
        estimatedDays: matchedCourier.estimated_delivery_days || "-",
        pincode: pincode,
        courierName: matchedCourier.courier_name,
      });
      // console.log("Selected Courier:", matchedCourier);
    } catch (err) {
      console.error("Error checking delivery:", err);
      setdeliveryAvailability(false);
      setShippingData({
        shippingCharge: 0,
        estimatedDays: "-",
        pincode: pincode,
        courierName: "-",
      });
    } finally {
      setDeliveryCheckLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)] lg:gap-10 xl:gap-14">
      <div className="flex flex-col gap-5">
        <ProductImage
          cartProduct={cartProduct}
          product={product}
          handleColorSelect={handleColorSelect}
        />
        <ProductAccordions description={product.description} />
        {reviewSection}
      </div>

      <div className="fashion-panel flex min-w-0 flex-col gap-4 p-4 text-sm text-[var(--color-secondary)] sm:p-6 lg:p-8">
        <p className="fashion-kicker">MTShop selection</p>
        <h2 className="text-2xl font-black uppercase leading-tight text-[var(--color-primary)] sm:text-3xl">{product.name}</h2>

        <div className="flex items-center gap-2">
          <Rating value={productRating} readOnly />
          <div>{product.reviews.length} reviews</div>
        </div>

        <HorizontalLine />

        <div className="text-justify">{product.description}</div>

        <HorizontalLine />

        <div>
          <span className="font-semibold">CATEGORY: </span>
          {product.category}
        </div>
        <div>
          <span className="font-semibold">BRAND: </span>
          {product.brand}
        </div>

        <div className="font-mono text-xl font-black text-[var(--color-primary)] sm:text-2xl">
          {hasSalePrice ? (
            <>
              Price:
              <span className="line-through text-gray-500 ml-2">
                ₹{product.price}
              </span>
              <span className="text-red-500 ml-2">₹{product.finalPrice}</span>
            </>
          ) : (
            <>Price: ₹{displayPrice}</>
          )}
        </div>

        <div className={product.inStock ? "font-semibold text-[var(--color-success)]" : "font-semibold text-[var(--color-accent-alt)]"}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </div>

        <div className="mt-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[var(--color-primary)]">
              Size
            </span>
            <button
              onClick={() => setSizeGuideOpen(true)}
              className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-accent)]"
            >
              Size Guide &gt;
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {["S", "M", "L", "XL", "XXL"].map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-h-11 min-w-14 rounded-full border px-4 text-sm font-black transition active:scale-105 ${
                  selectedSize === size
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-bg)]"
                    : "border-[var(--color-border)] text-[var(--color-primary)]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {isProductInCart ? (
          <>
            <p className="mb-2 text-[var(--color-secondary)] flex items-center gap-1">
              <MdCheckCircle size={20} className="text-[var(--color-success)]" />
              <span>Product added to cart</span>
            </p>
            <div className="relative flex max-w-[620px] flex-wrap gap-3">
              <div className="min-w-0 flex-1 basis-[280px]">
                <Button lable="View Cart" outline onClick={handleViewCartClick} />
              </div>
              <div className="min-w-0 flex-1 basis-[280px]">
                <Button
                  lable="Get Yours Customized Now"
                  outline
                  onClick={() => {
                    setLoading(true);
                    router.push("/customization-form");
                  }}
                />
              </div>
              {loading && <Loader />}
            </div>
          </>
        ) : (
          <>
            {/* <SetColor
              cartProduct={cartProduct}
              images={product.images}
              handleColorSelect={handleColorSelect}
            />*/}

            <HorizontalLine />

            <SetQuantity
              cartProduct={cartProduct}
              handleQtyIncrease={handleQtyIncrease}
              handleQtyDecrease={handleQtyDecrease}
            />

            <HorizontalLine />

            <div className="mt-4 flex max-w-[620px] flex-wrap gap-3">
              <div className="min-w-0 flex-1 basis-[280px]">
                <input
                  type="text"
                  placeholder="Enter your Pincode"
                  value={pincode}
                  onChange={(e) => {
                    setdeliveryAvailability(false);
                    setIsApiCalled(false);
                    setShippingData(null);
                    setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  }}
                  className="w-full border rounded px-3 py-2 text-sm"
                  maxLength={6}
                />
              </div>

              <div className="flex min-w-0 flex-1 basis-[280px] items-center">
                <Button
                  lable="Check Delivery Availability"
                  onClick={handleCheckDelivery}
                  disabled={pincode.length !== 6}
                />
              </div>

              <div className="w-full">
                {pincode.length !== 6 ? (
                  <p className="text-orange-500 mt-2 text-sm">
                    Please enter a valid 6 digit pin-code
                  </p>
                ) : null}

                {deliveryCheckLoading && <Loader />}

                {isApiCalled && (
                  <p className="text-sm mt-2 flex items-center gap-1">
                    Delivery{" "}
                    {deliveryCheckLoading ? (
                      <span className="text-blue-600">checking...</span>
                    ) : deliveryAvailability ? (
                      <span className="flex flex-wrap items-center gap-1 text-green-600">
                        <strong className="flex items-center gap-1">
                          available <Check className="w-5 h-5" />
                        </strong>
                        {shippingData?.estimatedDays &&
                          shippingData.estimatedDays !== "-" && (
                            <span>
                              Estimated delivery in {shippingData.estimatedDays} days
                            </span>
                          )}
                      </span>
                    ) : (
                      <strong className="flex items-center gap-1 text-red-600">
                        not available
                      </strong>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* 👉 Buttons Side by Side */}
            <div className="mt-4 flex max-w-[620px] flex-wrap gap-3">
              <div className="min-w-0 flex-1 basis-[280px]">
                <Button
                  lable="Add to Cart"
                  onClick={() => handleAddProductToCart(cartProduct)}
                  disabled={!product.inStock || !deliveryAvailability}
                />
                {!product.inStock ? (
                  <p className="text-red-500 mt-2 text-sm">
                    Product is out of stock
                  </p>
                ) : (
                  !deliveryAvailability && (
                    <p className="text-orange-500 mt-2 text-sm">
                      Please check delivery availability to proceed
                    </p>
                  )
                )}
              </div>

              <div className="min-w-0 flex-1 basis-[280px]">
                <Button
                  lable="Get Yours Customized Now"
                  outline
                  disabled={!deliveryAvailability}
                  onClick={() => {
                    setLoading(true);
                    router.push("/customization-form");
                  }}
                />
              </div>
            </div>
          </>
        )}

        <HorizontalLine />
        <div className="grid grid-cols-1 gap-2 text-center text-xs font-bold uppercase text-[var(--color-secondary)] sm:grid-cols-3 sm:gap-3">
          <span>Free Returns</span>
          <span>Secure Payment</span>
          <span>COD Available</span>
        </div>
      </div>
      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
      <StickyAddToCart
        productName={product.name}
        disabled={!product.inStock || !deliveryAvailability || isProductInCart}
        onAdd={() => handleAddProductToCart(cartProduct)}
      />
    </div>
  );
};

export default ProductDetails;
