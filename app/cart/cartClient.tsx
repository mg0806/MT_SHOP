'use client'

import Heading from "@/components/universal/Heading";
import Link from "next/link";
import { MdArrowBack } from "react-icons/md";
import { useCart } from "@/hooks/useCart";
import Button from "@/components/universal/Button";
import ItemContent from './itemContent';




const CartClient = () => {
    const {cartProducts} = useCart()

    if (!cartProducts || cartProducts.length === 0)  {
        return(
            <div className="flex flex-col items-center">
                <div className="text-2xl">Your cart is empty</div>
                <div>
                    <Link href={"/"} className="text-slate-500 flex items-center gap-1 mt-2 ">
                        <MdArrowBack/>
                         <span>Start Shopping</span>
                    </Link>
                </div>
            </div>
        )
        
    }
    return ( 

        <div>
            <Heading title="Shopping Cart" center/>
            <div className=" grid grid-cols-5   text-xs gap-4 pb-2  mt-8">
                <div className="col-span-2 justify-self-start ml-4 ">PRODUCT</div>
                <div className=" justify-self-center ">PRICE</div>
                <div className=" justify-self-center  ">QUANTITY</div>
                <div className=" justify-self-end mr-4">TOTAL</div>
                
            </div>
            <div>{cartProducts && cartProducts.map((item)=>{
                    return <ItemContent key={item.id} item={item}/>
                })}
                </div>
            <div className="border-t[1.5px] border-slate-200 py-4 flex justify-between gap-4">
            <div className="w-[90px] ">
                <Button lable="Clear Cart" onClick={()=>{}} small outline />
            </div>
            <div className="text-sm flex flex-col gap-1 items-start">
                    <div className="flex justify-between w-full text-base font-semibold max-sm:mt-2">
                    <span>Subtotal</span>
                    <span>$100</span>
                    </div>
                    <p className="text-slate-500 max-sm:mt-2">Taxes and shipping calculate at chechout</p>
                    <Button lable="Checkout" onClick={()=>{}}/>
                    <Link href={"/"} className="text-slate-500 flex items-center gap-1 mt-2 ">
                        <MdArrowBack/>
                         <span>Continue Shopping</span>
                    </Link>
                </div>
            </div>
        </div>
     );
}
 
export default CartClient;