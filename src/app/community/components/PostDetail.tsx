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
      <div className="mb-4 border-b border-blue-100 dark:border-blue-800 pb-2">
        <h2 className="text-xl font-bold text-blue-700 dark:text-blue-200 mb-2">{post.title}</h2>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2 mb-2">
          <span>{post.author}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <span>·</span>
          <span>조회 {post.views}</span>
        </div>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="첨부 이미지"
            className="w-full max-h-80 object-contain rounded mb-2 border border-blue-100 dark:border-blue-800"
            loading="lazy"
          />
        )}
        {post.videoUrl && (
          <div className="mb-2">
            <iframe
              src={post.videoUrl}
              title="동영상"
              className="w-full h-56 sm:h-80 rounded border border-blue-100 dark:border-blue-800"
              allowFullScreen
            />
          </div>
        )}
        <div className="text-base text-gray-800 dark:text-gray-100 whitespace-pre-line mb-2">{post.content}</div>
        <div className="flex gap-2 mt-2">
          <button className="px-3 py-1 rounded bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200" onClick={onReport}>신고</button>
          {(post.isMine || post.isAdmin) && (
            <>
              <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200" onClick={onEdit}>수정</button>
              <button className="px-3 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200" onClick={onDelete}>삭제</button>
            </>
          )}
        </div>
      </div>
      {/* 댓글 목록 */}
      <div className="mb-2">
        <h3 className="font-semibold text-blue-700 dark:text-blue-200 mb-2">댓글</h3>
        {comments.length === 0 && <div className="text-gray-400 dark:text-gray-500">아직 댓글이 없습니다.</div>}
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="bg-blue-50 dark:bg-blue-900 rounded p-2 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1">
                {c.isDeleted ? (
                  <div className="italic text-gray-400 dark:text-gray-500">삭제된 댓글입니다.</div>
                ) : editingCommentId === c.id ? (
                  <>
                    <input
                      className="w-full px-2 py-1 rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-blue-950 text-gray-900 dark:text-gray-100"
                      value={editingContent}
                      onChange={e => setEditingContent(e.target.value)}
                      maxLength={500}
                    />
                    <div className="flex gap-2 mt-1">
                      <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={() => { onCommentEdit(c.id, editingContent); setEditingCommentId(null); }}>저장</button>
                      <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setEditingCommentId(null)}>취소</button>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-800 dark:text-gray-100 whitespace-pre-line">{c.content}</div>
                )}
              </div>
              <div className="flex flex-col items-end sm:items-center gap-1 min-w-[80px]">
                <span className="text-xs text-gray-500 dark:text-gray-400">{c.author}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                {!c.isDeleted && (
                  <div className="flex gap-1 mt-1">
                    <button className="px-2 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200 text-xs" onClick={() => onCommentReport(c.id)}>신고</button>
                    {(c.isMine || c.isAdmin) && (
                      <>
                        <button className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs" onClick={() => { setEditingCommentId(c.id); setEditingContent(c.content); }}>수정</button>
                        <button className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 text-xs" onClick={() => onCommentDelete(c.id)}>삭제</button>
                      </>
                    )}
                  </div>
                )}
              </div>
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