import type {Metadata} from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { DarkModeProvider } from "@/lib/dark-mode";
import MainLayout from "@/components/layout/MainLayout";

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Phone8ez',
  description: '모바일 판매 전문가를 위한 최고의 파트너',
  keywords: ['모바일폰', '판매', '커뮤니티', '데이터분석', '엑셀', '자동화'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* CSS 깜빡임 방지를 위한 초기 스타일 */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* 초기 로딩 시 깜빡임 방지 */
              html { visibility: hidden; }
              html.theme-loaded { visibility: visible; }
              
              /* 다크모드 초기 설정 */
              html.dark { color-scheme: dark; }
              html.light { color-scheme: light; }
              
              /* 폰트 로딩 최적화 */
              body { font-display: swap; }
            `,
          }}
        />
      </head>
      <body className={notoSansKr.className}>
        <DarkModeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="phone8ez-theme"
        >
          <MainLayout>
            {children}
          </MainLayout>
          <Toaster />
        </DarkModeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 테마 로딩 완료 후 페이지 표시 (hydration 안전하게 처리)
              (function() {
                try {
                  const html = document.documentElement;
                  const theme = localStorage.getItem('phone8ez-theme') || 'system';
                  
                  // 시스템 테마 감지
                  if (theme === 'system') {
                    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    html.classList.add(systemTheme);
                  } else {
                    html.classList.add(theme);
                  }
                  
                  // 페이지 표시
                  html.classList.add('theme-loaded');
                } catch (error) {
                  // 에러 발생 시 기본 라이트 모드로 설정
                  document.documentElement.classList.add('light', 'theme-loaded');
                }
                
                // 메시지 채널 에러 무시
                window.addEventListener('error', function(e) {
                  if (e.message.includes('message channel closed')) {
                    e.preventDefault();
                    return false;
                  }
                });
                
                // Promise rejection 에러 무시
                window.addEventListener('unhandledrejection', function(e) {
                  if (e.reason && e.reason.message && e.reason.message.includes('message channel closed')) {
                    e.preventDefault();
                    return false;
                  }
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
