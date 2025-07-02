'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Comment } from '@/types/comment';
import { useToast } from '@/hooks/use-toast';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

interface CommentListProps {
  postId: number;
}

export default function CommentList({ postId }: CommentListProps) {
  const { toast } = useToast();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchComments = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/comments?post_id=${postId}`);
      
      if (!response.ok) {
        throw new Error('댓글을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error('댓글 조회 오류:', error);
      toast({
        title: "오류 발생",
        description: "댓글을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleCommentAdded = () => {
    fetchComments();
  };

  const handleCommentUpdated = () => {
    fetchComments();
  };

  const handleCommentDeleted = () => {
    fetchComments();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            댓글
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">댓글을 불러오는 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          댓글 {comments.length}개
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 댓글 작성 폼 */}
        <CommentForm
          postId={postId}
          onCommentAdded={handleCommentAdded}
        />

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>아직 댓글이 없습니다.</p>
              <p className="text-sm">첫 번째 댓글을 작성해보세요!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
              />
            ))
          )}
        </div>

        {/* 새로고침 버튼 */}
        {comments.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchComments}
              disabled={refreshing}
            >
              <Loader2 className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? '새로고침 중...' : '새로고침'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 