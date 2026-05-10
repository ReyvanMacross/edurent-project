'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  // State untuk buka/tutup menu di mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* LOGO */}
        <Link href="/" className="text-2xl font-bold tracking-tight text-primary">
          Edu<span className="text-shadow-black">Rent</span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium hover:text-accent transition-colors">
            Home
          </Link>
          <Link href="/properties" className="text-sm font-medium hover:text-accent transition-colors">
            Browse
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-accent transition-colors">
            Contact
          </Link>
        </div>

        {/* CTA BUTTON DESKTOP */}
        <div className="hidden md:block">
          <Link href="/track">
            <Button className="bg-primary hover:bg-primary-dark text-white rounded-full px-6">
              Lacak Pesanan
            </Button>
          </Link>
        </div>

        {/* HAMBURGER BUTTON (MOBILE ONLY) */}
        <button
          className="md:hidden p-2 text-primary"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-4 shadow-lg absolute w-full">
          <Link
            href="/"
            className="block text-base font-medium text-gray-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/properties"
            className="block text-base font-medium text-gray-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Browse
          </Link>
          <Link
            href="/contact"
            className="block text-base font-medium text-gray-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <Link
            href="/track"
            className="block text-base font-bold text-primary"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Lacak Pesanan
          </Link>
        </div>
      )}
    </nav>
  )
}