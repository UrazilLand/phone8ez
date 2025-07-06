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

  const BOARD_TYPE_OPTIONS = [
    { value: 'free', label: '자유게시판' },
    { value: 'humor', label: '유머게시판' },
    { value: 'mobile', label: '휴대폰 정보' },
    { value: 'review', label: '사용기/리뷰' },
  ];

  return (
    <form
      className="max-w-4xl w-full mx-auto mt-12 bg-white dark:bg-[#181f2a] rounded-2xl shadow-2xl p-0 flex flex-col md:flex-row gap-0 border border-blue-500 dark:border-blue-900 overflow-hidden"
      onSubmit={handleSubmit}
    >
      {/* 좌측: 게시판, 제목, 이미지 */}
      <div className="flex-1 flex flex-col gap-6 p-10 bg-blue-50 dark:bg-[#232b3b] border-r border-blue-200 dark:border-blue-800 min-w-[320px]">
        <div>
          <label className="font-semibold text-blue-600 dark:text-blue-400 text-base mb-2 block">게시판 선택</label>
          <select
            className="w-full bg-white dark:bg-[#232b3b] border border-blue-500 dark:border-blue-900 rounded-md px-4 py-3 text-blue-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-base"
            value={boardType}
            onChange={e => setBoardType(e.target.value)}
            disabled={loading}
          >
            {BOARD_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-semibold text-blue-600 dark:text-blue-400 text-base mb-2 block">제목</label>
          <input
            className="w-full bg-white dark:bg-[#232b3b] border border-blue-500 dark:border-blue-900 rounded-md px-5 py-4 text-blue-900 dark:text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
            disabled={loading}
          />
        </div>
        <div>
          <label className="font-semibold text-blue-600 dark:text-blue-400 text-base mb-2 block">이미지 업로드</label>
          <ImageUploader value={imageUrl} onUpload={setImageUrl} />
        </div>
      </div>
      {/* 우측: 본문, 동영상, 버튼 */}
      <div className="flex-1 flex flex-col gap-6 p-10 bg-white dark:bg-[#181f2a] min-w-[320px]">
        <div>
          <label className="font-semibold text-blue-600 dark:text-blue-400 text-base mb-2 block">본문</label>
          <textarea
            className="w-full bg-white dark:bg-[#232b3b] border border-blue-500 dark:border-blue-900 rounded-md px-5 py-4 text-blue-900 dark:text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[180px] text-base"
            placeholder="본문을 입력하세요"
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={2000}
            disabled={loading}
          />
        </div>
        <div>
          <label className="font-semibold text-blue-600 dark:text-blue-400 text-base mb-2 block">동영상 URL (선택)</label>
          <input
            className="w-full bg-white dark:bg-[#232b3b] border border-blue-500 dark:border-blue-900 rounded-md px-5 py-3 text-blue-900 dark:text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-base"
            placeholder="동영상 URL (선택)"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            maxLength={300}
            disabled={loading}
          />
        </div>
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-md w-full shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-lg"
          disabled={loading}
        >
          {isEdit ? '수정' : '등록'}
        </button>
      </div>
    </form>
  );
};

export default PostEditor; 