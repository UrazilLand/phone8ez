"use client";
import React, { useEffect, useState } from 'react';
import PostDetail from '../../components/PostDetail';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AuthGuard from '../../components/AuthGuard';

const PostDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { tab, id } = params as { tab: string; id: string };
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  // 현재 로그인 유저 fetch
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
  }, []);

  // 게시글/댓글 fetch
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    (async () => {
      // 게시글 + 작성자 정보
      const { data: postData, error: postErr } = await supabase
        .from('posts')
        .select('*, author:users(id, nickname, role)')
        .eq('id', id)
        .single();
      // 조회수 증가 (정상 조회 시 1회만)
      if (postData && !ignore) {
        await supabase
          .from('posts')
          .update({ views: (postData.views || 0) + 1 })
          .eq('id', id);
      }
      // 댓글 + 작성자 정보
      const { data: commentData } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true });
      if (!ignore) {
        if (postErr || !postData) {
          setError('존재하지 않는 게시글입니다.');
        } else {
          setPost({
            ...postData,
            createdAt: postData.created_at,
            videoUrl: postData.video_url,
          });
          const mapComment = (arr: any[] = []) => arr.map(comment => ({
            ...comment,
            createdAt: comment.created_at,
            author: comment.nickname || '익명',
          }));
          setComments(mapComment(commentData ?? []));
        }
        setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  // 권한 계산
  const isMine = post && user && post.user_id === user.id;
  const isAdmin = user && (user.role === 'admin' || post?.author?.role === 'admin');
  const authorName = post?.nickname || '익명';

  // 댓글 권한/작성자
  const commentsWithAuth = comments.map(c => ({
    ...c,
    isMine: user && c.user_id === user.id,
    isAdmin: false, // 관리자 여부는 별도 처리 필요시 확장
    author: c.nickname || '익명',
  }));

  // 신고 100회 이상이면 삭제 처리
  const postDeleted = post && post.reportCount !== undefined && post.reportCount >= 100;
  const commentsFiltered = commentsWithAuth.map(c => ({
    ...c,
    isDeleted: c.reportCount !== undefined && c.reportCount >= 100,
  }));

  // 댓글 등록
  const handleCommentAdd = async (content: string) => {
    if (!user) return;
    // users 테이블에서 nickname 조회
    const { data: userInfo } = await supabase
      .from('users')
      .select('nickname')
      .eq('id', user.id)
      .maybeSingle();
    const nickname = userInfo?.nickname || '익명';
    const { data, error: err } = await supabase
      .from('comments')
      .insert({ post_id: id, content, user_id: user.id, nickname })
      .select('*')
      .single();
    if (!err && data) setComments([
      ...comments,
      {
        ...data,
        createdAt: data.created_at,
        author: data.nickname || '익명',
      }
    ]);
  };
  // 댓글 수정
  const handleCommentEdit = async (cid: string, content: string) => {
    const { data, error: err } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', cid)
      .select('*')
      .single();
    if (!err && data) setComments(comments.map(c =>
      c.id === cid
        ? { ...data, createdAt: data.created_at, author: data.nickname || '익명' }
        : c
    ));
  };
  // 댓글 삭제
  const handleCommentDelete = async (cid: string) => {
    const { error: err } = await supabase
      .from('comments')
      .delete()
      .eq('id', cid);
    if (!err) setComments(comments.filter(c => c.id !== cid));
  };
  // 댓글 신고
  const handleCommentReport = async (cid: string) => {
    await supabase.from('reports').insert({ target_type: 'comment', target_id: cid });
    alert('댓글이 신고되었습니다.');
  };
  // 게시글 신고
  const handlePostReport = async () => {
    await supabase.from('reports').insert({ target_type: 'post', target_id: id });
    alert('게시글이 신고되었습니다.');
  };
  // 게시글 삭제
  const handlePostDelete = async () => {
    await supabase.from('posts').delete().eq('id', id);
    alert('삭제되었습니다.');
    router.replace('/community');
  };
  // 게시글 수정(페이지 이동)
  const handlePostEdit = () => {
    router.push(`/community/${tab}/write?id=${id}`);
  };

  if (loading) return <div className="max-w-2xl mx-auto px-2 sm:px-0 py-8 text-center text-blue-700 dark:text-blue-200">로딩 중...</div>;
  if (error) return <div className="max-w-2xl mx-auto px-2 sm:px-0 py-8 text-center text-red-500">{error}</div>;
  if (postDeleted) return <div className="max-w-2xl mx-auto px-2 sm:px-0 py-8 text-center text-gray-400 dark:text-gray-500 text-lg">삭제된 게시글입니다.</div>;

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-0 py-8">
      <PostDetail
        post={{
          ...post,
          isMine,
          isAdmin,
          author: authorName,
        }}
        comments={commentsFiltered}
        onEdit={handlePostEdit}
        onDelete={handlePostDelete}
        onReport={handlePostReport}
        onCommentAdd={handleCommentAdd}
        onCommentEdit={handleCommentEdit}
        onCommentDelete={handleCommentDelete}
        onCommentReport={handleCommentReport}
      />
    </div>
  );
};

export default PostDetailPage; 