"use client";

import { useAuth } from '@/lib/auth';
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import UserDefaultIcon from '@/components/ui/UserDefaultIcon';

async function resizeImage(file: File, maxSize = 256): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = e => {
      if (!e.target) return reject();
      img.src = e.target.result as string;
    };
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject();
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject();
      }, 'image/jpeg', 0.8);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfileEditPage() {
  const { user } = useAuth();
  const [nickname, setNickname] = useState(user?.user_metadata?.nickname || '');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getRandomNickname = () => {
    return 'user' + Math.floor(100000 + Math.random() * 900000);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const resized = await resizeImage(file, 256);
      const fileName = `avatar_${user.id}_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, resized, { upsert: true, contentType: 'image/jpeg' });
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setAvatarUrl(publicUrlData.publicUrl);
    } catch (err) {
      setMessage('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const finalNickname = nickname.trim() ? nickname : getRandomNickname();
    const { error } = await supabase
      .from('users')
      .update({
        nickname: finalNickname,
        avatar_url: avatarUrl || null,
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
        <div className="flex flex-col items-center">
          <div className="relative cursor-pointer" onClick={handleImageClick} title="프로필 이미지 변경">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="프로필 이미지"
                className="w-24 h-24 rounded-full object-cover border border-gray-300 shadow mb-2"
                onError={e => (e.currentTarget.src = '')}
              />
            ) : (
              <UserDefaultIcon className="w-24 h-24 rounded-full border border-gray-300 bg-white shadow mb-2 p-2 text-gray-400" />
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full">
                <span className="text-xs text-gray-500">업로드 중...</span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={uploading}
          />
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
          disabled={saving}
        >
          {saving ? '저장 중...' : '저장'}
        </button>
        {message && (
          <div className="text-center text-sm mt-2 text-green-600">{message}</div>
        )}
      </form>
    </div>
  );
} 