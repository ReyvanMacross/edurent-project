import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Star } from 'lucide-react'
import type { Property } from '@/lib/supabase'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/property/${property.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-0">
        {/* Image Container */}
        <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
          <Image
            src={property.image_url || '/placeholder.jpg'}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 text-primary backdrop-blur-sm border-0">
              {property.category}
            </Badge>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {property.rating}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-accent transition">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
            <MapPin className="w-4 h-4" />
            <span>{property.location}</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary">
                Rp {property.price.toLocaleString('id-ID')}
              </span>
              <span className="text-gray-500 text-sm ml-1">/hari</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}