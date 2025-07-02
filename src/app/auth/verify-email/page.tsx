'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // URL에서 토큰 확인
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (token && type === 'signup') {
      handleEmailConfirmation(token);
    }
  }, [searchParams]);

  const handleEmailConfirmation = async (token: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup',
      });

      if (error) {
        setStatus('error');
        setError(error.message);
      } else {
        setStatus('success');
        // 3초 후 대시보드로 리다이렉트
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (error: any) {
      setStatus('error');
      setError(error.message || '이메일 인증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
      });

      if (error) {
        setError(error.message);
      } else {
        setError('');
        alert('인증 이메일을 다시 보냈습니다. 이메일을 확인해주세요.');
      }
    } catch (error: any) {
      setError(error.message || '이메일 재전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="text-2xl font-bold text-green-600">이메일 인증 완료!</CardTitle>
            <CardDescription>
              계정이 성공적으로 인증되었습니다. 잠시 후 대시보드로 이동합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-pulse text-sm text-gray-600 dark:text-gray-400">
              대시보드로 이동 중...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle className="text-2xl font-bold text-red-600">인증 실패</CardTitle>
            <CardDescription>
              이메일 인증에 실패했습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="text-center space-y-2">
              <Button onClick={resendVerificationEmail} disabled={loading}>
                {loading ? '전송 중...' : '인증 이메일 다시 보내기'}
              </Button>
              <div>
                <Link 
                  href="/auth/login" 
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  로그인 페이지로 돌아가기
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Mail className="mx-auto h-12 w-12 text-blue-500" />
          <CardTitle className="text-2xl font-bold">이메일 인증</CardTitle>
          <CardDescription>
            가입하신 이메일 주소로 인증 링크를 보냈습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              이메일을 확인하여 계정을 활성화해주세요. 
              인증 링크를 클릭하면 자동으로 로그인됩니다.
            </AlertDescription>
          </Alert>
          
          <div className="text-center space-y-2">
            <Button onClick={resendVerificationEmail} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  전송 중...
                </>
              ) : (
                '인증 이메일 다시 보내기'
              )}
            </Button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              이메일을 받지 못하셨나요? 스팸 폴더도 확인해보세요.
            </div>
            <div>
              <Link 
                href="/auth/login" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
              >
                로그인 페이지로 돌아가기
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 