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
      <body className={notoSansKr.className}>
        <DarkModeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MainLayout>
            {children}
          </MainLayout>
          <Toaster />
        </DarkModeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
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
            `,
          }}
        />
      </body>
    </html>
  );
}
