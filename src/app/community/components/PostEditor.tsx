import React, { useState } from 'react';
import ImageUploader from './ImageUploader';

const FORBIDDEN = ['광고', '불법', '도박', '성인', '마약', '홍보', '카톡', '카카오톡', '텔레그램', '성매매', '야동', '섹스', 'sex', 'porn', '카지노', '바카라', '토토', '먹튀', '사기', '대출', '주식', '투자', '무료', '수익', '클릭'];

interface PostEditorProps {
  initialData?: {
    title: string;
    content: string;
    imageUrl?: string;
    videoUrl?: string;
  };
  onSubmit: (data: { title: string; content: string; imageUrl?: string; videoUrl?: string }) => void;
  loading?: boolean;
  isEdit?: boolean;
}

const PostEditor: React.FC<PostEditorProps> = ({ initialData, onSubmit, loading, isEdit }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [error, setError] = useState('');

  const checkForbidden = (text: string) => FORBIDDEN.some(word => text.includes(word));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 본문을 입력하세요.');
      return;
    }
    if (checkForbidden(title) || checkForbidden(content)) {
      setError('불법/광고성 내용이 포함되어 있습니다.');
      return;
    }
    setError('');
    onSubmit({ title: title.trim(), content: content.trim(), imageUrl, videoUrl: videoUrl.trim() });
  };

  return (
    <form className="max-w-2xl mx-auto p-4 bg-white dark:bg-blue-950 rounded shadow-md flex flex-col gap-4" onSubmit={handleSubmit}>
      <input
        className="px-3 py-2 rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-blue-950 text-gray-900 dark:text-gray-100"
        placeholder="제목"
        value={title}
        onChange={e => setTitle(e.target.value)}
        maxLength={100}
        disabled={loading}
      />
      <textarea
        className="px-3 py-2 rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-blue-950 text-gray-900 dark:text-gray-100 min-h-[120px]"
        placeholder="본문을 입력하세요"
        value={content}
        onChange={e => setContent(e.target.value)}
        maxLength={2000}
        disabled={loading}
      />
      <ImageUploader value={imageUrl} onUpload={setImageUrl} />
      <input
        className="px-3 py-2 rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-blue-950 text-gray-900 dark:text-gray-100"
        placeholder="동영상 URL (선택)"
        value={videoUrl}
        onChange={e => setVideoUrl(e.target.value)}
        maxLength={300}
        disabled={loading}
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-50"
        disabled={loading}
      >
        {isEdit ? '수정' : '등록'}
      </button>
    </form>
  );
};

export default PostEditor; 