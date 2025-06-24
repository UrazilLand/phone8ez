"use client";

import { Button } from '@/components/ui/button';
import { DataSet } from '@/types/dashboard';
import { Save, RotateCcw, Undo2Icon, Redo2Icon, Database } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from 'react';
import DataInputModal from './DataInputModal';
import SaveDataModal from './SaveDataModal';

interface DataInputHeaderProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  onSave: (dataName?: string) => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onApplyData?: (data: any) => void;
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
  onApplyData,
}: DataInputHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleDataInputClick = () => {
    setIsModalOpen(true);
  };

  const handleSaveClick = () => {
    setIsSaveModalOpen(true);
  };

  const handleSaveConfirm = (dataName: string) => {
    // 여기서 실제 저장 로직을 호출하고 데이터 이름을 전달
    onSave(dataName);
    setIsSaveModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-2">
          <Button 
            size="default"
            onClick={handleSaveClick}
          >
            <Save className="w-4 h-4 mr-2"/>
            <span className="max-md:hidden text-sm font-bold">저장하기</span>
          </Button>
          <Button 
            variant="destructive"
            size="default"
            onClick={onReset}
          >
            <RotateCcw className="w-4 h-4 mr-2"/>
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
        <div className="flex items-center">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleDataInputClick}
          >
            <Database className="w-4 h-4 mr-2" />
            <span className="max-md:hidden text-sm font-bold">데이터 입력</span>
          </Button>
        </div>
      </div>

      <DataInputModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataSets={dataSets}
        setDataSets={setDataSets}
        onApplyData={onApplyData}
      />

      <SaveDataModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={handleSaveConfirm}
        dataSets={dataSets}
      />
    </>
  );
} 