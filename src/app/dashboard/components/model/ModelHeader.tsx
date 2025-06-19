"use client";

import { Button } from '@/components/ui/button';
import { DataSet } from '@/types/dashboard';
import { Database } from 'lucide-react';
import { BUTTON_THEME } from '@/styles/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModelHeaderProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
}

export default function ModelHeader({ dataSets, setDataSets }: ModelHeaderProps) {
  return (
    <div className="flex flex-col w-full">
      {/* 버튼 영역 */}
      <div className="flex items-center justify-between p-4">
        {/* 왼쪽 드롭다운 */}
        <div className="flex items-center gap-2">
          <Select>
            <SelectTrigger className="w-[270px] h-9">
              <SelectValue placeholder="모델 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="iphone15">iPhone 15</SelectItem>
              <SelectItem value="iphone15pro">iPhone 15 Pro</SelectItem>
              <SelectItem value="s24">Galaxy S24</SelectItem>
              <SelectItem value="s24ultra">Galaxy S24 Ultra</SelectItem>
            </SelectContent>
          </Select>
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