"use client";
import React, { useState, useEffect } from 'react';
import CommunityTabs from './components/CommunityTabs';
import CommunityTable from './components/CommunityTable';
import Pagination from './components/Pagination';
import SkeletonTable from './components/SkeletonTable';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const TABS = [
  { key: 'free', label: '자유게시판' },
  { key: 'humor', label: '유머게시판' },
  { key: 'mobile', label: '모바일정보' },
  { key: 'review', label: '후기 및 건의' },
];
const PAGE_SIZE = 20;

const CommunityPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // URL에서 탭/페이지/검색어 추출
  const tab = searchParams.get('tab') || 'free';
  const page = Number(searchParams.get('page') || 1);
  const search = searchParams.get('search') || '';

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    (async () => {
      // 공지글 fetch
      const { data: noticeData } = await supabase
        .from('posts')
        .select(`
          number,
          id,
          title,
          user_id,
          created_at,
          views,
          is_notice,
          comments(count),
          nickname
        `)
        .eq('is_notice', true)
        .order('number', { ascending: false });
      // 일반글 fetch (검색어 있을 때 title/content ilike)
      let query = supabase
        .from('posts')
        .select(`
          number,
          id,
          title,
          user_id,
          created_at,
          views,
          is_notice,
          comments(count),
          nickname
        `, { count: 'exact' })
        .eq('board_type', tab)
        .eq('is_notice', false);
      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }
      const { data: postData, count } = await query
        .order('number', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      // 댓글 수, 닉네임, 날짜 매핑
      const mapPost = (arr: any[] = []) => arr.map(post => ({
        ...post,
        commentCount: post.comments?.[0]?.count ?? 0,
        author: post.nickname || '알 수 없음',
        createdAt: post.created_at,
        comments: post.comments?.map?.((c: any) => ({ ...c, createdAt: c.created_at })) ?? [],
      }));
      if (!ignore) {
        setNotices(mapPost(noticeData ?? []));
        setPosts(mapPost(postData ?? []));
        setTotal(count || 0);
        setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [tab, page, search]);

  // 탭 변경 시 URL 갱신
  const handleTabChange = (newTab: string) => {
    router.push(`/community?tab=${newTab}&page=1${search ? `&search=${encodeURIComponent(search)}` : ''}`);
  };
  // 페이지 변경 시 URL 갱신
  const handlePageChange = (newPage: number) => {
    router.push(`/community?tab=${tab}&page=${newPage}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
  };
  // 검색 실행
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    router.push(`/community?tab=${tab}&page=1${searchInput ? `&search=${encodeURIComponent(searchInput)}` : ''}`);
  };
  // 상세 이동 시 URL에 탭/페이지 정보 포함
  const handleRowClick = (id: string) => {
    router.push(`/community/${tab}/${id}?page=${page}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-0 py-8">
      <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-200 mb-4">커뮤니티</h1>
      <CommunityTabs current={tab} onChange={handleTabChange} />
      {loading ? (
        <SkeletonTable />
      ) : (
        <>
          <CommunityTable
            posts={posts}
            notices={notices}
            page={page}
            pageSize={PAGE_SIZE}
            onRowClick={handleRowClick}
          />
          {/* 검색 입력창 */}
          <form onSubmit={handleSearch} className="flex gap-2 my-4 justify-end">
            <input
              className="border border-blue-200 dark:border-blue-700 rounded px-3 py-2 w-48 text-sm bg-white dark:bg-blue-950 text-gray-900 dark:text-gray-100"
              placeholder="제목 또는 내용을 입력하세요"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold text-sm"
            >
              검색
            </button>
          </form>
          <Pagination
            page={page}
            totalPages={Math.ceil(total / PAGE_SIZE)}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default function CommunityPageWrapper() {
  return (
    <Suspense>
      <CommunityPage />
    </Suspense>
  );
} 