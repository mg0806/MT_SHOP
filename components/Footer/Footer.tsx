"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "../universal/Container";
import FooterList from "./FooterList";
import { MdFacebook } from "react-icons/md";
import { categories } from "@/Utils/Categories";
import {
  AiFillGithub,
  AiFillInstagram,
  AiFillTwitterCircle,
} from "react-icons/ai";
import Loader from "@/components/universal/Loader"; // Import Loader

const Footer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Handle navigation with loader
  const handleNavigation = (url: string) => {
    setIsLoading(true);
    router.push(url);
    setTimeout(() => setIsLoading(false), 700); // Simulating page load
  };

  return (
    <footer className="bg-[#0a0a0a] text-[var(--color-primary)] text-sm mt-16 pb-20 md:pb-0">
      <Container>
        <div className="flex flex-col lg:flex-row flex-wrap justify-between gap-y-10 pt-16 pb-8">
          {/* Shop Categories */}
          <FooterList>
            <h3 className="text-base mb-3 font-bold uppercase tracking-[0.12em]">Shop Categories</h3>
            {categories
              .filter((item) => item.label !== "")
              .map((category) => (
                <Link
                  key={category.label}
                  href={`/?category=${category.label}`}
                  className="block text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                >
                  {category.label}
                </Link>
              ))}
          </FooterList>

          {/* Customer Services */}
          <FooterList>
            <h3 className="text-base mb-3 font-bold uppercase tracking-[0.12em]">Customer Services</h3>
            {[
              { label: "Contact us", path: "/contact" },
              { label: "Terms and Conditions", path: "/terms-and-conditions" },
              { label: "Shipping Policy", path: "/shippingPolicy" },
              {
                label: "Cancellation and Refund",
                path: "/cancellation-refund",
              },
              { label: "FAQs", path: "/FAQ" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className="block text-left w-full text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
              >
                {item.label}
                {isLoading && <Loader />}
              </button>
            ))}
          </FooterList>

          {/* About Us */}
          <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mb-6">
            <h3 className="text-base font-bold mb-3 uppercase tracking-[0.12em]">About MTShop</h3>
            <p className="mb-2 text-[var(--color-secondary)]">
              MTShop curates modern clothing for sharp everyday dressing:
              crisp shirts, easy layers, statement fits, and wardrobe staples
              built for comfort, confidence, and repeat wear.
            </p>

            <p className="text-[var(--color-secondary)]">
              &copy; {new Date().getFullYear()} MTShop. All rights
              Reserved
            </p>
          </div>

          {/* Social Links */}
          <FooterList>
            <h3 className="text-base font-bold mb-3 uppercase tracking-[0.12em]">Follow Us</h3>
            <div className="flex gap-3">
              <Link href="">
                <MdFacebook size={24} />
              </Link>
              <Link href="">
                <AiFillTwitterCircle size={24} />
              </Link>
              <Link href="https://www.instagram.com/ush.art_?igsh=aWhscDBnNTI1OTM=">
                <AiFillInstagram size={24} />
              </Link>
              {/* <Link href="">
                <AiFillGithub size={24} />
              </Link> */}
            </div>
          </FooterList>
        </div>
      </Container>

      {/* Show Loader when navigating */}
      {isLoading && <Loader />}
    </footer>
  );
};

export default Footer;
