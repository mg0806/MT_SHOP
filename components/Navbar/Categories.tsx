"use client";

import { useState, useEffect } from "react";
import Container from "../universal/Container";
import Category from "./Category";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Loader from "@/components/universal/Loader";
import axios from "axios";
import { MdStorefront } from "react-icons/md";
import { getCategoryIcon } from "@/Utils/categoryIconMap";

interface CategoryItem {
  label: string;
  icon: any;
}

const Categories = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([
    { label: "All", icon: MdStorefront },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useSearchParams();
  const category = params?.get("category");
  const pathname = usePathname();
  const isMainPage = pathname === "/";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        const fetchedCategories = response.data.map((cat: any) => ({
          label: cat.name,
          icon: getCategoryIcon(cat.icon),
        }));
        setCategories([
          { label: "All", icon: MdStorefront },
          ...fetchedCategories,
        ]);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Keep default categories if fetch fails
      } finally {
        setIsLoading(false);
      }
    };

    if (isMainPage) {
      fetchCategories();
    }
  }, [isMainPage]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [category]);

  if (!isMainPage) {
    return null;
  }

  return (
    <Suspense fallback={<Loader />}>
      <div className="w-full border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <Container>
          <div className="px-0 py-3">
            <div
              className="
            flex flex-row items-center
            gap-2
            overflow-x-auto scrollbar-hide
            sm:flex-wrap sm:justify-center sm:overflow-x-visible
          "
            >
              {isLoading ? (
                <Loader />
              ) : (
                categories.map((item) => (
                  <Category
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    selected={
                      category === item.label ||
                      (category === null && item.label === "All")
                    }
                  />
                ))
              )}
            </div>
          </div>
        </Container>
      </div>
    </Suspense>
  );
};

export default Categories;
