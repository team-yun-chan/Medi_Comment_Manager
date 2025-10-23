'use client'

import { useState } from 'react'
import { Youtube, Instagram, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi } from '@/lib/api'

export default function LoginPage() {
  const [loading, setLoading] = useState<'google' | 'meta' | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setLoading('google')
      const { data } = await authApi.getGoogleLoginUrl()
      window.location.href = data.url
    } catch (error) {
      console.error('Google login error:', error)
      setLoading(null)
    }
  }

  const handleMetaLogin = async () => {
    try {
      setLoading('meta')
      const { data } = await authApi.getMetaLoginUrl()
      window.location.href = data.url
    } catch (error) {
      console.error('Meta login error:', error)
      setLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">소셜 댓글 관리</CardTitle>
          <CardDescription className="text-base">
            YouTube와 Instagram 댓글을 한 곳에서 관리하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full h-12 text-base"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading !== null}
          >
            {loading === 'google' ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Youtube className="mr-2 h-5 w-5 text-red-600" />
            )}
            YouTube로 시작하기
          </Button>

          <Button
            className="w-full h-12 text-base"
            variant="outline"
            onClick={handleMetaLogin}
            disabled={loading !== null}
          >
            {loading === 'meta' ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Instagram className="mr-2 h-5 w-5 text-pink-600" />
            )}
            Instagram으로 시작하기
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>두 플랫폼 모두 연결하여</p>
            <p>통합 관리가 가능합니다</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
