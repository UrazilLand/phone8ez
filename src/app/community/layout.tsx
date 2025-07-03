"use client";
import React from 'react';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#020817]">
      <main>{children}</main>
    </div>
  );
} 