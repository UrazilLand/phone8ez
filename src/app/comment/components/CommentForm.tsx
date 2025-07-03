'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

const CommentForm = ({ onSubmit }: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "알림",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (content.length > 1000) {
      toast({
        title: "알림",
        description: "댓글은 1000자 이내로 작성해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent(''); // 성공 시 입력 필드 초기화
    } catch (error) {
      // 에러는 onSubmit에서 처리됨
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <h3 className="text-lg font-semibold mb-2 font-headline text-primary">댓글 작성</h3>
      <div className="space-y-2">
        <Textarea 
          placeholder="댓글을 입력하세요..." 
          rows={3} 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          maxLength={1000}
        />
        <div className="flex items-center justify-between">
          <Button 
            type="submit" 
            disabled={isSubmitting || !content.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? '등록 중...' : '등록'}
          </Button>
          <span className="text-sm text-muted-foreground">
            {content.length}/1000
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          커뮤니티 가이드라인을 준수해주세요. 비방이나 욕설은 제재 대상이 될 수 있습니다.
        </p>
      </div>
    </form>
  );
};

export default CommentForm;
