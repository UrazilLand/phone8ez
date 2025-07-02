import { supabase } from './supabaseClient';
import { User, UserRole, UserPlan, Permission, ROLE_PERMISSIONS } from '../types/auth';

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      email: data.email,
      supabase_id: data.supabase_id,
      nickname: data.nickname,
      role: data.role as UserRole,
      plan: data.plan as UserPlan,
      is_verified: Boolean(data.is_verified),
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    return null;
  }
}

export async function createUserIfNotExists(email: string | null, nickname?: string): Promise<User> {
  try {
    // email로 확인
    if (email) {
      const userByEmail = await getUserByEmail(email);
      if (userByEmail) return userByEmail;
    }
    
    // 새 사용자 생성
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: email || '',
        nickname: nickname || '익명',
        role: 'user',
        plan: 'free',
        is_verified: false
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      email: data.email,
      supabase_id: data.supabase_id,
      nickname: data.nickname,
      role: data.role as UserRole,
      plan: data.plan as UserPlan,
      is_verified: Boolean(data.is_verified),
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('사용자 생성 오류:', error);
    throw error;
  }
}

export function hasPermission(
  userRole: UserRole,
  resource: Permission['resource'],
  action: Permission['action'],
  isOwnResource: boolean = false
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  
  const permission = permissions.find(p => 
    p.resource === resource && p.action === action
  );

  if (!permission) {
    return false;
  }

  // ownOnly 조건 체크
  if (permission.conditions?.ownOnly && !isOwnResource) {
    return false;
  }

  return true;
}

export function canModerate(userRole: UserRole): boolean {
  return userRole === 'admin' || userRole === 'moderator';
}

export function canManageUsers(userRole: UserRole): boolean {
  return userRole === 'admin';
}

export async function updateUserRole(userId: number, newRole: UserRole): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('사용자 역할 업데이트 오류:', error);
    return false;
  }
}

export async function getUserStats(userId: number): Promise<{
  post_count: number;
  comment_count: number;
}> {
  try {
    const { count: post_count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    const { count: comment_count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return {
      post_count: post_count || 0,
      comment_count: comment_count || 0,
    };
  } catch (error) {
    console.error('사용자 통계 조회 오류:', error);
    return { post_count: 0, comment_count: 0 };
  }
} 