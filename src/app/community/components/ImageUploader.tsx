import React, { useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ImageUploaderProps {
  value?: File | null;
  previewUrl?: string;
  onUpload: (file: File | null) => void;
}

const ACCEPT = '.jpg,.jpeg,.png,.webp';
const MAX_SIZE = 5 * 1024 * 1024;

const ImageUploader: React.FC<ImageUploaderProps> = ({ value, previewUrl, onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFile = (file: File) => {
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
    onUpload(file);
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
      >
        {value ? '이미지 변경' : '이미지 업로드'}
      </button>
      {previewUrl && (
        <img src={previewUrl} alt="첨부 이미지" className="w-full max-h-48 object-contain rounded border border-blue-100 dark:border-blue-800" />
      )}
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
};

export default ImageUploader; 