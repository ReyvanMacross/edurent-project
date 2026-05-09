import { supabase, Property } from '@/lib/supabase'
import PropertyCard from '@/components/ui/property-card'
import Navbar from '@/components/ui/navbar'
import { Button } from '@/components/ui/button'

export const revalidate = 0 // Disable cache untuk development

async function getProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }

  return data as Property[]
}

export default async function HomePage() {
  const properties = await getProperties()

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-gray-900 text-white py-20 md:py-32 overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Sewa Barang Antar Mahasiswa
              <span className="text-accent"> Mudah & Aman</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Platform rental terpercaya untuk mahasiswa. Dari kamera, tenda camping, hingga drone - semua ada di sini.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-accent hover:bg-accent-hover text-black font-semibold">
                Mulai Sewa Sekarang
              </Button>
              <Button size="lg" variant="outline" className="border-white text-black hover:bg-white hover:text-primary">
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Barang Tersedia
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pilih dari berbagai kategori barang berkualitas yang siap disewa dengan harga terjangkau
            </p>
          </div>

          {/* Responsive Grid: 1 col mobile, 2 col tablet, 4 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {properties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada barang tersedia. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}