import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // 페이지 버튼 그룹 계산 (최대 5개)
  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="flex justify-center items-center gap-1 mt-4 select-none">
      <button
        className="px-2 py-1 rounded text-blue-600 dark:text-blue-300 disabled:opacity-40"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="이전 페이지"
      >
        이전
      </button>
      {start > 1 && (
        <button
          className="px-2 py-1 text-gray-400 dark:text-gray-500"
          onClick={() => onPageChange(1)}
        >
          1
        </button>
      )}
      {start > 2 && <span className="px-1 text-gray-400 dark:text-gray-500">...</span>}
      {pages.map((p) => (
        <button
          key={p}
          className={`px-2 py-1 rounded font-semibold ${
            p === page
              ? 'bg-blue-600 text-white dark:bg-blue-400 dark:text-blue-900'
              : 'text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800'
          }`}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}
      {end < totalPages - 1 && <span className="px-1 text-gray-400 dark:text-gray-500">...</span>}
      {end < totalPages && (
        <button
          className="px-2 py-1 text-gray-400 dark:text-gray-500"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      )}
      <button
        className="px-2 py-1 rounded text-blue-600 dark:text-blue-300 disabled:opacity-40"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="다음 페이지"
      >
        다음
      </button>
      {/* 모바일: 숫자 버튼 최소화 */}
      <style jsx>{`
        @media (max-width: 640px) {
          nav > button:not([aria-current]), nav > span {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Pagination; 