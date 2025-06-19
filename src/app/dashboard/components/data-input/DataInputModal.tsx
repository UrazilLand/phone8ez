"use client";

import { DataSet } from '@/types/dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { BUTTON_THEME } from '@/styles/common';

interface DataInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
}

export default function DataInputModal({
  isOpen,
  onClose,
  dataSets,
  setDataSets,
}: DataInputModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold text-blue-600">
            데이터 입력
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 모달 내용이 여기에 들어갈 예정 */}
          <div className="text-center text-gray-500 py-8">
            데이터 입력 기능이 준비 중입니다...
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 