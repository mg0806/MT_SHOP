import getProducts from "@/actions/getProduct";
import ProductListingClient from "@/components/product/ProductListingClient";

export const revalidate = 0;

const NewArrivalsPage = async () => {
  const products = await getProducts({ isNewArrival: true });

  return <ProductListingClient products={products} title="New Arrivals" />;
};

export default NewArrivalsPage;
