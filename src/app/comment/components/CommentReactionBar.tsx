import { Button } from '@/components/ui/button';
import { ThumbsUp, Flag } from 'lucide-react';

const CommentReactionBar = () => {
  return (
    <div className="flex items-center space-x-2 mt-1">
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" disabled>
        <ThumbsUp className="h-4 w-4 mr-1" />
        추천 (0)
      </Button>
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" disabled>
        <Flag className="h-4 w-4 mr-1" />
        신고
      </Button>
    </div>
  );
};

export default CommentReactionBar;
