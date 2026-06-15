"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Container from "../universal/Container";
import AdminNavitem from "./adminNavItem";
import {
  MdDashboard,
  MdDns,
  MdFormatListBulleted,
  MdLibraryAdd,
  MdPhotoLibrary,
  MdCategory,
  MdSettings,
} from "react-icons/md";
import Loader from "@/components/universal/Loader"; // Import the loader
import ThemeToggle from "@/components/universal/ThemeToggle";

const AdminNav = () => {
  const pathName = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false); // State for loader

  // Handle navigation with loader
  const handleNavigation = useCallback(
    async (url: string) => {
      if (pathName !== url) {
        setLoading(true); // Show loader
        router.push(url);
      }
    },
    [pathName, router],
  );

  // Stop loading when navigation is complete
  useEffect(() => {
    setLoading(false);
  }, [pathName]);

  return (
    <>
      <div className="top-20 w-full border-b border-[var(--color-border)] bg-[var(--color-bg)] pt-4 shadow-sm">
        <Container>
          <div className="flex flex-row items-center justify-between gap-4 overflow-x-auto flex-nowrap md:justify-center md:gap-10">
            <button onClick={() => handleNavigation("/admin")}>
              <AdminNavitem
                label="Summary"
                icon={MdDashboard}
                selected={pathName === "/admin"}
              />
            </button>
            <button onClick={() => handleNavigation("/admin/add-products")}>
              <AdminNavitem
                label="Add Products"
                icon={MdLibraryAdd}
                selected={pathName === "/admin/add-products"}
              />
            </button>
            <button onClick={() => handleNavigation("/admin/manage-products")}>
              <AdminNavitem
                label="Manage Products"
                icon={MdDns}
                selected={pathName === "/admin/manage-products"}
              />
            </button>
            <button onClick={() => handleNavigation("/admin/manage-orders")}>
              <AdminNavitem
                label="Manage Orders"
                icon={MdFormatListBulleted}
                selected={pathName === "/admin/manage-orders"}
              />
            </button>
            <button onClick={() => handleNavigation("/admin/manage-banner")}>
              <AdminNavitem
                label="Manage Banner"
                icon={MdPhotoLibrary}
                selected={pathName === "/admin/manage-banner"}
              />
            </button>
            <button
              onClick={() => handleNavigation("/admin/manage-categories")}
            >
              <AdminNavitem
                label="Manage Categories"
                icon={MdCategory}
                selected={pathName === "/admin/manage-categories"}
              />
            </button>
            <button onClick={() => handleNavigation("/admin/settings")}>
              <AdminNavitem
                label="Settings"
                icon={MdSettings}
                selected={pathName === "/admin/settings"}
              />
            </button>
            <div className="shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </Container>
      </div>

      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)]">
          <Loader />
        </div>
      )}
    </>
  );
};

export default AdminNav;
