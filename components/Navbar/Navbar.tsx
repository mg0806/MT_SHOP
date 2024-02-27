import Link from "next/link";
import Container from "../universal/Container";
import { Redressed } from "next/font/google";
import CartCount from "./cartCount";
import UserMenu from './userMenu';
import { getCurrentUser } from "@/actions/getCurrentUser";
import Categories from "./Categories";
import SearchBar from "../universal/SearchBar";
import { Suspense } from "react";

const redressed = Redressed({subsets:['latin'],weight:['400']});

const Navbar = async () => {

    const currentUser = await getCurrentUser();

    return ( 
    
    <div className=" sticky top-0 w-full bg-slate-200 z-30 shadow-md">

        <div className="py-4 border-b-[1px]">
            <Container>

                <div className="flex items-center justify-between gap-3 md-gap-0 ">
                    <Link href="/" className={`${redressed.className} font-bold text-2xl`} >MT-Store</Link>
                    <div className="hidden md:block">
                    <Suspense fallback={<div>Search...</div>}>
                        <SearchBar />
                    </Suspense>
                    </div>
                    <div className="flex items-center gap-8 md:gap-12">
                        <CartCount/>
                        <UserMenu currentUser = {currentUser}/>
                    </div>
                </div>
            </Container>
        </div>
        <Categories/>
    </div> 
    
    );
}

export default Navbar;