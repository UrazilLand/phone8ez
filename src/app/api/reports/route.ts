import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserByEmail, canModerate } from '@/lib/auth-server';
import { supabase } from '@/lib/supabaseClient';
import { z } from 'zod';

const createReportSchema = z.object({
  target_type: z.enum(['post', 'comment']),
  target_id: z.number().positive('유효한 대상 ID를 입력해주세요'),
  reason: z.string().min(1, '신고 사유를 입력해주세요').max(500, '신고 사유는 500자 이내로 입력해주세요'),
});

export async function GET(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 현재 사용자 정보 조회
    const currentUser = await getUserByEmail(user.email);
    if (!currentUser) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 관리자/모더레이터 권한 확인
    if (!canModerate(currentUser.role)) {
      return NextResponse.json(
        { error: '관리자 또는 모더레이터 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    
    const offset = (page - 1) * limit;
    
    // 전체 신고 수 조회
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
    `;
    let countParams: string[] = [];
    
    if (status) {
      countQuery += ' WHERE r.status = ?';
      countParams.push(status);
    }
    
    const countResult = await db.execute({
      sql: countQuery,
      args: countParams
    });
    const total = countResult.rows[0]?.total as number;
    
    // 신고 목록 조회
    let reportsQuery = `
      SELECT 
        r.*,
        u.email,
        u.nickname
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
    `;
    let reportsParams: string[] = [];
    
    if (status) {
      reportsQuery += ' WHERE r.status = ?';
      reportsParams.push(status);
    }
    
    reportsQuery += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    reportsParams.push(limit.toString(), offset.toString());
    
    const reportsResult = await db.execute({
      sql: reportsQuery,
      args: reportsParams
    });
    
    const reports = reportsResult.rows.map(row => ({
      id: row.id,
      target_type: row.target_type,
      target_id: row.target_id,
      reason: row.reason,
      status: row.status,
      created_at: row.created_at,
      user: row.user_id && row.email ? {
        id: row.user_id,
        email: String(row.email),
        nickname: row.nickname ?? ''
      } : undefined
    }));
    
    return NextResponse.json({
      reports,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('신고 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '신고 목록을 불러오는데 실패했습니다.' },
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
    
    const body = await request.json();
    const validatedData = createReportSchema.parse(body);
    
    // 사용자 정보 조회
    const userInfo = await getUserByEmail(user.email);
    if (!userInfo) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 대상 존재 여부 확인
    let targetExists = false;
    if (validatedData.target_type === 'post') {
      const postResult = await db.execute({
        sql: 'SELECT id FROM posts WHERE id = ?',
        args: [validatedData.target_id.toString()]
      });
      targetExists = postResult.rows.length > 0;
    } else if (validatedData.target_type === 'comment') {
      const commentResult = await db.execute({
        sql: 'SELECT id FROM comments WHERE id = ?',
        args: [validatedData.target_id.toString()]
      });
      targetExists = commentResult.rows.length > 0;
    }
    
    if (!targetExists) {
      return NextResponse.json(
        { error: '신고 대상이 존재하지 않습니다.' },
        { status: 404 }
      );
    }
    
    // 중복 신고 확인 (같은 사용자가 같은 대상을 신고한 경우)
    const existingReport = await db.execute({
      sql: `
        SELECT id FROM reports 
        WHERE user_id = ? AND target_type = ? AND target_id = ?
      `,
      args: [userInfo.id.toString(), validatedData.target_type, validatedData.target_id.toString()]
    });
    
    if (existingReport.rows.length > 0) {
      return NextResponse.json(
        { error: '이미 신고한 대상입니다.' },
        { status: 400 }
      );
    }
    
    // 신고 생성
    const result = await db.execute({
      sql: `
        INSERT INTO reports (target_type, target_id, reason, user_id, status)
        VALUES (?, ?, ?, ?, 'pending')
      `,
      args: [
        validatedData.target_type,
        validatedData.target_id.toString(),
        validatedData.reason,
        userInfo.id.toString()
      ]
    });
    
    const reportId = result.lastInsertRowid;
    
    // 생성된 신고 조회
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
      args: [reportId?.toString() || '0']
    });
    
    const report = reportResult.rows[0];
    
    return NextResponse.json({
      id: report.id,
      target_type: report.target_type,
      target_id: report.target_id,
      reason: report.reason,
      status: report.status,
      created_at: report.created_at,
      updated_at: report.updated_at,
      user: report.user_id && report.email ? {
        id: report.user_id,
        email: String(report.email),
        nickname: report.nickname ?? ''
      } : undefined
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error('신고 생성 오류:', error);
    return NextResponse.json(
      { error: '신고를 생성하는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 