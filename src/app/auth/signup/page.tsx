'use client';

import { useAuth } from '../../../lib/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SignUpPage() {
  const { signInWithGoogle, signInWithKakao, loading, error } = useAuth();

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google 회원가입 오류:', error);
    }
  };

  const handleKakaoSignup = async () => {
    try {
      await signInWithKakao();
    } catch (error) {
      console.error('Kakao 회원가입 오류:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020817] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* 로고/브랜드 영역 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Phone8ez
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">스마트폰 데이터 분석 서비스</p>
        </div>

        {/* 회원가입 카드 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">회원가입</h2>
            <p className="text-gray-600 dark:text-gray-400">소셜 계정으로 간편하게 가입하세요</p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 소셜 로그인 버튼들 */}
          <div className="space-y-4">
            {/* Google 회원가입 */}
            <button 
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 rounded-xl transition-all duration-200 hover:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-gray-900 dark:group-hover:text-white">
                {loading ? '가입 중...' : 'Google로 시작하기'}
              </span>
            </button>

            {/* Kakao 회원가입 */}
            <button 
              onClick={handleKakaoSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600 rounded-xl transition-all duration-200 hover:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
              </svg>
              <span className="text-gray-800 font-medium group-hover:text-gray-900">
                {loading ? '가입 중...' : '카카오로 시작하기'}
              </span>
            </button>
          </div>

          {/* 구분선 */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">또는</span>
            </div>
          </div>

          {/* 로그인 링크 */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              이미 계정이 있으신가요?{' '}
              <a 
                href="/auth/login" 
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline transition-colors"
              >
                로그인
              </a>
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            회원가입하면{' '}
            <a href="/terms" className="hover:underline">이용약관</a>
            {' '}및{' '}
            <a href="/privacy" className="hover:underline">개인정보처리방침</a>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
} 