'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Loader2, Upload, CheckCircle, Clock, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface PaymentFormProps {
  booking: any
}

export default function PaymentForm({ booking }: PaymentFormProps) {
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState(booking.status)
  const [proofUrl, setProofUrl] = useState<string | null>(booking.proof_url)

  // Realtime subscription untuk status update
  useEffect(() => {
    const channel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${booking.id}`,
        },
        (payload) => {
          setStatus(payload.new.status)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [booking.id])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi file
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar!')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB!')
      return
    }

    setUploading(true)

    try {
      // Upload ke Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${booking.id}-${Date.now()}.${fileExt}`
      const filePath = `proofs/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('proof-payments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('proof-payments')
        .getPublicUrl(filePath)

      // Update booking dengan proof_url
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ proof_url: urlData.publicUrl })
        .eq('id', booking.id)

      if (updateError) throw updateError

      setProofUrl(urlData.publicUrl)
      alert('Bukti pembayaran berhasil diupload! Tunggu konfirmasi admin.')
    } catch (error) {
      console.error('Error uploading proof:', error)
      alert('Gagal mengupload bukti pembayaran. Silakan coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={`border-2 ${
        status === 'success' ? 'border-green-500 bg-green-50' :
        status === 'pending' ? 'border-yellow-500 bg-yellow-50' :
        'border-gray-300'
      }`}>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            {status === 'success' ? (
              <>
                <CheckCircle className="w-12 h-12 text-green-600" />
                <div>
                  <h3 className="font-bold text-xl text-green-800">Pembayaran Dikonfirmasi! ✅</h3>
                  <p className="text-green-700">Pesanan Anda telah disetujui. Kami akan menghubungi Anda via WhatsApp.</p>
                </div>
              </>
            ) : (
              <>
                <Clock className="w-12 h-12 text-yellow-600 animate-pulse" />
                <div>
                  <h3 className="font-bold text-xl text-yellow-800">Menunggu Konfirmasi</h3>
                  <p className="text-yellow-700">Admin sedang memeriksa bukti pembayaran Anda.</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QRIS Payment */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-4 rounded-xl">
              <p className="text-sm opacity-90 mb-1">Total Pembayaran</p>
              <p className="text-3xl font-bold">Rp {booking.total_price.toLocaleString('id-ID')}</p>
            </div>

            {/* QRIS Code */}
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <div className="relative w-48 h-48 mx-auto bg-gray-100 rounded-lg mb-4">
                <Image
                  src="https://rjwzrtuzgqxzdsenrtrr.supabase.co/storage/v1/object/public/proof-payments/qris%20payment/Screenshot%202026-05-09%20095627.png"
                  alt="QRIS Code"
                  fill
                  className="object-contain p-2"
                  sizes="192px"
                />
              </div>
              <p className="font-semibold mb-1">Scan QRIS di atas</p>
              <p className="text-sm text-gray-600">atau transfer ke rekening:</p>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">BCA - 1234567890</p>
                <p className="font-bold">a.n. EduRent Indonesia</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Proof */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Upload Bukti Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proof" className="text-sm text-gray-600">
                Screenshot/foto bukti transfer
              </Label>
              
              {proofUrl ? (
                <div className="space-y-3">
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={proofUrl}
                      alt="Bukti Pembayaran"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Bukti pembayaran telah diupload
                  </p>
                </div>
              ) : (
                <label
                  htmlFor="proof"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-accent transition bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                      <Loader2 className="w-12 h-12 text-accent animate-spin mb-3" />
                    ) : (
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    )}
                    <p className="mb-2 text-sm text-gray-600 font-medium">
                      {uploading ? 'Mengupload...' : 'Klik untuk upload'}
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG (Max. 5MB)</p>
                  </div>
                  <input
                    id="proof"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">📋 Instruksi:</p>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>Transfer sesuai nominal yang tertera</li>
                <li>Screenshot bukti transfer</li>
                <li>Upload bukti di form ini</li>
                <li>Tunggu konfirmasi dari admin (1-5 menit)</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Details */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Detail Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Nama</p>
            <p className="font-semibold">{booking.guest_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">WhatsApp</p>
            <p className="font-semibold">{booking.guest_whatsapp}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Durasi</p>
            <p className="font-semibold">{booking.duration_days} hari</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Barang</p>
            <p className="font-semibold truncate">{booking.properties.title}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}