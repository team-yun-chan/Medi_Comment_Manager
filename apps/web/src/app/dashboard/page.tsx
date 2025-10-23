'use client'

import { useEffect, useState } from 'react'
import { Youtube, Instagram, Shield, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth'
import { moderationApi } from '@/lib/api'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    moderationApi.getStats()
      .then(({ data }) => setStats(data))
      .catch(console.error)
  }, [])

  const hasGoogle = user?.accounts.some((a) => a.provider === 'google')
  const hasMeta = user?.accounts.some((a) => a.provider === 'meta')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">
          댓글 관리 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* 연결 상태 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600" />
              YouTube
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasGoogle ? (
              <div className="space-y-2">
                <Badge variant="default">연결됨</Badge>
                <p className="text-sm text-muted-foreground">
                  {user?.youtubeChannels.length || 0}개 채널
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Badge variant="outline">연결 안됨</Badge>
                <p className="text-sm text-muted-foreground">
                  로그인 페이지에서 YouTube 연결하기
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-600" />
              Instagram
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasMeta ? (
              <div className="space-y-2">
                <Badge variant="default">연결됨</Badge>
                <p className="text-sm text-muted-foreground">
                  {user?.instagramPages.length || 0}개 페이지
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Badge variant="outline">연결 안됨</Badge>
                <p className="text-sm text-muted-foreground">
                  로그인 페이지에서 Instagram 연결하기
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 통계 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 규칙</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRules}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 액션</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedActions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">실패</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failedActions}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 빠른 시작 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 시작</CardTitle>
          <CardDescription>
            첫 방문이신가요? 아래 단계를 따라해보세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              1
            </div>
            <p className="text-sm">
              YouTube 또는 Instagram 계정 연결
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              2
            </div>
            <p className="text-sm">
              채널/페이지에서 댓글 동기화
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              3
            </div>
            <p className="text-sm">
              자동 관리 규칙 설정
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
