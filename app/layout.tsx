import Navbar from "@/components/Navbar/Navbar";
import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Footer from "@/components/Footer/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import CartProvider from "../providers/cartProviders";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import RouteLoader from "@/components/universal/RouteLoader";
import AnnouncementBar from "@/components/Navbar/AnnouncementBar";
import BottomTabBar from "@/components/Navbar/BottomTabBar";
import CartDrawer from "@/components/cart/CartDrawer";
import { WishlistProvider } from "@/hooks/useWishlist";
import ThemeProvider from "@/providers/themeProvider";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "MTShop | Modern Clothing",
  description: "A modern fashion e-commerce store for curated everyday clothing.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <link rel='icon' href="/mtlogo.webp" type='image/x-icon'/> */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('next-mtshop-theme') || 'light';
                  if (theme !== 'light' && theme !== 'dark') theme = 'light';
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.style.colorScheme = theme;
                } catch (error) {
                  document.documentElement.dataset.theme = 'light';
                  document.documentElement.style.colorScheme = 'light';
                }
              })();
            `,
          }}
        />
      </head>

      <body className={`${poppins.className} bg-[var(--color-bg)] text-[var(--color-primary)] antialiased`}>
        <Toaster
          toastOptions={{
            style: {
              background: "#171412",
              color: "#fbfaf7",
            },
          }}
        />
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-primary)]">
                <RouteLoader />
                <AnnouncementBar />
                <Suspense>
                  <Navbar />
                </Suspense>
                <main className="flex-grow">{children}</main>
                <Footer />
                <CartDrawer />
                <BottomTabBar />
              </div>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
