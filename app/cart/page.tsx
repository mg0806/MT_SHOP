
import Container from "@/components/universal/Container";
import CartClient from "./cartClient";


const Cart = () => {
    
    return ( 

        <div className="p-8">
            <Container>
                <CartClient/>
            </Container>
        </div>
     );
}
 
export default Cart;