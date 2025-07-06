import React from 'react';

interface PostDetailProps {
  post: {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    videoUrl?: string;
    author: string;
    createdAt: string;
    views: number;
    isMine: boolean;
    isAdmin: boolean;
    reportCount?: number;
    isDeleted?: boolean;
    image_urls?: string;
  };
  comments: Array<{
    id: string;
    content: string;
    author: string;
    createdAt: string;
    isMine: boolean;
    isAdmin: boolean;
    isDeleted?: boolean;
  }>;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onCommentAdd: (content: string) => void;
  onCommentEdit: (id: string, content: string) => void;
  onCommentDelete: (id: string) => void;
  onCommentReport: (id: string) => void;
}

// 동영상 embed URL 변환 함수 추가
function getEmbedUrl(url: string) {
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  // 네이버TV
  const naver = url.match(/tv\.naver\.com\/v\/(\d+)/);
  if (naver) return `https://tv.naver.com/embed/${naver[1]}`;
  // 카카오TV
  const kakao = url.match(/tv\.kakao\.com\/v\/(\d+)/);
  if (kakao) return `https://play-tv.kakao.com/embed/player/cliplink/${kakao[1]}`;
  // 기본: 원본 URL 반환
  return url;
}

const PostDetail: React.FC<PostDetailProps> = ({
  post,
  comments,
  onEdit,
  onDelete,
  onReport,
  onCommentAdd,
  onCommentEdit,
  onCommentDelete,
  onCommentReport,
}) => {
  const [commentInput, setCommentInput] = React.useState('');
  const [editingCommentId, setEditingCommentId] = React.useState<string | null>(null);
  const [editingContent, setEditingContent] = React.useState('');

  const isDeleted = post.reportCount && post.reportCount >= 100 || post.isDeleted;

  // 이미지 배열 파싱
  let imageUrls: string[] = [];
  if (Array.isArray(post.image_urls)) {
    imageUrls = post.image_urls;
  } else if (typeof post.image_urls === "string") {
    try { imageUrls = JSON.parse(post.image_urls); } catch { imageUrls = []; }
  }

  if (isDeleted) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-gray-100 dark:bg-blue-950 rounded shadow-md flex items-center justify-center min-h-[300px]">
        <span className="text-lg text-gray-400 dark:text-gray-500 italic">삭제된 게시글입니다.</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white dark:bg-blue-950 rounded shadow-md">
      {/* 게시글 정보 */}
      <div className="mb-4 border-b border-blue-100 dark:border-blue-800 pb-2 relative min-h-[240px]">
        <h2 className="text-xl font-bold text-blue-700 dark:text-blue-200 mb-2 flex items-center justify-between">
          <span className="flex-1 truncate min-w-0">{post.title}</span>
          <div className="flex flex-row items-center gap-2 flex-shrink-0">
            <button
              className="px-2 py-1 border border-red-300 text-red-500 bg-transparent rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-normal"
              onClick={onReport}
            >
              신고
            </button>
            {(post.isMine || post.isAdmin) && (
              <>
                <button className="px-2 py-1 border border-blue-300 text-blue-600 bg-transparent rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-normal" onClick={onEdit}>수정</button>
                <button className="px-2 py-1 border border-gray-300 text-gray-600 bg-transparent rounded hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors text-sm font-normal" onClick={onDelete}>삭제</button>
              </>
            )}
          </div>
        </h2>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2 mb-2">
          <span>{post.author}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <span>·</span>
          <span>조회 {post.views}</span>
        </div>
        <div className="border-t border-blue-100 dark:border-blue-800 my-3" />
        {imageUrls.length > 0 && (
          <div className="mb-2 flex flex-col items-center">
            {imageUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`첨부 이미지 ${idx + 1}`}
                className="w-auto max-w-full max-h-[400px] rounded object-contain"
                style={{ display: 'block', margin: '0 auto' }}
                loading="lazy"
              />
            ))}
          </div>
        )}
        {post.videoUrl && (
          <div className="mb-2">
            <iframe
              src={getEmbedUrl(post.videoUrl)}
              title="동영상"
              className="w-full h-56 sm:h-80 rounded border border-blue-100 dark:border-blue-800"
              allowFullScreen
            />
          </div>
        )}
        <div className="text-base text-gray-800 dark:text-gray-100 whitespace-pre-line mb-2">{post.content}</div>
      </div>
      {/* 댓글 목록 */}
      <div className="mb-2">
        <h3 className="font-semibold text-blue-700 dark:text-blue-200 mb-2">댓글</h3>
        {comments.length === 0 && <div className="text-gray-400 dark:text-gray-500">아직 댓글이 없습니다.</div>}
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="px-2 py-2 flex items-center gap-2">
              {/* 아이디 */}
              <span className="flex-shrink-0 w-[80px] text-xs text-gray-500 dark:text-gray-400 text-center">{c.author}</span>
              {/* 댓글 내용 */}
              <div className="flex-1 text-gray-800 dark:text-gray-100 break-words whitespace-pre-line text-sm min-w-0">
                {c.isDeleted ? (
                  <span className="italic text-gray-400 dark:text-gray-500">삭제된 댓글입니다.</span>
                ) : editingCommentId === c.id ? (
                  <input
                    className="w-full px-2 py-1 rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-blue-950 text-gray-900 dark:text-gray-100"
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    maxLength={500}
                  />
                ) : (
                  c.content
                )}
              </div>
              {/* 날짜 */}
              <span className="flex-shrink-0 w-[90px] text-xs text-gray-400 dark:text-gray-500 text-center">{new Date(c.createdAt).toLocaleDateString()}</span>
              {/* 신고버튼 */}
              {!c.isDeleted && (
                <button
                  className="px-1 py-0.5 min-w-0 border border-red-300 text-red-500 bg-transparent rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-normal transition-colors text-center"
                  onClick={() => onCommentReport(c.id)}
                >
                  신고
                </button>
              )}
              {/* 수정/삭제 버튼 */}
              {(c.isMine || c.isAdmin) && !c.isDeleted && (
                <>
                  <button className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs rounded" onClick={() => { setEditingCommentId(c.id); setEditingContent(c.content); }}>수정</button>
                  <button className="px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 text-xs rounded" onClick={() => onCommentDelete(c.id)}>삭제</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* 댓글 입력 */}
      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-blue-950 text-gray-900 dark:text-gray-100"
          placeholder="댓글을 입력하세요"
          value={commentInput}
          onChange={e => setCommentInput(e.target.value)}
          maxLength={500}
        />
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-50"
          onClick={() => { if (commentInput.trim()) { onCommentAdd(commentInput); setCommentInput(''); } }}
          disabled={!commentInput.trim()}
        >
          등록
        </button>
      </div>
    </div>
  );
};

export default PostDetail; 