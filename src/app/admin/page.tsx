'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserManagement from './components/UserManagement';
import ReportManagement from './components/ReportManagement';

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <p className="text-muted-foreground">
          사용자 관리 및 신고 처리를 할 수 있습니다.
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">사용자 관리</TabsTrigger>
          <TabsTrigger value="reports">신고 관리</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <ReportManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
} 