import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import Image from 'next/image'


const Hero = () => {
  return (
    <main className="flex-1 py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className='flex items-center justify-center my-10'>
           <p className='translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms] px-3 pl-1 py-2 bg-stone-900 border border-stone-600 rounded-full text-white text-xs'><span className='px-2 mr-1 bg-white py-1 border rounded-full text-black '>new</span> Latest integration just arrived</p>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center mb-10">
            <div className="space-y-2">
              <h1 className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:500ms] text-2xl text-center font-bold tracking-tighter text-white md:text-5xl lg:text-6xl/none">
                Let Your Fans Choose the Beat
              </h1>
              <p className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms] mx-auto text-center max-w-[700px] text-gray-400 md:text-xl text-sm">
                Empower your audience to curate your music stream. <br className='hidden md:block' /> Connect with
                fans like never before.
              </p>
            </div>
            <div className="space-x-4 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:700ms]">
              <Button className=''>
                <Link href="/signin">Get Started</Link>
              </Button>
              <Button variant="secondary">
                Learn More
              </Button>
            </div>
          </div>
        </div>
          
          <div className='translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms] relative items-center justify-center rounded-lg md:mt-20 md:w-[900px] bg-stone-900 backdrop-blur-sm bg-opacity-80 lg:w-[1300px]  mx-auto border px-2 py-2 border-stone-800'>
          <div className="glow absolute bottom-30 -top-1 -z-10 aspect-square md:flex items-center justify-center  w-full h-[20rem] max-w-4xl rounded-full bg-[#737373] opacity-50 blur-3xl filter hidden" />
          <div className="glow absolute bottom-1 right-56 -z-10 aspect-square flex items-center justify-center  w-full h-[20rem] max-w-4xl rounded-full bg-[#737373] opacity-50 blur-3xl filter" />
            <Image src="/hero.png" alt='hero' width={1300} height={793} className='border  border-stone-800 rounded-lg' />
          </div>
      </main>
  )
}

export default Hero