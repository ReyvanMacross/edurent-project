'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isError, setIsError] = useState(false)

  // ============================================
  // PASSWORD DARI ENV LOCAL
  // ============================================
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setIsError(false)

    // Simulasi loading biar terasa seperti mengecek ke server
    await new Promise(resolve => setTimeout(resolve, 800))

    if (password === ADMIN_PASSWORD) {
    
      document.cookie = 'admin-auth=authenticated; path=/; secure; samesite=strict'
      
      // Redirect ke dashboard
      router.push('/admin-private')
    } else {
      setIsError(true)
      setPassword('') // Kosongin field kalau salah
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ornaments */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-primary rounded-2xl shadow-xl shadow-blue-900/50 mb-6 transform rotate-3">
            <ShieldCheck className="w-10 h-10 text-white -rotate-3" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">EduRent Admin</h1>
          <p className="text-slate-400 font-medium text-sm">
            Sistem Informasi Manajemen Penyewaan
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl ring-1 ring-white/10 rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="password" className="text-slate-300 font-semibold ml-1">
                  Security Key
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password admin..."
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (isError) setIsError(false)
                    }}
                    className={`h-14 bg-black/40 border-slate-700 text-white placeholder:text-slate-500 rounded-2xl pr-12 focus-visible:ring-2 transition-all ${
                      isError 
                        ? 'border-red-500 focus-visible:ring-red-500/50' 
                        : 'focus-visible:ring-blue-500/50 focus-visible:border-blue-500'
                    }`}
                    autoFocus
                  />
                  
                  {/* Toggle Show/Hide Password */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Pesan Error */}
                {isError && (
                  <p className="text-red-400 text-sm font-medium ml-1 animate-in fade-in slide-in-from-top-1">
                    Password yang Anda masukkan salah!
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] group"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Mengotentikasi...
                  </>
                ) : (
                  <>
                    Masuk ke Sistem
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

          </CardContent>
        </Card>

        {/* Footer Info (Bisa Dihapus Kalau Masuk Production) */}
        <div className="mt-8 text-center opacity-50 hover:opacity-100 transition-opacity">
          <p className="text-xs text-slate-400 font-mono">
            Dev Mode: <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded">admin123</span>
          </p>
        </div>
      </div>
    </div>
  )
}