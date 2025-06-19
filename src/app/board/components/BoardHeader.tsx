'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const boardCategories = [
  { name: '자유게시판', path: '/board/free' },
  { name: '유머게시판', path: '/board/funny' },
  { name: '건의사항', path: '/board/suggestion' },
  { name: '사용후기', path: '/board/review' },
];

const BoardHeader = () => {
  const pathname = usePathname();
  const currentCategoryPath = boardCategories.find(cat => pathname?.startsWith(cat.path))?.path || boardCategories[0].path;

  return (
    <div className="mb-6">
      <Tabs value={currentCategoryPath} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-blue-50/50 p-1 rounded-lg">
          {boardCategories.map((category) => (
            <TabsTrigger 
              key={category.path} 
              value={category.path} 
              asChild 
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all duration-200"
            >
              <Link href={category.path} className="font-medium text-gray-600 hover:text-blue-600">
                {category.name}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default BoardHeader;
