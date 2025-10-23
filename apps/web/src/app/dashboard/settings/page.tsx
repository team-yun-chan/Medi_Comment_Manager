'use client'

import { Youtube, Instagram, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'

export default function SettingsPage() {
  const { user } = useAuthStore()

  const googleAccount = user?.accounts.find((a) => a.provider === 'google')
  const metaAccount = user?.accounts.find((a) => a.provider === 'meta')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground">
          계정 연결 상태와 권한을 관리하세요
        </p>
      </div>

      {/* 사용자 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">이메일</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">이름</span>
            <span className="font-medium">{user?.name || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">역할</span>
            <Badge>{user?.role}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Google 계정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            YouTube (Google)
          </CardTitle>
          <CardDescription>
            YouTube 댓글 관리를 위한 Google 계정 연결
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {googleAccount ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">연결됨</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">만료일</span>
                  <span>
                    {googleAccount.expiresAt
                      ? new Date(googleAccount.expiresAt).toLocaleDateString()
                      : '없음'}
                  </span>
                </div>
              </div>

              {user?.youtubeChannels && user.youtubeChannels.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">연결된 채널</p>
                  <div className="space-y-1">
                    {user.youtubeChannels.map((channel) => (
                      <div
                        key={channel.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span className="text-sm">{channel.title}</span>
                        <Badge variant="outline">{channel.channelId}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button variant="outline" disabled>
                  연결 해제 (준비 중)
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">연결되지 않음</span>
              </div>
              <Button onClick={() => (window.location.href = '/login')}>
                Google 계정 연결
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Meta 계정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-600" />
            Instagram (Meta)
          </CardTitle>
          <CardDescription>
            Instagram 댓글 관리를 위한 Meta 계정 연결
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {metaAccount ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">연결됨</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">만료일</span>
                  <span>
                    {metaAccount.expiresAt
                      ? new Date(metaAccount.expiresAt).toLocaleDateString()
                      : '없음'}
                  </span>
                </div>
              </div>

              {user?.instagramPages && user.instagramPages.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">연결된 페이지</p>
                  <div className="space-y-1">
                    {user.instagramPages.map((page) => (
                      <div
                        key={page.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span className="text-sm">{page.name}</span>
                        {page.username && (
                          <Badge variant="outline">@{page.username}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button variant="outline" disabled>
                  연결 해제 (준비 중)
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">연결되지 않음</span>
              </div>
              <Button onClick={() => (window.location.href = '/login')}>
                Meta 계정 연결
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* 권한 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>요청된 권한</CardTitle>
          <CardDescription>
            이 앱이 사용하는 권한 목록입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">YouTube 권한</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 댓글 조회 및 관리</li>
                <li>• 채널 정보 조회</li>
                <li>• 비디오 정보 조회</li>
              </ul>
            </div>

            <div>
              <p className="font-medium mb-2">Instagram 권한</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 댓글 조회 및 관리</li>
                <li>• 페이지 정보 조회</li>
                <li>• 미디어 정보 조회</li>
                <li>• Webhook 구독</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 데이터 관리 */}
      <Card>
        <CardHeader>
          <CardTitle>데이터 관리</CardTitle>
          <CardDescription>
            저장된 데이터를 관리하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            모든 계정 연결을 해제하고 데이터를 삭제하려면 support@example.com으로
            문의해주세요.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
