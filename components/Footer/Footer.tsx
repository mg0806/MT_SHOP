import Link from "next/link";
import Container from "../universal/Container";
import FooterList from "./FooterList";



const Footer = () => {
    return ( <footer className="bg-slate-700 text-slate-200 text-sm mt-16">

        <Container>
        <div className=" flex flex-col md:flex-row justify-between pt-16 pb-8 ">

            <FooterList>
                <h3 className=" text-base mb-2 font-bold"> Shop Categories</h3>
                <Link href="#">Phones</Link>
                <Link href="#">Laptops</Link>
                <Link href="#">Desktops</Link>
                <Link href="#">Watches</Link>
                <Link href="#">TVs</Link>
                <Link href="#">Accessories</Link>
                
            </FooterList>
            <FooterList>
                <h3 className=" text-base mb-2 font-bold"> Customer Services</h3>
                <Link href="#">Contact us</Link>
                <Link href="#">Shipping Policy</Link>
                <Link href="#">Returns & Exchange</Link>
                <Link href="#">FAQs</Link>
            </FooterList>

            <div className="w-full md:w-1/3 mb-6 md:mb-0">
                <h3 className="text-base font-bold mb-2">About</h3>
            </div>
        </div>
        </Container>
        </footer>
     );
}
 
export default Footer;