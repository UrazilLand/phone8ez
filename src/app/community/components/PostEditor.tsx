import React, { useState } from 'react';
import ImageUploader from './ImageUploader';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 본문을 입력하세요.');
      return;
    }
    setError('');
    onSubmit({ title: title.trim(), content: content.trim(), imageUrl, videoUrl: videoUrl.trim(), boardType });
  };

  return (
    <form
      className="max-w-2xl w-full mx-auto mt-8 bg-white dark:bg-[#181f2a] rounded-xl shadow-2xl p-10 flex flex-col gap-8 border border-blue-500 dark:border-blue-900"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-2">
        <label className="font-semibold text-blue-600 dark:text-blue-400 text-base min-w-[90px]">게시판 선택</label>
        <select
          className="bg-white dark:bg-[#232b3b] border border-blue-500 dark:border-blue-900 rounded-md px-4 py-3 text-blue-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-base"
          value={boardType}
          onChange={e => setBoardType(e.target.value)}
          disabled={loading}
        >
          <option value="free">자유게시판</option>
          <option value="notice">공지사항</option>
          <option value="general">일반게시판</option>
        </select>
      </div>
      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2 text-center border-b border-blue-500 dark:border-blue-800 pb-2">
        {isEdit ? '게시글 수정' : '게시글 작성'}
      </div>
      <input
        className="bg-white dark:bg-[#232b3b] border border-blue-500 dark:border-blue-900 rounded-md px-5 py-4 text-blue-900 dark:text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition mb-2 text-lg"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={e => setTitle(e.target.value)}
        maxLength={100}
        disabled={loading}
      />
      <textarea
        className="bg-white dark:bg-[#232b3b] border border-blue-500 dark:border-blue-900 rounded-md px-5 py-4 text-blue-900 dark:text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[180px] mb-2 text-base"
        placeholder="본문을 입력하세요"
        value={content}
        onChange={e => setContent(e.target.value)}
        maxLength={2000}
        disabled={loading}
      />
      <ImageUploader value={imageUrl} onUpload={setImageUrl} />
      <input
        className="bg-white dark:bg-[#232b3b] border border-blue-500 dark:border-blue-900 rounded-md px-5 py-3 text-blue-900 dark:text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition mb-2 text-base"
        placeholder="동영상 URL (선택)"
        value={videoUrl}
        onChange={e => setVideoUrl(e.target.value)}
        maxLength={300}
        disabled={loading}
      />
      {error && <div className="text-red-400 text-sm text-center">{error}</div>}
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-md w-full shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-lg"
        disabled={loading}
      >
        {isEdit ? '수정' : '등록'}
      </button>
    </form>
  );
};

export default PostEditor; 