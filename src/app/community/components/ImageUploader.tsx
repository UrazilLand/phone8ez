import React, { useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ImageUploaderProps {
  value?: string;
  onUpload: (url: string) => void;
}

const ACCEPT = '.jpg,.jpeg,.png,.webp';
const MAX_SIZE = 5 * 1024 * 1024;

const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setError('');
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
      setError('jpg, jpeg, png, webp 파일만 업로드 가능합니다.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('5MB 이하 파일만 업로드 가능합니다.');
      return;
    }
    setLoading(true);
    try {
      const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'post-img';
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      if (!urlData?.publicUrl) throw new Error('URL 생성 실패');
      onUpload(urlData.publicUrl);
    } catch (e: any) {
      setError('업로드 실패: ' + (e?.message || '')); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        className="px-3 py-2 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-semibold"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? '업로드 중...' : value ? '이미지 변경' : '이미지 업로드'}
      </button>
      {value && (
        <img src={value} alt="첨부 이미지" className="w-full max-h-48 object-contain rounded border border-blue-100 dark:border-blue-800" />
      )}
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
};

export default ImageUploader; 