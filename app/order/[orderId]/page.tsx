import Container from "@/components/universal/Container";
import OrderDetails from "./OrderDetails";
import getOrderById from "@/actions/getOrderById";
import NullData from "@/components/NullData";
import { getCurrentUser } from "@/actions/getCurrentUser";
import AdminHistoryControls from "@/components/admin/AdminHistoryControls";

interface IParams {
  orderId?: string;
}

const Order = async({ params }: { params: Promise<IParams> }) => {

    const resolvedParams = await params
    const order = await getOrderById(resolvedParams)
    const currentUser = await getCurrentUser()

    if (!order) {
        return <NullData title="No Order"></NullData>
    }
  return (
    <div className=" p-8">
      <Container>
        <OrderDetails order={order} />
      </Container>
      {currentUser?.role === "ADMIN" && <AdminHistoryControls />}
    </div>
  );
};

export default Order;
