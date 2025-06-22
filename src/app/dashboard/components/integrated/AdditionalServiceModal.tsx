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
import { BUTTON_THEME } from '@/styles/common';
import { DataSet } from '@/types/dashboard';

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

  // 기존 부가서비스 데이터 불러오기
  useEffect(() => {
    const additionalDataSet = dataSets.find(dataset => dataset.type === 'additional');
    if (additionalDataSet?.data.additionalServices) {
      setAdditionalServicesData(additionalDataSet.data.additionalServices);
    }
  }, [dataSets]);

  // 첫 번째 업체를 기본 선택
  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyKey) {
      handleCompanySelect(companies[0].key);
    }
  }, [companies, selectedCompanyKey]);

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
    setSelectedCompanyKey('');
    setAdditionalServicesData({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[900px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-blue-600">부가서비스 설정</DialogTitle>
          <DialogDescription>
            업체별 부가서비스와 할인금액을 설정해주세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-4 h-[550px]">
          {/* 1열: 업체명 탭 */}
          <div className="w-1/3 border-r border-gray-200">
            <div className="font-medium text-gray-700 mb-3 px-2">업체명</div>
            <div className="overflow-y-auto h-full pr-2 space-y-2">
              {companies.map((company) => (
                <div
                  key={company.key}
                  className={`h-10 px-2 rounded-lg cursor-pointer transition-colors flex items-center ${
                    selectedCompanyKey === company.key
                      ? 'bg-blue-100 border-blue-300 border'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                  onClick={() => handleCompanySelect(company.key)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="font-medium text-gray-900">{company.company}</div>
                    <div className="text-sm text-gray-500">{company.carrier}</div>
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
                  <div className="flex-1 font-medium text-gray-700">부가서비스명</div>
                  <div className="w-1/3 font-medium text-gray-700">할인금액</div>
                </div>
                <div className="space-y-2 max-h-[480px] overflow-y-auto">
                  {currentCompanyServices.map((service, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <Input
                        className="flex-1 bg-white text-black"
                        placeholder="부가서비스명을 입력하세요"
                        value={service.service}
                        onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
                      />
                      <Input
                        className="w-1/3 bg-white text-black"
                        placeholder="할인금액"
                        value={service.discount}
                        onChange={(e) => handleServiceChange(index, 'discount', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                업체를 선택해주세요
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className={BUTTON_THEME.gray}>
            취소
          </Button>
          <Button onClick={handleApply} className={BUTTON_THEME.primary}>
            저장하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 