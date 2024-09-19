import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t border-stone-700 px-4 py-6 sm:flex-row md:px-6 animate-fade-in opacity-0 [--animation-delay:800ms]">
        <p className="text-xs text-gray-400">
          © 2023 MusicStreamChoice. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link
            className="text-xs text-gray-400 transition-colors hover:text-purple-400"
            href="#"
          >
            Terms of Service
          </Link>
          <Link
            className="text-xs text-gray-400 transition-colors hover:text-purple-400"
            href="#"
          >
            Privacy
          </Link>
        </nav>
      </footer>
  )
}

export default Footer