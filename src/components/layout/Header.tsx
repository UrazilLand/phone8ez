'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, LogIn, UserPlus, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

const MAIN_COLOR = 'text-blue-600 border-blue-600';

const navLinks = [
  { href: '/intro', label: '서비스 소개' },
  { href: '/how-to-use', label: '사용 방법' },
  { href: '/dashboard', label: 'DASHBOARD', emphasized: true },
  { href: '/board/free', label: '게시판' },
  { href: '/support', label: '고객지원' },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const NavLinksContent = ({ mobile = false }: { mobile?: boolean }) => {
    return (
      <>
        {navLinks.map((link) => {
          if (link.emphasized) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full font-bold border-4 bg-white shadow-sm transition-all duration-200 text-sm md:text-base hover:scale-110 hover:bg-blue-50 focus:scale-110 active:scale-105 flex items-center justify-center h-10 ${MAIN_COLOR} ${mobile ? 'block w-full text-center my-1' : ''}`}
                style={{ minWidth: 110, minHeight: 36 }}
                onClick={() => mobile && setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          }
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium flex items-center justify-center h-10 transition-colors duration-150${mobile ? ' block w-full text-center my-1' : ''} ${isActive ? 'text-blue-600' : 'text-muted-foreground'} hover:text-blue-600`}
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
            <div className="hidden md:flex flex-1 justify-center space-x-2 items-center">
              {[...Array(5)].map((_, i) => <div key={i} className="w-20 h-7 bg-muted rounded animate-pulse"></div>)}
            </div>
            <div className="hidden md:flex items-center space-x-2">
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

          {/* 중앙: 네비게이션 (항상 h-10 flex items-center로 정렬) */}
          <nav className="hidden md:flex flex-1 justify-center space-x-1 items-center h-10">
            <NavLinksContent />
          </nav>

          {/* 우측: 다크모드, 로그인, 회원가입 */}
          <div className="hidden md:flex items-center space-x-2 min-w-[180px] justify-end">
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
            <Button variant="ghost" asChild className="text-foreground hover:text-blue-600 px-3">
              <Link href="/login">
                로그인
              </Link>
            </Button>
            <Button variant="default" asChild className="bg-blue-600 text-white hover:bg-blue-700 px-4 font-semibold shadow-none">
              <Link href="/signup">
                회원가입
              </Link>
            </Button>
          </div>

          {/* 모바일 메뉴 트리거 */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">메뉴 열기</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs bg-white p-6">
                <div className="flex justify-between items-center mb-6">
                  {/* 모바일에서도 파비콘 + 로고 */}
                  <div className="flex items-center min-w-[48px] space-x-2">
                    <img src="/favicon.png" alt="로고 아이콘" className="w-7 h-7 mr-1" />
                    <Logo />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                    <span className="sr-only">메뉴 닫기</span>
                  </Button>
                </div>
                <nav className="flex flex-col space-y-1">
                  <NavLinksContent mobile={true} />
                  <hr className="my-3 border-border" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        라이트 모드
                      </>
                    ) : (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        다크 모드
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      로그인
                    </Link>
                  </Button>
                  <Button variant="default" className="w-full justify-start bg-blue-600 text-white hover:bg-blue-700" asChild>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      회원가입
                    </Link>
                  </Button>
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
