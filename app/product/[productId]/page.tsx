import Container from "@/components/universal/Container";
import ProductDetails from "./ProductDetails";
import Listrating from "./ListRating";
import { products } from "@/Utils/products";
import { product } from "../../../Utils/product";

interface IParams {
  ProductId?: string;
}

const Product = ({ params }: { params: IParams }) => {
//   console.log("params: ", params);

//   const product = products.find((item)=>item.id === params.ProductId)

  return (
    <div className=" p-8">
      <Container>
        <ProductDetails product={product} />
        <div className="flex flex-col mt-20 gap-4">Add Rating</div>
        <Listrating product={product} />
      </Container>
    </div>
  );
};

export default Product;
