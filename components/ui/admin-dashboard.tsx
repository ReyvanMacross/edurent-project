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
  Users
} from 'lucide-react'

interface AdminDashboardProps {
  initialBookings: any[]
}

export default function AdminDashboard({ initialBookings }: AdminDashboardProps) {
  const [bookings, setBookings] = useState(initialBookings)
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedProof, setSelectedProof] = useState<string | null>(null)

  // ============================================
  // REALTIME SUBSCRIPTION
  // Setiap ada INSERT/UPDATE di tabel bookings,
  // langsung update UI tanpa refresh!
  // ============================================
  useEffect(() => {
    const channel = supabase
      .channel('admin-bookings')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen semua event (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'bookings',
        },
        async (payload) => {
          console.log('📡 Realtime update:', payload)

          if (payload.eventType === 'INSERT') {
            // Booking baru masuk → fetch detail lengkap
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
            // Status booking diupdate → update di list
            setBookings(prev =>
              prev.map(booking =>
                booking.id === payload.new.id
                  ? { ...booking, ...payload.new }
                  : booking
              )
            )
          } else if (payload.eventType === 'DELETE') {
            // Booking dihapus → hapus dari list
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
  // Update status jadi 'success' → user langsung
  // dapat notif via Realtime di payment page!
  // ============================================
  const handleApprove = async (bookingId: string) => {
    setLoading(bookingId)

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'success' })
        .eq('id', bookingId)

      if (error) throw error

      // UI sudah auto-update via Realtime, tidak perlu manual update state!
      alert('✅ Booking berhasil diapprove!')
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
    if (!confirm('Yakin ingin reject booking ini?')) return

    setLoading(bookingId)

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'rejected' })
        .eq('id', bookingId)

      if (error) throw error

      alert('❌ Booking berhasil direject')
    } catch (error) {
      console.error('Error rejecting booking:', error)
      alert('❌ Gagal reject booking')
    } finally {
      setLoading(null)
    }
  }

  // ============================================
  // STATISTIK DASHBOARD
  // ============================================
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    success: bookings.filter(b => b.status === 'success').length,
    revenue: bookings
      .filter(b => b.status === 'success')
      .reduce((sum, b) => sum + Number(b.total_price), 0),
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.success}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-accent to-green-500 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold">
                  Rp {stats.revenue.toLocaleString('id-ID')}
                </p>
              </div>
              <DollarSign className="w-12 h-12 opacity-30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Daftar Booking (Realtime)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Belum ada booking masuk</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-xl p-4 md:p-6 hover:shadow-md transition bg-white"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Property Image */}
                    <div className="relative w-full md:w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={booking.properties?.image_url || '/placeholder.jpg'}
                        alt={booking.properties?.title || 'Property'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 128px"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-lg">{booking.properties?.title}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <Badge
                          className={
                            booking.status === 'success'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }
                        >
                          {booking.status.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Guest Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Nama</p>
                          <p className="font-semibold">{booking.guest_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">WhatsApp</p>
                          <p className="font-semibold">{booking.guest_whatsapp}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Durasi</p>
                          <p className="font-semibold">{booking.duration_days} hari</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Total</p>
                          <p className="font-bold text-accent">
                            Rp {Number(booking.total_price).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>

                      {/* Payment Proof & Actions */}
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 pt-3 border-t">
                        {booking.proof_url ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProof(booking.proof_url)}
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Lihat Bukti Bayar
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-500 italic">
                            Belum upload bukti pembayaran
                          </span>
                        )}

                        {booking.status === 'pending' && (
                          <div className="flex gap-2 md:ml-auto">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 gap-2"
                              onClick={() => handleApprove(booking.id)}
                              disabled={loading === booking.id || !booking.proof_url}
                            >
                              {loading === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-2"
                              onClick={() => handleReject(booking.id)}
                              disabled={loading === booking.id}
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
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

      {/* Image Modal */}
      {selectedProof && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProof(null)}
        >
          <div className="relative max-w-4xl w-full h-full max-h-[90vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70"
              onClick={() => setSelectedProof(null)}
            >
              <XCircle className="w-6 h-6" />
            </Button>
            <div className="relative w-full h-full">
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