import getProducts from "@/actions/getProduct";
import ProductListingClient from "@/components/product/ProductListingClient";

export const revalidate = 0;

const ShopPage = async () => {
  const products = await getProducts({});
  return <ProductListingClient products={products} title="Shop" />;
};

export default ShopPage;
