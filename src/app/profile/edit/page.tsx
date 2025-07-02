"use client";

import { useAuth } from '@/lib/auth';
import { useState } from 'react';

export default function ProfileEditPage() {
  const { user } = useAuth();
  const [nickname, setNickname] = useState(user?.user_metadata?.nickname || '');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '/favicon.png'
  );

  // TODO: 프로필 저장 로직 구현 필요
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('프로필 저장 기능은 추후 구현 예정입니다.');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">내 정보 수정</h1>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex flex-col items-center">
          <img
            src={avatarUrl}
            alt="프로필 이미지"
            className="w-24 h-24 rounded-full object-cover border border-gray-300 shadow mb-2"
          />
          <label className="block text-sm font-medium text-gray-700">프로필 이미지</label>
          {/* 실제 이미지 업로드 기능은 추후 구현 */}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
        >
          저장
        </button>
      </form>
    </div>
  );
} 