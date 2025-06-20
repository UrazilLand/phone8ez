"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BUTTON_THEME } from '@/styles/common';
import { Smartphone, Save, X } from 'lucide-react';

interface ModelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (modelInfo: ModelInfo) => void;
  initialData?: ModelInfo;
  rowIndex: number;
}

interface ModelInfo {
  modelName: string;
  manufacturer: string;
  releaseDate: string;
  description: string;
  specifications: string;
}

export default function ModelInfoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  rowIndex 
}: ModelInfoModalProps) {
  const [modelInfo, setModelInfo] = useState<ModelInfo>({
    modelName: initialData?.modelName || '',
    manufacturer: initialData?.manufacturer || '',
    releaseDate: initialData?.releaseDate || '',
    description: initialData?.description || '',
    specifications: initialData?.specifications || '',
  });

  const handleSave = () => {
    onSave(modelInfo);
    onClose();
  };

  const handleClose = () => {
    setModelInfo({
      modelName: '',
      manufacturer: '',
      releaseDate: '',
      description: '',
      specifications: '',
    });
    onClose();
  };

  const handleInputChange = (field: keyof ModelInfo, value: string) => {
    setModelInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-blue-700">
            <Smartphone className="w-5 h-5" />
            모델정보 입력
          </DialogTitle>
          <DialogDescription className="text-left text-gray-600">
            {rowIndex + 1}행의 모델 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modelName" className="text-sm font-medium text-gray-700">
                모델명 *
              </Label>
              <Input
                id="modelName"
                value={modelInfo.modelName}
                onChange={(e) => handleInputChange('modelName', e.target.value)}
                placeholder="예: Galaxy S24"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manufacturer" className="text-sm font-medium text-gray-700">
                제조사 *
              </Label>
              <Input
                id="manufacturer"
                value={modelInfo.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                placeholder="예: 삼성전자"
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="releaseDate" className="text-sm font-medium text-gray-700">
              출시일
            </Label>
            <Input
              id="releaseDate"
              type="date"
              value={modelInfo.releaseDate}
              onChange={(e) => handleInputChange('releaseDate', e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              모델 설명
            </Label>
            <Textarea
              id="description"
              value={modelInfo.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="모델에 대한 간단한 설명을 입력하세요"
              rows={3}
              className="w-full resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specifications" className="text-sm font-medium text-gray-700">
              주요 스펙
            </Label>
            <Textarea
              id="specifications"
              value={modelInfo.specifications}
              onChange={(e) => handleInputChange('specifications', e.target.value)}
              placeholder="화면 크기, 배터리, 카메라 등 주요 스펙을 입력하세요"
              rows={4}
              className="w-full resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={handleClose} className={`${BUTTON_THEME.gray} flex items-center gap-2`}>
            <X className="w-4 h-4" />
            취소
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!modelInfo.modelName.trim() || !modelInfo.manufacturer.trim()}
            className={`${!modelInfo.modelName.trim() || !modelInfo.manufacturer.trim() ? BUTTON_THEME.disabled : BUTTON_THEME.primary} flex items-center gap-2`}
          >
            <Save className="w-4 h-4" />
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 