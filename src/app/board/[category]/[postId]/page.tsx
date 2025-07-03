'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Heart, MessageCircle, Calendar, User, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import type { Post } from '@/app/board/components/BoardList';
import type { Comment } from '@/app/comment/components/CommentList';
import CommentList from '@/app/comment/components/CommentList';
import CommentForm from '@/app/comment/components/CommentForm';

// API에서 받은 데이터를 Post 타입으로 변환하는 함수
const transformApiDataToPost = (apiPost: any): Post & { content: string; image_url?: string; video_url?: string } => {
  return {
    id: apiPost.id,
    title: apiPost.title,
    content: apiPost.content || '',
    author_nickname: apiPost.user?.nickname || '익명',
    author_plan: apiPost.user?.plan || 'free',
    author_role: apiPost.user?.role || 'user',
    created_at: apiPost.created_at,
    views: apiPost.views || 0,
    likes: apiPost.likes || 0,
    comment_count: apiPost.comment_count || 0,
    is_notice: apiPost.is_notice || false,
    category: apiPost.board_type || 'free',
    image_url: apiPost.image_url,
    video_url: apiPost.video_url,
  };
};

// API에서 받은 댓글 데이터를 Comment 타입으로 변환하는 함수
const transformApiDataToComment = (apiComment: any): Comment => {
  return {
    id: apiComment.id,
    author_nickname: apiComment.user?.nickname || '익명',
    author_plan: apiComment.user?.plan || 'free',
    author_role: apiComment.user?.role || 'user',
    content: apiComment.content,
    created_at: apiComment.created_at,
  };
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const postId = params.postId as string;

  const [post, setPost] = useState<(Post & { content: string; image_url?: string; video_url?: string; }) | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthor, setIsAuthor] = useState(false);

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
      }
    };

    getCurrentUser();
  }, []);

  // 게시글 상세 정보 가져오기
  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('게시글을 찾을 수 없습니다.');
        }
        throw new Error('게시글을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      const transformedPost = transformApiDataToPost(data);
      setPost(transformedPost);
      
      // 작성자 여부 확인
      if (currentUser && data.user?.email === currentUser.email) {
        setIsAuthor(true);
      }
    } catch (error) {
      console.error('게시글 조회 오류:', error);
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "게시글을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 댓글 목록 가져오기
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?post_id=${postId}`);
      
      if (!response.ok) {
        throw new Error('댓글을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      const transformedComments = data.comments.map(transformApiDataToComment);
      setComments(transformedComments);
    } catch (error) {
      console.error('댓글 조회 오류:', error);
      toast({
        title: "오류",
        description: "댓글을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingComments(false);
    }
  };

  // 댓글 추가
  const handleCommentSubmit = async (content: string) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          post_id: postId,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('댓글 작성에 실패했습니다.');
      }

      const newComment = await response.json();
      const transformedComment = transformApiDataToComment(newComment);
      setComments(prev => [transformedComment, ...prev]);
      
      // 게시글의 댓글 수 업데이트
      if (post) {
        setPost(prev => prev ? { ...prev, comment_count: prev.comment_count + 1 } : null);
      }

      toast({
        title: "성공",
        description: "댓글이 작성되었습니다.",
      });
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      toast({
        title: "오류",
        description: "댓글 작성에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 게시글 삭제
  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '게시글 삭제에 실패했습니다.');
      }

      toast({
        title: "삭제 완료",
        description: "게시글이 삭제되었습니다.",
      });

      router.push(`/board/${category}`);
    } catch (error) {
      console.error('게시글 삭제 오류:', error);
      toast({
        title: "삭제 실패",
        description: error instanceof Error ? error.message : "게시글 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (category && postId) {
      fetchPost();
      fetchComments();
    }
  }, [category, postId]);

  // 작성자 여부 업데이트
  useEffect(() => {
    if (post && currentUser) {
      setIsAuthor(post.author_nickname === currentUser.user_metadata?.name || 
                 post.author_nickname === currentUser.email?.split('@')[0]);
    }
  }, [post, currentUser]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">게시글을 찾을 수 없습니다.</h1>
          <Button asChild>
            <Link href={`/board/${category || 'free'}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> 목록으로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/board/${category}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> 목록으로
          </Link>
        </Button>
      </div>

      {/* 게시글 상세 */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {post.is_notice && (
                  <Badge variant="destructive">공지</Badge>
                )}
                <Badge variant="outline">{post.category}</Badge>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{post.author_nickname}</span>
                  {post.author_plan === 'pro' && (
                    <Badge variant="secondary" className="ml-1">PRO</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comment_count}</span>
                </div>
              </div>
            </div>
            
            {/* 작성자만 수정/삭제 버튼 표시 */}
            {isAuthor && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/board/${category}/${postId}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  수정
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  삭제
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {/* 이미지가 있는 경우 */}
            {post.image_url && (
              <div className="mb-4">
                <img 
                  src={post.image_url} 
                  alt="게시글 이미지" 
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
            
            {/* 내용 */}
            <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
              {post.content}
            </div>

            {/* 동영상이 있는 경우 */}
            {post.video_url && (
              <div className="mt-4">
                <iframe
                  src={post.video_url}
                  title="게시글 동영상"
                  className="w-full aspect-video rounded-lg"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 댓글 섹션 */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          댓글 ({post.comment_count})
        </h2>
        
        {/* 댓글 작성 폼 */}
        <CommentForm onSubmit={handleCommentSubmit} />
        
        <Separator />
        
        {/* 댓글 목록 */}
        {isLoadingComments ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <CommentList comments={comments} />
        )}
      </div>
    </div>
  );
}
