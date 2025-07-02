import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createCommentSchema = z.object({
  content: z.string().min(1, '댓글 내용을 입력해주세요').max(1000, '댓글은 1000자 이내로 입력해주세요'),
  parent_id: z.number().optional(),
});

// 댓글 목록 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    if (!postId) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const offset = (page - 1) * limit;
    
    // 전체 댓글 수 조회 (대댓글 제외)
    const countResult = await db.execute({
      sql: `
        SELECT COUNT(*) as total 
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id 
        WHERE c.post_id = ? AND c.parent_id IS NULL
      `,
      args: [postId]
    });
    const total = countResult.rows[0]?.total as number;
    
    // 댓글 목록 조회 (대댓글 제외)
    const commentsResult = await db.execute({
      sql: `
        SELECT 
          c.*,
          u.email,
          u.nickname,
          (SELECT COUNT(*) FROM comments WHERE parent_id = c.id) as reply_count
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ? AND c.parent_id IS NULL
        ORDER BY c.created_at ASC
        LIMIT ? OFFSET ?
      `,
      args: [postId, limit.toString(), offset.toString()]
    });
    
    const comments = commentsResult.rows.map(row => ({
      id: row.id,
      post_id: row.post_id,
      user_id: row.user_id,
      content: row.content,
      parent_id: row.parent_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: row.user_id ? {
        id: row.user_id,
        email: row.email,
        nickname: row.nickname
      } : undefined,
      reply_count: row.reply_count
    }));
    
    // 각 댓글의 대댓글 조회
    for (const comment of comments) {
      const repliesResult = await db.execute({
        sql: `
          SELECT 
            c.*,
            u.email,
            u.nickname
          FROM comments c
          LEFT JOIN users u ON c.user_id = u.id
          WHERE c.parent_id = ?
          ORDER BY c.created_at ASC
        `,
        args: [comment.id?.toString() || '0']
      });
      
      (comment as any).replies = repliesResult.rows.map(row => ({
        id: row.id,
        post_id: row.post_id,
        user_id: row.user_id,
        content: row.content,
        parent_id: row.parent_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user: row.user_id ? {
          id: row.user_id,
          email: row.email,
          nickname: row.nickname
        } : undefined
      }));
    }
    
    return NextResponse.json({
      comments,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('댓글 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '댓글 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 댓글 작성 (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCommentSchema.parse(body);
    
    // 댓글 생성
    const result = await db.execute({
      sql: `
        INSERT INTO comments (post_id, user_id, content, parent_id)
        VALUES (?, ?, ?, ?)
      `,
      args: [
        body.post_id.toString(),
        body.user_id?.toString() || '0',
        validatedData.content,
        validatedData.parent_id?.toString() || null
      ]
    });
    
    const commentId = result.lastInsertRowid;
    
    // 생성된 댓글 조회
    const commentResult = await db.execute({
      sql: `
        SELECT 
          c.*,
          u.email,
          u.nickname
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `,
      args: [commentId?.toString() || '0']
    });
    
    const comment = commentResult.rows[0];
    
    return NextResponse.json({
      id: comment.id,
      post_id: comment.post_id,
      user_id: comment.user_id,
      content: comment.content,
      parent_id: comment.parent_id,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user: {
        id: comment.user_id,
        email: comment.email,
        nickname: comment.nickname
      }
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error('댓글 생성 오류:', error);
    return NextResponse.json(
      { error: '댓글을 생성하는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 