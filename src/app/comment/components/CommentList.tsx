import CommentItem from './CommentItem';

export interface Comment {
  id: number;
  author_nickname: string;
  author_plan?: 'free' | 'pro';
  author_role?: 'user' | 'admin';
  content: string;
  created_at: string;
}

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  if (comments.length === 0) {
    return <p className="text-muted-foreground mt-4">등록된 댓글이 없습니다.</p>;
  }

  return (
    <div className="mt-6 space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;
