import { CartProductType } from "@/app/product/[productId]/ProductDetails";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type CartContextType = {
    cartTotalQty: number;
    cartProducts: CartProductType[]| null;
    handleAddProductToCart: (product:CartProductType)=> void;
    handleRemoveProductFromCart: (product:CartProductType)=> void;
}

export const CartContext = createContext<CartContextType | null>(null);

interface Props{
    [propName: string]:any;
}

export const CartContextProvider = (props: Props)=>{

    const [cartTotalQty , setCartTotalQty] = useState(10) 

    const[cartProducts , setCartProducts] = useState<CartProductType[]|null>(null);


    // Using useEffect to make our page saty where we left after adding products to cart 
    useEffect(()=>{
            const cartItems:any = localStorage.getItem('MTshopCartItems')
            const cProducts:CartProductType[]|null = JSON.parse(cartItems)

            setCartProducts(cProducts)
    },[])

    const handleAddProductToCart = useCallback((product:CartProductType)=>{
        setCartProducts((prev)=>{
            let updatedCart;

            if (prev) {
                updatedCart = [...prev, product]
            }
            else{
                updatedCart = [product]
            }

            // storing cart information into localStorage
            localStorage.setItem('MTshopCartItems', JSON.stringify(updatedCart))
            return updatedCart;
        })
        toast.success("Product added successfully")
    },[])

    const handleRemoveProductFromCart = useCallback((product:CartProductType)=>{
if (cartProducts) {
    const filteredProducts = cartProducts.filter
    ((item)=>{
        return item.id != product.id
    })

    setCartProducts(filteredProducts)
    localStorage.setItem('MTshopCartItems', JSON.stringify(filteredProducts))

}
toast.success("Product Removed successfully")
    },[cartProducts])


    const value ={
        cartTotalQty,
        cartProducts,
        handleAddProductToCart,
        handleRemoveProductFromCart,
    }

    return <CartContext.Provider value={value} {...props}/>
}

export const useCart = ()=>{
    const context = useContext(CartContext);

    if (context === null) {
        throw new Error("useCart must be used wiithin a CartContextProvider")        
    }

    return context;
}