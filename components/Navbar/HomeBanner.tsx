import Image from "next/image";
const HomeBanner = () => {
    return (  
        <div className="relative bg-gradient-to-r from-red-300 to-sky-400 rounded-xl">
            <div className="mx-auto px-8 py-12 flex flex-col gap-2 md:flex-row items-center justify-evenly">
                <div className="mb-8 md:mb-0 text-center">
                    <h1 className="text-2xl md:text-6xl font-bold text-white">Welcome to</h1>
                    <h1 className="text-2xl md:text-6xl font-bold text-white"> MT-Store</h1>
                    <p className="text-lg md:text-xl text-white mb-2"> Enjoy Your Shopping</p>
                    <p className="text-2xl md:text-5xl text-yellow-200 mb-2 font-bold"> Get 50% off</p>
                        
                </div>
                <div className="w-1/2 max-sm:w-full relative aspect-video ">
                    <Image src="/banner-image.jpg" width={800} height={800} priority={true} alt="Banner Image" className="object-contain rounded-[20px] w-auto h-auto m-auto mt-6" />
                </div>
            </div>
        </div>
    );
}
 
export default HomeBanner;