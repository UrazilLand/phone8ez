import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { createUserIfNotExists } from '@/lib/auth-server';
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
    let countQuery = supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('board_type', board_type);
    
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    
    const { count: total } = await countQuery;
    
    // 게시글 목록 조회
    let postsQuery = supabase
      .from('posts')
      .select(`
        *,
        users!inner(email, nickname),
        comments(count)
      `)
      .eq('board_type', board_type);
    
    if (search) {
      postsQuery = postsQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    
    const { data: postsData, error: postsError } = await postsQuery
      .order('is_notice', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      throw postsError;
    }
    
    const posts = postsData?.map(row => ({
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
      user: {
        id: row.user_id,
        email: row.users.email,
        nickname: row.users.nickname
      },
      comment_count: row.comments?.[0]?.count || 0
    })) || [];
    
    return NextResponse.json({
      posts,
      total: total || 0,
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
    const { data: postData, error: insertError } = await supabase
      .from('posts')
      .insert({
        title: validatedData.title,
        content: validatedData.content,
        board_type: validatedData.board_type,
        image_urls: validatedData.image_urls || '[]',
        video_url: validatedData.video_url || null,
        user_id: dbUser.id
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }
    
    // 생성된 게시글 조회
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select(`
        *,
        users!inner(email, nickname)
      `)
      .eq('id', postData.id)
      .single();

    if (fetchError || !post) {
      throw fetchError;
    }
    
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
        email: post.users.email,
        nickname: post.users.nickname
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