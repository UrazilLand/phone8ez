import React from 'react';

const SkeletonTable: React.FC = () => {
  return (
    <div className="w-full overflow-x-auto animate-pulse">
      <table className="min-w-full text-sm text-left border-separate border-spacing-0">
        <thead>
          <tr className="bg-blue-50 dark:bg-blue-900">
            <th className="px-2 py-2 w-12 text-center border-b border-blue-100 dark:border-blue-800">번호</th>
            <th className="px-2 py-2 border-b border-blue-100 dark:border-blue-800">제목</th>
            <th className="px-2 py-2 w-24 text-center border-b border-blue-100 dark:border-blue-800">글쓴이</th>
            <th className="px-2 py-2 w-20 text-center border-b border-blue-100 dark:border-blue-800">날짜</th>
            <th className="px-2 py-2 w-16 text-center border-b border-blue-100 dark:border-blue-800">조회수</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 15 }).map((_, idx) => (
            <tr key={idx} className="border-b border-blue-100 dark:border-blue-800">
              <td className="text-center">
                <div className="h-4 w-6 mx-auto bg-blue-100 dark:bg-blue-800 rounded" />
              </td>
              <td>
                <div className="h-4 w-3/4 bg-blue-100 dark:bg-blue-800 rounded" />
              </td>
              <td className="text-center">
                <div className="h-4 w-12 mx-auto bg-blue-100 dark:bg-blue-800 rounded" />
              </td>
              <td className="text-center">
                <div className="h-4 w-10 mx-auto bg-blue-100 dark:bg-blue-800 rounded" />
              </td>
              <td className="text-center">
                <div className="h-4 w-8 mx-auto bg-blue-100 dark:bg-blue-800 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* 모바일: 컬럼 축소 */}
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
    </div>
  );
};

export default SkeletonTable; 