import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getUserByEmail, canManageUsers, updateUserRole, getUserStats } from '@/lib/auth-server';
import { UserRole } from '@/types/auth';
import { z } from 'zod';

const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'moderator', 'admin']),
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

    // 관리자 권한 확인
    if (!canManageUsers(currentUser.role)) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    
    const offset = (page - 1) * limit;
    
    // 전체 사용자 수 조회
    let countQuery = supabase.from('users').select('*', { count: 'exact', head: true });
    if (search) {
      countQuery = supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .or(`email.ilike.%${search}%,nickname.ilike.%${search}%`);
    }
    const { count: total } = await countQuery;
    
    // 사용자 목록 조회
    let usersQuery = supabase
      .from('users')
      .select('id, email, nickname, role, plan, is_verified, created_at, updated_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (search) {
      usersQuery = usersQuery.or(`email.ilike.%${search}%,nickname.ilike.%${search}%`);
    }
    const { data: usersData } = await usersQuery;
    
    // 각 사용자의 통계 정보 조회
    const users = await Promise.all(
      (usersData || []).map(async (row) => {
        const stats = await getUserStats(row.id as string);
        return {
          id: row.id,
          email: row.email,
          nickname: row.nickname,
          role: row.role,
          plan: row.plan,
          is_verified: Boolean(row.is_verified),
          created_at: row.created_at,
          updated_at: row.updated_at,
          post_count: stats.post_count,
          comment_count: stats.comment_count,
        };
      })
    );
    
    return NextResponse.json({
      users,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '사용자 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // 관리자 권한 확인
    if (!canManageUsers(currentUser.role)) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { targetUserId, ...updateData } = body;
    
    if (!targetUserId) {
      return NextResponse.json(
        { error: '대상 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 역할 업데이트
    if (updateData.role) {
      const validatedData = updateUserRoleSchema.parse({ role: updateData.role });
      
      const success = await updateUserRole(targetUserId, validatedData.role as UserRole);
      if (!success) {
        return NextResponse.json(
          { error: '사용자 역할 업데이트에 실패했습니다.' },
          { status: 500 }
        );
      }
    }

    // 업데이트된 사용자 정보 조회
    const updatedUser = await getUserByEmail(targetUserId);
    if (!updatedUser) {
      return NextResponse.json(
        { error: '업데이트된 사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: '사용자 정보가 성공적으로 업데이트되었습니다.',
      user: updatedUser
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('사용자 업데이트 오류:', error);
    return NextResponse.json(
      { error: '사용자 정보 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
} 