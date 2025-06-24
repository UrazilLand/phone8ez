"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BUTTON_THEME } from '@/components/ui/colors';
import { DataSet } from '@/types/dashboard';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AdditionalServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (additionalServicesData: Record<string, Array<{service: string, discount: string}>>) => void;
  dataSets: DataSet[];
}

interface CompanyInfo {
  company: string;
  carrier: string;
  key: string; // company-carrier 조합으로 고유 키 생성
}

export default function AdditionalServiceModal({
  isOpen,
  onClose,
  onApply,
  dataSets,
}: AdditionalServiceModalProps) {
  const [selectedCompanyKey, setSelectedCompanyKey] = useState<string>('');
  const [additionalServicesData, setAdditionalServicesData] = useState<
    Record<string, Array<{service: string, discount: string}>>
  >({});
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);

  // 데이터셋에서 업체명과 통신사 정보 추출
  const companies = useMemo(() => {
    const companySet = new Set<string>();
    const companiesList: CompanyInfo[] = [];

    dataSets.forEach(dataSet => {
      if (dataSet.type === 'integrated') return; // 통합 데이터는 제외
      
      const sheetData = dataSet.data.sheetData;
      if (!sheetData || sheetData.length < 5) return;

      // 1행(통신사)과 5행(업체명)에서 정보 추출
      for (let col = 1; col < sheetData[0].length; col++) {
        const carrier = sheetData[0]?.[col]?.trim();
        const company = sheetData[4]?.[col]?.trim();
        
        if (carrier && company) {
          const key = `${company}-${carrier}`;
          if (!companySet.has(key)) {
            companySet.add(key);
            companiesList.push({
              company,
              carrier,
              key
            });
          }
        }
      }
    });

    return companiesList.sort((a, b) => {
      // 통신사 순서: SK, KT, LG
      const carrierOrder = { 'SK': 1, 'KT': 2, 'LG': 3 };
      const aOrder = carrierOrder[a.carrier as keyof typeof carrierOrder] || 4;
      const bOrder = carrierOrder[b.carrier as keyof typeof carrierOrder] || 4;
      
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.company.localeCompare(b.company);
    });
  }, [dataSets]);

  // 모달이 열릴 때 기존 데이터를 불러오고 상태를 초기화합니다.
  useEffect(() => {
    if (isOpen) {
      const additionalDataSet = dataSets.find(dataset => dataset.type === 'additional');
      if (additionalDataSet?.data.additionalServices) {
        setAdditionalServicesData(additionalDataSet.data.additionalServices);
      } else {
        setAdditionalServicesData({});
      }

      if (companies.length > 0) {
        setSelectedCompanyKey(companies[0].key);
      } else {
        setSelectedCompanyKey('');
      }
    }
  }, [isOpen, dataSets, companies]);

  // 선택된 업체의 부가서비스 데이터 가져오기
  const currentCompanyServices = useMemo(() => {
    if (!selectedCompanyKey) return Array(10).fill({ service: '', discount: '' });
    return additionalServicesData[selectedCompanyKey] || Array(10).fill({ service: '', discount: '' });
  }, [selectedCompanyKey, additionalServicesData]);

  // 업체 선택 시 초기 데이터 설정
  const handleCompanySelect = (companyKey: string) => {
    setSelectedCompanyKey(companyKey);
    if (!additionalServicesData[companyKey]) {
      setAdditionalServicesData(prev => ({
        ...prev,
        [companyKey]: Array(10).fill({ service: '', discount: '' })
      }));
    }
  };

  // 부가서비스 데이터 업데이트
  const handleServiceChange = (index: number, field: 'service' | 'discount', value: string) => {
    if (!selectedCompanyKey) return;

    const updatedServices = [...currentCompanyServices];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value
    };

    setAdditionalServicesData(prev => ({
      ...prev,
      [selectedCompanyKey]: updatedServices
    }));
  };

  const handleApply = () => {
    onApply(additionalServicesData);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    const existingAdditionalDataSet = dataSets.find(dataset => dataset.type === 'additional');
    if (existingAdditionalDataSet) {
      setIsOverwriteModalOpen(true);
    } else {
      handleApply();
    }
  };

  const handleCancelOverwrite = () => {
    setIsOverwriteModalOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-[900px] max-h-[80vh] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-blue-600 dark:text-blue-400">부가서비스 설정</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              업체별 부가서비스와 할인금액을 설정해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-4 h-[550px]">
            {/* 1열: 업체명 탭 */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700">
              <div className="font-medium text-gray-700 dark:text-gray-300 mb-3 px-2">업체명</div>
              <div className="overflow-y-auto h-full pr-2 space-y-2">
                {companies.map((company) => (
                  <div
                    key={company.key}
                    className={`h-10 px-2 rounded-lg cursor-pointer transition-colors flex items-center ${
                      selectedCompanyKey === company.key
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 border'
                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                    onClick={() => handleCompanySelect(company.key)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{company.company}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{company.carrier}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2열, 3열: 부가서비스 입력 */}
            <div className="flex-1">
              {selectedCompanyKey ? (
                <>
                  <div className="flex gap-4 mb-3">
                    <div className="flex-1 font-medium text-gray-700 dark:text-gray-300">부가서비스명</div>
                    <div className="w-1/3 font-medium text-gray-700 dark:text-gray-300">할인금액</div>
                  </div>
                  <div className="space-y-2 max-h-[480px] overflow-y-auto">
                    {currentCompanyServices.map((service, index) => (
                      <div key={index} className="flex gap-4 items-center">
                        <Input
                          className="flex-1 bg-white dark:bg-gray-800 text-black dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          placeholder="부가서비스명을 입력하세요"
                          value={service.service}
                          onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
                        />
                        <Input
                          className="w-1/3 bg-white dark:bg-gray-800 text-black dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          placeholder="할인금액"
                          value={service.discount}
                          onChange={(e) => handleServiceChange(index, 'discount', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  업체를 선택해주세요
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className={BUTTON_THEME.gray}>
              취소
            </Button>
            <Button onClick={handleSave} className={BUTTON_THEME.primary}>
              저장하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 덮어쓰기 확인 모달 */}
      <Dialog open={isOverwriteModalOpen} onOpenChange={setIsOverwriteModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-blue-600 dark:text-blue-400">덮어쓰기 확인</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              이미 '부가' 데이터가 존재합니다. 덮어쓰시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCancelOverwrite} className={BUTTON_THEME.gray}>
              취소
            </Button>
            <Button onClick={handleApply} className={BUTTON_THEME.primary}>
              덮어쓰기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 