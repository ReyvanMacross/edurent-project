import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminDashboard from '@/components/ui/admin-dashboard'

// 1. WAJIB: Kasih tau Vercel jangan jadikan halaman ini statis saat build
// Ini solusi buat error "cookies was called outside a request scope"
export const dynamic = 'force-dynamic'

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
 
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin-auth')

  if (!authCookie || authCookie.value !== 'authenticated') {
    redirect('/admin-login')
  }

  // Jika lolos gembok di atas, baru ambil data
  const bookings = await getBookings()

  return (
    <div className="min-h-screen bg-gray-50/50">
      
      {/* Header Premium Area */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <span className="bg-primary text-white p-2 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                Control Panel
              </h1>
              <p className="text-gray-500 mt-1 font-medium ml-11">
                Kelola pesanan dan konfirmasi pembayaran EduRent.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold border border-blue-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Sistem Realtime Aktif
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Mengirim data bookings ke Client Component Dashboard */}
        <AdminDashboard initialBookings={bookings} />
      </main>
      
    </div>
  )
}