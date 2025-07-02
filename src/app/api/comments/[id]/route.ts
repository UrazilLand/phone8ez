import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserByEmail, hasPermission } from '@/lib/auth-server';
import { supabase } from '@/lib/supabaseClient';
import { z } from 'zod';

const updateCommentSchema = z.object({
  content: z.string().min(1, '댓글 내용을 입력해주세요').max(1000, '댓글은 1000자 이내로 입력해주세요'),
});

export async function PUT(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = context.params;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const commentId = parseInt(id);
    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: '잘못된 댓글 ID입니다.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateCommentSchema.parse(body);

    // 댓글 존재 여부 및 권한 확인
    const commentResult = await db.execute({
      sql: `
        SELECT c.*, u.email 
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `,
      args: [commentId.toString()]
    });

    if (commentResult.rows.length === 0) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const comment = commentResult.rows[0];
    
    // 사용자 정보 조회
    const dbUser = await getUserByEmail(authUser.email);
    if (!dbUser) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 확인: 본인 댓글이거나 관리자/모더레이터
    const isOwnComment = comment.email === authUser.email;
    const canEdit = hasPermission(dbUser.role, 'comments', 'update', isOwnComment);
    
    if (!canEdit) {
      return NextResponse.json(
        { error: '댓글을 수정할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 댓글 수정
    await db.execute({
      sql: `
        UPDATE comments 
        SET content = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,
      args: [validatedData.content, commentId.toString()]
    });

    // 수정된 댓글 조회
    const updatedResult = await db.execute({
      sql: `
        SELECT 
          c.*,
          u.email,
          u.nickname
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `,
      args: [commentId.toString()]
    });

    const updatedComment = updatedResult.rows[0];
    
    return NextResponse.json({
      id: updatedComment.id,
      post_id: updatedComment.post_id,
      user_id: updatedComment.user_id,
      content: updatedComment.content,
      parent_id: updatedComment.parent_id,
      created_at: updatedComment.created_at,
      updated_at: updatedComment.updated_at,
      user: updatedComment.user_id && updatedComment.email ? {
        id: updatedComment.user_id,
        email: String(updatedComment.email),
        nickname: updatedComment.nickname ?? ''
      } : undefined
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('댓글 수정 오류:', error);
    return NextResponse.json(
      { error: '댓글을 수정하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = context.params;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const commentId = parseInt(id);
    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: '잘못된 댓글 ID입니다.' },
        { status: 400 }
      );
    }

    // 댓글 존재 여부 및 권한 확인
    const commentResult = await db.execute({
      sql: `
        SELECT c.*, u.email 
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `,
      args: [commentId.toString()]
    });

    if (commentResult.rows.length === 0) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const comment = commentResult.rows[0];
    
    // 사용자 정보 조회
    const dbUser = await getUserByEmail(authUser.email);
    if (!dbUser) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 확인: 본인 댓글이거나 관리자/모더레이터
    const isOwnComment = comment.email === authUser.email;
    const canDelete = hasPermission(dbUser.role, 'comments', 'delete', isOwnComment);
    
    if (!canDelete) {
      return NextResponse.json(
        { error: '댓글을 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 댓글과 대댓글 모두 삭제
    await db.execute({
      sql: 'DELETE FROM comments WHERE id = ? OR parent_id = ?',
      args: [commentId.toString(), commentId.toString()]
    });

    return NextResponse.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('댓글 삭제 오류:', error);
    return NextResponse.json(
      { error: '댓글을 삭제하는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 