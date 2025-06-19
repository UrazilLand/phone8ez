'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { type Post } from '@/components/board/BoardList';
import { type Comment } from '@/components/comment/CommentList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data generation
const generateMockPostDetail = (category: string, postId: number): Post & { content: string; image_url?: string; video_url?: string } => {
  const isNotice = category === 'free' && postId <= 2;
  return {
    id: postId,
    title: `${isNotice ? '중요 공지사항 상세' : category} 게시판 글 제목 ${postId}`,
    content: `이것은 ${category} 게시판의 ${postId}번 게시글의 상세 내용입니다. \n\n다양한 정보와 의견을 나누는 공간입니다. \n\n**중요한 내용**은 이렇게 강조될 수 있습니다. \n\n줄바꿈도 잘 적용됩니다.`,
    author_nickname: `사용자${postId % 10 + 1}`,
    author_plan: postId % 3 === 0 ? 'pro' : 'free',
    author_role: postId % 10 === 0 ? 'admin' : 'user',
    created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    views: Math.floor(Math.random() * 1000) + 50, // Ensure some views
    likes: Math.floor(Math.random() * 200) + 10,  // Ensure some likes
    comment_count: 5, // Will be derived from comments array length
    is_notice: isNotice,
    category: category,
    image_url: postId % 4 === 0 ? `https://placehold.co/800x450.png` : undefined,
    video_url: postId % 5 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : undefined,
  };
};

const generateMockComments = (count: number): Comment[] => {
  const comments: Comment[] = [];
  for (let i = 1; i <= count; i++) {
    comments.push({
      id: i,
      author_nickname: `댓글러${i}`,
      author_plan: i % 2 === 0 ? 'pro' : 'free',
      author_role: i % 5 === 0 ? 'admin' : 'user',
      content: `${i}번째 댓글입니다. 이 댓글은 게시글에 대한 의견이나 질문을 담고 있습니다.`,
      created_at: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
    });
  }
  return comments;
};


export default function PostDetailPage() {
  const params = useParams();
  const category = params.category as string;
  const postId = parseInt(params.postId as string, 10);

  const [post, setPost] = useState< (Post & { content: string; image_url?: string; video_url?: string; }) | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (category && postId) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockPost = generateMockPostDetail(category, postId);
        const mockComments = generateMockComments(5);
        mockPost.comment_count = mockComments.length;
        setPost(mockPost);
        setComments(mockComments);
        setIsLoading(false);
      }, 500);
    }
  }, [category, postId]);

  if (isLoading) {
    return (
      <div className="mb-6">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">게시글을 찾을 수 없습니다.</h1>
        <Button asChild>
          <Link href={`/board/${category || 'free'}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> 목록으로 돌아가기
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Button variant="outline" asChild>
        <Link href={`/board/${category}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> 목록으로
        </Link>
      </Button>
    </div>
  );
}
