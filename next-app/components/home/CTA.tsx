import React from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const CTA = () => {
  return (
    <section className="w-full py-10 md:mb-10 md:pb-10 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:1000ms]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl">
                Ready to Transform Your Streams?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl">
                Join MusicStreamChoice today and create unforgettable
                experiences.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <form className="flex space-x-2">
                <Input
                  className="max-w-lg flex-1 border-stone-700 bg-stone-800 text-white placeholder-gray-500"
                  placeholder="Enter your email"
                  type="email"
                />
                <Button
                  type="submit"
                  className="bg-purple-600 text-white hover:bg-purple-700"
                >
                  Sign Up
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
  )
}

export default CTA