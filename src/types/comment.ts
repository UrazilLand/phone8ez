export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    email: string;
    nickname: string;
  };
  replies?: Comment[];
  reply_count?: number;
}

export interface CreateCommentRequest {
  content: string;
  parent_id?: number;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
} 