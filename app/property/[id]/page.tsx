import { supabase, Property } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Shield, Clock, CheckCircle, ArrowLeft, FileText } from 'lucide-react'
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
      
      <div className="min-h-screen bg-gray-50/50 pb-20 pt-8">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary mb-8 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>

          {/* Main Grid Layout - 3 Columns on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* KIRI: Konten Utama (Gambar, Judul, Deskripsi) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Gambar Hero */}
              <div className="relative w-full aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden bg-gray-100 shadow-md border border-gray-200/50">
                <Image
                  src={property.image_url || '/placeholder.jpg'}
                  alt={property.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                <Badge className="absolute top-4 left-4 bg-white/90 text-primary hover:bg-white backdrop-blur-md border-0 px-4 py-1.5 shadow-sm text-sm">
                  {property.category}
                </Badge>
              </div>

              {/* Info Header */}
              <div className="space-y-4 pb-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5 text-accent" />
                      <span className="text-lg font-medium">{property.location}</span>
                    </div>
                  </div>
                  
                  {/* Rating Badge */}
                  <div className="flex items-center gap-1.5 bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-100 h-fit shrink-0">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-yellow-700 text-lg">{property.rating}</span>
                    <span className="text-yellow-600/70 text-sm">(120 ulasan)</span>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Deskripsi Barang</h2>
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                  {property.description || 'Barang berkualitas tinggi yang siap membantu aktivitas Anda. Kondisi terawat dan siap pakai. Cocok untuk mahasiswa yang butuh solusi praktis tanpa harus membeli barang baru.'}
                </p>
              </div>

              {/* Yang Termasuk */}
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Yang Termasuk dalam Sewa</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Barang kondisi 100% prima', 'Tas / Case pelindung original', 'Kabel & Aksesoris bawaan', 'Asuransi kerusakan minor'].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                      <span className="text-gray-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* KANAN: Sticky Checkout Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-8 space-y-6">
                
                {/* Harga */}
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Tarif Sewa</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-primary">
                      Rp {property.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-gray-500 font-medium">/ hari</span>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Tombol Sewa */}
                <Link href={`/checkout/${property.id}`} className="block">
                  <Button 
                    size="lg" 
                    className="w-full bg-accent hover:bg-accent-hover text-primary rounded-2xl h-14 text-lg font-bold shadow-lg shadow-accent/20 transition-all hover:-translate-y-1"
                  >
                    Mulai Sewa Sekarang
                  </Button>
                </Link>

                {/* Info Tambahan & Syarat Ketentuan */}
                <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-xs text-gray-500 mb-3 text-center">
                    Dengan mengklik tombol sewa, Anda menyetujui:
                  </p>
                  <a 
                    href="https://docs.google.com/document/d/1ESKFlI4zH6Ew9G7WFWTaIskqHBgHUD6sTEmiBur7kXE/edit?usp=drive_web" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-primary hover:text-accent flex items-center justify-center gap-2 transition-colors"
                  >
                    <FileText className="size-4" />
                    Syarat & Ketentuan Sewa
                  </a>
                </div>

                {/* Trust Badges Grid */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                  <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                    <Shield className="w-6 h-6 text-blue-500" />
                    <span className="text-xs font-bold text-gray-700">Terverifikasi</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                    <Clock className="w-6 h-6 text-green-500" />
                    <span className="text-xs font-bold text-gray-700">Respon Cepat</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}