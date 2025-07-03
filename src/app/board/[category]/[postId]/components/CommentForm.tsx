'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CommentFormProps {
  postId: number;
  parentId?: number;
  onCommentAdded: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export default function CommentForm({ 
  postId, 
  parentId, 
  onCommentAdded, 
  onCancel,
  placeholder = "댓글을 입력하세요..." 
}: CommentFormProps) {
  const { toast } = useToast();
  
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "내용 입력 필요",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: content.trim(),
          post_id: postId,
          parent_id: parentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '댓글 작성에 실패했습니다.');
      }

      toast({
        title: "댓글 작성 완료",
        description: "댓글이 성공적으로 작성되었습니다.",
      });

      setContent('');
      onCommentAdded();
      
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      toast({
        title: "작성 실패",
        description: error instanceof Error ? error.message : '댓글 작성에 실패했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              rows={3}
              maxLength={1000}
              className="resize-none"
            />
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {content.length}/1000
              </div>
              
              <div className="flex gap-2">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4 mr-1" />
                    취소
                  </Button>
                )}
                
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !content.trim()}
                >
                  <Send className="w-4 h-4 mr-1" />
                  {isSubmitting ? '작성 중...' : '댓글 작성'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 