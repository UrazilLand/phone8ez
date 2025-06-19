"use client"

import Link from 'next/link';
import type React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-muted/50 backdrop-blur-md py-8 text-center text-muted-foreground">
      <div className="container mx-auto px-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Phone8ez. 모든 권리 보유.
        </p>
        <div className="mt-2 space-x-4">
          <Link href="/privacy" className="hover:text-primary transition-colors">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            이용약관
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
