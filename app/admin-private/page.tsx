import { supabase } from '@/lib/supabase'
import AdminDashboard from '@/components/ui/admin-dashboard'
import { redirect } from 'next/navigation'

export const revalidate = 0

async function getBookings() {
  const { data, error } = await supabase
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
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
    return []
  }

  return data
}

export default async function AdminPage() {
  const bookings = await getBookings()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Admin Dashboard 🔐
          </h1>
          <p className="text-gray-200">
            Kelola semua booking dan konfirmasi pembayaran secara realtime
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <AdminDashboard initialBookings={bookings} />
      </div>
    </div>
  )
}