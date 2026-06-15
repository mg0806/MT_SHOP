export const revalidate = 0;


import HomeBanner from '@/components/Navbar/HomeBanner'
import Container from '@/components/universal/Container'
import ProductCard from '@/components/Products/ProductCard';
import getProducts, { IProductParams } from '@/actions/getProduct';
import NullData from '@/components/NullData';
import getCategories from '@/actions/getCategories';
import Link from 'next/link';

interface HomeProps{
  searchParams : Promise<IProductParams>
}

export default async function Home({searchParams}:HomeProps) {

  const resolvedSearchParams = await searchParams
  const products = await getProducts(resolvedSearchParams)
  const categories = await getCategories()

  if (products.length === 0) {
    return <NullData title='No Products Found. Click "All" to clear filters'/>
  }

  function shuffleArray(array:any){
    for (let i = array.length-1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [array[i] , array[j]] = [array[j] , array[i]] 
      
    }

    return array
  }


  const shuffleProducts = shuffleArray(products)
  return (
    <div className='px-3 py-5 sm:px-8 sm:py-8'>
      <Container>
        <div>
          <HomeBanner/>
        </div>
        <div className="mt-0 overflow-hidden bg-[var(--color-surface-2)] py-4">
          <div className="marquee-track flex w-max whitespace-nowrap text-[13px] font-black uppercase tracking-[0.18em] text-[var(--color-primary)]">
            {Array.from({ length: 6 }).map((_, index) => (
              <span key={index} className="mx-6">
                Limited drops - Flat 20% off - COD available - Express delivery
              </span>
            ))}
          </div>
        </div>
        <div className="mt-10 flex items-end justify-between gap-4 border-b border-[var(--color-border)] pb-4 sm:mt-12">
          <div>
            <p className="fashion-kicker">Latest collection</p>
            <h2 className="mt-1 text-3xl font-black uppercase text-[var(--color-primary)] sm:text-5xl">New Arrivals</h2>
            <p className="mt-2 text-sm text-[var(--color-secondary)]">June drop - everyday statement pieces</p>
          </div>
          <Link href="/" className="hidden text-xs font-black uppercase tracking-[0.16em] text-[var(--color-accent)] sm:block">
            View all
          </Link>
        </div>
        <div className='mt-6 grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 sm:gap-x-4 md:grid-cols-3 lg:mt-8 lg:grid-cols-4 lg:gap-8'>
          {shuffleProducts.map((product:any)=>{
            return <ProductCard data={product} key={product.id}></ProductCard>;
          })}
        </div>
        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {categories.slice(0, 3).map((category) => (
            <Link
              key={category.id}
              href={`/?category=${encodeURIComponent(category.name)}`}
              className="group flex min-h-[150px] items-end justify-between gap-3 border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition hover:border-[var(--color-accent)] sm:min-h-[180px] sm:p-5"
            >
              <span className="text-2xl font-black uppercase sm:text-3xl">{category.name}</span>
              <span className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-accent)]">
                Shop all
              </span>
            </Link>
          ))}
        </section>
        <section className="mt-16 border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:grid md:grid-cols-[1fr_1.4fr] md:p-10">
          <div>
            <p className="fashion-kicker">Trusted by shoppers</p>
            <h2 className="mt-2 text-5xl font-black uppercase leading-none md:text-7xl">50,000+</h2>
            <p className="mt-3 text-[var(--color-secondary)]">Happy customers across India</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 md:mt-0">
            {["Fast delivery", "Secure payment", "Easy returns"].map((item) => (
              <div key={item} className="border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                <p className="text-xl font-black text-[var(--color-accent)]">★★★★★</p>
                <p className="mt-3 text-sm font-bold uppercase">{item}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="mt-16 grid overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] md:grid-cols-2">
          <div className="p-5 sm:p-6 md:p-10">
            <p className="fashion-kicker">Mobile app</p>
            <h2 className="mt-2 text-3xl font-black uppercase leading-none sm:text-5xl">Shop faster on the app</h2>
            <p className="mt-4 max-w-md text-[var(--color-secondary)]">
              Scan, save your wishlist, track orders, and get first access to limited drops.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="grid h-28 w-28 grid-cols-7 gap-1 bg-white p-2">
                {Array.from({ length: 49 }).map((_, index) => (
                  <span
                    key={index}
                    className={
                      [0, 1, 2, 7, 14, 42, 43, 44, 35, 28, 4, 5, 6, 11, 13, 20, 21, 27, 30, 34, 38, 40, 45, 48].includes(index)
                        ? "bg-black"
                        : "bg-white"
                    }
                  />
                ))}
              </div>
              <div className="flex flex-col justify-end gap-3">
                <button className="border border-[var(--color-border)] px-5 py-3 text-xs font-black uppercase">App Store</button>
                <button className="border border-[var(--color-border)] px-5 py-3 text-xs font-black uppercase">Google Play</button>
              </div>
            </div>
          </div>
          <div className="flex min-h-[320px] items-end justify-center bg-[var(--color-bg)] p-8">
            <div className="h-72 w-36 rounded-[28px] border-4 border-[var(--color-primary)] bg-[var(--color-surface-2)] p-3 shadow-2xl">
              <div className="h-full border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                <div className="h-24 bg-[var(--color-accent)]" />
                <div className="mt-3 h-3 bg-[var(--color-primary)]" />
                <div className="mt-2 h-3 w-2/3 bg-[var(--color-secondary)]" />
              </div>
            </div>
          </div>
        </section>
      </Container>
    </div>
  )
}
