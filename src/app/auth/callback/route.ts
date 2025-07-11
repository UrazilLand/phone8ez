import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  let next = searchParams.get('next') ?? '/dashboard';

  console.log('[AUTH CALLBACK] code:', code);
  console.log('[AUTH CALLBACK] next:', next);
  console.log('[AUTH CALLBACK] origin:', origin);

  if (!next.startsWith('/')) {
    next = '/dashboard';
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      console.log('[AUTH CALLBACK] exchangeCodeForSession data:', data);
      console.log('[AUTH CALLBACK] exchangeCodeForSession error:', error);
      
      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
      }

      if (data.user) {
        // 사용자 정보를 users 테이블에 저장 (실패해도 인증은 성공)
        try {
          console.log('[AUTH CALLBACK] users upsert 시도:', data.user.id, data.user.email);
          const { error: insertError } = await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              email: data.user.email ?? '',
              nickname: data.user.user_metadata?.full_name || 
                       data.user.user_metadata?.name || 
                       data.user.user_metadata?.nickname ||
                       data.user.email?.split('@')[0] || '사용자',
              avatar_url: data.user.user_metadata?.avatar_url || null,
              provider: data.user.app_metadata?.provider || 'email',
              role: 'user',
              plan: 'free',
              is_verified: data.user.email_confirmed_at ? true : false,
              post_count: 0,
              comment_count: 0,
              created_at: data.user.created_at,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id',
              ignoreDuplicates: false
            });
          console.log('[AUTH CALLBACK] users upsert 결과:', insertError);
          if (insertError) {
            console.error('사용자 정보 저장 오류:', insertError);
            // 사용자 정보 저장 실패해도 인증은 성공으로 처리
          }
        } catch (dbError) {
          console.error('[AUTH CALLBACK] upsert try-catch 에러:', dbError);
          // 데이터베이스 오류가 있어도 인증은 성공으로 처리
        }
      }

      // 인증 성공 시 리다이렉트
      let redirectUrl = `${origin}${next}`;
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (!isLocalEnv && forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`;
      }
      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      console.error('Auth callback 처리 중 오류:', error);
      return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
    }
  }

  // 코드가 없으면 로그인 페이지로 리다이렉트
  console.log('[AUTH CALLBACK] No code found, redirecting to login.');
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
} 