import Link from "next/link";
import { Suspense } from "react";
import { FiHeart, FiSearch } from "react-icons/fi";
import { getCurrentUser } from "@/actions/getCurrentUser";
import Container from "../universal/Container";
import CartCount from "./cartCount";
import Categories from "./Categories";
import SearchBar from "../universal/SearchBar";
import UserMenu from "./userMenu";
import ThemeToggle from "../universal/ThemeToggle";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";

const Navbar = async () => {
  const currentUser = await getCurrentUser();

  return (
    <div className="sticky top-0 z-30 w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-xl">
      <div className="py-3 lg:py-4">
        <Container>
          <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-[220px_minmax(0,1fr)_minmax(320px,460px)_auto] xl:grid-cols-[280px_minmax(0,1fr)_minmax(420px,520px)_auto]">
            <div className="flex items-center justify-between md:justify-start">
              <Link
                href="/"
                className="whitespace-nowrap text-lg font-black uppercase tracking-[0.16em] text-[var(--color-primary)] min-[380px]:text-xl sm:text-2xl"
              >
                MTShop
              </Link>
            </div>

            <NavLinks />

            <div className="hidden w-full justify-end lg:flex">
              <div className="w-full max-w-[460px]">
                <Suspense fallback={<div>Search...</div>}>
                  <SearchBar />
                </Suspense>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <button
                aria-label="Search"
                className="grid h-11 w-11 place-items-center border border-transparent text-[var(--color-primary)] transition hover:border-[var(--color-border)] lg:hidden"
              >
                <FiSearch size={21} />
              </button>
              <Link
                href="/account/wishlist"
                aria-label="Wishlist"
                className="hidden h-11 w-11 place-items-center text-[var(--color-primary)] transition hover:text-[var(--color-accent)] md:grid"
              >
                <FiHeart size={21} />
              </Link>
              <div className="hidden md:block">
                <ThemeToggle compact />
              </div>
              <CartCount />
              <div className="hidden md:block">
                <UserMenu currentUser={currentUser} />
              </div>
              <MobileMenu currentUser={currentUser} />
            </div>
          </div>
        </Container>
        <div className="mt-3 px-4 sm:px-6 md:px-8 lg:hidden">
          <Suspense fallback={<div className="h-11 border border-[var(--color-border)]" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      <Categories />
    </div>
  );
};

export default Navbar;
