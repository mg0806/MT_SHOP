'use client'


import { Rating } from '@mui/material';
import Image from 'next/image';


interface ProductDetailsProps{
    product:any;
}

const HorizontalLine = ()=>{
    return <hr className='w-[30%] my-2' />
}

const ProductDetails:React.FC<ProductDetailsProps> = ({product}) => {
   
    const productRating = product.reviews.reduce((acc:number,item:any)=> item.rating + acc ,0)/product.reviews.length;
   
    return ( 

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            <div>Images</div>
            <div className='flex flex-col gap-1 text-slate-500 text-sm'>
                <h2 className='text-3xl font-medium text-slate-700'>{product.name}</h2>
                <div className='flex items-center gap-2'>
                <Rating value={productRating} readOnly/>
                <div>{product.reviews.length} reviews</div>
            </div>
            <HorizontalLine/>

            <div className='text-justify'>{product.description}</div>
            <HorizontalLine/>
            <div>
                <span className=' font-semibold'>CATEGORY:</span>
                {product.category}
            </div>
            <div>
                <span className=' font-semibold'>BRAND:</span>
                {product.brand}
            </div>
            <div className={product.inStock ? 'text-teal-400':' text-red-400'}>{product.inStock ? "In Stock" : "Out of Stock"}</div>
            <HorizontalLine/>
            <div>Color</div>
            <HorizontalLine/>
            <div>Quantity</div>
            <HorizontalLine/>
            <div>Add to Cart</div>
            </div>
            
        </div>
     );
}
 
export default ProductDetails;