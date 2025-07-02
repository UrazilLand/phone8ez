import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getUserByEmail, hasPermission, canModerate } from '@/lib/auth-server';
import { z } from 'zod';

const updatePostSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자 이내로 입력해주세요').optional(),
  content: z.string().min(1, '내용을 입력해주세요').optional(),
  board_type: z.string().min(1, '게시판을 선택해주세요').optional(),
  image_url: z.string().optional(),
  video_url: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  context: any
) {
  const { id } = context.params;
  try {
    const postId = parseInt(id);
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: '잘못된 게시글 ID입니다.' },
        { status: 400 }
      );
    }

    // 조회수 증가
    const { data: currentPost, error: currentError } = await supabase
      .from('posts')
      .select('views')
      .eq('id', postId)
      .single();

    if (!currentError && currentPost) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({ views: (currentPost.views || 0) + 1 })
        .eq('id', postId);

      if (updateError) {
        console.error('조회수 증가 오류:', updateError);
      }
    }

    // 게시글 조회
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select(`
        *,
        users!inner(email, nickname)
      `)
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: post.id,
      title: post.title,
      content: post.content,
      board_type: post.board_type,
      image_url: post.image_url,
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
    });
  } catch (error) {
    console.error('게시글 조회 오류:', error);
    return NextResponse.json(
      { error: '게시글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: any
) {
  const { id } = context.params;
  try {
    const postId = parseInt(id);
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: '잘못된 게시글 ID입니다.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updatePostSchema.parse(body);

    // 게시글 존재 여부 및 권한 확인
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        users!inner(email)
      `)
      .eq('id', postId)
      .single();

    if (postError || !postData) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자 정보 조회
    if (!postData.users.email) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    const user = await getUserByEmail(postData.users.email);
    if (!user) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 확인: 본인 게시글이거나 관리자/모더레이터
    const isOwnPost = postData.users.email === postData.users.email;
    const canEdit = hasPermission(user.role, 'posts', 'update', isOwnPost);
    
    if (!canEdit) {
      return NextResponse.json(
        { error: '게시글을 수정할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 업데이트할 필드 구성
    const updateData: any = { updated_at: new Date().toISOString() };

    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title;
    }
    if (validatedData.content !== undefined) {
      updateData.content = validatedData.content;
    }
    if (validatedData.board_type !== undefined) {
      updateData.board_type = validatedData.board_type;
    }
    if (validatedData.image_url !== undefined) {
      updateData.image_url = validatedData.image_url || '';
    }
    if (validatedData.video_url !== undefined) {
      updateData.video_url = validatedData.video_url || '';
    }

    // 게시글 수정
    const { error: updateError } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId);

    if (updateError) {
      throw updateError;
    }

    // 수정된 게시글 조회
    const { data: updatedPost, error: fetchError } = await supabase
      .from('posts')
      .select(`
        *,
        users!inner(email, nickname)
      `)
      .eq('id', postId)
      .single();

    if (fetchError || !updatedPost) {
      throw fetchError;
    }
    
    return NextResponse.json({
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content,
      board_type: updatedPost.board_type,
      image_url: updatedPost.image_url,
      video_url: updatedPost.video_url,
      user_id: updatedPost.user_id,
      views: updatedPost.views,
      likes: updatedPost.likes,
      is_notice: updatedPost.is_notice,
      created_at: updatedPost.created_at,
      updated_at: updatedPost.updated_at,
      user: {
        id: updatedPost.user_id,
        email: updatedPost.users.email,
        nickname: updatedPost.users.nickname
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('게시글 수정 오류:', error);
    return NextResponse.json(
      { error: '게시글을 수정하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  const { id } = context.params;
  try {
    const postId = parseInt(id);
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: '잘못된 게시글 ID입니다.' },
        { status: 400 }
      );
    }

    // 게시글 존재 여부 및 권한 확인
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        users!inner(email)
      `)
      .eq('id', postId)
      .single();

    if (postError || !postData) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자 정보 조회
    if (!postData.users.email) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    const user = await getUserByEmail(postData.users.email);
    if (!user) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 확인: 본인 게시글이거나 관리자/모더레이터
    const isOwnPost = postData.users.email === postData.users.email;
    const canDelete = hasPermission(user.role, 'posts', 'delete', isOwnPost);
    
    if (!canDelete) {
      return NextResponse.json(
        { error: '게시글을 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 게시글과 관련 댓글 모두 삭제
    const { error: deleteCommentsError } = await supabase
      .from('comments')
      .delete()
      .eq('post_id', postId);

    if (deleteCommentsError) {
      console.error('댓글 삭제 오류:', deleteCommentsError);
    }
    
    const { error: deletePostError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (deletePostError) {
      throw deletePostError;
    }

    return NextResponse.json({ message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error('게시글 삭제 오류:', error);
    return NextResponse.json(
      { error: '게시글을 삭제하는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 