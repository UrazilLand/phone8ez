import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserByEmail, canModerate } from '@/lib/auth-server';
import { z } from 'zod';

const updateReportSchema = z.object({
  status: z.enum(['pending', 'resolved', 'rejected']),
  moderator_note: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 신고 상세 조회
    const reportResult = await db.execute({
      sql: `
        SELECT 
          r.*,
          u.email,
          u.nickname
        FROM reports r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
      `,
      args: [id]
    });

    if (reportResult.rows.length === 0) {
      return NextResponse.json(
        { error: '신고를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const report = reportResult.rows[0];
    
    // 신고 대상 정보 조회
    let targetInfo = null;
    if (report.target_type === 'post' && report.target_id) {
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
        args: [report.target_id.toString()]
      });
      
      if (postResult.rows.length > 0) {
        const post = postResult.rows[0];
        targetInfo = {
          id: post.id,
          title: post.title,
          content: post.content,
          category: post.category,
          created_at: post.created_at,
          user: {
            id: post.user_id,
            email: post.email,
            nickname: post.nickname
          }
        };
      }
    } else if (report.target_type === 'comment' && report.target_id) {
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
        args: [report.target_id.toString()]
      });
      
      if (commentResult.rows.length > 0) {
        const comment = commentResult.rows[0];
        targetInfo = {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          user: {
            id: comment.user_id,
            email: comment.email,
            nickname: comment.nickname
          }
        };
      }
    }

    return NextResponse.json({
      id: report.id,
      target_type: report.target_type,
      target_id: report.target_id,
      reason: report.reason,
      status: report.status,
      moderator_note: report.moderator_note,
      created_at: report.created_at,
      updated_at: report.updated_at,
      user: report.user_id ? {
        id: report.user_id,
        email: report.email,
        nickname: report.nickname
      } : undefined,
      target_info: targetInfo
    });
  } catch (error) {
    console.error('신고 상세 조회 오류:', error);
    return NextResponse.json(
      { error: '신고 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 신고 존재 여부 확인
    const existingReport = await db.execute({
      sql: 'SELECT id, status FROM reports WHERE id = ?',
      args: [id]
    });

    if (existingReport.rows.length === 0) {
      return NextResponse.json(
        { error: '신고를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 신고 상태 업데이트
    await db.execute({
      sql: `
        UPDATE reports 
        SET status = ?, moderator_note = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        validatedData.status,
        validatedData.moderator_note || null,
        id
      ]
    });

    // 업데이트된 신고 조회
    const updatedReportResult = await db.execute({
      sql: `
        SELECT 
          r.*,
          u.email,
          u.nickname
        FROM reports r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
      `,
      args: [id]
    });

    const updatedReport = updatedReportResult.rows[0];

    return NextResponse.json({
      message: '신고가 성공적으로 처리되었습니다.',
      report: {
        id: updatedReport.id,
        target_type: updatedReport.target_type,
        target_id: updatedReport.target_id,
        reason: updatedReport.reason,
        status: updatedReport.status,
        moderator_note: updatedReport.moderator_note,
        created_at: updatedReport.created_at,
        updated_at: updatedReport.updated_at,
        user: updatedReport.user_id ? {
          id: updatedReport.user_id,
          email: updatedReport.email,
          nickname: updatedReport.nickname
        } : undefined
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('신고 처리 오류:', error);
    return NextResponse.json(
      { error: '신고 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
} 