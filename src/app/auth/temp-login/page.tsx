"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TempLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (!error) {
      router.push('/');
    } else {
      setError(error.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center w-full max-w-xs">
        <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">로그인</h1>
        <p className="mb-6 text-gray-700 dark:text-gray-200">서비스 이용을 위해 로그인이 필요합니다.</p>
        <div className="mb-4">
          <input
            className="w-full px-3 py-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="이메일"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="username"
          />
          <input
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="비밀번호"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
        <button
          className="w-full px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-60"
          onClick={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </div>
    </div>
  );
} 