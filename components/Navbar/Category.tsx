'use client'

import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { useCallback } from "react";
import { IconType } from "react-icons";
import { Suspense } from 'react';

interface CategoryProps{
    label: string;
    icon : IconType
    selected?: boolean
}

const CategoryComponent:React.FC<CategoryProps> = ({label , icon:Icon,selected}) => {
   const router = useRouter();
   const params = useSearchParams()
   const handelClick = useCallback(()=>{
    
    if (label === 'All') {
        router.push('/')

    }else{
        let currentQuery = {};

        if (params) {
            currentQuery = queryString.parse(params.toString())
        }

        const updatedQuery:any = {
            ...currentQuery,
            category : label,

        } 

        const url = queryString.stringifyUrl({
            url : '/',
            query : updatedQuery
        },
        {
            skipNull : true,
        }
        )
        router.push(url)
    }
   },[label , params , router])
   
    return ( 
    
            <div onClick={handelClick} className={` flex items-center justify-center text-center gap-1 p-2 border-b-2 hover:text-slate-800 transition cursor-pointer
            ${selected?" border-b-sky-800 text-slate-800":" border-transparent text-slate-500"}`}>
                <Icon size={20}/>
                <div className=" font-medium text-sm">{label}</div>
            </div>
     );
}
 
const Category: React.FC<CategoryProps> = (props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryComponent {...props} />
    </Suspense>
  );
export default Category;