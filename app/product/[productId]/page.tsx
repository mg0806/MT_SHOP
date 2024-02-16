import { product } from "@/Utils/product";
import Container from "@/components/universal/Container";
import ProductDetails from "./ProductDetails";

interface IParams{
    ProductId?: string;
}

const Product = ({params}:{params: IParams}) => {

    console.log("params: ", params)

    

    return ( 

        <div className=" p-8">
            <Container>
                <ProductDetails product={product}/>
            </Container>
        </div>
     );
}
 
export default Product;