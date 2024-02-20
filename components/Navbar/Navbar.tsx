import Link from "next/link";
import Container from "../universal/Container";
import { Redressed } from "next/font/google";
import CartCount from "./cartCount";

const redressed = Redressed({subsets:['latin'],weight:['400']});

const Navbar = () => {
    return ( 
    
    <div className=" sticky top-0 w-full bg-slate-200 z-30 shadow-md">

        <div className="py-4 border-b-[1px]">
            <Container>

                <div className="flex items-center justify-between gap-3 md-gap-0 ">
                    <Link href="/" className={`${redressed.className} font-bold text-2xl`} >MT-Store</Link>
                    <div className="hidden md:block">Search</div>
                    <div className="flex items-center gap-8 md:gap-12">
                        <CartCount/>
                        <div>User Menu</div>
                    </div>
                </div>
            </Container>
        </div>

    </div> );
}
 
export default Navbar;