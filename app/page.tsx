/* eslint-disable react/jsx-key */
import { products } from '@/Utils/products'
import HomeBanner from '@/components/Navbar/HomeBanner'
import Container from '@/components/universal/Container'
import Image from 'next/image'
import { truncateText } from '../Utils/truncateText';
import ProductCard from '@/components/Products/ProductCard';

export default function Home() {
  return (
    <div className=' p-8'>
      <Container>
        <div>
          <HomeBanner/>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4  m-4 mt-8 gap-8 '>
          {products.map((product:any)=>{
            return <ProductCard data={product}></ProductCard>;
          })}
        </div>
      </Container>
    </div>
  )
}
