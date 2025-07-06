import React, { useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ImageUploaderProps {
  value?: File | null;
  previewUrl?: string;
  onUpload: (file: File | null) => void;
}

const ACCEPT = '.jpg,.jpeg,.png,.webp';
const MAX_SIZE = 5 * 1024 * 1024;

// 이미지 변환 및 리사이즈 함수 수정 (linter 에러 해결)
async function resizeAndConvertToWebp(file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas context 생성 실패'));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('webp 변환 실패'));
          },
          'image/webp',
          quality
        );
      };
      img.onerror = reject;
      if (e.target && typeof e.target.result === 'string') {
        img.src = e.target.result;
      } else {
        reject(new Error('FileReader 결과 오류'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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