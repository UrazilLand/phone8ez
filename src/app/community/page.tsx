"use client";
import React, { useState, useEffect } from 'react';
import CommunityTabs from './components/CommunityTabs';
import CommunityTable from './components/CommunityTable';
import Pagination from './components/Pagination';
import SkeletonTable from './components/SkeletonTable';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const TABS = [
  { key: 'free', label: '자유게시판' },
  { key: 'humor', label: '유머게시판' },
  { key: 'info', label: '모바일정보' },
  { key: 'review', label: '후기 및 건의' },
];
const PAGE_SIZE = 20;

const CommunityPage = () => {
  const [tab, setTab] = useState('free');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const router = useRouter();

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
          users (
            nickname
          )
        `)
        .eq('is_notice', true)
        .order('number', { ascending: false });
      // 일반글 fetch (댓글 수, 닉네임 포함)
      const { data: postData, count } = await supabase
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
          users (
            nickname
          )
        `, { count: 'exact' })
        .eq('board_type', tab)
        .eq('is_notice', false)
        .order('number', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      // 댓글 수, 닉네임, 날짜 매핑
      const mapPost = (arr: any[] = []) => arr.map(post => ({
        ...post,
        commentCount: post.comments?.[0]?.count ?? 0,
        author: post.users?.nickname || '알 수 없음',
        createdAt: post.created_at,
        // 댓글도 createdAt 매핑 (상세 fetch에서 활용)
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
  }, [tab, page]);

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-0 py-8">
      <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-200 mb-4">커뮤니티</h1>
      <CommunityTabs current={tab} onChange={t => { setTab(t); setPage(1); }} />
      {loading ? (
        <SkeletonTable />
      ) : (
        <>
          <CommunityTable
            posts={posts}
            notices={notices}
            page={page}
            pageSize={PAGE_SIZE}
            onRowClick={id => {
              router.push(`/community/${tab}/${id}`);
            }}
          />
          <Pagination
            page={page}
            totalPages={Math.ceil(total / PAGE_SIZE)}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default CommunityPage; 