import { supabase, Property } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Navbar from '@/components/ui/navbar'
import CheckoutForm from '@/components/ui/checkout-form'

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

export default async function CheckoutPage({
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
      {/* Background dibikin agak abu-abu halus biar Card-nya lebih pop-out */}
      <div className="min-h-screen bg-[#F8FAFC] py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Selesaikan <span className="text-primary">Pesanan Lo</span>
            </h1>
            <p className="text-gray-500 mt-2">Isi data diri di bawah ini buat lanjut ke proses pembayaran.</p>
          </div>

          <CheckoutForm property={property} />
        </div>
      </div>
    </>
  )
}