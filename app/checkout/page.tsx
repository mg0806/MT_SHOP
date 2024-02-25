import FormWrap from "@/components/Products/FormWarp";
import Container from "@/components/universal/Container";
import CheckoutClient from "./CheckoutClient";

const Checkout = () => {
    return ( 

        <div className=" p-8">
            <Container>
                <FormWrap>
                    <CheckoutClient/>
                </FormWrap>
            </Container>
        </div>
    );
}
export default Checkout;