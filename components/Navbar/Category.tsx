"use client";

import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { useCallback } from "react";
import { IconType } from "react-icons";
import { Suspense } from "react";

interface CategoryProps {
  label: string;
  icon: IconType;
  selected?: boolean;
}

const CategoryComponent: React.FC<CategoryProps> = ({
  label,
  icon: Icon,
  selected,
}) => {
  const router = useRouter();
  const params = useSearchParams();
  const handelClick = useCallback(() => {
    if (label === "All") {
      router.push("/");
    } else {
      let currentQuery = {};

      if (params) {
        currentQuery = queryString.parse(params.toString());
      }

      const updatedQuery: any = {
        ...currentQuery,
        category: label,
      };

      const url = queryString.stringifyUrl(
        {
          url: "/",
          query: updatedQuery,
        },
        {
          skipNull: true,
        }
      );
      router.push(url);
    }
  }, [label, params, router]);

  return (
    <div
      onClick={handelClick}
      className={`
      flex min-h-10 items-center justify-center gap-2 border px-4 text-center
      cursor-pointer uppercase tracking-[0.12em] transition
      hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]
      ${
        selected
          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-bg)]"
          : "border-[var(--color-border)] bg-transparent text-[var(--color-secondary)]"
      }
    `}
    >
      <Icon size={16} />
      <div className="whitespace-nowrap text-[11px] font-black sm:text-xs">
        {label}
      </div>
    </div>
  );
};

const Category: React.FC<CategoryProps> = (props) => (
  <Suspense fallback={<div>Loading...</div>}>
    <CategoryComponent {...props} />
  </Suspense>
);
export default Category;
