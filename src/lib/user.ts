import { supabase } from './supabaseClient';
import { User } from '@/types/auth';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return null;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userError) {
      console.error('사용자 정보 조회 오류:', userError);
      return null;
    }

    return userData as User;
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    return null;
  }
}

export async function updateUserProfile(updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return { success: false, error: '인증되지 않은 사용자입니다.' };
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', authUser.id);

    if (updateError) {
      console.error('사용자 정보 업데이트 오류:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('사용자 정보 업데이트 오류:', error);
    return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('사용자 정보 조회 오류:', userError);
      return null;
    }

    return userData as User;
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    return null;
  }
}

export async function incrementUserCounts(userId: string, type: 'post' | 'comment'): Promise<void> {
  try {
    const field = type === 'post' ? 'post_count' : 'comment_count';
    
    const { error } = await supabase
      .from('users')
      .update({ [field]: supabase.rpc('increment', { row_id: userId, field_name: field }) })
      .eq('id', userId);

    if (error) {
      console.error(`${type} 카운트 증가 오류:`, error);
    }
  } catch (error) {
    console.error(`${type} 카운트 증가 오류:`, error);
  }
} 