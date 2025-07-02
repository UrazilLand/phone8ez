'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Edit, 
  Trash2, 
  Reply, 
  User, 
  Calendar,
  Check,
  X
} from 'lucide-react';
import ReportButton from '@/components/ReportButton';
import { Comment } from '@/types/comment';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: Comment;
  postId: number;
  onCommentUpdated: () => void;
  onCommentDeleted: () => void;
  isReply?: boolean;
}

export default function CommentItem({ 
  comment, 
  postId, 
  onCommentUpdated, 
  onCommentDeleted,
  isReply = false 
}: CommentItemProps) {
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ko 
      });
    } catch {
      return dateString;
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast({
        title: "내용 입력 필요",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '댓글 수정에 실패했습니다.');
      }

      toast({
        title: "수정 완료",
        description: "댓글이 성공적으로 수정되었습니다.",
      });

      setIsEditing(false);
      onCommentUpdated();
    } catch (error) {
      console.error('댓글 수정 오류:', error);
      toast({
        title: "수정 실패",
        description: error instanceof Error ? error.message : '댓글 수정에 실패했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '댓글 삭제에 실패했습니다.');
      }

      toast({
        title: "삭제 완료",
        description: "댓글이 성공적으로 삭제되었습니다.",
      });

      onCommentDeleted();
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
      toast({
        title: "삭제 실패",
        description: error instanceof Error ? error.message : '댓글 삭제에 실패했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className={`${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      <Card className="mb-3">
        <CardContent className="p-4">
          {/* 댓글 헤더 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">
                {comment.user?.nickname || '익명'}
              </span>
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.created_at)}
              </span>
              {comment.updated_at !== comment.created_at && (
                <Badge variant="outline" className="text-xs">
                  수정됨
                </Badge>
              )}
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isDeleting}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              <ReportButton targetType="comment" targetId={comment.id} />
            </div>
          </div>

          {/* 댓글 내용 */}
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                maxLength={1000}
                className="resize-none"
              />
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {editContent.length}/1000
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isDeleting}
                  >
                    <X className="w-4 h-4 mr-1" />
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={isDeleting || !editContent.trim()}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {isDeleting ? '수정 중...' : '수정'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm">{comment.content}</div>
          )}

          {/* 댓글 액션 */}
          {!isEditing && !isReply && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Reply className="w-4 h-4 mr-1" />
                답글
              </Button>
              
              {comment.reply_count && comment.reply_count > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span>답글 {comment.reply_count}개</span>
                </div>
              )}
            </div>
          )}

          {/* 답글 폼 */}
          {isReplying && !isReply && (
            <div className="mt-4">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onCommentAdded={onCommentUpdated}
                onCancel={() => setIsReplying(false)}
                placeholder={`@${comment.user?.nickname || '익명'}님에게 답글 작성...`}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 대댓글들 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onCommentUpdated={onCommentUpdated}
              onCommentDeleted={onCommentDeleted}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
} 