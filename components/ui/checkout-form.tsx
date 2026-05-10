'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase, Property } from '@/lib/supabase'
import { Loader2, Calendar, User, Phone, ShieldCheck, CreditCard } from 'lucide-react'
import Image from 'next/image'

interface CheckoutFormProps {
  property: Property
}

export default function CheckoutForm({ property }: CheckoutFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_whatsapp: '',
    duration_days: '1',
  })

  const totalPrice = property.price * parseInt(formData.duration_days)
  const finalPrice = parseInt(formData.duration_days) >= 7 ? totalPrice * 0.9 : totalPrice

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          property_id: property.id,
          guest_name: formData.guest_name,
          guest_whatsapp: formData.guest_whatsapp,
          duration_days: parseInt(formData.duration_days),
          total_price: finalPrice, // Pakai finalPrice yang udah didiskon (kalau ada)
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/payment/${data.id}`)
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
      
      {/* Bagian Kiri: Form Input */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        <Card className="border-gray-100 shadow-xl shadow-gray-200/40 rounded-2xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 px-6 py-5">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Informasi Penyewa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Nama */}
              <div className="space-y-2.5">
                <Label htmlFor="name" className="text-gray-700 font-medium">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Contoh: John Doe"
                  required
                  value={formData.guest_name}
                  onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                  className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-primary focus:border-primary transition-colors rounded-xl"
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-2.5">
                <Label htmlFor="whatsapp" className="text-gray-700 font-medium">Nomor WhatsApp</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+62</span>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="81234567890"
                    required
                    value={formData.guest_whatsapp}
                    onChange={(e) => setFormData({ ...formData, guest_whatsapp: e.target.value })}
                    className="h-12 pl-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-primary focus:border-primary transition-colors rounded-xl"
                  />
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-green-500" /> Kami menjaga kerahasiaan nomor lo.
                </p>
              </div>

              {/* Duration */}
              <div className="space-y-2.5">
                <Label htmlFor="duration" className="text-gray-700 font-medium">Durasi Sewa</Label>
                <Select
                  value={formData.duration_days}
                  onValueChange={(value) => setFormData({ ...formData, duration_days: value || '1' })}
                >
                  <SelectTrigger className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-primary focus:border-primary transition-colors rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {[1, 2, 3, 4, 5, 6, 7, 14, 30].map((day) => (
                      <SelectItem key={day} value={day.toString()} className="cursor-pointer">
                        {day} Hari {day >= 7 && <span className="text-green-600 font-medium ml-1">(Diskon 10%)</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Bagian Kanan: Order Summary */}
      <div className="lg:col-span-5 xl:col-span-4">
        <div className="sticky top-24 space-y-6">
          <Card className="border-gray-100 shadow-xl shadow-gray-200/40 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-5">
              <CardTitle className="text-lg font-bold">Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              
              {/* Property Preview */}
              <div className="flex gap-4 mb-6">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                  <Image
                    src={property.image_url || '/placeholder.jpg'}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-semibold tracking-wider text-primary uppercase mb-1">
                    {property.category}
                  </span>
                  <h4 className="font-bold text-gray-900 leading-tight line-clamp-2">
                    {property.title}
                  </h4>
                </div>
              </div>

              {/* Rincian Harga */}
              <div className="space-y-3 pt-4 border-t border-dashed border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Harga per hari</span>
                  <span className="font-medium text-gray-900">Rp {property.price.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Durasi</span>
                  <span className="font-medium text-gray-900">{formData.duration_days} hari</span>
                </div>
                {parseInt(formData.duration_days) >= 7 && (
                  <div className="flex justify-between text-green-600 font-medium bg-green-50 p-2 rounded-lg -mx-2 px-2">
                    <span>Diskon (10%)</span>
                    <span>-Rp {(totalPrice * 0.1).toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              {/* Total Harga Highlight */}
              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-extrabold text-2xl text-primary">
                    Rp {finalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Submit Button dipindah ke bawah summary biar e-commerce banget */}
              <Button
                form="checkout-form"
                type="submit"
                size="lg"
                className="w-full h-14 mt-6 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Bayar Sekarang
                  </>
                )}
              </Button>
              
            </CardContent>
          </Card>

          {/* Trust Badge Tambahan */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <ShieldCheck className="w-4 h-4" />
            <span>Transaksi lo dijamin aman 100%</span>
          </div>
        </div>
      </div>

    </div>
  )
}