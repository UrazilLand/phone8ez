import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

const CommentForm = () => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2 font-headline text-primary">댓글 작성</h3>
      <div className="space-y-2">
        <Textarea placeholder="댓글을 입력하세요. (로그인 필요)" rows={3} disabled />
        <Button disabled className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Send className="mr-2 h-4 w-4" />
          등록
        </Button>
        <p className="text-sm text-muted-foreground">
          커뮤니티 가이드라인을 준수해주세요. 비방이나 욕설은 제재 대상이 될 수 있습니다.
        </p>
      </div>
    </div>
  );
};

export default CommentForm;
