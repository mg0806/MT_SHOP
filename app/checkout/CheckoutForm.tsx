'use client'

import { formatPrice } from "@/Utils/formatPrice";
import Button from "@/components/universal/Button";
import Heading from "@/components/universal/Heading";
import { useCart } from "@/hooks/useCart";
import { AddressElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CheckoutFormProps{
    clientSecret:string;
    handelSetPaymentSuccess: (value:boolean) => void;
}
const CheckoutForm: React.FC<CheckoutFormProps> = ({clientSecret,handelSetPaymentSuccess}) => {

    const {cartTotalAmount,handleClearCart,handelSetPaymentIntent} = useCart()
    const stripe = useStripe()
    const elements = useElements()
    const [isLoading , setIsLoading] = useState(false)
    const formattedPrice = formatPrice(cartTotalAmount)

    useEffect(() => {

        if (!stripe) {
            return
        }
        if (!clientSecret) {
            return
        }

        handelSetPaymentSuccess(false);
    },[stripe])

    const handelSubmit = async(e:React.FormEvent) => {
        e.preventDefault();

        if(!stripe || !elements){
            return
        }

        setIsLoading(true);

        stripe.confirmPayment({
            elements,redirect:'if_required'
        }).then(result => {

            //we are having an error here which we have to resolve
            // we have to change result.error to !result.error 
            if (!result.error) {
                toast.success('Checkout Success')

                handleClearCart()
                handelSetPaymentSuccess(true)
                handelSetPaymentIntent(null)
            }
        setIsLoading(false);
        })
    }

    return ( <form onSubmit={handelSubmit} id="payment-form">
        <div className="mb-6 ">
            <Heading title="Enter your details to complete checkout" />
        </div>
        <h2 className=" font-semibold mb-2 ">Address Information</h2>
        <AddressElement options={{mode:'shipping', allowedCountries:['US','KE','IN']}}/>
        
        <h2 className=" font-semibold mt-4 mb-2 ">Payment Information</h2>
        <PaymentElement id="payment-element" options={{layout:"tabs"}}/>
        <div className=" py-4 text-center text-slate-700 text-xl font-bold">
            Total : {formattedPrice}
        </div>
        <Button lable={isLoading? 'Processing':'Pay now'} disabled={isLoading || !stripe || !elements} onClick={()=>{}}/>
    </form> );
}
export default CheckoutForm;