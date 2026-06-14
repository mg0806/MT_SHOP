import Container from "@/components/universal/Container";
import CheckoutClient from "./CheckoutClient";
import { getCurrentUser } from "@/actions/getCurrentUser";

const Checkout = async () => {
  const currentUser = await getCurrentUser();
  return (
    <div className="px-4 py-8 sm:px-8">
      <Container>
        <CheckoutClient currentUser={currentUser} />
      </Container>
    </div>
  );
};
export default Checkout;
