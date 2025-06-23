"use client";

import { Button } from '@/components/ui/button';
import { DataSet } from '@/types/dashboard';
import { Database } from 'lucide-react';
import { BUTTON_THEME } from '@/styles/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from 'react';
import PublicDataModal from './PublicDataModal';

interface ModelHeaderProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  onModelSelect: (modelContent: string) => void;
  selectedModelContent: string;
  publicData: any;
}

interface ModelOption {
  displayName: string;
  cellContent: string;
  rowIndex: number;
}

export default function ModelHeader({ 
  dataSets, 
  setDataSets, 
  onModelSelect, 
  selectedModelContent,
  publicData 
}: ModelHeaderProps) {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isPublicDataModalOpen, setIsPublicDataModalOpen] = useState(false);

  // 통합 데이터에서 A열 모델 정보 추출
  const modelOptions = useMemo(() => {
    const options: ModelOption[] = [];
    
    const integratedDataSet = dataSets.find(dataset => dataset.type === 'integrated');
    if (integratedDataSet?.data.sheetData) {
      const sheetData = integratedDataSet.data.sheetData;
      
      // 6행부터 A열 데이터 확인 (모델 정보가 저장된 행들)
      for (let rowIndex = 5; rowIndex < sheetData.length; rowIndex++) {
        const cellContent = sheetData[rowIndex]?.[0]?.trim();
        if (cellContent && cellContent.includes('display:')) {
          // display:모델명 부분 추출
          const displayMatch = cellContent.match(/display:([^|]+)/);
          if (displayMatch) {
            const displayName = displayMatch[1];
            options.push({
              displayName,
              cellContent,
              rowIndex
            });
          }
        }
      }
    }
    
    return options;
  }, [dataSets]);

  const handleModelSelect = (value: string) => {
    setSelectedModel(value);
    
    // 선택된 모델의 셀 내용을 그대로 사용
    const selectedOption = modelOptions.find(option => option.displayName === value);
    if (selectedOption) {
      // 부모 컴포넌트로 선택된 모델의 셀 내용 전달
      onModelSelect(selectedOption.cellContent);
    }
  };

  const handleOpenPublicDataModal = () => {
    setIsPublicDataModalOpen(true);
  };

  const handleClosePublicDataModal = () => {
    setIsPublicDataModalOpen(false);
  };

  return (
    <div className="flex items-center justify-between p-4">
      {/* 왼쪽 드롭다운 */}
      <div className="flex items-center gap-2">
        <Select value={selectedModel} onValueChange={handleModelSelect}>
          <SelectTrigger className="w-[270px] h-9">
            <SelectValue placeholder="모델 선택" />
          </SelectTrigger>
          <SelectContent>
            {modelOptions.map((option, index) => (
              <SelectItem key={index} value={option.displayName}>
                {option.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 오른쪽 버튼 */}
      <div className="flex items-center">
        <Button 
          className={`${BUTTON_THEME.secondary} flex items-center gap-2`}
          size="sm"
          onClick={handleOpenPublicDataModal}
        >
          <Database className="w-4 h-4" />
          <span className="max-md:hidden">공시 데이터</span>
        </Button>
      </div>

      {/* 공시 데이터 모달 */}
      <PublicDataModal
        isOpen={isPublicDataModalOpen}
        onClose={handleClosePublicDataModal}
        selectedModelContent={selectedModelContent}
        publicData={publicData}
      />
    </div>
  );
} 