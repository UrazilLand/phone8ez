"use client"

import Link from 'next/link';
import type React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-muted/50 backdrop-blur-md pt-10 pb-6 text-muted-foreground border-t border-border/60">
      <div className="container mx-auto px-4 flex flex-col gap-6">
        {/* 서비스명 및 간단 소개 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-center md:text-left">
            <span className="font-bold text-foreground text-lg">Phone8ez</span>
            <span className="ml-2 text-sm text-muted-foreground/80">모바일 판매 전문가를 위한 최고의 파트너</span>
          </div>
          <nav className="flex flex-wrap justify-center md:justify-end gap-4 mt-2 md:mt-0">
            <Link href="/privacy" className="text-sm hover:text-primary transition-colors">개인정보처리방침</Link>
            <Link href="/terms" className="text-sm hover:text-primary transition-colors">이용약관</Link>
            <Link href="/support" className="text-sm hover:text-primary transition-colors">고객지원</Link>
          </nav>
        </div>

        {/* 사업자 정보 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-muted-foreground/80">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-center md:text-left">
            <span>상호명: 세컨드라이프</span>
            <span>대표자: 하형진</span>
            <span>사업자등록번호: 272-97-01638</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-center md:text-left">
            <span>사업장 주소: 전남 광양시 공영로10</span>
            <span>연락처: 010-5857-9410</span>
            <span>이메일: easypower@kakao.com</span>
          </div>
        </div>

        {/* 저작권 */}
        <div className="pt-2 text-center text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} Phone8ez. 모든 권리 보유.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
