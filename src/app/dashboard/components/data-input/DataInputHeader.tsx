"use client";

import { Button } from '@/components/ui/button';
import { DataSet } from '@/types/dashboard';
import { Save, RotateCcw, Undo, Database } from 'lucide-react';
import { BUTTON_THEME } from '@/styles/common';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Undo2Icon, Redo2Icon } from "lucide-react";

interface DataInputHeaderProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  onSave: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function DataInputHeader({
  dataSets,
  setDataSets,
  onSave,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: DataInputHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Button 
          className={`${BUTTON_THEME.primary} flex items-center gap-2`}
          size="sm"
          onClick={onSave}
        >
          <Save className="w-4 h-4" />
          <span className="max-md:hidden">저장하기</span>
        </Button>
        <Button 
          className={`${BUTTON_THEME.danger_fill} flex items-center gap-2`}
          size="sm"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4" />
          <span className="max-md:hidden">시트초기화</span>
        </Button>
        <div className="flex items-center gap-1 ml-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onUndo}
                disabled={!canUndo}
                variant="ghost"
                size="icon"
                className={`w-8 h-8 hover:bg-gray-100 hover:text-black ${
                  canUndo 
                    ? 'text-black' 
                    : 'text-gray-300'
                }`}
              >
                <Undo2Icon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>실행취소 (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onRedo}
                disabled={!canRedo}
                variant="ghost"
                size="icon"
                className={`w-8 h-8 hover:bg-gray-100 hover:text-black ${
                  canRedo 
                    ? 'text-black' 
                    : 'text-gray-300'
                }`}
              >
                <Redo2Icon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>되돌리기 (Ctrl+Shift+Z)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
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
  );
} 