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
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
      }

      if (data.user) {
        // 사용자 정보를 users 테이블에 저장 (실패해도 인증은 성공)
        try {
          const { error: insertError } = await supabase
            .from('users')
            .upsert({
              supabase_id: data.user.id,
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
              onConflict: 'supabase_id',
              ignoreDuplicates: false
            });

          if (insertError) {
            console.error('사용자 정보 저장 오류:', insertError);
            // 사용자 정보 저장 실패해도 인증은 성공으로 처리
          }
        } catch (dbError) {
          console.error('사용자 정보 저장 중 오류:', dbError);
          // 데이터베이스 오류가 있어도 인증은 성공으로 처리
        }
      }

      // 인증 성공 시 리다이렉트
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (error) {
      console.error('Auth callback 처리 중 오류:', error);
      return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
    }
  }

  // 코드가 없으면 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
} 