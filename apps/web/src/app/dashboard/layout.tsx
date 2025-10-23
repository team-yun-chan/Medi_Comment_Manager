'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Youtube, Instagram, Shield, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { name: '홈', href: '/dashboard', icon: Home },
  { name: 'YouTube', href: '/dashboard/youtube', icon: Youtube },
  { name: 'Instagram', href: '/dashboard/instagram', icon: Instagram },
  { name: '자동 관리', href: '/dashboard/moderation', icon: Shield },
  { name: '설정', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, fetchUser, logout } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    if (!user) {
      fetchUser()
    }
  }, [user, fetchUser, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-slate-50">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold">댓글 관리</h1>
          </div>

          {/* User Info */}
          <div className="border-b p-4">
            <p className="text-sm font-medium">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              로그아웃
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
