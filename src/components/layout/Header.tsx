'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Sun, Moon, User, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import UserDefaultIcon from '@/components/ui/UserDefaultIcon';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs';

const MAIN_COLOR = 'text-blue-600 border-blue-600';

const navLinks = [
  { href: '/intro', label: '서비스 소개' },
  { href: '/how-to-use', label: '사용 방법' },
  { href: '/dashboard', label: 'DASHBOARD', emphasized: true },
  { href: '/community', label: '커뮤니티' },
  { href: '/support', label: '고객지원' },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setIsPro(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan, ends_at')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data && data.plan === 'pro' && data.ends_at && dayjs(data.ends_at).isAfter(dayjs())) {
        setIsPro(true);
      } else {
        setIsPro(false);
      }
    })();
  }, [user?.id]);

  const NavLinksContent = ({ mobile = false }: { mobile?: boolean }) => {
    return (
      <>
        {navLinks.map((link) => {
          if (link.emphasized) {
            return (
              <a
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full font-bold border-4 bg-white shadow-sm transition-all duration-200 text-sm md:text-base hover:scale-110 hover:bg-blue-50 focus:scale-110 active:scale-105 flex items-center justify-center h-10 ${MAIN_COLOR} ${mobile ? 'block w-full text-center my-1' : ''}`}
                style={{ minWidth: 110, minHeight: 36 }}
                onClick={() => mobile && setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            );
          }
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium flex items-center justify-center h-10 transition-colors duration-150${mobile ? ' block w-full text-center my-1' : ''} ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'} hover:text-blue-600 dark:hover:text-blue-400`}
              onClick={() => mobile && setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          );
        })}
      </>
    );
  };

  if (!isMounted) {
    return (
      <header className="bg-muted/50 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 좌측: 파비콘 + 로고 */}
            <div className="flex items-center min-w-[48px] space-x-2">
              <img src="/favicon.png" alt="로고 아이콘" className="w-7 h-7 mr-1" />
              <Logo />
            </div>
            <div className="hidden lg:flex flex-1 justify-center space-x-2 items-center">
              {[...Array(5)].map((_, i) => <div key={i} className="w-20 h-7 bg-muted rounded animate-pulse"></div>)}
            </div>
            <div className="hidden lg:flex items-center space-x-2">
              <div className="w-12 h-8 bg-muted rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-muted/50 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 좌측: 파비콘 + 로고 */}
          <div className="flex items-center min-w-[48px] space-x-2">
            <img src="/favicon.png" alt="로고 아이콘" className="w-7 h-7 mr-1" />
            <Logo />
          </div>
          {/* 중앙: 네비게이션 (항상 중앙 고정) */}
          <nav className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 items-center justify-center">
            <NavLinksContent />
          </nav>
          {/* 우측: 다크모드, 로그인/로그아웃 */}
          <div className="hidden lg:flex items-center space-x-2 min-w-[180px] justify-end">
            {isPro && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-muted-foreground hover:text-blue-600"
              >
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                <span className="sr-only">테마 변경</span>
              </Button>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.location.href = '/profile/edit'}
                  className="focus:outline-none"
                  title="내 정보 수정"
                >
                  {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                    <img
                      src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
                      alt="프로필 이미지"
                      className="w-9 h-9 rounded-full object-cover border border-gray-300 shadow-sm hover:ring-2 hover:ring-blue-400 transition-all"
                    />
                  ) : (
                    <UserDefaultIcon className="w-9 h-9 rounded-full border border-gray-300 bg-white shadow-sm p-1 text-gray-400 hover:ring-2 hover:ring-blue-400 transition-all" />
                  )}
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  disabled={loading}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/temp-login">
                  <Button variant="ghost" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" size="sm">
                    회원가입
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* 모바일 메뉴 트리거 */}
          <div className="flex md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">메뉴 열기</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs bg-white dark:bg-[#222222] p-6">
                <div className="flex justify-between items-center mb-6">
                  {/* 모바일에서도 파비콘 + 로고 */}
                  <div className="flex items-center min-w-[48px] space-x-2">
                    <img src="/favicon.png" alt="로고 아이콘" className="w-7 h-7 mr-1" />
                    <Logo />
                  </div>
                </div>
                <nav className="flex flex-col space-y-1">
                  <NavLinksContent mobile={true} />
                  <hr className="my-3 border-border" />
                  
                  {user ? (
                    <div className="space-y-2 flex items-center">
                      <button
                        onClick={() => {
                          window.location.href = '/profile/edit';
                          setIsMobileMenuOpen(false);
                        }}
                        className="focus:outline-none"
                        title="내 정보 수정"
                      >
                        {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                          <img
                            src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
                            alt="프로필 이미지"
                            className="w-9 h-9 rounded-full object-cover border border-gray-300 shadow-sm hover:ring-2 hover:ring-blue-400 transition-all"
                          />
                        ) : (
                          <UserDefaultIcon className="w-9 h-9 rounded-full border border-gray-300 bg-white shadow-sm p-1 text-gray-400 hover:ring-2 hover:ring-blue-400 transition-all" />
                        )}
                      </button>
                      <Button
                        variant="outline"
                        className="w-full justify-center text-gray-900 dark:text-white"
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        disabled={loading}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        로그아웃
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/auth/temp-login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-center text-gray-900 dark:text-white">
                          로그인
                        </Button>
                      </Link>
                      <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-center text-gray-900 dark:text-white">
                          회원가입
                        </Button>
                      </Link>
                    </div>
                  )}
                  
                  <hr className="my-3 border-border" />
                  {isPro && (
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-gray-900 dark:text-white"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                      {theme === 'dark' ? (
                        <>
                          <Moon className="mr-2 h-4 w-4 hidden lg:inline" />
                          다크 모드
                        </>
                      ) : (
                        <>
                          <Sun className="mr-2 h-4 w-4 hidden lg:inline" />
                          라이트 모드
                        </>
                      )}
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
