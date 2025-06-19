import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import BoardItem from './BoardItem';
import { Card, CardContent } from '@/components/ui/card';

export interface Post {
  id: number;
  title: string;
  author_nickname: string;
  author_plan?: 'free' | 'pro';
  author_role?: 'user' | 'admin';
  created_at: string;
  views: number;
  likes: number;
  comment_count: number;
  is_notice?: boolean;
  category: string; // Add category to Post type
}

interface BoardListProps {
  posts: Post[];
  category: string;
}

const BoardList: React.FC<BoardListProps> = ({ posts, category }) => {
  const notices = posts.filter(post => post.is_notice);
  const regularPosts = posts.filter(post => !post.is_notice);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-lg rounded-xl overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-50/50 hover:bg-blue-50/50">
              <TableHead className="w-[80px] text-center text-blue-700 font-semibold">번호</TableHead>
              <TableHead className="text-blue-700 font-semibold">제목</TableHead>
              <TableHead className="w-10" />
              <TableHead className="w-32 text-blue-700 font-semibold text-center hidden md:table-cell">글쓴이</TableHead>
              <TableHead className="w-32 text-blue-700 font-semibold text-center">작성일</TableHead>
              <TableHead className="text-center hidden sm:table-cell text-blue-700 font-semibold">조회</TableHead>
              <TableHead className="text-center hidden sm:table-cell text-blue-700 font-semibold">추천</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notices.map((post) => (
              <BoardItem key={`notice-${post.id}`} post={post} category={category} />
            ))}
            {regularPosts.map((post) => (
              <BoardItem key={post.id} post={post} category={category} />
            ))}
          </TableBody>
          {posts.length === 0 && (
            <TableCaption className="text-gray-500 py-8">게시글이 없습니다.</TableCaption>
          )}
        </Table>
      </CardContent>
    </Card>
  );
};

export default BoardList;
