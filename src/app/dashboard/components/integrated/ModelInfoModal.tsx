"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BUTTON_THEME } from '@/components/ui/colors';
import { Smartphone, Save, X, Search, Check, ChevronDown } from 'lucide-react';
import { DataSet, PublicSupportData, ModelInfo as ModelInfoType } from '@/types/dashboard';

interface ModelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (modelInfo: ModelInfo) => void;
  initialData?: ModelInfo;
  rowIndex: number;
  dataSets: DataSet[];
  publicData: PublicSupportData | null;
}

interface ModelInfo {
  selectedModelCodes: string[];      // 선택된 모델번호들
  standardModelCode: string;         // 표준 모델번호
  modelName: string;                 // 모델명
  price: string;                     // 출고가
}

interface SearchResult {
  modelCode: string;
  source: string; // 데이터셋 이름
}

// 숫자 포맷팅 함수 (쉼표 추가)
const formatNumber = (value: string): string => {
  // 숫자가 아닌 문자 제거
  const numericValue = value.replace(/[^\d]/g, '');
  if (!numericValue) return '';
  
  // 쉼표 추가
  return parseInt(numericValue).toLocaleString();
};

// 숫자 언포맷팅 함수 (쉼표 제거)
const unformatNumber = (value: string): string => {
  return value.replace(/[^\d]/g, '');
};

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
    selectedModelCodes: [],
    standardModelCode: '',
    modelName: '',
    price: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showStandardModelCodes, setShowStandardModelCodes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setModelInfo({
          selectedModelCodes: initialData.selectedModelCodes || [],
          standardModelCode: initialData.standardModelCode || '',
          modelName: initialData.modelName || '',
          price: initialData.price ? formatNumber(String(initialData.price)) : '',
        });
      } else {
        // initialData가 없으면(새로운 행) 상태 초기화
        setModelInfo({
          selectedModelCodes: [],
          standardModelCode: '',
          modelName: '',
          price: '',
        });
      }
      // 모달이 열릴 때 검색어도 초기화
      setSearchQuery('');
    }
  }, [isOpen, initialData]);

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

  // 초기 로드 시 모든 모델번호 표시
  useEffect(() => {
    if (isOpen) {
      setSearchResults(extractModelCodesFromDataSets);
    }
  }, [isOpen, extractModelCodesFromDataSets]);

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
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
    });
    
    return highlightedText;
  };

  // 검색 기능
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // 검색어가 없으면 모든 모델번호 표시
      setSearchResults(extractModelCodesFromDataSets);
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
    
    // 표준 모델번호에 해당하는 모델명과 출고가 찾기
    if (publicData?.model_info) {
      const matchingModel = publicData.model_info.find((model: ModelInfoType) => 
        model.model_number === standardCode
      );
      if (matchingModel) {
        setModelInfo(prev => ({
          ...prev,
          modelName: matchingModel.model_name,
          // 출고가 정보가 있으면 자동입력
          price: matchingModel.max_price ? formatNumber(String(matchingModel.max_price)) : ''
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

  // 출고가 입력 처리
  const handlePriceChange = (value: string) => {
    // 숫자만 추출
    const numericValue = unformatNumber(value);
    
    // 상태에는 포맷된 값 저장 (화면 표시용)
    setModelInfo(prev => ({
      ...prev,
      price: formatNumber(numericValue)
    }));
  };

  // 저장 시 숫자만 추출하여 저장
  const handleSave = () => {
    const modelInfoToSave = {
      ...modelInfo,
      price: unformatNumber(modelInfo.price) // 저장 시 숫자만
    };
    onSave(modelInfoToSave);
    onClose();
  };

  const handleClose = () => {
    setModelInfo({
      selectedModelCodes: [],
      standardModelCode: '',
      modelName: '',
      price: '',
    });
    setSearchQuery('');
    setSearchResults([]);
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
    if (!publicData?.model_info) return [];
    
    const allModelCodes = [...new Set(publicData.model_info.map(m => m.model_number))];

    if (!searchQuery.trim()) {
      return allModelCodes;
    }

    const searchTerms = searchQuery
      .split(/[,\s]+/)
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 0);

    return allModelCodes.filter((code: string) => {
      const codeLower = code.toLowerCase();
      return searchTerms.every(term => codeLower.includes(term));
    });
  }, [publicData?.model_info, searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-black dark:text-gray-100">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Smartphone className="w-5 h-5" />
            모델정보 입력
          </DialogTitle>
          <DialogDescription className="text-left text-gray-600 dark:text-gray-400">
            {rowIndex + 1}행의 모델 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4 text-black dark:text-gray-100">
          {/* 1. 모델번호 검색 및 선택 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              모델번호 검색 및 선택 *
            </Label>
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="모델번호 검색 (예: 갤럭시 = S931 256, ip15 128, 쉼표나 띄어쓰기로 구분)"
                className="w-full pr-10 text-black dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            
            {/* 검색 결과 */}
            {searchResults.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto bg-white dark:bg-gray-800">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {searchQuery.trim() ? '검색 결과:' : '모든 모델번호:'}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-gray-100 ${
                        modelInfo.selectedModelCodes.includes(result.modelCode) ? 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700' : ''
                      }`}
                      onClick={() => handleModelCodeToggle(result.modelCode)}
                    >
                      <div className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${
                        modelInfo.selectedModelCodes.includes(result.modelCode) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {modelInfo.selectedModelCodes.includes(result.modelCode) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span 
                        className="text-sm text-black dark:text-gray-100 truncate"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightSearchTerms(result.modelCode, searchQuery) 
                        }}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">({result.source})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 선택된 모델번호들 */}
            
          </div>

          {/* 2. 표준 모델번호 선택 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              표준 모델번호 선택
            </Label>
            <div className="relative">
              <button
                onClick={() => setShowStandardModelCodes(!showStandardModelCodes)}
                className="w-full flex items-center justify-between p-2 h-10 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
              >
                <span className={modelInfo.standardModelCode ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 text-sm'}>
                  {modelInfo.standardModelCode || '표준 모델번호를 선택하세요. (공시 연결)'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${
                  showStandardModelCodes ? 'rotate-180' : ''
                }`} />
              </button>
              
              {showStandardModelCodes && (
                <div className="absolute z-10 w-full mt-1 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-lg max-h-40 overflow-y-auto">
                  {filteredStandardModelCodes.length > 0 ? (
                    filteredStandardModelCodes.map((code: string, index: number) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 text-black dark:text-gray-100"
                        onClick={() => handleStandardModelCodeSelect(code)}
                      >
                        <span className="text-sm text-black dark:text-gray-100">{code}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500 dark:text-gray-400">표준 모델번호가 없습니다.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. 모델명 입력 */}
          <div className="space-y-3">
            <Label htmlFor="modelName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              모델명 *
            </Label>
            <Input
              id="modelName"
              value={modelInfo.modelName}
              onChange={(e) => handleInputChange('modelName', e.target.value)}
              placeholder="모델명을 입력하세요"
              className="w-full text-black dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 h-10"
            />
          </div>

          {/* 4. 출고가 입력 */}
          <div className="space-y-3">
            <Label htmlFor="price" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              출고가
            </Label>
            <Input
              id="price"
              value={modelInfo.price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="출고가를 입력하세요 (예: 1350000)"
              className="w-full text-black dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 h-10"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
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