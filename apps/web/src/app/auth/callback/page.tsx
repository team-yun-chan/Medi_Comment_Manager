'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Loader2 } from 'lucide-react'

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAuthStore((state) => state.login)

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      router.push('/login?error=' + error)
      return
    }

    if (token) {
      login(token).then(() => {
        router.push('/dashboard')
      }).catch((err) => {
        console.error('Login failed:', err)
        router.push('/login?error=login_failed')
      })
    } else {
      router.push('/login')
    }
  }, [searchParams, login, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">로그인 중...</p>
      </div>
    </div>
  )
}
