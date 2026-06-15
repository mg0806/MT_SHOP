const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";

const isRoadCourier = (courier: any) => {
  const searchableText = [
    courier?.courier_name,
    courier?.mode,
    courier?.transportation_mode,
    courier?.shipment_mode,
    courier?.freight_type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (searchableText.includes("air")) return false;

  return (
    searchableText.includes("surface") ||
    searchableText.includes("road") ||
    searchableText.includes("ground") ||
    courier?.is_surface === true ||
    courier?.is_surface === 1
  );
};

const getCourierRate = (courier: any) => Number(courier?.rate ?? Infinity);

export function getCheapestRoadCourier(couriers: any[] = []) {
  const roadCouriers = couriers.filter(isRoadCourier);

  return roadCouriers
    .filter((courier) => Number.isFinite(getCourierRate(courier)))
    .sort((a, b) => getCourierRate(a) - getCourierRate(b))[0] || null;
}

export async function getShiprocketAvailability({
  pickup_postcode,
  delivery_postcode,
  weight,
  length,
  breadth,
  height,
  cod,
}: {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number;
  length: number;
  breadth: number;
  height: number;
  cod: boolean;
}) {
  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    throw new Error("Shiprocket credentials are missing in .env");
  }

  if (!pickup_postcode || !delivery_postcode) {
    throw new Error("Pickup and delivery pincodes are required");
  }

  if (!Number.isFinite(Number(weight)) || Number(weight) <= 0) {
    throw new Error("Product weight must be greater than 0");
  }

  const authResponse = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL.trim(),
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  const authData = await authResponse.json().catch(() => null);
  if (!authResponse.ok || !authData?.token) {
    throw new Error(
      `Shiprocket auth failed: ${authData?.message || authData?.error || authResponse.statusText}`,
    );
  }

  const queryParams = new URLSearchParams({
    pickup_postcode,
    delivery_postcode,
    weight: Number(weight).toString(),
    length: Number(length || 1).toString(),
    breadth: Number(breadth || 1).toString(),
    height: Number(height || 1).toString(),
    cod: cod ? "1" : "0",
  });

  const result = await fetch(`${SHIPROCKET_BASE}/courier/serviceability/?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${authData.token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await result.json().catch(() => null);
  if (!result.ok || !data?.data) {
    throw new Error(
      `Shiprocket serviceability check failed: ${data?.message || data?.error || result.statusText}`,
    );
  }

  return data.data;
}
