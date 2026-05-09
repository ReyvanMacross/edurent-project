import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Edu<span className="text-accent">Rent</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium hover:text-accent transition">
            Home
          </Link>
          <Link href="/properties" className="text-sm font-medium hover:text-accent transition">
            Browse
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-accent transition">
            Contact
          </Link>
        </div>

        <Button className="bg-cyan-800 hover:bg-accent-hover">
          List Your Item
        </Button>
      </div>
    </nav>
  )
}