"use client";

import { Button } from '@/components/ui/button';
import { DataSet } from '@/types/dashboard';
import { Save, RotateCcw, Undo, Database } from 'lucide-react';
import { BUTTON_THEME } from '@/styles/common';

interface DataInputHeaderProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
}

export default function DataInputHeader({ dataSets, setDataSets }: DataInputHeaderProps) {
  return (
    <div className="flex flex-col w-full">
      {/* 버튼 영역 */}
      <div className="flex items-center justify-between p-4">
        {/* 왼쪽 버튼 그룹 */}
        <div className="flex items-center gap-2">
          <Button 
            className={`${BUTTON_THEME.primary} flex items-center gap-2`}
            size="sm"
          >
            <Save className="w-4 h-4" />
            <span className="max-md:hidden">저장하기</span>
          </Button>
          <Button 
            className={`${BUTTON_THEME.danger_fill} flex items-center gap-2`}
            size="sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="max-md:hidden">시트초기화</span>
          </Button>
          <Button 
            className={`${BUTTON_THEME.danger} flex items-center gap-2`}
            size="sm"
          >
            <Undo className="w-4 h-4" />
            <span className="max-md:hidden">실행취소</span>
          </Button>
        </div>

        {/* 오른쪽 버튼 */}
        <div className="flex items-center">
          <Button 
            className={`${BUTTON_THEME.secondary} flex items-center gap-2`}
            size="sm"
          >
            <Database className="w-4 h-4" />
            <span className="max-md:hidden">데이터 입력</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 