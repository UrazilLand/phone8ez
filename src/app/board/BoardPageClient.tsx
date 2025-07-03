'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BoardHeader from './components/BoardHeader';
import BoardFilterBar from './components/BoardFilterBar';
import BoardList, { type Post } from './components/BoardList';
import Pagination from './components/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 20;

// API에서 받은 데이터를 Post 타입으로 변환하는 함수
const transformApiDataToPost = (apiPost: any): Post => {
  return {
    id: apiPost.id,
    title: apiPost.title,
    author_nickname: apiPost.user?.nickname || '익명',
    author_plan: apiPost.user?.plan || 'free',
    author_role: apiPost.user?.role || 'user',
    created_at: apiPost.created_at,
    views: apiPost.views || 0,
    likes: apiPost.likes || 0,
    comment_count: apiPost.comment_count || 0,
    is_notice: apiPost.is_notice || false,
    category: apiPost.board_type || 'free',
  };
};

export default function BoardPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = 'free'; // 기본값, 실제로는 URL 파라미터에서 받아야 함

  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');

  // 게시글 목록 가져오기
  const fetchPosts = async (page: number, search: string = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        board_type: category,
        ...(search && { search })
      });

      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) {
        throw new Error('게시글을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      const transformedPosts = data.posts.map(transformApiDataToPost);
      setPosts(transformedPosts);
      setTotalPosts(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('게시글 목록 조회 오류:', error);
      toast({
        title: '오류',
        description: '게시글을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
      setPosts([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const pageQueryParam = searchParams.get('page');
    const page = parseInt(pageQueryParam || '1', 10);
    setCurrentPage(page);
    fetchPosts(page, currentSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, searchParams, currentSearch]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('page', page.toString());
    router.push(newUrl.pathname + newUrl.search);
  };

  const handleSearchChange = (value: string) => setSearchValue(value);
  const handleSearchClick = () => {
    setCurrentSearch(searchValue);
    setCurrentPage(1);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('page', '1');
    if (searchValue) {
      newUrl.searchParams.set('search', searchValue);
    } else {
      newUrl.searchParams.delete('search');
    }
    router.push(newUrl.pathname + newUrl.search);
  };

  const handleWriteClick = () => {
    router.push(`/board/${category}/write`);
  };

  const categoryTitleMap: { [key: string]: string } = {
    free: '자유게시판',
    funny: '유머게시판',
    'mobile-info': '모바일정보',
    review: '사용후기',
  };

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-headline font-bold text-blue-700 dark:text-blue-400">
          {categoryTitleMap[category] || '커뮤니티'}
        </h1>
        <BoardHeader />
        <BoardFilterBar
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onSearchClick={handleSearchClick}
          onWriteClick={handleWriteClick}
        />
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <BoardList posts={posts} category={category} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {currentSearch ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
          </div>
        )}
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </div>
    </div>
  );
} 