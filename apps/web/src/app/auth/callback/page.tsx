'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');

    console.log('🔐 Auth callback:', { token: !!token, provider, error });

    if (error) {
      // 에러 처리
      console.error('❌ Auth error:', error);
      alert(`로그인 실패: ${error}`);
      router.push(`/login`);
      return;
    }

    if (token) {
      // JWT 토큰 저장
      localStorage.setItem('token', token);
      console.log('✅ Login successful, provider:', provider);
      
      // 대시보드로 리다이렉트
      if (provider === 'google') {
        router.push('/dashboard/youtube');
      } else if (provider === 'meta') {
        router.push('/dashboard/instagram');
      } else {
        router.push('/dashboard');
      }
    } else {
      // 토큰 없으면 로그인 페이지로
      console.error('❌ No token received');
      router.push('/login');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg text-gray-700 font-medium">로그인 처리 중...</p>
        <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}