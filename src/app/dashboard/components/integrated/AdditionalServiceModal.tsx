"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BUTTON_THEME } from '@/styles/common';

interface AdditionalServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (selectedServices: string[]) => void;
}

export default function AdditionalServiceModal({
  isOpen,
  onClose,
  onApply,
}: AdditionalServiceModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleApply = () => {
    onApply(selectedServices);
    onClose();
  };

  const handleClose = () => {
    setSelectedServices([]);
    onClose();
  };

  // 임시 부가서비스 목록
  const additionalServices = [
    { id: 'data_roaming', name: '데이터 로밍', description: '해외 데이터 사용 서비스' },
    { id: 'voice_roaming', name: '음성 로밍', description: '해외 음성 통화 서비스' },
    { id: 'sms_roaming', name: 'SMS 로밍', description: '해외 문자 서비스' },
    { id: 'vowifi', name: 'VoWiFi', description: 'WiFi 통화 서비스' },
    { id: 'volte', name: 'VoLTE', description: '고품질 음성 통화 서비스' },
    { id: 'esim', name: 'eSIM', description: '내장형 SIM 카드 서비스' },
    { id: 'family_discount', name: '가족 할인', description: '가족 구성원 할인 서비스' },
    { id: 'auto_payment', name: '자동 결제', description: '자동 결제 서비스' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-blue-600">부가서비스 선택</DialogTitle>
          <DialogDescription>
            적용할 부가서비스를 선택해주세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
            {additionalServices.map((service) => (
              <div
                key={service.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedServices.includes(service.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleServiceToggle(service.id)}
              >
                <div className="flex items-center h-4 w-4 mr-3">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{service.name}</div>
                  <div className="text-sm text-gray-500">{service.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className={BUTTON_THEME.gray}>
            취소
          </Button>
          <Button onClick={handleApply} className={BUTTON_THEME.primary}>
            적용하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 