import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Navbar from '@/components/ui/navbar'
import PaymentForm from '@/components/ui/payment-form'

export const revalidate = 0

async function getBookingDetails(bookingId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      properties (*)
    `)
    .eq('id', bookingId)
    .single()

  if (error || !data) return null
  return data
}

export default async function PaymentPage({ 
  params 
}: { 
  params: Promise<{ bookingId: string }> // Tambahin Promise di sini
}) {
  // 2. UNWRAP params-nya dulu pake await (Ini kuncinya!)
  const { bookingId } = await params 

  // 3. Baru deh dipake buat narik data
  const booking = await getBookingDetails(bookingId)

  if (!booking) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <PaymentForm booking={booking} />
        </div>
      </div>
    </>
  )
}