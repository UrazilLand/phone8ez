import { NextRequest, NextResponse } from 'next/server';
// RouteContext 타입 직접 선언
type RouteContext<P extends Record<string, string> = {}> = { params: P };
import { db } from '@/lib/db';
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
    await db.execute({
      sql: 'UPDATE posts SET views = views + 1 WHERE id = ?',
      args: [postId.toString()]
    });

    // 게시글 조회
    const result = await db.execute({
      sql: `
        SELECT 
          p.*,
          u.email,
          u.nickname
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `,
      args: [postId.toString()]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const post = result.rows[0];
    
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
      user: post.user_id ? {
        id: post.user_id,
        email: post.email,
        nickname: post.nickname
      } : undefined
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
    const postResult = await db.execute({
      sql: `
        SELECT p.*, u.email 
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `,
      args: [postId.toString()]
    });

    if (postResult.rows.length === 0) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const post = postResult.rows[0];
    
    // 사용자 정보 조회
    if (!post.email) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    const user = await getUserByEmail(String(post.email));
    if (!user) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 확인: 본인 게시글이거나 관리자/모더레이터
    const isOwnPost = post.email === post.email;
    const canEdit = hasPermission(user.role, 'posts', 'update', isOwnPost);
    
    if (!canEdit) {
      return NextResponse.json(
        { error: '게시글을 수정할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 업데이트할 필드 구성
    const updateFields: string[] = [];
    const updateArgs: string[] = [];

    if (validatedData.title !== undefined) {
      updateFields.push('title = ?');
      updateArgs.push(validatedData.title);
    }
    if (validatedData.content !== undefined) {
      updateFields.push('content = ?');
      updateArgs.push(validatedData.content);
    }
    if (validatedData.board_type !== undefined) {
      updateFields.push('board_type = ?');
      updateArgs.push(validatedData.board_type);
    }
    if (validatedData.image_url !== undefined) {
      updateFields.push('image_url = ?');
      updateArgs.push(validatedData.image_url || '');
    }
    if (validatedData.video_url !== undefined) {
      updateFields.push('video_url = ?');
      updateArgs.push(validatedData.video_url || '');
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: '수정할 내용이 없습니다.' },
        { status: 400 }
      );
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateArgs.push(postId.toString());

    // 게시글 수정
    await db.execute({
      sql: `UPDATE posts SET ${updateFields.join(', ')} WHERE id = ?`,
      args: updateArgs
    });

    // 수정된 게시글 조회
    const updatedResult = await db.execute({
      sql: `
        SELECT 
          p.*,
          u.email,
          u.nickname
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `,
      args: [postId.toString()]
    });

    const updatedPost = updatedResult.rows[0];
    
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
        email: updatedPost.email,
        nickname: updatedPost.nickname
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
    const postResult = await db.execute({
      sql: `
        SELECT p.*, u.email 
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `,
      args: [postId.toString()]
    });

    if (postResult.rows.length === 0) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const post = postResult.rows[0];
    
    // 사용자 정보 조회
    if (!post.email) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    const user = await getUserByEmail(String(post.email));
    if (!user) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 확인: 본인 게시글이거나 관리자/모더레이터
    const isOwnPost = post.email === post.email;
    const canDelete = hasPermission(user.role, 'posts', 'delete', isOwnPost);
    
    if (!canDelete) {
      return NextResponse.json(
        { error: '게시글을 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 게시글 삭제
    await db.execute({
      sql: 'DELETE FROM posts WHERE id = ?',
      args: [postId.toString()]
    });

    return NextResponse.json({ message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error('게시글 삭제 오류:', error);
    return NextResponse.json(
      { error: '게시글을 삭제하는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 