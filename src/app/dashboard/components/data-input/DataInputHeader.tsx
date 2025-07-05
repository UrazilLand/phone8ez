"use client";

import { Button } from '@/components/ui/button';
import { DataSet } from '@/types/dashboard';
import { Save, RotateCcw, Undo2Icon, Redo2Icon, Database } from 'lucide-react';
import { BUTTON_THEME } from '@/components/ui/colors';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useRef } from 'react';
import DataInputModal from './DataInputModal';
import SaveDataModal from './SaveDataModal';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

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
  const modalRef = useRef<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDataInputClick = () => {
    setIsModalOpen(true);
  };

  const handleSaveClick = async () => {
    // 1. 사용자의 구독 플랜 확인
    let isPro = false;
    if (user?.id) {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan, ends_at')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data && data.plan === 'pro' && data.ends_at) {
        const now = new Date();
        const ends = new Date(data.ends_at);
        if (ends > now) {
          isPro = true;
        }
      }
    }
    // 2. 무료 플랜이고 normal 데이터셋이 3개 이상이면 제한
    const normalCount = dataSets.filter(ds => ds.type === 'normal').length;
    if (!isPro && normalCount >= 3) {
      toast({
        title: '데이터셋 개수 제한',
        description: '무료 플랜은 3개 이상의 데이터셋을 입력할 수 없습니다.\n더 많은 데이터 입력을 원하신다면 프로 플랜으로 구독해 주세요.',
      });
      return;
    }
    setIsSaveModalOpen(true);
  };

  const handleSaveConfirm = (dataName: string) => {
    // 여기서 실제 저장 로직을 호출하고 데이터 이름을 전달
    onSave(dataName);
    setIsSaveModalOpen(false);
  };

  const handleResetAll = () => {
    onReset();
    modalRef.current?.reset();
  };

  return (
    <>
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-2">
          <Button 
            className={BUTTON_THEME.primary}
            onClick={handleSaveClick}
          >
            <Save className="w-4 h-4 mr-2"/>
            <span className="max-md:hidden text-sm font-bold">저장하기</span>
          </Button>
          <Button 
            className={BUTTON_THEME.danger_fill}
            onClick={handleResetAll}
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
          {user && (
            <Button 
              variant="outline"
              size="sm"
              onClick={handleDataInputClick}
            >
              <Database className="w-4 h-4" />
              <span className="max-md:hidden text-sm font-bold">데이터 입력</span>
            </Button>
          )}
        </div>
      </div>

      <DataInputModal 
        ref={modalRef}
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