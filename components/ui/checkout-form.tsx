'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase, Property } from '@/lib/supabase'
import { Loader2, Calendar, User, Phone } from 'lucide-react'
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
          total_price: totalPrice,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      // Redirect ke halaman payment
      router.push(`/payment/${data.id}`)
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Form */}
      <Card className="lg:col-span-2 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Informasi Penyewa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-accent" />
                Nama Lengkap
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                className="h-12"
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                Nomor WhatsApp
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="08123456789"
                required
                value={formData.guest_whatsapp}
                onChange={(e) => setFormData({ ...formData, guest_whatsapp: e.target.value })}
                className="h-12"
              />
              <p className="text-xs text-gray-500">Format: 08xxxxxxxxxx (tanpa +62)</p>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                Durasi Sewa
              </Label>
              <Select
                value={formData.duration_days}
                onValueChange={(value) => setFormData({ ...formData, duration_days: value || '1' })}              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 14, 30].map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day} Hari {day >= 7 && '(Diskon 10%)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-accent hover:bg-accent-hover text-white font-semibold h-12"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Lanjut ke Pembayaran'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Right: Order Summary */}
      <div className="space-y-6">
        <Card className="border-0 shadow-lg sticky top-24">
          <CardHeader>
            <CardTitle className="text-xl">Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Property Preview */}
            <div className="flex gap-3">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                <Image
                  src={property.image_url || '/placeholder.jpg'}
                  alt={property.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div>
                <h4 className="font-semibold text-sm line-clamp-2">{property.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{property.category}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Harga per hari</span>
                <span className="font-medium">Rp {property.price.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Durasi</span>
                <span className="font-medium">{formData.duration_days} hari</span>
              </div>
              {parseInt(formData.duration_days) >= 7 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Diskon (10%)</span>
                  <span>-Rp {(totalPrice * 0.1).toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Total</span>
                <span className="font-bold text-2xl text-accent">
                  Rp {(parseInt(formData.duration_days) >= 7 ? totalPrice * 0.9 : totalPrice).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}