"use client";

import { Button } from '@/components/ui/button';
import { DataSet } from '@/types/dashboard';
import { Save, RotateCcw, Undo, Filter, Plus } from 'lucide-react';
import { BUTTON_THEME } from '@/components/ui/colors';
import { SHEET_HEADER_LABELS, DEFAULT_ROW_COUNT, DEFAULT_COLUMN_COUNT } from '@/styles/common';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Undo2Icon, Redo2Icon } from "lucide-react";

interface IntegratedHeaderProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  publicData: any;
  onSave: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenFilterModal: () => void;
  onOpenAdditionalServiceModal: () => void;
}

export default function IntegratedHeader({
  dataSets,
  setDataSets,
  publicData,
  onSave,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenFilterModal,
  onOpenAdditionalServiceModal,
}: IntegratedHeaderProps) {
  return (
    <div className="flex items-center justify-between px-1 py-2">
      <div className="flex items-center gap-2">
        <Button 
          className={BUTTON_THEME.primary}
          onClick={onSave}
        >
          <Save className="w-4 h-4 mr-2" />
          <span className="max-md:hidden text-sm font-bold">저장하기</span>
        </Button>
        <Button 
          className={BUTTON_THEME.danger_fill}
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          <span className="max-md:hidden text-sm font-bold">시트초기화</span>
        </Button>
        <div className="flex items-center gap-1 ml-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onUndo}
                disabled={!canUndo}
                variant="ghost"
                size="icon"
                className="w-8 h-8"
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
                className="w-8 h-8"
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
      <div className="flex items-center gap-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={onOpenAdditionalServiceModal}
        >
          <Plus className="w-4 h-4" />
          <span className="max-md:hidden text-sm font-bold">부가서비스</span>
        </Button>
        <Button 
          variant="outline"
          size="sm"
          onClick={onOpenFilterModal}
        >
          <Filter className="w-4 h-4" />
          <span className="max-md:hidden text-sm font-bold">데이터 선택</span>
        </Button>
      </div>
    </div>
  );
} 