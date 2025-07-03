'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const boardCategories = [
  { id: 'free', name: '자유게시판', path: '/board/free' },
  { id: 'funny', name: '유머게시판', path: '/board/funny' },
  { id: 'mobile-info', name: '모바일정보', path: '/board/mobile-info' },
  { id: 'review', name: '사용후기', path: '/board/review' },
];

interface BoardHeaderProps {
  onCategoryChange?: (category: string) => void;
  currentCategory?: string;
}

const BoardHeader = ({ onCategoryChange, currentCategory }: BoardHeaderProps) => {
  const pathname = usePathname();
  
  // props로 받은 카테고리가 있으면 사용, 없으면 pathname에서 추출
  const activeCategory = currentCategory || 
    boardCategories.find(cat => pathname?.startsWith(cat.path))?.id || 
    'free';

  const handleCategoryClick = (categoryId: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  return (
    <nav className="mb-6 w-full">
      {/* 모바일: 가로 스크롤 탭 */}
      <ul className="flex lg:hidden overflow-x-auto no-scrollbar gap-2 py-2 px-1 bg-blue-50/70 dark:bg-gray-800/80 rounded-lg">
        {boardCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <li key={cat.path} className="shrink-0">
              {onCategoryChange ? (
                <button
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`block px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                    ${isActive
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow font-bold'
                      : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700/60'}
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                  `}
                >
                  {cat.name}
                </button>
              ) : (
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
              )}
            </li>
          );
        })}
      </ul>
      {/* 데스크탑: 중앙 정렬 탭 */}
      <ul className="hidden lg:flex justify-center gap-4 py-2 bg-blue-50/70 dark:bg-gray-800/80 rounded-lg">
        {boardCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <li key={cat.path}>
              {onCategoryChange ? (
                <button
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-6 py-2 rounded-full text-base font-medium transition-colors
                    ${isActive
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow font-bold'
                      : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700/60'}
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                  `}
                >
                  {cat.name}
                </button>
              ) : (
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
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BoardHeader;
