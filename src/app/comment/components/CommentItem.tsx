import UserBadge from '@/components/user/UserBadge';
import CommentReactionBar from './CommentReactionBar';
import type { Comment } from './CommentList'; // Assuming Comment type is exported from CommentList

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const formattedDate = new Date(comment.created_at).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="py-4 border-b border-border last:border-b-0">
      <div className="flex items-start space-x-3">
        {/* Placeholder for avatar if needed in future */}
        {/* <Avatar className="h-8 w-8">
          <AvatarFallback>{comment.author_nickname.substring(0, 1)}</AvatarFallback>
        </Avatar> */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <UserBadge nickname={comment.author_nickname} plan={comment.author_plan} role={comment.author_role} />
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>
          <p className="mt-1 text-sm text-foreground/90 whitespace-pre-line">{comment.content}</p>
          <CommentReactionBar />
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
