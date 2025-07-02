import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getUserByEmail, canModerate } from '@/lib/auth-server';
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
    let countQuery = supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });
    
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    
    const { count: total } = await countQuery;
    
    // 신고 목록 조회
    let reportsQuery = supabase
      .from('reports')
      .select(`
        *,
        users!inner(email, nickname)
      `);
    
    if (status) {
      reportsQuery = reportsQuery.eq('status', status);
    }
    
    const { data: reportsData, error: reportsError } = await reportsQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (reportsError) {
      throw reportsError;
    }
    
    const reports = reportsData?.map(row => ({
      id: row.id,
      target_type: row.target_type,
      target_id: row.target_id,
      reason: row.reason,
      status: row.status,
      created_at: row.created_at,
      user: {
        id: row.user_id,
        email: row.users.email,
        nickname: row.users.nickname
      }
    })) || [];
    
    return NextResponse.json({
      reports,
      total: total || 0,
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
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('id')
        .eq('id', validatedData.target_id)
        .single();
      targetExists = !postError && !!post;
    } else if (validatedData.target_type === 'comment') {
      const { data: comment, error: commentError } = await supabase
        .from('comments')
        .select('id')
        .eq('id', validatedData.target_id)
        .single();
      targetExists = !commentError && !!comment;
    }
    
    if (!targetExists) {
      return NextResponse.json(
        { error: '신고 대상이 존재하지 않습니다.' },
        { status: 404 }
      );
    }
    
    // 중복 신고 확인 (같은 사용자가 같은 대상을 신고한 경우)
    const { data: existingReport, error: checkError } = await supabase
      .from('reports')
      .select('id')
      .eq('user_id', userInfo.id)
      .eq('target_type', validatedData.target_type)
      .eq('target_id', validatedData.target_id)
      .single();
    
    if (!checkError && existingReport) {
      return NextResponse.json(
        { error: '이미 신고한 대상입니다.' },
        { status: 400 }
      );
    }
    
    // 신고 생성
    const { data: reportData, error: insertError } = await supabase
      .from('reports')
      .insert({
        target_type: validatedData.target_type,
        target_id: validatedData.target_id,
        reason: validatedData.reason,
        user_id: userInfo.id,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }
    
    // 생성된 신고 조회
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select(`
        *,
        users!inner(email, nickname)
      `)
      .eq('id', reportData.id)
      .single();

    if (fetchError || !report) {
      throw fetchError;
    }
    
    return NextResponse.json({
      id: report.id,
      target_type: report.target_type,
      target_id: report.target_id,
      reason: report.reason,
      status: report.status,
      created_at: report.created_at,
      updated_at: report.updated_at,
      user: {
        id: report.user_id,
        email: report.users.email,
        nickname: report.users.nickname
      }
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