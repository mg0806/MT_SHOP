"use client";

import Link from "next/link";
import Container from "../universal/Container";
import AdminNavitem from "./adminNavItem";
import {
  MdDashboard,
  MdDns,
  MdFormatListBulleted,
  MdLibraryAdd,
} from "react-icons/md";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Loader from "@/components/universal/Loader";

const AdminNav = () => {
  const [loading, setLoading] = useState(false);
  const pathName = usePathname();

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500); // Simulate a network request with a timeout
  };

  return (
    <div className="w-full shadow-sm top-20 border-b-[1px] pt-4">
      <Container>
        <div className="flex flex-row items-center justify-between md:justify-center gap-8 md:gap-12 overflow-x-auto flex-nowrap">
          <Link href="/admin" onClick={handleClick}>
            <AdminNavitem
              label="Summary"
              icon={MdDashboard}
              selected={pathName === "/admin"}
            />
          </Link>
          <Link href="/admin/add-products" onClick={handleClick}>
            <AdminNavitem
              label="Add Products"
              icon={MdLibraryAdd}
              selected={pathName === "/admin/add-products"}
            />
          </Link>
          <Link href="/admin/manage-products" onClick={handleClick}>
            <AdminNavitem
              label="Manage Products"
              icon={MdDns}
              selected={pathName === "/admin/manage-products"}
            />
          </Link>
          <Link href="/admin/manage-orders" onClick={handleClick}>
            <AdminNavitem
              label="Manage Orders"
              icon={MdFormatListBulleted}
              selected={pathName === "/admin/manage-orders"}
            />
          </Link>
        </div>
      </Container>
      {loading && <Loader />}
    </div>
  );
};

export default AdminNav;
