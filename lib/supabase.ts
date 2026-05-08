import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Property = {
  id: string
  title: string
  description: string | null
  price: number
  location: string | null
  image_url: string | null
  category: string | null
  rating: number
  created_at: string
}

export type Booking = {
  id: string
  property_id: string
  guest_name: string
  guest_whatsapp: string
  duration_days: number
  total_price: number
  status: 'pending' | 'success' | 'rejected'
  proof_url: string | null
  created_at: string
}