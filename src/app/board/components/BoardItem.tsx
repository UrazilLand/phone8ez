import Link from 'next/link';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import UserBadge from '@/components/user/UserBadge';
import { MessageSquare, ThumbsUp, Eye, Megaphone, Flame, ShieldCheck } from 'lucide-react';
import type { Post } from './BoardList'; // Assuming Post type is exported from BoardList

interface BoardItemProps {
  post: Post;
  category: string;
}

// 배찌(아이콘)만 표시하는 컴포넌트
const UserBadgeBadgeOnly: React.FC<{ plan?: 'free' | 'pro'; role?: 'user' | 'admin' }> = ({ plan, role }) => {
  if (role === 'admin') {
    return <ShieldCheck className="h-4 w-4 text-blue-600 mx-auto" />;
  }
  if (plan === 'pro') {
    return <Flame className="h-4 w-4 text-orange-500 mx-auto" />;
  }
  return <span className="block w-4 h-4 mx-auto" />;
};

const BoardItem: React.FC<BoardItemProps> = ({ post, category }) => {
  const formattedDate = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <TableRow className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
      <TableCell className="w-[80px] text-center text-gray-500">
        {post.is_notice ? (
          <Megaphone className="h-5 w-5 mx-auto text-blue-600" />
        ) : (
          post.id
        )}
      </TableCell>
      <TableCell className="max-w-[300px] sm:max-w-none truncate">
        <Link 
          href={`/board/${category}/${post.id}`} 
          className="font-medium group-hover:text-blue-600 transition-colors text-gray-700"
        >
          {post.is_notice && (
            <span className="text-blue-600 font-bold">[공지] </span>
          )}
          {post.title}
        </Link>
        {post.comment_count > 0 && (
          <Badge variant="outline" className="ml-2 text-xs border-blue-200 text-blue-600 bg-blue-50">
            <MessageSquare className="h-3 w-3 mr-1" /> {post.comment_count}
          </Badge>
        )}
      </TableCell>
      {/* 배찌(아이콘) 셀 */}
      <TableCell className="w-10 text-center align-middle hidden md:table-cell">
        <UserBadgeBadgeOnly plan={post.author_plan} role={post.author_role} />
      </TableCell>
      <TableCell className="w-32 text-center hidden md:table-cell">
        <UserBadge nickname={post.author_nickname} plan={post.author_plan} role={post.author_role} />
      </TableCell>
      <TableCell className="w-32 text-center text-gray-500">{formattedDate}</TableCell>
      <TableCell className="text-center text-gray-500 hidden sm:table-cell">
        <div className="flex items-center justify-center">
          <Eye className="h-4 w-4 mr-1 text-blue-500"/> {post.views}
        </div>
      </TableCell>
      <TableCell className="text-center text-gray-500 hidden sm:table-cell">
        <div className="flex items-center justify-center">
          <ThumbsUp className="h-4 w-4 mr-1 text-blue-500"/> {post.likes}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default BoardItem;
