"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../../../components/Products/ProductCard"; // Import ProductCard component
import { CartProductType } from "./ProductDetails";

interface YouMayAlsoLikeProps {
  category: string;
  currentProductId: string; // Add currentProductId as a prop
}

const YouMayAlsoLike: React.FC<YouMayAlsoLikeProps> = ({
  category,
  currentProductId,
}) => {
  const [products, setProducts] = useState<CartProductType[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Pass category as query parameter
        const response = await axios.get(`/api/products?category=${category}`);
        // Filter out the current product by matching the product id
        const filteredProducts = response.data.filter(
          (product: CartProductType) => product.id !== currentProductId
        );
        setProducts(filteredProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, [category, currentProductId]); // Re-run when category or currentProductId changes

  // Only show the section if products are available
  if (products.length === 0) {
    return null; // Or return an empty fragment: <></>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white rounded-2xl shadow mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center sm:text-left">
        You May Also Like
      </h2>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} data={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No related products found.</p>
      )}
    </div>
  );
};

export default YouMayAlsoLike;
