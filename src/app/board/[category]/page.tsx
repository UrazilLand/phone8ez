'use client'; // Required for usePathname, useState, useEffect

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import BoardHeader from '../components/BoardHeader';
import BoardFilterBar from '../components/BoardFilterBar';
import BoardList, { type Post } from '../components/BoardList';
import Pagination from '../components/Pagination';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_PAGE = 20;

// Mock data generation
const generateMockPosts = (category: string, count: number): Post[] => {
  const posts: Post[] = [];
  for (let i = 1; i <= count; i++) {
    const isNotice = category === 'free' && i <= 2; // Make first 2 posts in 'free' notices
    posts.push({
      id: i,
      title: `${isNotice ? '중요 공지사항' : category} 게시판 글 제목 ${i}`,
      author_nickname: `사용자${i % 10 + 1}`,
      author_plan: i % 3 === 0 ? 'pro' : 'free',
      author_role: i % 10 === 0 ? 'admin' : 'user',
      created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 200),
      comment_count: Math.floor(Math.random() * 50),
      is_notice: isNotice,
      category: category,
    });
  }
  return posts.sort((a,b) => (b.is_notice ? 1 : 0) - (a.is_notice ? 1 : 0) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export default function BoardCategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const category = params.category as string || 'free';
  
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const pageQueryParam = searchParams.get('page');
    const page = parseInt(pageQueryParam || '1', 10);
    setCurrentPage(page);

    // Simulate API call
    setTimeout(() => {
      const mockPostsForCategory = generateMockPosts(category, 55); // Generate 55 posts for testing pagination
      setAllPosts(mockPostsForCategory);
      setTotalPages(Math.ceil(mockPostsForCategory.length / ITEMS_PER_PAGE));
      setIsLoading(false);
    }, 500);
  }, [category, searchParams]);

  useEffect(() => {
    if (allPosts.length > 0) {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setDisplayedPosts(allPosts.slice(startIndex, endIndex));
    }
  }, [allPosts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // In a real app, you'd update the URL query parameter here
    // router.push(`/board/${category}?page=${page}`);
  };

  const categoryTitleMap: { [key: string]: string } = {
    free: '자유게시판',
    funny: '유머게시판',
    suggestion: '건의사항',
    review: '사용후기',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold text-blue-700">
        {categoryTitleMap[category] || '커뮤니티'}
      </h1>
      <BoardHeader />
      <BoardFilterBar />
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-grow">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      ) : (
        <BoardList posts={displayedPosts} category={category} />
      )}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
}
