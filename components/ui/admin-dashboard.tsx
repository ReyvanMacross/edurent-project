'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Loader2,
  TrendingUp,
  DollarSign,
  Users,
  MessageCircle,
  Filter
} from 'lucide-react'

interface AdminDashboardProps {
  initialBookings: any[]
}

export default function AdminDashboard({ initialBookings }: AdminDashboardProps) {
  const [bookings, setBookings] = useState(initialBookings)
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedProof, setSelectedProof] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'success' | 'rejected'>('all')

  // ============================================
  // REALTIME SUBSCRIPTION
  // ============================================
  useEffect(() => {
    const channel = supabase
      .channel('admin-bookings')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'bookings',
        },
        async (payload) => {
          console.log('📡 Realtime update:', payload)

          if (payload.eventType === 'INSERT') {
            const { data } = await supabase
              .from('bookings')
              .select(`
                *,
                properties (
                  id,
                  title,
                  image_url,
                  category
                )
              `)
              .eq('id', payload.new.id)
              .single()

            if (data) {
              setBookings(prev => [data, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            setBookings(prev =>
              prev.map(booking =>
                booking.id === payload.new.id
                  ? { ...booking, ...payload.new }
                  : booking
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setBookings(prev => prev.filter(b => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // ============================================
  // APPROVE BOOKING
  // ============================================
  const handleApprove = async (bookingId: string) => {
    setLoading(bookingId)

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'success' })
        .eq('id', bookingId)

      if (error) throw error
    } catch (error) {
      console.error('Error approving booking:', error)
      alert('❌ Gagal approve booking')
    } finally {
      setLoading(null)
    }
  }

  // ============================================
  // REJECT BOOKING
  // ============================================
  const handleReject = async (bookingId: string) => {
    if (!confirm('Yakin ingin menolak booking ini? Bukti bayar dianggap tidak valid.')) return

    setLoading(bookingId)

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'rejected' })
        .eq('id', bookingId)

      if (error) throw error
    } catch (error) {
      console.error('Error rejecting booking:', error)
      alert('❌ Gagal reject booking')
    } finally {
      setLoading(null)
    }
  }

  // ============================================
  // FORMAT WA NUMBER
  // ============================================
  const formatWaNumber = (number: string) => {
    let formatted = number.replace(/\D/g, '') // hapus karakter non-angka
    if (formatted.startsWith('0')) {
      formatted = '62' + formatted.substring(1)
    }
    return formatted
  }

  // ============================================
  // STATISTIK & FILTERING
  // ============================================
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    success: bookings.filter(b => b.status === 'success').length,
    revenue: bookings
      .filter(b => b.status === 'success')
      .reduce((sum, b) => sum + Number(b.total_price), 0),
  }

  const filteredBookings = bookings.filter(b => filter === 'all' ? true : b.status === filter)

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-50 rounded-2xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Pesanan</p>
                <p className="text-3xl font-extrabold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-yellow-50 rounded-2xl">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Perlu Review</p>
                <p className="text-3xl font-extrabold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-50 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Disetujui</p>
                <p className="text-3xl font-extrabold text-green-600">{stats.success}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-primary to-blue-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-100 mb-1">Total Pendapatan</p>
                <p className="text-2xl font-extrabold">
                  Rp {stats.revenue.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Section */}
      <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-white/50 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-6 h-6 text-primary" />
              Daftar Pesanan Realtime
            </CardTitle>
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl overflow-x-auto">
              <Button 
                variant={filter === 'all' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setFilter('all')}
                className={`rounded-lg ${filter === 'all' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
              >
                Semua
              </Button>
              <Button 
                variant={filter === 'pending' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setFilter('pending')}
                className={`rounded-lg ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800 shadow-sm' : 'text-gray-500'}`}
              >
                Pending
              </Button>
              <Button 
                variant={filter === 'success' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setFilter('success')}
                className={`rounded-lg ${filter === 'success' ? 'bg-green-100 text-green-800 shadow-sm' : 'text-gray-500'}`}
              >
                Approved
              </Button>
              <Button 
                variant={filter === 'rejected' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setFilter('rejected')}
                className={`rounded-lg ${filter === 'rejected' ? 'bg-red-100 text-red-800 shadow-sm' : 'text-gray-500'}`}
              >
                Rejected
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 bg-gray-50/50">
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                <Filter className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-gray-600">Tidak ada pesanan di kategori ini</p>
                <p className="text-sm">Orderan baru akan otomatis muncul di sini.</p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Property Image */}
                    <div className="relative w-full md:w-40 h-40 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                      <Image
                        src={booking.properties?.image_url || '/placeholder.jpg'}
                        alt={booking.properties?.title || 'Property'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 768px) 100vw, 160px"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge
                          className={
                            booking.status === 'success'
                              ? 'bg-green-500 hover:bg-green-600'
                              : booking.status === 'pending'
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-red-500 hover:bg-red-600'
                          }
                        >
                          {booking.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-4">
                          <div>
                            <h3 className="font-extrabold text-xl text-gray-900 mb-1">
                              {booking.properties?.title}
                            </h3>
                            <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {new Date(booking.created_at).toLocaleString('id-ID', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </p>
                          </div>
                          
                          {/* Harga Area */}
                          <div className="text-left md:text-right bg-blue-50 px-4 py-2 rounded-xl">
                            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Total Bayar</p>
                            <p className="font-extrabold text-lg text-primary">
                              Rp {Number(booking.total_price).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>

                        {/* Guest Info - Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 py-4 border-y border-dashed border-gray-100">
                          <div>
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Penyewa</p>
                            <p className="font-bold text-gray-900">{booking.guest_name}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Durasi</p>
                            <p className="font-bold text-gray-900">{booking.duration_days} Hari</p>
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Kontak</p>
                            <a 
                              href={`https://wa.me/${formatWaNumber(booking.guest_whatsapp)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-green-600 font-bold hover:text-green-700 bg-green-50 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                              {booking.guest_whatsapp}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Payment Proof & Actions */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-2">
                        {booking.proof_url ? (
                          <Button
                            variant="outline"
                            onClick={() => setSelectedProof(booking.proof_url)}
                            className="w-full sm:w-auto gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
                          >
                            <Eye className="w-4 h-4" />
                            Cek Bukti Transfer
                          </Button>
                        ) : (
                          <span className="text-sm text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                            Menunggu upload bukti bayar...
                          </span>
                        )}

                        {booking.status === 'pending' && (
                          <div className="flex w-full sm:w-auto gap-2">
                            <Button
                              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white shadow-md rounded-xl gap-2"
                              onClick={() => handleApprove(booking.id)}
                              disabled={loading === booking.id || !booking.proof_url}
                            >
                              {loading === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Setujui
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex-1 sm:flex-none shadow-md rounded-xl gap-2"
                              onClick={() => handleReject(booking.id)}
                              disabled={loading === booking.id}
                            >
                              <XCircle className="w-4 h-4" />
                              Tolak
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Modal - Dipercantik dengan backdrop blur */}
      {selectedProof && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-10 transition-all"
          onClick={() => setSelectedProof(null)}
        >
          <div className="relative max-w-3xl w-full h-full max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
              <span className="text-white font-semibold drop-shadow-md">Bukti Pembayaran</span>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={() => setSelectedProof(null)}
              >
                <XCircle className="w-8 h-8" />
              </Button>
            </div>
            <div className="relative w-full h-full bg-gray-900">
              <Image
                src={selectedProof}
                alt="Bukti Pembayaran"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}