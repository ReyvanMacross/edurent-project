'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')

  // ============================================
  // HARDCODED PASSWORD (Ganti sesuai keinginan!)
  // Untuk production, simpan di .env
  // ============================================
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 500))

    if (password === ADMIN_PASSWORD) {
      // Set cookie
      document.cookie = 'admin-auth=authenticated; path=/; max-age=86400' // 24 jam
      
      // Redirect ke dashboard
      router.push('/admin-private')
    } else {
      alert('❌ Password salah!')
      setPassword('')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-3xl font-bold">Admin Login</CardTitle>
          <p className="text-gray-600 mt-2">Masukkan password untuk akses dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password admin"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-accent hover:bg-accent-hover text-white font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Password default: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              (Ganti di .env: NEXT_PUBLIC_ADMIN_PASSWORD)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}