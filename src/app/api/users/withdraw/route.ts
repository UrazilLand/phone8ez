import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: '인증된 사용자가 아닙니다.' }, { status: 401 });
  }

  // users 테이블에서 삭제
  await supabase.from('users').delete().eq('supabase_id', user.id);

  // Supabase Auth 계정 완전 삭제 (service_role key 필요)
  const adminClient = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { error: adminDeleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (adminDeleteError) {
    return NextResponse.json({ error: 'Auth 계정 삭제에 실패했습니다.' }, { status: 500 });
  }

  // 로그아웃 처리: 세션 쿠키 제거
  await supabase.auth.signOut();

  return NextResponse.json({ message: '회원 탈퇴가 완료되었습니다.' });
} 