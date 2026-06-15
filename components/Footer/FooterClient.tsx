"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "../universal/Container";
import FooterList from "./FooterList";
import { MdFacebook } from "react-icons/md";
import {
  AiFillInstagram,
} from "react-icons/ai";
import Loader from "@/components/universal/Loader";

interface FooterClientProps {
  categoryNames: string[];
}

const FooterClient = ({ categoryNames }: FooterClientProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const footerCategories = [
    "All",
    ...categoryNames.filter((category) => category.trim() !== ""),
  ];

  return (
    <footer className="mt-16 bg-[#0a0a0a] text-sm text-[#f8f3ea] pb-20 md:pb-0">
      <Container>
        <div className="flex flex-col lg:flex-row flex-wrap justify-between gap-y-10 pt-16 pb-8">
          <FooterList>
            <h3 className="text-base mb-3 font-bold uppercase tracking-[0.12em] text-[#f8f3ea]">Shop Categories</h3>
            {footerCategories.map((category) => (
              <Link
                key={category}
                href={category === "All" ? "/" : `/?category=${encodeURIComponent(category)}`}
                onClick={() => setIsLoading(true)}
                className="block text-[#d8cdbc] hover:text-white"
              >
                {category}
              </Link>
            ))}
          </FooterList>

          <FooterList>
            <h3 className="text-base mb-3 font-bold uppercase tracking-[0.12em] text-[#f8f3ea]">Customer Services</h3>
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
              <Link
                key={item.label}
                href={item.path}
                onClick={() => setIsLoading(true)}
                className="block text-left w-full text-[#d8cdbc] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </FooterList>

          <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mb-6">
            <h3 className="text-base font-bold mb-3 uppercase tracking-[0.12em] text-[#f8f3ea]">About MTShop</h3>
            <p className="mb-2 text-[#d8cdbc]">
              MTShop curates modern clothing for sharp everyday dressing:
              crisp shirts, easy layers, statement fits, and wardrobe staples
              built for comfort, confidence, and repeat wear.
            </p>

            <p className="text-[#d8cdbc]">
              &copy; {new Date().getFullYear()} MTShop. All rights Reserved
            </p>
          </div>

          <FooterList>
            <h3 className="text-base font-bold mb-3 uppercase tracking-[0.12em] text-[#f8f3ea]">Follow Us</h3>
            <div className="flex gap-3">
              <Link href="https://www.facebook.com/" aria-label="Facebook" className="text-[#d8cdbc] hover:text-white">
                <MdFacebook size={24} />
              </Link>
              <Link href="https://www.instagram.com/ush.art_?igsh=aWhscDBnNTI1OTM=" aria-label="Instagram" className="text-[#d8cdbc] hover:text-white">
                <AiFillInstagram size={24} />
              </Link>
            </div>
          </FooterList>
        </div>
      </Container>

      {isLoading && <Loader />}
    </footer>
  );
};

export default FooterClient;
