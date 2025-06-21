"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BUTTON_THEME } from '@/styles/common';
import { Smartphone, Save, X, Search, Check, ChevronDown } from 'lucide-react';
import { DataSet } from '@/types/dashboard';
import { SupportAmountData } from '@/app/dashboard/utils/support-amounts';

interface ModelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (modelInfo: ModelInfo) => void;
  initialData?: ModelInfo;
  rowIndex: number;
  dataSets: DataSet[];
  publicData: SupportAmountData | null;
}

interface ModelInfo {
  selectedModelCodes: string[];      // 선택된 모델번호들
  standardModelCode: string;         // 표준 모델번호
  modelName: string;                 // 모델명
}

interface SearchResult {
  modelCode: string;
  source: string; // 데이터셋 이름
}

export default function ModelInfoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  rowIndex,
  dataSets,
  publicData
}: ModelInfoModalProps) {
  const [modelInfo, setModelInfo] = useState<ModelInfo>({
    selectedModelCodes: initialData?.selectedModelCodes || [],
    standardModelCode: initialData?.standardModelCode || '',
    modelName: initialData?.modelName || '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showStandardModelCodes, setShowStandardModelCodes] = useState(false);

  // 데이터셋에서 모델번호 추출
  const extractModelCodesFromDataSets = useMemo(() => {
    const modelCodes: SearchResult[] = [];
    
    dataSets.forEach(dataSet => {
      if (dataSet.data.sheetData) {
        // A열(인덱스 0)에서 6행부터 모델번호 추출
        for (let row = 5; row < dataSet.data.sheetData.length; row++) {
          const modelCode = dataSet.data.sheetData[row]?.[0]?.trim();
          if (modelCode && modelCode !== '') {
            modelCodes.push({
              modelCode,
              source: dataSet.name
            });
          }
        }
      }
    });
    
    return modelCodes;
  }, [dataSets]);

  // 검색어 하이라이트 함수
  const highlightSearchTerms = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const searchTerms = searchQuery
      .split(/[,\s]+/)
      .map(term => term.trim())
      .filter(term => term.length > 0);
    
    let highlightedText = text;
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    
    return highlightedText;
  };

  // 검색 기능
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // 쉼표나 띄어쓰기로 검색어를 분리
    const searchTerms = query
      .split(/[,\s]+/) // 쉼표나 공백으로 분리
      .map(term => term.trim().toLowerCase()) // 각 항목을 trim하고 소문자로 변환
      .filter(term => term.length > 0); // 빈 문자열 제거

    // 모든 검색어를 만족하는 모델번호만 필터링
    const filtered = extractModelCodesFromDataSets.filter(result => {
      const modelCodeLower = result.modelCode.toLowerCase();
      // 모든 검색어가 모델번호에 포함되어야 함 (AND 조건)
      return searchTerms.every(term => modelCodeLower.includes(term));
    });
    
    setSearchResults(filtered);
    setShowSearchResults(true);
  };

  // 모델번호 선택/해제
  const handleModelCodeToggle = (modelCode: string) => {
    setModelInfo(prev => ({
      ...prev,
      selectedModelCodes: prev.selectedModelCodes.includes(modelCode)
        ? prev.selectedModelCodes.filter(code => code !== modelCode)
        : [...prev.selectedModelCodes, modelCode]
    }));
  };

  // 표준 모델번호 선택
  const handleStandardModelCodeSelect = (standardCode: string) => {
    setModelInfo(prev => ({
      ...prev,
      standardModelCode: standardCode
    }));
    setShowStandardModelCodes(false);
    
    // 표준 모델번호에 해당하는 모델명 찾기
    if (publicData?.models) {
      const matchingModel = publicData.models.find(model => 
        model.modelName.includes(standardCode) || standardCode.includes(model.modelName)
      );
      if (matchingModel) {
        setModelInfo(prev => ({
          ...prev,
          modelName: matchingModel.modelName
        }));
      }
    }
  };

  // 모델명 변경 시 표준 모델번호도 업데이트
  const handleModelNameChange = (modelName: string) => {
    setModelInfo(prev => {
      const newModelInfo = {
        ...prev,
        modelName
      };
      
      // 모델명이 변경되면 표준 모델번호도 초기화
      if (modelName !== prev.modelName) {
        newModelInfo.standardModelCode = '';
      }
      
      return newModelInfo;
    });
  };

  const handleSave = () => {
    onSave(modelInfo);
    onClose();
  };

  const handleClose = () => {
    setModelInfo({
      selectedModelCodes: [],
      standardModelCode: '',
      modelName: '',
    });
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setShowStandardModelCodes(false);
    onClose();
  };

  const handleInputChange = (field: keyof ModelInfo, value: string) => {
    if (field === 'modelName') {
      handleModelNameChange(value);
    } else {
      setModelInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // 표준 모델번호 필터링
  const filteredStandardModelCodes = useMemo(() => {
    if (!publicData?.allModelCodes) return [];
    
    return publicData.allModelCodes.filter(code =>
      !searchQuery || code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [publicData?.allModelCodes, searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-black">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-blue-700">
            <Smartphone className="w-5 h-5" />
            모델정보 입력
          </DialogTitle>
          <DialogDescription className="text-left text-gray-600">
            {rowIndex + 1}행의 모델 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4 text-black">
          {/* 1. 모델번호 검색 및 선택 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              모델번호 검색 및 선택 *
            </Label>
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="모델번호 검색 (예: 겔럭시 = S931 128, 아이폰 = ip15 256)"
                className="w-full pr-10 text-black bg-white border-gray-300"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            {/* 검색 결과 */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto bg-white">
                <div className="text-sm font-medium text-gray-700 mb-2">검색 결과:</div>
                <div className="space-y-2">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 text-black ${
                        modelInfo.selectedModelCodes.includes(result.modelCode) ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                      onClick={() => handleModelCodeToggle(result.modelCode)}
                    >
                      <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                        modelInfo.selectedModelCodes.includes(result.modelCode) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                      }`}>
                        {modelInfo.selectedModelCodes.includes(result.modelCode) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span 
                        className="text-sm text-black"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightSearchTerms(result.modelCode, searchQuery) 
                        }}
                      />
                      <span className="text-xs text-gray-500">({result.source})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 선택된 모델번호들 */}
            {modelInfo.selectedModelCodes.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="text-sm font-medium text-gray-700 mb-2">선택된 모델번호:</div>
                <div className="flex flex-wrap gap-2">
                  {modelInfo.selectedModelCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                    >
                      <span>{code}</span>
                      <button
                        onClick={() => handleModelCodeToggle(code)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. 표준 모델번호 선택과 모델명 입력 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 표준 모델번호 선택 */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                표준 모델번호 선택
              </Label>
              <div className="relative">
                <button
                  onClick={() => setShowStandardModelCodes(!showStandardModelCodes)}
                  className="w-full flex items-center justify-between p-2 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white text-black"
                >
                  <span className={modelInfo.standardModelCode ? 'text-gray-900' : 'text-gray-500 text-sm'}>
                    {modelInfo.standardModelCode || '표준 모델번호를 선택하세요. (공시 연결)'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                    showStandardModelCodes ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {showStandardModelCodes && (
                  <div className="absolute z-10 w-full mt-1 border border-gray-200 rounded-lg bg-white shadow-lg max-h-40 overflow-y-auto">
                    {filteredStandardModelCodes.length > 0 ? (
                      filteredStandardModelCodes.map((code, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 text-black"
                          onClick={() => handleStandardModelCodeSelect(code)}
                        >
                          <span className="text-sm text-black">{code}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-gray-500">표준 모델번호가 없습니다.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 모델명 입력 */}
            <div className="space-y-3">
              <Label htmlFor="modelName" className="text-sm font-medium text-gray-700">
                모델명 *
              </Label>
              <Input
                id="modelName"
                value={modelInfo.modelName}
                onChange={(e) => handleInputChange('modelName', e.target.value)}
                placeholder="모델명을 입력하세요"
                className="w-full text-black bg-white border-gray-300 h-10"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={handleClose} className={`${BUTTON_THEME.gray} flex items-center gap-2`}>
            <X className="w-4 h-4" />
            취소
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!modelInfo.selectedModelCodes.length || !modelInfo.modelName.trim()}
            className={`${!modelInfo.selectedModelCodes.length || !modelInfo.modelName.trim() ? BUTTON_THEME.disabled : BUTTON_THEME.primary} flex items-center gap-2`}
          >
            <Save className="w-4 h-4" />
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 