import { supabase, Property } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Calendar, Shield, Clock } from 'lucide-react'
import Navbar from '@/components/ui/navbar'

export const revalidate = 0

async function getProperty(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Property
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const property = await getProperty(id)

  if (!property) {
    notFound()
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-accent mb-6 transition">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Home
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Image */}
            <div className="space-y-4">
              <div className="relative h-64 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden bg-gray-200 shadow-xl">
                <Image
                  src={property.image_url || '/placeholder.jpg'}
                  alt={property.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                  <Shield className="w-6 h-6 mx-auto text-accent mb-2" />
                  <p className="text-xs text-gray-600 font-medium">Verified</p>
                </div>
                <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                  <Clock className="w-6 h-6 mx-auto text-accent mb-2" />
                  <p className="text-xs text-gray-600 font-medium">Fast Response</p>
                </div>
                <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                  <Calendar className="w-6 h-6 mx-auto text-accent mb-2" />
                  <p className="text-xs text-gray-600 font-medium">Flexible</p>
                </div>
              </div>
            </div>

            {/* Right: Details & CTA */}
            <div className="space-y-6">
              {/* Category & Rating */}
              <div className="flex items-center gap-3">
                <Badge className="bg-accent/10 text-accent border-0 px-3 py-1">
                  {property.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{property.rating}</span>
                  <span className="text-gray-400">(120 reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
                {property.title}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5 text-accent" />
                <span className="text-lg">{property.location}</span>
              </div>

              {/* Price Card */}
              <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 rounded-2xl shadow-lg">
                <p className="text-sm opacity-90 mb-1">Harga Sewa</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-bold">
                    Rp {property.price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-lg opacity-75">/hari</span>
                </div>
                <p className="text-sm mt-2 opacity-75">Diskon 10% untuk sewa 7+ hari</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Deskripsi</h3>
                <p className="text-gray-700 leading-relaxed">
                  {property.description || 'Barang berkualitas tinggi yang siap membantu aktivitas Anda. Kondisi terawat dan siap pakai. Cocok untuk mahasiswa yang butuh solusi praktis tanpa harus membeli barang baru.'}
                </p>
              </div>

              {/* What's Included */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Yang Termasuk</h3>
                <ul className="space-y-2">
                  {['Barang dalam kondisi prima', 'Tas/case pelindung', 'Panduan penggunaan', 'Asuransi kerusakan'].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Link href={`/checkout/${property.id}`} className="block">
                <Button size="lg" className="w-full bg-accent hover:bg-accent-hover text-black text-lg font-semibold py-6 shadow-lg">
                  Sewa Sekarang
                </Button>
              </Link>

              <p className="text-xs text-center text-gray-500">
                Dengan melanjutkan, Anda menyetujui <span className="text-accent underline">Syarat & Ketentuan</span> kami
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}