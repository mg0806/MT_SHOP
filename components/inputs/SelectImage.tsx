'use client'

import { ImageType } from "@/app/admin/add-products/AddProductForm"
import { useCallback } from "react"
import {useDropzone} from 'react-dropzone'

interface SelectImageProps{
    item?: ImageType
    handelFileChange : (value:File) => void
}

const Selectimage:React.FC<SelectImageProps> = ({item , handelFileChange}) => {

    const onDrop = useCallback((acceptedFiles: File[]) => {
        
        if (acceptedFiles.length > 0 ) {
            handelFileChange(acceptedFiles[0])
        }
        }, [handelFileChange])
        const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop,
    accept : {'image/*' : [".jpeg" , ".png" , ".jpg"]}
    })
    
    return (  

        <div {...getRootProps()} className=" border-2 border-slate-400 p-2 border-dashed cursor-pointer text-sm font-normal text-slate-400 items-center justify-center ">
            <input {...getInputProps()}/>

            {isDragActive ? (<p>Drop Image Here...</p>) : (<p> {item?.color} Image</p>)}
        </div>
    );
}
 
export default Selectimage;