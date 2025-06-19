import Image from 'next/image';
import UserBadge from '@/components/user/UserBadge';
import PostVideoEmbed from './PostVideoEmbed';
import CommentList, { type Comment } from '@/components/comment/CommentList';
import CommentForm from '@/components/comment/CommentForm';
import { type Post } from '@/components/board/BoardList'; // Re-use Post type
import { Badge } from '@/components/ui/badge';
import { Eye, ThumbsUp, CalendarDays, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface PostDetailViewProps {
  post: Post & { content: string; image_url?: string; video_url?: string; }; // Extend Post with more details
  comments: Comment[];
}

const PostDetailView: React.FC<PostDetailViewProps> = ({ post, comments }) => {
  const formattedDate = new Date(post.created_at).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Placeholder for Markdown rendering
  const renderContent = (content: string) => {
    // Basic Markdown-like features: newlines and bold text
    // In a real app, use a library like react-markdown
    return content
      .split('\n')
      .map((line, index) => {
        const boldedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: boldedLine }} />;
      });
  };


  return (
    <article className="bg-card p-6 sm:p-8 rounded-lg shadow-xl">
      {/* Post Header */}
      <header className="mb-6">
        {post.is_notice && (
          <Badge variant="default" className="mb-2 bg-primary text-primary-foreground">공지</Badge>
        )}
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-3">{post.title}</h1>
        <div className="flex flex-wrap items-center text-sm text-muted-foreground space-x-4">
          <UserBadge nickname={post.author_nickname} plan={post.author_plan} role={post.author_role} />
          <span className="flex items-center"><CalendarDays className="mr-1 h-4 w-4" /> {formattedDate}</span>
          <span className="flex items-center"><Eye className="mr-1 h-4 w-4" /> 조회 {post.views}</span>
          <span className="flex items-center"><ThumbsUp className="mr-1 h-4 w-4" /> 추천 {post.likes}</span>
        </div>
      </header>

      <Separator className="my-6" />

      {/* Post Content */}
      <div className="prose prose-sm sm:prose-base max-w-none text-foreground/90 mb-6 min-h-[150px]">
        {post.image_url && (
          <div className="my-6 relative aspect-video max-w-2xl mx-auto">
            <Image
              src={post.image_url}
              alt={post.title}
              layout="fill"
              objectFit="contain"
              className="rounded-lg shadow-md"
              data-ai-hint="user content"
            />
          </div>
        )}
        {renderContent(post.content)}
        <PostVideoEmbed videoUrl={post.video_url} />
      </div>
      
      {/* Actions for author/admin (placeholder) */}
      { (post.author_role === 'admin' || post.author_nickname === '현재사용자닉네임') && (
        <div className="flex space-x-2 mb-6">
          <Button variant="outline" size="sm" disabled>
            <Edit className="mr-2 h-4 w-4" /> 수정
          </Button>
          <Button variant="destructive" size="sm" disabled>
            <Trash2 className="mr-2 h-4 w-4" /> 삭제
          </Button>
        </div>
      )}

      <Separator className="my-6" />

      {/* Comments Section */}
      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4 text-primary">댓글 ({comments.length})</h2>
        <CommentList comments={comments} />
        <CommentForm />
      </section>
    </article>
  );
};

export default PostDetailView;
