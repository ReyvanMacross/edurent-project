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

export default async function CheckoutPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id)

  if (!property) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Checkout <span className="text-accent">Rental</span>
          </h1>

          <CheckoutForm property={property} />
        </div>
      </div>
    </>
  )
}