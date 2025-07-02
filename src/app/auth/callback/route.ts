import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  let next = searchParams.get('next') ?? '/dashboard';

  if (!next.startsWith('/')) {
    next = '/dashboard';
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // 사용자 정보를 users 테이블에 저장
      try {
        const { error: insertError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            nickname: data.user.user_metadata?.full_name || 
                     data.user.user_metadata?.name || 
                     data.user.user_metadata?.nickname ||
                     data.user.email?.split('@')[0] || '사용자',
            avatar_url: data.user.user_metadata?.avatar_url || null,
            provider: data.user.app_metadata?.provider || 'email',
            is_verified: data.user.email_confirmed_at ? true : false,
            created_at: data.user.created_at,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id',
            ignoreDuplicates: false
          });

        if (insertError) {
          console.error('사용자 정보 저장 오류:', insertError);
        }
      } catch (error) {
        console.error('사용자 정보 저장 중 오류:', error);
      }
    }

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // 에러 발생 시 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
} 