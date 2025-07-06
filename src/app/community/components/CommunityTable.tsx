import React from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
dayjs.extend(timezone);

interface Post {
  id: string;
  title: string;
  commentCount: number;
  reportCount?: number;
  author: string;
  createdAt: string;
  views: number;
  isNotice?: boolean;
  isAdmin?: boolean;
  isDeleted?: boolean;
  nickname?: string;
  number: number;
}

interface CommunityTableProps {
  posts: Post[];
  notices?: Post[];
  page: number;
  pageSize: number;
  onRowClick: (id: string) => void;
}

const formatDate = (date: string) => {
  return dayjs.utc(date).tz('Asia/Seoul').format('MM-DD');
};

const CommunityTable: React.FC<CommunityTableProps> = ({ posts, notices = [], page, pageSize, onRowClick }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-sm text-left border-separate border-spacing-0">
        <thead>
          <tr className="bg-blue-50 dark:bg-gray-700">
            <th className="px-2 py-2 w-12 text-center border-b border-blue-100 dark:border-blue-800">번호</th>
            <th className="px-2 py-2 border-b border-blue-100 dark:border-blue-800">제목</th>
            <th className="px-2 py-2 w-24 text-center border-b border-blue-100 dark:border-blue-800">글쓴이</th>
            <th className="px-2 py-2 w-20 text-center border-b border-blue-100 dark:border-blue-800">날짜</th>
            <th className="px-2 py-2 w-16 text-center border-b border-blue-100 dark:border-blue-800">조회수</th>
          </tr>
        </thead>
        <tbody>
          {/* 공지글 상단 고정 */}
          {notices.map((notice, idx) => (
            <tr
              key={notice.id}
              className={clsx(
                'bg-yellow-50 dark:bg-yellow-900 font-bold cursor-pointer',
                'hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors'
              )}
              onClick={() => onRowClick(notice.id)}
            >
              <td className="text-center text-blue-600 dark:text-blue-300">공지</td>
              <td className="truncate">
                {notice.title}
                {notice.commentCount > 0 && (
                  <span className="ml-2 text-orange-500 dark:text-orange-300">({notice.commentCount})</span>
                )}
                {notice.reportCount && notice.reportCount > 0 && (
                  <span className="ml-2 text-red-500 dark:text-red-300">(신고 {notice.reportCount})</span>
                )}
              </td>
              <td className="text-center">{notice.author}</td>
              <td className="text-center">{formatDate(notice.createdAt)}</td>
              <td className="text-center">{notice.views}</td>
            </tr>
          ))}
          {/* 일반글 */}
          {posts.map((post, idx) => {
            const isDeleted = post.reportCount && post.reportCount >= 100 || post.isDeleted;
            return (
              <tr
                key={post.id}
                className={
                  isDeleted
                    ? 'bg-gray-100 dark:bg-blue-950 text-gray-400 cursor-not-allowed select-none'
                    : 'hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer'
                }
                style={{ paddingTop: '8px', paddingBottom: '8px' }}
                onClick={() => {
                  if (!isDeleted) onRowClick(post.id);
                }}
              >
                <td className="w-12 text-center py-3">{post.number}</td>
                <td className="px-2 py-3">
                  {isDeleted ? (
                    <span className="italic">삭제된 게시글입니다.</span>
                  ) : (
                    <span>
                      {post.title}
                      {post.commentCount > 0 && (
                        <span className="ml-1 text-xs text-blue-500">({post.commentCount})</span>
                      )}
                    </span>
                  )}
                </td>
                <td className="w-24 text-center py-3">{post.author}</td>
                <td className="w-24 text-center py-3">{formatDate(post.createdAt)}</td>
                <td className="w-16 text-center py-3">{post.views}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* 모바일: 컬럼 축소 */}
      {/*
      <style jsx>{`
        @media (max-width: 640px) {
          table thead th:nth-child(1),
          table tbody td:nth-child(1),
          table thead th:nth-child(5),
          table tbody td:nth-child(5) {
            display: none;
          }
        }
      `}</style>
      */}
    </div>
  );
};

export default CommunityTable;