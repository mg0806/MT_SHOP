"use client";

import { formatNumber } from "@/Utils/formatNumber";
import { formatPrice } from "@/Utils/formatPrice";
import Heading from "@/components/universal/Heading";
import { Order, Product, User } from "@prisma/client";
import { useEffect, useState } from "react";

interface SummaryProps {
  orders: Order[];
  products: Product[];
  users: User[];
}
type SummaryDataType = {
  [key: string]: {
    label: string;
    digit: number;
  };
};
const Summary: React.FC<SummaryProps> = ({ orders, products, users }) => {
  const [summaryData, setSummaryData] = useState<SummaryDataType>({
    sale: {
      label: "Total Sale",
      digit: 0,
    },
    products: {
      label: "Total Products",
      digit: 0,
    },
    orders: {
      label: "Total Orders",
      digit: 0,
    },
    paidOrders: {
      label: "Paid Orders",
      digit: 0,
    },
    unPaidOrders: {
      label: "Unpaid Orders",
      digit: 0,
    },
    users: {
      label: "Total Users",
      digit: 0,
    },
  });

  useEffect(() => {
    setSummaryData((prev) => {
      let tempData = { ...prev };

      const totalSale = orders.reduce((acc, item) => {
        if (item.status === "complete") {
          return acc + item.amount / 100;
        } else {
          return acc;
        }
      }, 0);

      const paidOrders = orders.filter((order) => {
        return order.status === "complete";
      });
      const unPaidOrders = orders.filter((order) => {
        return order.status === "pending";
      });

      tempData.sale.digit = totalSale;
      tempData.orders.digit = orders.length;
      tempData.paidOrders.digit = paidOrders.length;
      tempData.unPaidOrders.digit = unPaidOrders.length;
      tempData.products.digit = products.length;
      tempData.users.digit = users.length;

      return tempData;
    });
  }, [orders, products, users]);

  const summaryKeys = Object.keys(summaryData);
  return (
    <div className=" max-w-[1150px] m-auto ">
      <div className=" mb-4 mt-8">
        <Heading title="Stats" center />
      </div>
      <div className="grid grid-cols-1 gap-4 max-h-50vh overflow-y-auto md:grid-cols-2">
        {summaryKeys &&
          summaryKeys.map((key) => {
            return (
              <div
                key={key}
                className="flex flex-col items-center gap-2 border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_16px_45px_rgba(23,20,18,0.08)] transition"
              >
                <div className="text-2xl font-black md:text-4xl">
                  {summaryData[key].label === "Total Sale" ? (
                    <>{formatPrice(summaryData[key].digit)}</>
                  ) : (
                    <>{formatNumber(summaryData[key].digit)}</>
                  )}
                </div>
                <div className="font-medium text-[var(--color-primary)]">{summaryData[key].label}</div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Summary;
