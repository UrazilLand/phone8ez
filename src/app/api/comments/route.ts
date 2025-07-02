import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
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
    const { count: total } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .is('parent_id', null);
    
    // 댓글 목록 조회 (대댓글 제외)
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *,
        users!inner(email, nickname),
        replies:comments!parent_id(count)
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (commentsError) {
      throw commentsError;
    }
    
    const comments = commentsData?.map(row => ({
      id: row.id,
      post_id: row.post_id,
      user_id: row.user_id,
      content: row.content,
      parent_id: row.parent_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        id: row.user_id,
        email: row.users.email,
        nickname: row.users.nickname
      },
      reply_count: row.replies?.[0]?.count || 0
    })) || [];
    
    // 각 댓글의 대댓글 조회
    for (const comment of comments) {
      const { data: repliesData, error: repliesError } = await supabase
        .from('comments')
        .select(`
          *,
          users!inner(email, nickname)
        `)
        .eq('parent_id', comment.id)
        .order('created_at', { ascending: true });

      if (!repliesError && repliesData) {
        (comment as any).replies = repliesData.map(row => ({
          id: row.id,
          post_id: row.post_id,
          user_id: row.user_id,
          content: row.content,
          parent_id: row.parent_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          user: {
            id: row.user_id,
            email: row.users.email,
            nickname: row.users.nickname
          }
        }));
      }
    }
    
    return NextResponse.json({
      comments,
      total: total || 0,
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
    const { data: commentData, error: insertError } = await supabase
      .from('comments')
      .insert({
        post_id: body.post_id,
        user_id: body.user_id,
        content: validatedData.content,
        parent_id: validatedData.parent_id || null
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }
    
    // 생성된 댓글 조회
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select(`
        *,
        users!inner(email, nickname)
      `)
      .eq('id', commentData.id)
      .single();

    if (fetchError || !comment) {
      throw fetchError;
    }
    
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
        email: comment.users.email,
        nickname: comment.users.nickname
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