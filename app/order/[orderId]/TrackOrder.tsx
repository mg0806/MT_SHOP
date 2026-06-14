"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Package, Truck, Warehouse, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

/* ---------------- ICON MAPPER ---------------- */
const iconForStatus = (status: string) => {
  switch (status) {
    case "Order Received":
      return <Warehouse className="text-gray-500" size={20} />;
    case "Dispatched":
      return <Package className="text-blue-500" size={20} />;
    case "In Transit":
      return <Truck className="text-yellow-500" size={20} />;
    case "Delivered":
      return <CheckCircle className="text-green-600" size={20} />;
    default:
      return <Package className="text-gray-400" size={20} />;
  }
};

/* ---------------- COMPONENT ---------------- */
const TrackOrder = () => {
  const searchParams = useSearchParams();
  const awb = searchParams?.get("awb");

  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH TRACKING ---------------- */
  useEffect(() => {
    if (!awb) return;

    setLoading(true);

    fetch(`/api/shiprocket/track-order?awb=${awb}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch tracking data");
        return res.json();
      })
      .then((data) => {
        const shipment = data?.tracking_data?.shipment_track?.[0];
        const statusHistory = data?.tracking_data?.shipment_status || [];

        if (!shipment) {
          setTrackingData(null);
          return;
        }

        setTrackingData({
          ...shipment,
          status_history: statusHistory,
        });
      })
      .catch((err) => {
        console.error("Tracking error:", err);
        setTrackingData(null);
      })
      .finally(() => setLoading(false));
  }, [awb]);

  /* ---------------- LOADING STATE ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        <span className="ml-3 text-blue-600 text-lg font-medium">
          Loading tracking info...
        </span>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-2xl"
    >
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📦 Track Your Order
      </h1>

      {trackingData ? (
        <div className="space-y-3 text-base text-gray-700">
          <p>
            <strong>AWB Code:</strong> {trackingData.awb_code}
          </p>

          <p>
            <strong>Courier:</strong> {trackingData.courier_name}
          </p>

          <p>
            <strong>Current Status:</strong> {trackingData.current_status}
          </p>

          <p>
            <strong>Pickup Date:</strong>{" "}
            {trackingData.pickup_date || "Not picked yet"}
          </p>

          <p>
            <strong>Last Updated:</strong>{" "}
            {trackingData.updated_time_stamp || "—"}
          </p>

          <p>
            <strong>Estimated Delivery:</strong> {trackingData.edd}
          </p>

          <p>
            <strong>Route:</strong> {trackingData.origin} →{" "}
            {trackingData.destination}
          </p>

          <p>
            <strong>Weight:</strong> {trackingData.weight} kg
          </p>
        </div>
      ) : (
        <p className="text-gray-500">No tracking data available</p>
      )}

      <hr className="my-6" />

      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        📍 Shipment Journey
      </h2>

      <ol className="relative border-l border-gray-300 pl-6">
        {trackingData?.status_history?.length ? (
          trackingData.status_history.map((step: any, index: number) => (
            <motion.li
              key={index}
              className="mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="absolute -left-3 top-1.5">
                {iconForStatus(step.status)}
              </div>
              <div className="ml-2">
                <p className="font-semibold text-gray-900">{step.status}</p>
                <p className="text-sm text-gray-500">{step.date}</p>
                <p className="text-sm text-gray-600">{step.location}</p>
              </div>
            </motion.li>
          ))
        ) : (
          <p className="text-gray-500 text-sm">
            No tracking updates available yet.
          </p>
        )}
      </ol>
    </motion.div>
  );
};

export default TrackOrder;
