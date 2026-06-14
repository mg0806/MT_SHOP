import getProducts from "@/actions/getProduct";
import ProductListingClient from "@/components/product/ProductListingClient";

export const revalidate = 0;

const CollectionPage = async ({ params }: { params: { category: string } }) => {
  const category = decodeURIComponent(params.category);
  const products = await getProducts({ category });
  return <ProductListingClient products={products} title={category} category={category} />;
};

export default CollectionPage;
