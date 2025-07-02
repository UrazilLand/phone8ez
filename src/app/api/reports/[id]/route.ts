import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getUserByEmail, canModerate } from '@/lib/auth-server';
import { z } from 'zod';

const updateReportSchema = z.object({
  status: z.enum(['pending', 'resolved', 'rejected']),
  moderator_note: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  context: any
) {
  const { id } = context.params;
  
  try {
    // 신고 상세 조회
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        *,
        users!inner(email, nickname)
      `)
      .eq('id', id)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { error: '신고를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 신고 대상 정보 조회
    let targetInfo = null;
    if (report.target_type === 'post' && report.target_id) {
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          users!inner(email, nickname)
        `)
        .eq('id', report.target_id)
        .single();
      
      if (!postError && post) {
        targetInfo = {
          id: post.id,
          title: post.title,
          content: post.content,
          category: post.category,
          created_at: post.created_at,
          user: {
            id: post.user_id,
            email: post.users.email,
            nickname: post.users.nickname
          }
        };
      }
    } else if (report.target_type === 'comment' && report.target_id) {
      const { data: comment, error: commentError } = await supabase
        .from('comments')
        .select(`
          *,
          users!inner(email, nickname)
        `)
        .eq('id', report.target_id)
        .single();
      
      if (!commentError && comment) {
        targetInfo = {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          user: {
            id: comment.user_id,
            email: comment.users.email,
            nickname: comment.users.nickname
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
      user: {
        id: report.user_id,
        email: report.users.email,
        nickname: report.users.nickname
      },
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
  context: any
) {
  const { id } = context.params;

  try {
    // 신고 존재 여부 확인
    const { data: existingReport, error: checkError } = await supabase
      .from('reports')
      .select('id, status')
      .eq('id', id)
      .single();

    if (checkError || !existingReport) {
      return NextResponse.json(
        { error: '신고를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 요청 body 파싱 및 검증
    const body = await request.json();
    const validatedData = updateReportSchema.parse(body);

    // 신고 상태 업데이트
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        status: validatedData.status,
        moderator_note: validatedData.moderator_note || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    // 업데이트된 신고 조회
    const { data: updatedReport, error: fetchError } = await supabase
      .from('reports')
      .select(`
        *,
        users!inner(email, nickname)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !updatedReport) {
      throw fetchError;
    }

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
        user: {
          id: updatedReport.user_id,
          email: updatedReport.users.email,
          nickname: updatedReport.users.nickname
        }
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
      { error: '신고를 처리하는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 