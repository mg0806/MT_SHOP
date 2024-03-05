import Navbar from '@/components/Navbar/Navbar'
import './globals.css'
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import Footer from '@/components/Footer/Footer'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import CartProvider from '../providers/cartProviders';
import { Toaster } from 'react-hot-toast'
import { Suspense } from 'react'

const poppins = Poppins({ subsets: ['latin'],weight:['400','700'] })

export const metadata: Metadata &{ image: { url: string; alt: string } } = {
  title: 'MT-SHOP',
  description: 'E-commerce website',
  // Image metadata
  image: {
    url: '/mtlogo.webp',
    alt: 'Website Image',
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  

  return (
    <html lang="en">

<head>
        {/* Open Graph Protocol meta tags */}
        <meta property="og:title" content={String(metadata.title)} />
        <meta property="og:description" content={String(metadata.description)} />
        <meta property="og:image" content={metadata.image.url} />
        <meta property="og:image:alt" content={metadata.image.alt} />
        {/* Other meta tags */}
        {/* ... */}
      </head>

      <body className={`${poppins.className} text-slate-700`}>
        <Toaster toastOptions={{style:{
          background:"rgb(51 65 85)",
          color: '#FFFFFF',
        }}}/>
      <CartProvider>
      <div className='flex flex-col min-h-screen'>
      <Suspense>
        <Navbar/>
        </Suspense>
        <main className=' flex-grow'>{children}</main>
        <Footer/>
        </div>
      </CartProvider>
        

        <Analytics />
        <SpeedInsights />

        </body>

    </html>
  )
}
