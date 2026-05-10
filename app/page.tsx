"use client"

import { useState, useEffect } from 'react'
import { supabase, type Property } from '@/lib/supabase'
import PropertyCard from '@/components/ui/property-card'
import Navbar from '@/components/ui/navbar'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Camera, 
  Laptop, 
  BookOpen, 
  Palette, 
  Mic2, 
  Gamepad2, 
  LayoutGrid,
  Loader2
} from 'lucide-react'

export default function HomePage() {
  // State untuk nyimpen data dan filter
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // State untuk input user
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("Semua")

  // List kategori
  const categories = [
    { name: 'Semua', icon: <LayoutGrid className="size-5" /> },
    { name: 'Elektronik & Multimedia', icon: <Camera className="size-5" /> },
    { name: 'Gadget & Teknologi', icon: <Laptop className="size-5" /> },
    { name: 'Peralatan Akademik', icon: <BookOpen className="size-5" /> },
    { name: 'Peralatan Kreatif', icon: <Palette className="size-5" /> },
    { name: 'Event & Organisasi', icon: <Mic2 className="size-5" /> },
    { name: 'Hiburan', icon: <Gamepad2 className="size-5" /> },
  ]

  // 1. Ambil data dari Supabase saat web pertama kali dibuka
  useEffect(() => {
    async function fetchProperties() {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching properties:', error)
      } else if (data) {
        setAllProperties(data)
        setFilteredProperties(data) // Default tampilkan semua
      }
      setIsLoading(false)
    }

    fetchProperties()
  }, [])

  // 2. Logika Filter (Otomatis jalan tiap kali user ngetik atau klik kategori)
  useEffect(() => {
    let result = allProperties

    // Filter berdasarkan Kategori
    if (activeCategory !== "Semua") {
      result = result.filter(p => 
        p.category?.toLowerCase().includes(activeCategory.toLowerCase())
      )
    }

    // Filter berdasarkan Teks Pencarian (Nama Barang)
    if (searchQuery.trim() !== "") {
      result = result.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredProperties(result)
  }, [searchQuery, activeCategory, allProperties])

  // Fungsi buat scroll mulus ke bawah pas klik "Cari Sekarang"
  const scrollToCatalog = () => {
    document.getElementById('katalog-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="relative bg-primary py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Sewa Peralatan Kuliah <br />
            <span className="text-accent">Makin Gampang & Murah</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Cari kamera, laptop, sampai alat presentasi buat kebutuhan tugas atau event kampus lo di EduRent.
          </p>

          {/* SEARCH BOX INTERAKTIF */}
          <div className="max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 gap-3 text-gray-400">
              <Search className="size-5" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lagi butuh alat apa nih?" 
                className="w-full py-3 bg-transparent border-none focus:ring-0 text-gray-900 outline-none"
              />
            </div>
            <div className="h-10 w-px bg-gray-200 hidden md:block self-center"></div>
            <div className="flex-1 flex items-center px-4 gap-3 text-gray-400">
              <LayoutGrid className="size-5" />
              <select 
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full py-3 bg-transparent border-none focus:ring-0 text-gray-900 outline-none appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <Button 
              onClick={scrollToCatalog}
              className="bg-accent hover:bg-accent-dark text-primary font-bold px-8 py-6 rounded-xl transition-all"
            >
              Cari Sekarang
            </Button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main id="katalog-section" className="container mx-auto px-4 py-16">
        
        {/* KATEGORI CHIPS INTERAKTIF */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.name
            return (
              <button 
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-2 transition-all px-5 py-2.5 rounded-full shadow-sm border font-medium text-sm
                  ${isActive 
                    ? 'bg-primary text-white border-primary scale-105' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                  }
                `}
              >
                {cat.icon}
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* SECTION PRODUK */}
        <div className="space-y-16">
          <div>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {activeCategory === "Semua" ? "Katalog Peralatan" : `Kategori: ${activeCategory}`}
                </h2>
                <p className="text-gray-500">
                  {searchQuery ? `Hasil pencarian untuk "${searchQuery}"` : 'Barang-barang terbaru yang siap lo sewa'}
                </p>
              </div>
              <span className="text-sm font-medium text-primary bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                Total {filteredProperties.length} Barang
              </span>
            </div>

            {/* GRID CARD - Tampil berdasarkan filter */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="size-10 text-primary animate-spin mb-4" />
                <p className="text-gray-500">Mencari peralatan di gudang...</p>
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                <Search className="size-16 text-gray-200 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900">Barang Nggak Ketemu</h3>
                <p className="text-gray-500 mt-2">Coba pakai kata kunci lain atau pilih kategori "Semua".</p>
                <Button 
                  onClick={() => {
                    setSearchQuery('')
                    setActiveCategory('Semua')
                  }}
                  variant="outline" 
                  className="mt-6"
                >
                  Reset Pencarian
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}