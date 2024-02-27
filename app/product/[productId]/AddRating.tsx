'use client'
import { Product, Review ,Order} from "@prisma/client";
import { SafeUser } from '@/types';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FieldValue, FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Heading from "@/components/universal/Heading";
import { Rating } from "@mui/material";
import Input from "@/components/inputs/input";
import Button from "@/components/universal/Button";
import toast from "react-hot-toast";
import { product } from '../../../Utils/product';
import axios from "axios";

interface AddRatingProps{
    product:Product & {
        reviews : Review[]
    };
    user:(SafeUser & {
        orders:Order[]
    }) | null
}


    const AddRating : React.FC<AddRatingProps> = ({product , user}) => {

        const [isLoading , setIsLodaing] = useState(false)
        const router = useRouter()

        const {register,handleSubmit,setValue,reset,formState:{errors}} = useForm<FieldValues>({

            defaultValues:{
                comment: '',
                rating : 0

            }
        })

        const setCustomValue = (id:string,value:any)=>{
            setValue(id,value,{
                shouldDirty:true,
                shouldTouch:true,
                shouldValidate:true,
            })
        }

        const onSubmit : SubmitHandler<FieldValues> = async(data)=>{
            setIsLodaing(true)
            if (data.rating === 0) {
                setIsLodaing(false)
                return toast.error(' Please Select Rating')
                
            }
            const ratingData = {...data,userId:user?.id , product:product}

            axios.post('/api/rating' , ratingData).then(()=>{
                toast.success('Rating Submitted')
                router.refresh()
                reset()
            }).catch((error)=>{
                toast.error('Something went wrong')
            }).finally(()=>{
                setIsLodaing(false)
            })
            console.log("ratingData",ratingData);
            
                        
        }


        if (!user || !product) {
            return null;
        }

        const deliveredOrder = user?.orders.some(order => order.products.find(item => item.id === product.id)  && order.deliveryStatus === "delivered")

    const userReview = product?.reviews.find(((review : Review)=>{
        return review.userId === user.id
    }))

    if (userReview || !deliveredOrder) {
        return null
    }

        return ( 

            <div className=" flex flex-col gap-2 max-w-[500px] mt-16 ">
            <Heading title="Rate this product"/>
            <Rating onChange={(event , newValue)=>{
                setCustomValue('rating',newValue)
            }}/>
            <Input id="comment" label="Comment" disabled={isLoading} register={register} errors={errors} required/>
            <Button lable={isLoading?"Loading":"Rate Product"} onClick={handleSubmit(onSubmit)}/>
            </div>
         );
    }
     
    export default AddRating;
