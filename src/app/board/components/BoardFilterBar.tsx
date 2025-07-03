'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListFilter, Search, PenSquare } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface BoardFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchClick: () => void;
  onWriteClick: () => void;
}

const BoardFilterBar = ({
  searchValue,
  onSearchChange,
  onSearchClick,
  onWriteClick,
}: BoardFilterBarProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
      } catch (error) {
        console.error('인증 확인 오류:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-blue-50/50 dark:bg-gray-800/50 rounded-lg border border-blue-100 dark:border-gray-700">
      {/* 검색 */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="제목 또는 내용으로 검색..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearchClick()}
            className="pl-10 border-blue-200 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400/20 dark:focus:ring-blue-400/20 bg-white/50 dark:bg-gray-800/50"
          />
        </div>
      </div>

      {/* 필터 및 버튼 */}
      <div className="flex gap-2 w-full sm:w-auto">
        <Select defaultValue="latest">
          <SelectTrigger className="w-full sm:w-[180px] border-blue-200 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400/20 dark:focus:ring-blue-400/20 bg-white/50 dark:bg-gray-800/50">
            <SelectValue placeholder="정렬 기준" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">최신순</SelectItem>
            <SelectItem value="views">조회순</SelectItem>
            <SelectItem value="likes">추천순</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          className="w-full sm:w-auto border-blue-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-gray-500"
        >
          <ListFilter className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
          필터
        </Button>
        {/* 로그인한 사용자만 글쓰기 버튼 표시 */}
        {!isLoading && isLoggedIn && (
          <Button 
            onClick={onWriteClick}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
          >
            <PenSquare className="mr-2 h-4 w-4" />
            글쓰기
          </Button>
        )}
      </div>
    </div>
  );
};

export default BoardFilterBar;
