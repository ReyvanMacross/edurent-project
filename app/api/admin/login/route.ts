import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const email = body.email?.trim()
    const password = body.password?.trim()

    // Validasi input kosong
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Cari admin berdasarkan email
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single()

    // Kalau admin tidak ditemukan
    if (error || !admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verifikasi password hash bcrypt
    const isValid = await bcrypt.compare(
      password,
      admin.password_hash
    )

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate token random
    const sessionToken = crypto.randomBytes(32).toString('hex')

    // Response sukses
    const response = NextResponse.json({
      success: true,
    })

    // Simpan cookie aman
    response.cookies.set('admin-auth', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 jam
    })

    return response
  } catch (error) {
    console.error('ADMIN LOGIN ERROR:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}