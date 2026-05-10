'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Loader2, Upload, CheckCircle, Clock, XCircle, FileText, Receipt, ArrowRight } from 'lucide-react'
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

      // Update booking dengan proof_url dan reset status ke pending (berguna kalau user re-upload setelah di-reject)
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          proof_url: urlData.publicUrl,
          status: 'pending' // Reset status
        })
        .eq('id', booking.id)

      if (updateError) throw updateError

      setProofUrl(urlData.publicUrl)
      setStatus('pending') // Update state lokal
      alert('Bukti pembayaran berhasil diupload! Tunggu konfirmasi admin.')
    } catch (error) {
      console.error('Error uploading proof:', error)
      alert('Gagal mengupload bukti pembayaran. Silakan coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  // Menentukan UI berdasarkan status
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-500',
          icon: <CheckCircle className="w-12 h-12 text-green-600" />,
          title: 'Pembayaran Dikonfirmasi!',
          desc: 'Pesanan Anda telah disetujui. Kami akan segera memprosesnya.',
        }
      case 'rejected':
        return {
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-500',
          icon: <XCircle className="w-12 h-12 text-red-600" />,
          title: 'Pembayaran Ditolak',
          desc: 'Bukti pembayaran tidak valid atau kurang jelas. Silakan upload ulang bukti yang benar.',
        }
      default: // pending
        return {
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-500',
          icon: <Clock className="w-12 h-12 text-amber-600 animate-pulse" />,
          title: 'Menunggu Konfirmasi',
          desc: 'Admin sedang memeriksa bukti pembayaran Anda (1-5 Menit).',
        }
    }
  }

  const currentStatus = getStatusConfig()

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner Status Card */}
      <Card className={`border-l-8 shadow-md transition-all duration-300 ${currentStatus.border} ${currentStatus.bg}`}>
        <CardContent className="py-6 flex items-center gap-5">
          <div className="shrink-0 bg-white p-3 rounded-full shadow-sm">
            {currentStatus.icon}
          </div>
          <div>
            <h3 className={`font-bold text-xl md:text-2xl mb-1 ${currentStatus.color}`}>
              {currentStatus.title}
            </h3>
            <p className="text-gray-700 text-sm md:text-base font-medium">
              {currentStatus.desc}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kolom Kiri: Instruksi & QRIS */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
              <p className="text-blue-100 text-sm font-medium mb-1">Total yang harus dibayar</p>
              <h2 className="text-4xl font-extrabold tracking-tight">
                Rp {booking.total_price.toLocaleString('id-ID')}
              </h2>
            </div>
            
            <CardContent className="p-6 space-y-6">
              {/* Instruksi */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
                <h4 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-3">
                  <Receipt className="w-4 h-4" /> 
                  Cara Pembayaran:
                </h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs font-bold">1</span>
                    Transfer sesuai nominal di atas.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs font-bold">2</span>
                    Simpan & screenshot bukti transfer.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs font-bold">3</span>
                    Upload bukti di kolom yang disediakan.
                  </li>
                </ul>
              </div>

              {/* QRIS Code */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <div className="relative w-48 h-48 mx-auto bg-white rounded-lg mb-4 shadow-sm border p-2">
                  <Image
                    src="https://rjwzrtuzgqxzdsenrtrr.supabase.co/storage/v1/object/public/proof-payments/qris%20payment/Screenshot%202026-05-09%20095627.png"
                    alt="QRIS Code"
                    fill
                    className="object-contain"
                    sizes="192px"
                    unoptimized
                  />
                </div>
                <p className="font-bold text-gray-800 mb-1">Scan QRIS di atas</p>
                <div className="flex items-center justify-center gap-3 text-sm text-gray-500 my-3">
                  <div className="h-px bg-gray-200 w-12"></div>
                  <span>Atau Transfer Manual</span>
                  <div className="h-px bg-gray-200 w-12"></div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Bank BCA</p>
                  <p className="font-mono text-xl text-gray-800 font-bold tracking-widest mb-1">123 456 7890</p>
                  <p className="text-sm font-medium text-gray-600">a.n. EduRent Indonesia</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Upload & Detail Pesanan */}
        <div className="space-y-6">
          {/* Upload Proof */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload Bukti Transfer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Logika: Kalau sukses/pending dan sudah ada foto, tunjukin fotonya. Kalau di-reject, boleh upload lagi */}
              {proofUrl && status !== 'rejected' ? (
                <div className="space-y-4">
                  <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border">
                    <Image
                      src={proofUrl}
                      alt="Bukti Pembayaran"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-100 font-medium">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    Bukti pembayaran berhasil terkirim.
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="proof"
                  className={`flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 
                    ${status === 'rejected' ? 'border-red-300 bg-red-50 hover:bg-red-100' : 'border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-400'}`}
                >
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    {uploading ? (
                      <>
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-sm font-semibold text-blue-600">Mengunggah gambar...</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                          <Upload className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="mb-2 text-base font-bold text-gray-700">
                          {status === 'rejected' ? 'Upload Ulang Bukti Transfer' : 'Klik untuk upload bukti'}
                        </p>
                        <p className="text-xs text-gray-500 max-w-[200px]">
                          Format: JPG, PNG, atau WEBP. Maksimal 5MB.
                        </p>
                      </>
                    )}
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
            </CardContent>
          </Card>

          {/* Booking Details - Ala Struk */}
          <Card className="border-0 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Rincian Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                <span className="text-gray-500 text-sm">Nama Lengkap</span>
                <span className="font-semibold text-gray-800">{booking.guest_name}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                <span className="text-gray-500 text-sm">WhatsApp</span>
                <span className="font-semibold text-gray-800">{booking.guest_whatsapp}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                <span className="text-gray-500 text-sm">Durasi Sewa</span>
                <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
                  {booking.duration_days} Hari
                </span>
              </div>
              <div className="pt-2">
                <span className="text-gray-500 text-sm block mb-1">Item yang disewa</span>
                <span className="font-bold text-blue-700 block line-clamp-2">
                  {booking.properties.title}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}