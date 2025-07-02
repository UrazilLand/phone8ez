"use client"

import type React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useTheme } from "next-themes";
import { AuthProvider } from '@/lib/auth';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-grow py-8 transition-colors duration-200">
          {children}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default MainLayout;
