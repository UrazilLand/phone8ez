export interface Post {
  id: number;
  title: string;
  content: string;
  board_type: string;
  image_url?: string;
  video_url?: string;
  user_id: number;
  views: number;
  likes: number;
  is_notice: boolean;
  created_at: string;
  updated_at: string;
  comment_count?: number;
  user?: {
    id: number;
    email: string;
    nickname: string;
  };
}

export interface CreatePostRequest {
  title: string;
  content: string;
  board_type: string;
  image_url?: string;
  video_url?: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  board_type?: string;
  image_url?: string;
  video_url?: string;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

export interface BoardCategory {
  id: string;
  name: string;
  description: string;
}

export const BOARD_CATEGORIES: BoardCategory[] = [
  {
    id: 'general',
    name: '자유게시판',
    description: '자유로운 이야기를 나누는 공간'
  },
  {
    id: 'notice',
    name: '공지사항',
    description: '중요한 공지사항을 확인하세요'
  },
  {
    id: 'qna',
    name: '질문과답변',
    description: '궁금한 점을 물어보세요'
  },
  {
    id: 'review',
    name: '리뷰',
    description: '사용 후기를 공유해주세요'
  }
]; 