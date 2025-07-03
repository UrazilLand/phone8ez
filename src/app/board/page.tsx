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

export default function BoardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState('free');
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

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
      
      // API 데이터를 Post 타입으로 변환
      const transformedPosts = data.posts.map(transformApiDataToPost);
      
      setPosts(transformedPosts);
      setTotalPosts(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('게시글 목록 조회 오류:', error);
      toast({
        title: "오류",
        description: "게시글을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
      setPosts([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 변경 시 게시글 다시 가져오기
  useEffect(() => {
    const pageQueryParam = searchParams.get('page');
    const page = parseInt(pageQueryParam || '1', 10);
    setCurrentPage(page);
    fetchPosts(page, search);
  }, [category, searchParams, search]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // URL 쿼리 파라미터 업데이트
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('page', page.toString());
    router.push(newUrl.pathname + newUrl.search);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setCurrentPage(1);
    setSearch('');
    setSearchInput('');
    // URL 쿼리 파라미터 업데이트
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('page', '1');
    newUrl.searchParams.delete('search');
    router.push(newUrl.pathname + newUrl.search);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setCurrentPage(1);
    // URL 쿼리 파라미터 업데이트
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('page', '1');
    if (searchInput) {
      newUrl.searchParams.set('search', searchInput);
    } else {
      newUrl.searchParams.delete('search');
    }
    router.push(newUrl.pathname + newUrl.search);
  };

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <BoardHeader onCategoryChange={handleCategoryChange} currentCategory={category} />
        <BoardFilterBar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onSearchClick={handleSearch}
          onWriteClick={() => router.push(`/board/${category}/write`)}
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
            {search ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
          </div>
        )}
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </div>
    </div>
  );
} 