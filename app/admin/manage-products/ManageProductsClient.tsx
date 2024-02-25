'use client'

import { Product } from "@prisma/client";
import {DataGrid, GridColDef} from '@mui/x-data-grid'
import { formatPrice } from "@/Utils/formatPrice";
import Heading from "@/components/universal/Heading";
import Status from "@/components/Status";
import { MdCached, MdClose, MdDelete, MdDone, MdRemoveRedEye } from "react-icons/md";
import ActionBtn from "@/components/ActionBtn";
import { useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { deleteObject, getStorage, ref } from "firebase/storage";
import firebaseApp from "@/libs/firebase";

interface ManageProductClientProps{
    products : Product[]
}

const ManageProductsClient: React.FC<ManageProductClientProps> = ({products}) => {

    const router = useRouter()
    const storage = getStorage(firebaseApp)

    let rows:any = []
    if (products) {
        rows = products.map((product) =>{
            return{
                id: product.id,
                name: product.name,
                price : formatPrice(product.price) ,
                category : product.category,
                brand : product.brand,
                inStock : product.inStock,
                images : product.images,
            }
        })
    }

    const columns : GridColDef[] = [
        {field : 'id', headerName: 'ID', width: 220},
        {field : 'name', headerName: 'Name', width: 220},
        {field : 'price', headerName: 'Price(INR)', width: 100 ,
        renderCell:(params)=>{
            return (
                <div className=" font-bold text-slate-800">{params.row.price}</div>
            )
        }},
        {field : 'category', headerName: 'Category', width: 100},
        {field : 'brand', headerName: 'Brand', width: 100},
        {field : 'inStock', headerName: 'inStock', width: 120 ,
        renderCell:(params)=>{
            return (
                <div>{params.row.inStock === true ? <Status text="In Stock" icon={MdDone} bg="bg-teal-200" color=" text-teal-700"/>:<Status text="Out of Stock" icon={MdClose} bg="bg-rose-200" color=" text-rose-700"/>}</div>
            )
        }},
        {field : 'action', headerName: 'Action', width: 200,
        renderCell:(params)=>{
            return (
                <div className=" flex justify-between gap-4 w-full" >
                    <ActionBtn icon={MdCached} onClick={()=>{handelToggleStock(params.row.id, params.row.inStock) }}/>
                    <ActionBtn icon={MdDelete} onClick={()=>{handelDelete(params.row.id,params.row.images)}}/>
                    <ActionBtn icon={MdRemoveRedEye} onClick={()=>{router.push(`products/${params.row.id}`)}}/>
                </div>
            )
        }},

    ]

    const handelToggleStock = useCallback((id : string , inStock:boolean)=>{
        axios.put('/api/product',{
            id,
            inStock: !inStock
        }).then((res)=>{
            toast.success('Product Status updated')
            router.refresh()
        }).catch((err)=>{
            toast.error('Something went wrong')
            console.log(err);
            
        })

    },[])

    const handelDelete = useCallback(async(id:string,images :any[])=>{
        toast('Deleting product , Please Wait')

        const handelImageDelete = async ()=>{
            try {
                for(const item of images){
                    if (item.image) {
                        const imageRef = ref(storage, item.image);
                        await deleteObject(imageRef)
                        console.log('image deleted',item.image);
                        
                    }
                }
            } catch (error) {
                return console.log("Deleting Images error",error);
                
            }
        }

        await handelImageDelete()

        axios.delete(`/api/product/${id}`).then((res)=>{
            toast.success('Product Deleted')
            router.refresh()
        }).catch((err)=>{
            return console.log("Deleting Images error",err);
        })
    },[])
    return ( 

        <div className=" max-w-[1150px] m-auto text-xl">
            <div className=" mb-4 mt-8">
                <Heading title="Manage Products" center/>
            </div>
            <div style={{height:600, width: "100%"}}>

            <DataGrid
    rows={rows}
    columns={columns}
    initialState={{
    pagination: {
    paginationModel: { page: 0, pageSize: 9 },
    },
    }}
    pageSizeOptions={[9, 20]}
    checkboxSelection
    disableRowSelectionOnClick
/>
            </div>
        </div>
    );
}
 
export default ManageProductsClient;