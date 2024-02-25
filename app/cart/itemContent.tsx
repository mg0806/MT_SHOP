import React from "react";
import { CartProductType } from "../product/[productId]/ProductDetails";
import { formatPrice } from "@/Utils/formatPrice";
import Link from "next/link";
import { truncateText } from "@/Utils/truncateText";
import Image from "next/image";
import SetQuantity from "@/components/Products/SetQuantity";
import { useCart } from "@/hooks/useCart";

interface itemContentProps{
    item:CartProductType;

}

const ItemContent: React.FC<itemContentProps> = ({item}) => {

    const {handleRemoveProductFromCart,handleCartQtyIncrease,handleCartQtyDecrease} = useCart();

    return (
        <div className=" border broder-[1.5px] border-slate-400 grid grid-cols-5  text-xs md:text-sm gap-4 rounded-lg px-2  py-4 justify-between items-center">
            <div className=" col-span-2  justify-self-start flex gap-2 md-gap-4 ">
                <Link href={`/product/${item.id}`}>
                    <div className="relative w-[70px]  aspect-square">
                        <Image src={`${item.selectedImg.image}`} alt={item.name} fill  className="object-contain"/>
                    </div>
                </Link>
                <div className="flex flex-col justify-between">
                <Link href={`/product/${item.id}`}>
                    {truncateText(item.name)}
                </Link>
                <div>{item.selectedImg.color}</div>
                <div className="w-[70px] ">
                    <button className="text-slate-500 underline" onClick={()=>handleRemoveProductFromCart(item)}>Remove</button>
                </div>
                </div>
            </div>
            <div className=" justify-self-center ">{formatPrice(item.price)}</div>
            <div className=" justify-self-center ">
                <SetQuantity 
                cartCounter={true}
                cartProduct={item}
                handleQtyIncrease={()=>{handleCartQtyIncrease(item)}}
                handleQtyDecrease={()=>{handleCartQtyDecrease(item)}}
                />
            </div>
            <div className=" justify-self-end font-semibold  ">
                {formatPrice(item.price*item.quantity)}
            </div>
        </div>
     );
}
 
export default ItemContent;