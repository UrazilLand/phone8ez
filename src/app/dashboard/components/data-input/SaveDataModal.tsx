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
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [pendingDataName, setPendingDataName] = useState('');

  // 동일한 이름의 데이터셋이 존재하는지 확인
  const isDuplicateName = (name: string) => {
    return dataSets.some(dataSet => dataSet.name === name);
  };

  const handleConfirm = () => {
    const trimmedName = dataName.trim();
    if (!trimmedName) return;

    // 동일한 이름이 존재하는지 확인
    if (isDuplicateName(trimmedName)) {
      setPendingDataName(trimmedName);
      setShowOverwriteConfirm(true);
    } else {
      // 중복이 없으면 바로 저장
      onConfirm(trimmedName);
      setDataName('');
    }
  };

  const handleOverwriteConfirm = () => {
    onConfirm(pendingDataName);
    setDataName('');
    setShowOverwriteConfirm(false);
    setPendingDataName('');
  };

  const handleOverwriteCancel = () => {
    setShowOverwriteConfirm(false);
    setPendingDataName('');
  };

  const handleClose = () => {
    setDataName('');
    setShowOverwriteConfirm(false);
    setPendingDataName('');
    onClose();
  };

  return (
    <>
      {/* 메인 저장 모달 */}
      <Dialog open={isOpen && !showOverwriteConfirm} onOpenChange={handleClose}>
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
              {dataName.trim() && isDuplicateName(dataName.trim()) && (
                <p className="text-sm text-orange-600">
                  ⚠️ 동일한 이름의 데이터셋이 이미 존재합니다.
                </p>
              )}
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

      {/* 덮어쓰기 확인 모달 */}
      <Dialog open={showOverwriteConfirm} onOpenChange={handleOverwriteCancel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-orange-600">
              덮어쓰기 확인
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              <strong>"{pendingDataName}"</strong> 이름의 데이터셋이 이미 존재합니다.
            </p>
            <p className="text-sm text-gray-600">
              기존 데이터를 덮어쓰시겠습니까?
            </p>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={handleOverwriteCancel}
                className={BUTTON_THEME.gray}
              >
                취소
              </Button>
              <Button
                onClick={handleOverwriteConfirm}
                className={BUTTON_THEME.danger_fill}
              >
                덮어쓰기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 