"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import BrandLoader from "./BrandLoader";

const RouteLoader = () => {
  const pathname = usePathname(); // Track route changes
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // You can tweak the delay for UX

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return <BrandLoader label="Loading page" />;
};

export default RouteLoader;
