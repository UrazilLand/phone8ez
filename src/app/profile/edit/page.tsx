"use client";

import { useAuth } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ProfileEditPage() {
  const { user } = useAuth();
  const [nickname, setNickname] = useState(user?.user_metadata?.nickname || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [checking, setChecking] = useState(false);

  // 닉네임 중복 검사 (디바운스)
  useEffect(() => {
    if (!nickname.trim()) {
      setIsDuplicate(false);
      return;
    }
    setChecking(true);
    const timeout = setTimeout(async () => {
      const { data, error } = await supabase
        .from('users')
        .select('nickname')
        .eq('nickname', nickname.trim())
        .neq('email', user?.email)
        .maybeSingle();
      setIsDuplicate(!!data);
      setChecking(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [nickname, user?.email]);

  const getRandomNickname = () => {
    return 'user' + Math.floor(100000 + Math.random() * 900000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDuplicate) return;
    setSaving(true);
    setMessage('');
    const finalNickname = nickname.trim() ? nickname : getRandomNickname();
    const { error } = await supabase
      .from('users')
      .update({
        nickname: finalNickname,
        updated_at: new Date().toISOString(),
      })
      .eq('email', user?.email);
    setSaving(false);
    if (error) {
      setMessage('저장에 실패했습니다. 다시 시도해 주세요.');
    } else {
      setMessage('프로필이 성공적으로 저장되었습니다.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">내 정보 수정</h1>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">이메일</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            autoComplete="off"
          />
          {checking ? (
            <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">중복 검사 중...</div>
          ) : isDuplicate ? (
            <div className="text-xs mt-1 text-red-600 dark:text-red-400">이미 사용 중인 닉네임입니다.</div>
          ) : nickname.trim() && (
            <div className="text-xs mt-1 text-green-600 dark:text-green-400">사용 가능한 닉네임입니다.</div>
          )}
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold disabled:bg-gray-400 dark:disabled:bg-gray-700"
          disabled={saving || isDuplicate || !nickname.trim()}
        >
          {saving ? '저장 중...' : '저장'}
        </button>
        {message && (
          <div className="text-center text-sm mt-2 text-green-600 dark:text-green-400">{message}</div>
        )}
      </form>
    </div>
  );
} 