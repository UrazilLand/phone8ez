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
    <>
      {/* 데스크탑: 테이블 */}
      <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-blue-100 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden hidden lg:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50/50 dark:bg-gray-800/50 hover:bg-blue-50/50 dark:hover:bg-gray-800/50">
                <TableHead className="w-[80px] text-center text-blue-700 dark:text-blue-400 font-semibold">번호</TableHead>
                <TableHead className="text-blue-700 dark:text-blue-400 font-semibold">제목</TableHead>
                <TableHead className="w-10" />
                <TableHead className="w-32 text-blue-700 dark:text-blue-400 font-semibold text-center hidden md:table-cell">글쓴이</TableHead>
                <TableHead className="w-32 text-blue-700 dark:text-blue-400 font-semibold text-center">작성일</TableHead>
                <TableHead className="text-center hidden sm:table-cell text-blue-700 dark:text-blue-400 font-semibold">조회</TableHead>
                <TableHead className="text-center hidden sm:table-cell text-blue-700 dark:text-blue-400 font-semibold">추천</TableHead>
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
              <TableCaption className="text-gray-500 dark:text-gray-400 py-8">게시글이 없습니다.</TableCaption>
            )}
          </Table>
        </CardContent>
      </Card>
      {/* 모바일/태블릿: 카드형 리스트 */}
      <div className="block lg:hidden space-y-3">
        {posts.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">게시글이 없습니다.</div>
        )}
        {posts.map((post) => (
          <MobileBoardCard key={post.id} post={post} category={category} />
        ))}
      </div>
    </>
  );
};

// 모바일 카드형 게시글
function MobileBoardCard({ post, category }: { post: Post; category: string }) {
  return (
    <a
      href={`/board/${category}/${post.id}`}
      className="block rounded-xl border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 shadow hover:border-blue-400 dark:hover:border-blue-400 transition-colors"
    >
      <div className="flex items-center gap-2 mb-1 min-w-0">
        {post.is_notice && (
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mr-1 shrink-0">[공지]</span>
        )}
        <span className="font-medium text-gray-900 dark:text-gray-100 flex-1 truncate min-w-0">{post.title}</span>
        {post.comment_count > 0 && (
          <span className="ml-2 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold shrink-0">
            {post.comment_count}
          </span>
        )}
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0">{post.author_nickname}</span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>작성일: {new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
        <span>조회: {post.views}</span>
        <span>추천: {post.likes}</span>
      </div>
    </a>
  );
}

export default BoardList;
