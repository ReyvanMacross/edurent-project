'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/ui/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Search, 
  Phone, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ArrowRight
} from 'lucide-react'

export default function TrackOrderPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneNumber.trim()) {
      alert('Masukkan nomor WhatsApp dulu, ngab!')
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      // Fetch data booking sekalian join ke tabel properties buat dapet nama barang & gambar
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          properties (
            title,
            image_url
          )
        `)
        .eq('guest_whatsapp', phoneNumber.trim())
        .order('created_at', { ascending: false }) // Urutkan dari yang paling baru

      if (error) throw error

      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      alert('Gagal mengambil data pesanan. Coba lagi nanti.')
    } finally {
      setIsLoading(false)
    }
  }

  // Fungsi untuk menentukan warna dan icon berdasarkan status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0 px-3 py-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Disetujui
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0 px-3 py-1 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Ditolak
          </Badge>
        )
      default: // pending
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 px-3 py-1 flex items-center gap-1">
            <Clock className="w-3 h-3 animate-pulse" /> Menunggu Konfirmasi
          </Badge>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 text-primary">
            <Search className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Lacak Pesanan</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Masukkan nomor WhatsApp yang Anda gunakan saat menyewa untuk melihat status pesanan.
          </p>
        </div>

        {/* Search Form Card */}
        <Card className="border-0 shadow-lg mb-10 overflow-hidden rounded-3xl">
          <CardContent className="p-2">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  type="text" 
                  placeholder="Contoh: 081234567890" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 border-0 bg-gray-50 rounded-2xl focus-visible:ring-2 focus-visible:ring-accent text-lg"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-14 px-8 bg-primary hover:bg-primary-dark text-white rounded-2xl text-lg font-semibold transition-all shrink-0"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cari Pesanan'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Mencari data pesanan Anda...</p>
          </div>
        ) : hasSearched && bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pesanan Tidak Ditemukan</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              Tidak ada pesanan aktif dengan nomor WhatsApp <strong>{phoneNumber}</strong>. Pastikan nomor yang Anda masukkan sama dengan saat checkout.
            </p>
            <Link href="/">
              <Button className="bg-accent hover:bg-accent-hover text-black rounded-full px-8">
                Mulai Sewa Barang
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    
                    {/* Gambar Barang (Kiri) */}
                    <div className="relative w-full sm:w-48 h-40 sm:h-auto bg-gray-100 shrink-0">
                      <Image 
                        src={booking.properties?.image_url || '/placeholder.jpg'}
                        alt={booking.properties?.title || 'Barang Rental'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 200px"
                      />
                    </div>

                    {/* Info Pesanan (Kanan) */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-md">
                            ID: {booking.id.split('-')[0]}
                          </p>
                          {getStatusBadge(booking.status)}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1">
                          {booking.properties?.title}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Total: <strong className="text-primary">Rp {booking.total_price.toLocaleString('id-ID')}</strong></p>
                          <p>Durasi: {booking.duration_days} Hari</p>
                        </div>
                      </div>

                      {/* Action Button: Kalau pending/rejected, kasih tombol cek/upload bukti bayar */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                        <Link href={`/payment/${booking.id}`}>
                          <Button variant={booking.status === 'success' ? 'outline' : 'default'} size="sm" className="rounded-full">
                            {booking.status === 'rejected' ? 'Upload Ulang Bukti' : booking.status === 'pending' ? 'Cek Status Bayar' : 'Lihat Detail'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}