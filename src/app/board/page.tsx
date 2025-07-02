'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BoardHeader from './components/BoardHeader';
import BoardFilterBar from './components/BoardFilterBar';
import BoardList, { type Post } from './components/BoardList';
import Pagination from './components/Pagination';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_PAGE = 20;

export default function BoardPage() {
  const router = useRouter();
  const [category, setCategory] = useState('free');
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          board_type: category,
          ...(search && { search })
        });
        const res = await fetch(`/api/posts?${params}`);
        if (!res.ok) throw new Error('게시글을 불러오는데 실패했습니다.');
        const data = await res.json();
        setPosts(data.posts);
        setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
      } catch (e) {
        setPosts([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [category, currentPage, search]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <BoardHeader />
        <BoardFilterBar
          searchValue={searchInput ?? ''}
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
          <div className="text-center py-12 text-muted-foreground">게시글이 없습니다.</div>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  );
} 