'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const boardCategories = [
  { name: '자유게시판', path: '/board/free' },
  { name: '유머게시판', path: '/board/funny' },
  { name: '모바일정보', path: '/board/mobile-info' },
  { name: '사용후기', path: '/board/review' },
];

const BoardHeader = () => {
  const pathname = usePathname();
  const currentCategoryPath = boardCategories.find(cat => pathname?.startsWith(cat.path))?.path || boardCategories[0].path;

  return (
    <nav className="mb-6 w-full">
      {/* 모바일: 가로 스크롤 탭 */}
      <ul className="flex lg:hidden overflow-x-auto no-scrollbar gap-2 py-2 px-1 bg-blue-50/70 dark:bg-gray-800/80 rounded-lg">
        {boardCategories.map((cat) => {
          const isActive = currentCategoryPath === cat.path;
          return (
            <li key={cat.path} className="shrink-0">
              <Link
                href={cat.path}
                aria-current={isActive ? 'page' : undefined}
                className={`block px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                  ${isActive
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow font-bold'
                    : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700/60'}
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                `}
              >
                {cat.name}
              </Link>
            </li>
          );
        })}
      </ul>
      {/* 데스크탑: 중앙 정렬 탭 */}
      <ul className="hidden lg:flex justify-center gap-4 py-2 bg-blue-50/70 dark:bg-gray-800/80 rounded-lg">
        {boardCategories.map((cat) => {
          const isActive = currentCategoryPath === cat.path;
          return (
            <li key={cat.path}>
              <Link
                href={cat.path}
                aria-current={isActive ? 'page' : undefined}
                className={`px-6 py-2 rounded-full text-base font-medium transition-colors
                  ${isActive
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow font-bold'
                    : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700/60'}
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                `}
              >
                {cat.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BoardHeader;
