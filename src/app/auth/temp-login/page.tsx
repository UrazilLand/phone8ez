"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TempLoginPage() {
  const router = useRouter();
  const [id, setId] = useState('testpay');
  const [pw, setPw] = useState('test11');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (id === 'testpay' && pw === 'test11') {
      // 임시 로그인 상태 저장 (로컬스토리지)
      localStorage.setItem('temp_login', 'true');
      router.push('/');
    } else {
      setError('ID 또는 비밀번호가 올바르지 않습니다.');
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
            placeholder="ID"
            value={id}
            onChange={e => setId(e.target.value)}
            autoComplete="username"
          />
          <input
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="비밀번호"
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
        <button
          className="w-full px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
          onClick={handleLogin}
        >
          로그인
        </button>
      </div>
    </div>
  );
} 