'use client'

import Input from "@/components/inputs/input";
import Button from "@/components/universal/Button";
import Heading from "@/components/universal/Heading";
import { useState } from "react";
import { FieldValues, useForm ,SubmitHandler} from "react-hook-form";
import Link from 'next/link';
import { AiOutlineGoogle } from "react-icons/ai";

const LoginForm = () => {

    const [isLoading,setIsLoading] = useState(false);
    const {register,handleSubmit,formState:{errors}} = useForm<FieldValues>({

        defaultValues: {
            email:'',
            password:''
        }

    })

    const onSubmit : SubmitHandler<FieldValues> = (data) => {

        setIsLoading(true)
        console.log(data)

    }
    return ( 

        <>
        
        <Heading title="Sign in to MT-Shop"/>

        <Button outline lable="continue with Google" icon={AiOutlineGoogle} onClick={()=>{}}/>
        <hr className=" bg-slate-300 w-full h-px"/>
        <Input id="email" label="Email" disabled={isLoading} register={register} errors={errors} required/>
        <Input id="password" label="Password" disabled={isLoading} register={register} errors={errors} required type="password"/>
        <Button lable = {isLoading ? "Loading" : "Login"} onClick={handleSubmit(onSubmit)}/>

        <p className="text-sm ">Don&apos;t have a account? 
            <Link className="underline " href="/Register"> Sign up</Link>
        </p>
        </>
        );
}
export default LoginForm;