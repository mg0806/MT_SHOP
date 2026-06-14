"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, Tooltip, Legend, CategoryScale, LinearScale);

interface BarGraphProps {
  data: GraphData[];
}
type GraphData = {
  day: string;
  date: string;
  totalAmount: number;
};
const BarGraph: React.FC<BarGraphProps> = ({ data }) => {
  const [theme, setTheme] = useState("light");
  const labels = data.map((item) => item.day);
  const amounts = data.map((item) => item.totalAmount);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setTheme(root.dataset.theme || "light");
    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  const themeColors = useMemo(() => {
    const isLight = theme === "light";

    return {
      primary: isLight ? "#171412" : "#f6f0e7",
      secondary: isLight ? "#675f56" : "#d6d0c6",
      grid: isLight ? "rgba(23, 20, 18, 0.26)" : "rgba(246, 240, 231, 0.24)",
      barBg: isLight ? "rgba(17, 17, 17, 0.62)" : "rgba(232, 255, 0, 0.72)",
      barBorder: isLight ? "#171412" : "#e8ff00",
      tooltipBg: isLight ? "#171412" : "#f6f0e7",
      tooltipText: isLight ? "#f6f0e7" : "#171412",
    };
  }, [theme]);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Sale Amount",
        data: amounts,
        backgroundColor: themeColors.barBg,
        borderColor: themeColors.barBorder,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: themeColors.primary,
          font: {
            weight: "bold" as const,
          },
        },
      },
      tooltip: {
        backgroundColor: themeColors.tooltipBg,
        titleColor: themeColors.tooltipText,
        bodyColor: themeColors.tooltipText,
        borderColor: themeColors.barBorder,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: themeColors.grid,
          lineWidth: 1.4,
        },
        ticks: {
          color: themeColors.primary,
          font: {
            weight: "bold" as const,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: themeColors.grid,
          lineWidth: 1.4,
        },
        ticks: {
          color: themeColors.primary,
          font: {
            weight: "bold" as const,
          },
        },
      },
    },
  };

  return (
    <div className="h-[420px] w-full border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
      <Bar data={chartData} options={options}></Bar>
    </div>
  );
};

export default BarGraph;

<></>;
