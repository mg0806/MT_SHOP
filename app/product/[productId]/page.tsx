import Container from "@/components/universal/Container";
import ProductDetails from "./ProductDetails";
import Listrating from "./ListRating";
import { products } from "@/Utils/products";
import { product } from "../../../Utils/product";
import getProductsById from "@/actions/getProductById";
import NullData from "@/components/NullData";
import AddRating from "./AddRating";
import { getCurrentUser } from "@/actions/getCurrentUser";
import Category from "../../../components/Navbar/Category";
import AlsoLike from "./AlsoLike";

interface IParams {
  productId?: string;
}

const Product = async ({ params }: { params: IParams }) => {
  const product = await getProductsById(params);
  const user = await getCurrentUser();

  if (!product) {
    return <NullData title="Product with given id does not exist" />;
  }

  return (
    <div className="px-4 py-8 sm:px-8">
      <Container>
        <ProductDetails
          product={product}
          reviewSection={<AddRating product={product} user={user} />}
        />
        <AlsoLike category={product.category} currentProductId={product.id} />
        <Listrating product={product} />
      </Container>
    </div>
  );
};

export default Product;
