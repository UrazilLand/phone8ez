"use client";

import { DataSet } from '@/types/dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { BUTTON_THEME } from '@/styles/common';
import { useState } from 'react';

interface SaveDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dataName: string) => void;
  dataSets: DataSet[];
}

export default function SaveDataModal({
  isOpen,
  onClose,
  onConfirm,
  dataSets,
}: SaveDataModalProps) {
  const [dataName, setDataName] = useState('');

  const handleConfirm = () => {
    if (dataName.trim()) {
      onConfirm(dataName.trim());
      setDataName(''); // 입력 필드 초기화
    }
  };

  const handleClose = () => {
    setDataName(''); // 입력 필드 초기화
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-bold text-blue-600">
            데이터 저장
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="dataName" className="text-sm font-medium text-black">
              데이터 세트 이름
            </Label>
            <Input
              id="dataName"
              value={dataName}
              onChange={(e) => setDataName(e.target.value)}
              placeholder="데이터 세트 이름을 입력하세요"
              className="w-full bg-white border-2 border-gray-300 rounded-md text-black"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={handleClose}
              className={BUTTON_THEME.gray}
            >
              취소
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!dataName.trim()}
              className={!dataName.trim() ? BUTTON_THEME.disabled : BUTTON_THEME.primary}
            >
              저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 