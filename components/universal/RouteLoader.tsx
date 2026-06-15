"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import BrandLoader from "./BrandLoader";

const RouteLoader = () => {
  const pathname = usePathname(); // Track route changes
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 650);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return <BrandLoader label="Loading page" />;
};

export default RouteLoader;
