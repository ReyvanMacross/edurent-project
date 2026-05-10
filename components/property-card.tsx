import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Property } from '@/lib/supabase'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/property/${property.id}`} className="group block">
      {/* Menggunakan base Card Shadcn */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white rounded-2xl h-full flex flex-col">
        
        {/* BAGIAN GAMBAR */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <Image
            src={property.image_url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop'} // Fallback image
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          
          {/* Badge Kategori Kiri Atas */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-800 shadow-sm capitalize">
              {property.category}
            </span>
          </div>

          {/* Badge Rating Kanan Atas */}
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm text-xs font-bold rounded-md text-yellow-400">
              <Star className="size-3 fill-yellow-400" />
              {property.rating}
            </span>
          </div>
        </div>

        {/* BAGIAN INFORMASI BAWAH */}
        <CardContent className="p-4 md:p-5 flex flex-col flex-grow">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1 group-hover:text-accent transition-colors">
            {property.title}
          </h3>
          
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <MapPin className="size-4 mr-1 text-gray-400" />
            <span className="line-clamp-1">{property.location}</span>
          </div>

          {/* Spacer biar harga selalu di bawah kalau judulnya beda baris */}
          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">Mulai dari</span>
              <span className="text-lg font-bold text-gray-900">
                Rp {new Intl.NumberFormat('id-ID').format(property.price)}
                <span className="text-sm font-normal text-gray-500">/hari</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}