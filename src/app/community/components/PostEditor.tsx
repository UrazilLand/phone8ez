import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import { PencilIcon } from '@heroicons/react/24/solid';
import { supabase } from '@/lib/supabaseClient';

interface PostEditorProps {
  initialData?: {
    title: string;
    content: string;
    imageUrl?: string;
    videoUrl?: string;
    boardType?: string;
  };
  onSubmit: (data: { title: string; content: string; imageUrl?: string; videoUrl?: string; boardType: string }) => void;
  loading?: boolean;
  isEdit?: boolean;
  initialBoardType?: string;
}

const PostEditor: React.FC<PostEditorProps> = ({ initialData, onSubmit, loading, isEdit, initialBoardType }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [boardType, setBoardType] = useState(initialData?.boardType || initialBoardType || 'free');
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 본문을 입력하세요.');
      return;
    }
    setError('');
    let imageUrl = '';
    if (imageFile) {
      const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'post-img';
      const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false,
      });
      if (uploadError) {
        setError('이미지 업로드 실패: ' + uploadError.message);
        return;
      }
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      imageUrl = urlData?.publicUrl || '';
    }
    onSubmit({ title: title.trim(), content: content.trim(), imageUrl, videoUrl: videoUrl.trim(), boardType });
  };

  const BOARD_TYPE_OPTIONS = [
    { value: 'free', label: '자유게시판' },
    { value: 'humor', label: '유머게시판' },
    { value: 'mobile', label: '모바일 정보' },
    { value: 'review', label: '후기 및 건의' },
  ];

  // 이미지 선택 핸들러
  const handleImageUpload = (file: File | null) => {
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-12 px-2">
      <div className="bg-white dark:bg-[#181f2a] rounded-2xl shadow-xl border border-blue-200 dark:border-blue-800 p-0 overflow-hidden">
        {/* 상단 헤더 */}
        <div className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-[#232b3b] dark:to-[#181f2a] px-8 py-6 border-b border-blue-200 dark:border-blue-800 flex items-center gap-4">
          <PencilIcon className="text-blue-500 w-7 h-7" />
          <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">게시글 작성</span>
          <select
            className="ml-auto bg-white dark:bg-[#232b3b] border border-blue-400 dark:border-blue-700 rounded-lg px-4 py-2 text-blue-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base shadow-sm"
            value={boardType}
            onChange={e => setBoardType(e.target.value)}
            disabled={loading}
          >
            {BOARD_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <form className="p-8 flex flex-col gap-6" onSubmit={handleSubmit}>
          <input
            className="w-full bg-white dark:bg-[#232b3b] border border-blue-300 dark:border-blue-800 rounded-lg px-5 py-4 text-blue-900 dark:text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-lg shadow-sm"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
            disabled={loading}
          />
          <ImageUploader value={imageFile} previewUrl={imagePreview} onUpload={handleImageUpload} />
          <textarea
            className="w-full bg-white dark:bg-[#232b3b] border border-blue-300 dark:border-blue-800 rounded-lg px-5 py-4 text-blue-900 dark:text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition min-h-[180px] text-base shadow-sm"
            placeholder="본문을 입력하세요"
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={2000}
            disabled={loading}
          />
          <input
            className="w-full bg-white dark:bg-[#232b3b] border border-blue-300 dark:border-blue-800 rounded-lg px-5 py-3 text-blue-900 dark:text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base shadow-sm"
            placeholder="동영상 URL (선택)"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            maxLength={300}
            disabled={loading}
          />
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 active:from-blue-700 active:to-blue-600 text-white font-bold py-4 rounded-xl w-full shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-lg tracking-wide"
            disabled={loading}
          >
            {isEdit ? '수정' : '등록'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostEditor; 