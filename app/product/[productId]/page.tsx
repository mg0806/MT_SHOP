import { product } from "@/Utils/product";
import Container from "@/components/universal/Container";
import ProductDetails from "./ProductDetails";
import { Rating } from '@mui/material';
import Listrating from "./ListRating";

interface IParams{
    ProductId?: string;
}

const Product = ({params}:{params: IParams}) => {

    // console.log("params: ", params)

    

    return ( 

        <div className=" p-8">
            <Container>
                <ProductDetails product={product}/>
                <div className="flex flex-col mt-20 gap-4">Add Rating</div>
                <Listrating product={product}/>
            </Container>
        </div>
     );
}
 
export default Product;