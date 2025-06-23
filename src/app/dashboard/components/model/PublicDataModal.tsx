"use client";

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BUTTON_THEME } from '@/styles/common';

interface PublicDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PublicDataModal({ isOpen, onClose }: PublicDataModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-blue-600 py-2">공시 데이터 입력</DialogTitle>
          <DialogDescription>
            공시 데이터를 입력할 수 있는 기능입니다. (임시 모달)
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-600">
            공시 데이터 입력 기능이 준비 중입니다.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className={BUTTON_THEME.primary}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 