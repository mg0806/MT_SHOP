import Navbar from '@/components/Navbar/Navbar'
import './globals.css'
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import Footer from '@/components/Footer/Footer'
import { SpeedInsights } from "@vercel/speed-insights/next"

const poppins = Poppins({ subsets: ['latin'],weight:['400','700'] })

export const metadata: Metadata = {
  title: 'MT-SHOP',
  description: 'E-commerce website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} text-slate-700`}>


        <div className='felx flex-col min-h-screen'>
        <Navbar/>
        <main className='flex-grow'>{children}</main>

        <Footer/>


        </div>



        </body>

    </html>
  )
}
