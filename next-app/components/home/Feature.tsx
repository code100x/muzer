import { Headphones, Radio, Users } from 'lucide-react'
import React from 'react'

const Feature = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
    <div className="container px-4 md:px-6 animate-fade-in opacity-0 [--animation-delay:700ms]">
      <h2 className="mb-8 text-center text-2xl font-bold tracking-tighter text-white sm:text-3xl">
        Key Features
      </h2>
      <div className="grid gap-8 sm:grid-cols-3">
        <div className="flex flex-col items-center space-y-3 text-center">
          <Users className="h-12 w-12 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Fan Interaction</h3>
          <p className="text-gray-400">Let fans choose the music.</p>
        </div>
        <div className="flex flex-col items-center space-y-3 text-center">
          <Radio className="h-12 w-12 text-green-400" />
          <h3 className="text-xl font-bold text-white">Live Streaming</h3>
          <p className="text-gray-400">Stream with real-time input.</p>
        </div>
        <div className="flex flex-col items-center space-y-3 text-center">
          <Headphones className="h-12 w-12 text-blue-400" />
          <h3 className="text-xl font-bold text-white">
            High-Quality Audio
          </h3>
          <p className="text-gray-400">Crystal clear sound quality.</p>
        </div>
      </div>
    </div>
  </section>
  )
}

export default Feature