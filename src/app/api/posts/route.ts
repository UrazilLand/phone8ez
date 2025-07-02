import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createUserIfNotExists } from '@/lib/auth-server';
import { supabase } from '@/lib/supabaseClient';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자 이내로 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  board_type: z.string().min(1, '게시판을 선택해주세요'),
  image_urls: z.string().optional(),
  video_url: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const board_type = searchParams.get('board_type') || 'general';
    const search = searchParams.get('search') || '';
    
    const offset = (page - 1) * limit;
    
    // 전체 게시글 수 조회
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM posts p 
      LEFT JOIN users u ON p.user_id = u.id 
      WHERE p.board_type = ?
    `;
    let countParams = [board_type];
    
    if (search) {
      countQuery += ` AND (p.title LIKE ? OR p.content LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    const countResult = await db.execute({
      sql: countQuery,
      args: countParams
    });
    const total = countResult.rows[0]?.total as number;
    
    // 게시글 목록 조회
    let postsQuery = `
      SELECT 
        p.*,
        u.email,
        u.nickname,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.board_type = ?
    `;
    let postsParams = [board_type];
    
    if (search) {
      postsQuery += ` AND (p.title LIKE ? OR p.content LIKE ?)`;
      postsParams.push(`%${search}%`, `%${search}%`);
    }
    
    postsQuery += ` ORDER BY p.is_notice DESC, p.created_at DESC LIMIT ? OFFSET ?`;
    postsParams.push(limit.toString(), offset.toString());
    
    const postsResult = await db.execute({
      sql: postsQuery,
      args: postsParams
    });
    
    const posts = postsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      board_type: row.board_type,
      image_urls: row.image_urls,
      video_url: row.video_url,
      user_id: row.user_id,
      views: row.views,
      likes: row.likes,
      is_notice: row.is_notice,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: row.user_id ? {
        id: row.user_id,
        email: row.email,
        nickname: row.nickname
      } : undefined,
      comment_count: row.comment_count
    }));
    
    return NextResponse.json({
      posts,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('게시글 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '게시글 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 사용자 정보 조회 또는 생성
    const dbUser = await createUserIfNotExists(user.email, user.user_metadata?.name);
    if (!dbUser || !dbUser.id) {
      return NextResponse.json(
        { error: '유저 정보를 찾을 수 없습니다.' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const validatedData = createPostSchema.parse(body);
    
    // 게시글 생성
    const result = await db.execute({
      sql: `
        INSERT INTO posts (title, content, board_type, image_urls, video_url, user_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [
        validatedData.title,
        validatedData.content,
        validatedData.board_type,
        validatedData.image_urls || '[]',
        validatedData.video_url || null,
        dbUser.id
      ]
    });
    
    const postId = result.lastInsertRowid;
    
    // 생성된 게시글 조회
    const postResult = await db.execute({
      sql: `
        SELECT 
          p.*,
          u.email,
          u.nickname
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `,
      args: [postId?.toString() || '0']
    });
    
    const post = postResult.rows[0];
    
    return NextResponse.json({
      id: post.id,
      title: post.title,
      content: post.content,
      board_type: post.board_type,
      image_urls: post.image_urls,
      video_url: post.video_url,
      user_id: post.user_id,
      views: post.views,
      likes: post.likes,
      is_notice: post.is_notice,
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: {
        id: post.user_id,
        email: post.email,
        nickname: post.nickname
      }
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error('게시글 생성 오류:', error);
    return NextResponse.json(
      { error: '게시글을 생성하는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 