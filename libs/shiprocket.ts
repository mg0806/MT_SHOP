import axios from "axios";
import getStoreSettings from "@/actions/getStoreSettings";

const BASE = "https://apiv2.shiprocket.in/v1/external";
let cachedToken: string | null = null;
let tokenExpiry: Date | null = null;

async function getToken() {
  if (cachedToken && tokenExpiry && new Date() < tokenExpiry) return cachedToken;
  const res = await axios.post(`${BASE}/auth/login`, {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD,
  });
  cachedToken = res.data.token;
  tokenExpiry = new Date(Date.now() + 23 * 60 * 60 * 1000);
  return cachedToken;
}

export async function createShiprocketShipment(order: any) {
  const token = await getToken();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const address = order.savedAddress;
  if (!address) throw new Error("Order address missing");
  const settings = await getStoreSettings();

  const orderRes = await axios.post(
    `${BASE}/orders/create/adhoc`,
    {
      order_id: order.id,
      order_date: new Date().toISOString().split("T")[0],
      pickup_location: settings.shiprocketPickupName,
      channel_id: process.env.SHIPROCKET_CHANNEL_ID,
      billing_customer_name: address.fullName,
      billing_address: address.line1,
      billing_address_2: address.line2 ?? "",
      billing_city: address.city,
      billing_pincode: address.pincode,
      billing_state: address.state,
      billing_country: "India",
      billing_email: address.email ?? order.user?.email ?? "",
      billing_phone: address.phone,
      shipping_is_billing: true,
      order_items: order.lineItems.map((item: any) => ({
        name: item.name,
        sku: item.productId,
        units: item.qty,
        selling_price: item.unitPrice,
      })),
      payment_method: "Prepaid",
      sub_total: order.subtotal,
      length: settings.defaultPackageLength,
      breadth: settings.defaultPackageBreadth,
      height: settings.defaultPackageHeight,
      weight: settings.defaultPackageWeight,
    },
    { headers },
  );

  const shipmentId = orderRes.data.shipment_id;
  const shiprocketOrderId = orderRes.data.order_id;
  if (!shipmentId) throw new Error("Shiprocket did not return a shipment ID");

  const awbRes = await axios.post(
    `${BASE}/courier/assign/awb`,
    { shipment_id: String(shipmentId), courier_id: "" },
    { headers },
  );
  const awbCode = awbRes.data.response?.data?.awb_code;
  const courierName = awbRes.data.response?.data?.courier_name;
  if (!awbCode) throw new Error("AWB generation failed");

  await axios.post(`${BASE}/courier/generate/pickup`, { shipment_id: [String(shipmentId)] }, { headers });
  return { shiprocketOrderId, shipmentId, awbCode, courierName };
}

export async function trackShipmentByAWB(awbCode: string) {
  const token = await getToken();
  const res = await axios.get(`${BASE}/courier/track/awb/${awbCode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.tracking_data;
}

export async function cancelShiprocketOrder(shiprocketOrderId: string) {
  const token = await getToken();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  await axios.post(
    `${BASE}/orders/cancel`,
    { ids: [Number(shiprocketOrderId)] },
    { headers },
  );
}
