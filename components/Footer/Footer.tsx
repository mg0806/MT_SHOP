import Link from "next/link";
import Container from "../universal/Container";
import FooterList from "./FooterList";
import {MdFacebook} from 'react-icons/md'
import { AiFillGithub, AiFillInstagram, AiFillTwitterCircle} from 'react-icons/ai'


const Footer = () => {
    return ( <footer  className="bg-slate-700 text-slate-200 text-sm mt-16 bottom-0">

        <Container>
        <div  className="  flex flex-col md:flex-row justify-between pt-16 pb-8 ">

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
                <h3 className="text-base font-bold mb-2">About Us</h3>
                <p className="mb-2">MTShop is your go-to online shopping destination, offering a diverse range of products including fashion, electronics, home decor, and more. With a user-friendly interface, easily browse, search, and filter items to find exactly what you need. Enjoy secure payment options and stay updated with exclusive deals and discounts. Save your favorite items in personalized wishlists and benefit from fast, reliable shipping services. Our dedicated customer support team is here to assist you every step of the way. Elevate your online shopping experience with MTShop – download the app now for seamless convenience and satisfaction guaranteed.</p>
                <p>&copy; {new Date().getFullYear() } MT-Shop All rights Reserved </p>

            </div>
            <FooterList>
            <h3 className="text-base font-bold mb-2">Follow Us</h3>
            <div className="flex gap-2">
                <Link href="">
                    <MdFacebook size={24}/>
                </Link>
                <Link href="">
                    <AiFillTwitterCircle size={24}/>
                </Link>
                <Link href="">
                    <AiFillInstagram size={24}/>
                </Link>
                <Link href="">
                    <AiFillGithub size={24}/>
                </Link>
            </div>
            </FooterList>
        </div>
        </Container>
        </footer>
     );
}
 
export default Footer;