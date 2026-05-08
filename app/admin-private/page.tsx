'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Clock, ExternalLink } from 'lucide-react'

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([])

  // 1. Fungsi narik data
  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, properties(title)')
      .order('created_at', { ascending: false })
    
    if (data) setBookings(data)
  }

  useEffect(() => {
    fetchBookings()

    // 2. REALTIME ENGINE: Dengerin perubahan status di DB
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' }, 
        () => {
          fetchBookings() // Refresh data otomatis kalau ada yang upload/berubah
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // 3. Fungsi Approve (Ubah Pending jadi Success)
  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'success' })
      .eq('id', id)

    if (error) alert("Gagal approve bray!")
    else alert("Pembayaran Berhasil di-Confirm!")
  }

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8">Admin EduRent Dashboard</h1>
      
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="border p-6 rounded-2xl bg-white shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-lg">{booking.guest_name}</h3>
              <p className="text-sm text-gray-500">WA: {booking.guest_whatsapp}</p>
              <p className="text-sm">Barang: <span className="font-medium">{booking.properties?.title}</span></p>
              <div className="flex items-center gap-2 mt-2">
                {booking.status === 'pending' ? (
                  <span className="flex items-center gap-1 text-xs font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-full uppercase">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold bg-green-100 text-green-600 px-2 py-1 rounded-full uppercase">
                    <CheckCircle className="w-3 h-3" /> Success
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              {booking.proof_url && (
                <a href={booking.proof_url} target="_blank" className="flex items-center gap-1 text-blue-600 text-sm hover:underline">
                  Lihat Bukti <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {booking.status === 'pending' && (
                <button 
                  onClick={() => handleApprove(booking.id)}
                  className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition"
                >
                  APPROVE
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}git add .