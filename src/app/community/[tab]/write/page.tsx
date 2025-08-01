'use client';
import React, { useEffect, useState } from 'react';
import PostEditor from '../../components/PostEditor';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AuthGuard from '../../components/AuthGuard';

const WritePage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const id = searchParams.get('id');
  const tab = params.tab as string;

  // 로그인 유저 fetch
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
  }, []);

  // 수정 시 기존 데이터 fetch
  useEffect(() => {
    if (!id) return setInit(true);
    (async () => {
      const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
      setInitialData(data || null);
      setInit(true);
    })();
  }, [id]);

  const handleSubmit = async (data: { title: string; content: string; imageUrl?: string; videoUrl?: string; boardType: string }) => {
    setLoading(true);
    if (id) {
      // 수정
      const { error } = await supabase.from('posts').update({
        ...data,
        video_url: data.videoUrl || '',
        image_urls: data.imageUrl ? [data.imageUrl] : [],
        board_type: data.boardType,
      }).eq('id', id);
      setLoading(false);
      if (!error) {
        alert('수정되었습니다!');
        router.push(`/community/${tab}/${id}`);
      }
    } else {
      // 등록
      const { imageUrl, videoUrl, boardType, ...rest } = data;
      if (!user?.id) {
        alert('로그인 정보가 없습니다.');
        setLoading(false);
        return;
      }
      // user.id로 users 테이블에서 nickname 조회
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('nickname')
        .eq('id', user.id)
        .single();
      if (userError || !userRow) {
        alert('닉네임 정보를 불러올 수 없습니다.');
        setLoading(false);
        return;
      }
      const { data: newPost, error } = await supabase.from('posts').insert({
        ...rest,
        image_urls: imageUrl ? [imageUrl] : [],
        video_url: videoUrl || '',
        board_type: boardType,
        user_id: user.id,
        nickname: userRow.nickname // nickname도 함께 저장
      }).select('id').single();
      setLoading(false);
      if (!error && newPost) {
        alert('게시글이 등록되었습니다!');
        router.push(`/community/${boardType}/${newPost.id}`);
      }
    }
  };

  if (!init) return <div className="max-w-2xl mx-auto px-2 sm:px-0 py-8 text-center text-blue-700 dark:text-blue-200">로딩 중...</div>;

  return (
    <div className="min-h-[100vh] bg-white dark:bg-[#101624]">
      <AuthGuard isLoggedIn={!!user} onLoginClick={() => router.push('/auth/login')}>
        <PostEditor initialData={initialData || undefined} onSubmit={handleSubmit} loading={loading} isEdit={!!id} initialBoardType={tab} />
      </AuthGuard>
    </div>
  );
};

export default WritePage; 