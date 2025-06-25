"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUTTON_THEME, CARRIER_OPTIONS } from '@/components/ui/colors';
import { Filter, RotateCcw, Building2, CreditCard, DollarSign } from 'lucide-react';
import { DataSet, PublicSupportData } from '@/types/dashboard';
import { 
  extractCompaniesByCarrier, 
  extractPlansByCarrierAndCompany, 
  extractMonthlyFeesByCarrier 
} from '@/app/dashboard/utils/integrated/dataExtraction';

// --- 타입 정의 ---
interface PlanSelection {
  monthlyFee1: number | null;
  monthlyFee2: number | null;
}

type PlanSelections = Record<string, PlanSelection>; // { [planName]: PlanSelection }

interface CarrierSpecificState {
    selectionsByCompany: Record<string, PlanSelections>; // { [companyName]: PlanSelections }
}

interface ExtractedDataByCarrier {
  companies: string[];
  plansByCompany: Record<string, string[]>; // { [companyName]: plans[] }
  monthlyFees5G: number[];
  monthlyFeesLTE: number[];
}

const getInitialCarrierState = (): CarrierSpecificState => ({
    selectionsByCompany: {},
});

// --- 컴포넌트 Props ---
interface DataSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (allSelections: Record<string, CarrierSpecificState>) => void;
  dataSets: DataSet[];
  publicData: PublicSupportData | null;
}

export default function DataSelectionModal({ isOpen, onClose, onApply, dataSets, publicData }: DataSelectionModalProps) {
  const [activeTab, setActiveTab] = useState('SK');
  
  // 현재 선택된 '업체' (요금제 선택 UI를 위해 필요)
  const [currentDisplayCompany, setCurrentDisplayCompany] = useState<string | null>(null);

  const [selectionByCarrier, setSelectionByCarrier] = useState<Record<string, CarrierSpecificState>>({
    SK: getInitialCarrierState(),
    KT: getInitialCarrierState(),
    LG: getInitialCarrierState(),
  });

  // 모든 데이터를 미리 추출하여 저장
  const [extractedDataByCarrier, setExtractedDataByCarrier] = useState<Record<string, ExtractedDataByCarrier>>({
    SK: { companies: [], plansByCompany: {}, monthlyFees5G: [], monthlyFeesLTE: [] },
    KT: { companies: [], plansByCompany: {}, monthlyFees5G: [], monthlyFeesLTE: [] },
    LG: { companies: [], plansByCompany: {}, monthlyFees5G: [], monthlyFeesLTE: [] },
  });

  // 모달 열릴 때 모든 데이터를 한 번에 추출
  useEffect(() => {
    if (isOpen) {
      console.log('publicData:', publicData);
      console.log('publicData.carrier_monthly_fees:', publicData?.carrier_monthly_fees);
      
      const carriers: ('SK' | 'KT' | 'LG')[] = ['SK', 'KT', 'LG'];
      const newExtractedData: Record<string, ExtractedDataByCarrier> = {
        SK: { companies: [], plansByCompany: {}, monthlyFees5G: [], monthlyFeesLTE: [] },
        KT: { companies: [], plansByCompany: {}, monthlyFees5G: [], monthlyFeesLTE: [] },
        LG: { companies: [], plansByCompany: {}, monthlyFees5G: [], monthlyFeesLTE: [] },
      };

      // '통합' 데이터셋을 제외한 일반 데이터셋만 필터링
      const filteredDataSets = dataSets.filter(dataSet => dataSet.name !== '통합');

      carriers.forEach(carrier => {
        // 업체명 추출
        const companies = extractCompaniesByCarrier(filteredDataSets, carrier);
        
        // 각 업체별 요금제 추출
        const plansByCompany: Record<string, string[]> = {};
        companies.forEach(company => {
          plansByCompany[company] = extractPlansByCarrierAndCompany(filteredDataSets, carrier, company);
        });
        
        // 월 요금제 추출
        const monthlyFees5G = extractMonthlyFeesByCarrier(publicData, carrier, '5G');
        const monthlyFeesLTE = extractMonthlyFeesByCarrier(publicData, carrier, 'LTE');

        console.log(`${carrier} 5G fees:`, monthlyFees5G);
        console.log(`${carrier} LTE fees:`, monthlyFeesLTE);

        newExtractedData[carrier] = {
          companies,
          plansByCompany,
          monthlyFees5G,
          monthlyFeesLTE
        };
      });

      setExtractedDataByCarrier(newExtractedData);
    }
  }, [isOpen, dataSets, publicData]);

  // --- 이벤트 핸들러 ---
  const handleCompanySelect = (company: string) => {
    // UI 표시용 현재 업체 업데이트
    setCurrentDisplayCompany(company);
  };

  const handlePlanToggle = (plan: string) => {
    if (!currentDisplayCompany) return;

    const currentCompanySelections = selectionByCarrier[activeTab].selectionsByCompany[currentDisplayCompany] || {};
    const isSelected = plan in currentCompanySelections;
    const newSelections = { ...currentCompanySelections };

    if (isSelected) {
        delete newSelections[plan];
    } else {
        newSelections[plan] = { monthlyFee1: null, monthlyFee2: null };
    }

    setSelectionByCarrier(prev => ({
        ...prev,
        [activeTab]: {
            ...prev[activeTab],
            selectionsByCompany: { 
                ...prev[activeTab].selectionsByCompany, 
                [currentDisplayCompany]: newSelections 
            }
        }
    }));
  };

  const handleMonthlyFeeChange = (plan: string, feeType: 'monthlyFee1' | 'monthlyFee2', fee: string | null) => {
    if (!currentDisplayCompany) return;

    const feeAsNumber = fee ? parseInt(fee, 10) : null;
    const currentCompanySelections = selectionByCarrier[activeTab].selectionsByCompany[currentDisplayCompany] || {};
    const currentPlanSelection = currentCompanySelections[plan] || { monthlyFee1: null, monthlyFee2: null };
    
    const newPlanSelection = { ...currentPlanSelection, [feeType]: feeAsNumber };
    const newSelections = { ...currentCompanySelections, [plan]: newPlanSelection };

    setSelectionByCarrier(prev => ({
        ...prev,
        [activeTab]: {
            ...prev[activeTab],
            selectionsByCompany: { 
                ...prev[activeTab].selectionsByCompany, 
                [currentDisplayCompany]: newSelections 
            }
        }
    }));
  };

  const handleApply = () => {
    onApply(selectionByCarrier);
    onClose();
  };
  
  const handleReset = () => {
    setSelectionByCarrier({
      SK: getInitialCarrierState(),
      KT: getInitialCarrierState(),
      LG: getInitialCarrierState(),
    });
    setCurrentDisplayCompany(null);
  };

  // --- 렌더링을 위한 변수 ---
  const activeSelection = selectionByCarrier[activeTab];
  const selectedPlans = currentDisplayCompany ? activeSelection.selectionsByCompany[currentDisplayCompany] || {} : {};
  const currentCarrierData = extractedDataByCarrier[activeTab];
  const currentPlans = currentDisplayCompany ? currentCarrierData.plansByCompany[currentDisplayCompany] || [] : [];

  const isAnySelectionMade = Object.values(selectionByCarrier).some(carrierState => {
    // 선택된 회사 중 하나라도 요금제 선택이 있는지 확인
    return Object.values(carrierState.selectionsByCompany).some(companySelections => {
        return Object.keys(companySelections).length > 0;
    });
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Filter className="w-5 h-5" />
            데이터 선택
          </DialogTitle>
          <DialogDescription className="text-left text-gray-600 dark:text-gray-400">
            통합 데이터에 사용할 업체명과 요금제 구간을 선택하세요.
            <br />
            월 요금제는 공시 정보를 수집하는 기준입니다. <a href="https://m.smartchoice.or.kr/smc/mobile/dantongList.do?type=m" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">스마트초이스</a>를 확인하여 정확한 구간을 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full flex-1 flex flex-col min-h-0">
          <div className="px-4">
            <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
              {['SK', 'KT', 'LG'].map((carrier) => {
                const carrierOption = CARRIER_OPTIONS.find(option => option.value === carrier);
                const isActive = activeTab === carrier;
                
                return (
                  <button
                    key={carrier}
                    onClick={() => setActiveTab(carrier)}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors whitespace-pre-wrap min-w-[80px] text-center ${
                      isActive
                        ? `bg-white dark:bg-gray-800 border-b-2 border-blue-600 ${carrierOption?.style || 'text-blue-600 dark:text-blue-400'}`
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    aria-label={`${carrier} 탭으로 전환`}
                  >
                    {carrier}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto pr-4">
            <div className="grid grid-cols-4 gap-4">
              
              {/* 1열: 업체명 탭 */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  <Building2 className="w-4 h-4" />
                  업체명
                </div>
                <div className="space-y-2">
                  {currentCarrierData.companies.map((company) => {
                    const hasSelectedPlans = Object.keys(activeSelection.selectionsByCompany[company] || {}).length > 0;
                    const isCurrentCompany = currentDisplayCompany === company;
                    
                    return (
                      <Button
                        key={company}
                        onClick={() => handleCompanySelect(company)}
                        className={`w-full justify-center text-center h-8 ${
                          isCurrentCompany 
                            ? BUTTON_THEME.primary 
                            : hasSelectedPlans 
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800' 
                              : BUTTON_THEME.secondary
                        }`}
                      >
                        {company}
                        {hasSelectedPlans && (
                          <span className="ml-1 text-xs">✓</span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* 2열: 요금제 */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  <CreditCard className="w-4 h-4" />
                  요금제 선택
                </div>
                <div className="space-y-2 text-gray-800 dark:text-gray-200">
                  {currentDisplayCompany ? (
                    currentPlans.length > 0 ? (
                      currentPlans.map((plan) => {
                        const isSelected = plan in selectedPlans;
                        return (
                          <Button
                            key={plan}
                            onClick={() => handlePlanToggle(plan)}
                            variant={isSelected ? 'default' : 'outline'}
                            className={`w-full justify-center text-center h-8 ${isSelected ? BUTTON_THEME.primary : ''}`}
                          >
                            {plan}
                          </Button>
                        );
                      })
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400 text-sm p-2 text-center">업체를 선택하세요.</div>
                    )
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-sm p-2 text-center">업체를 선택하세요.</div>
                  )}
                </div>
              </div>

              {/* 3열: 월 요금제 1 */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  5G 월 요금제
                </div>
                <div className="space-y-2">
                  {currentDisplayCompany ? (
                    currentPlans.length > 0 ? (
                      currentPlans.map((plan) => {
                        const isSelected = plan in selectedPlans;
                        const planSelection = selectedPlans[plan];
                        
                        return (
                          <div key={plan} className="h-8 flex items-center">
                            {isSelected ? (
                              <Select
                                value={planSelection?.monthlyFee1?.toString() || ""}
                                onValueChange={(value) => handleMonthlyFeeChange(plan, 'monthlyFee1', value)}
                              >
                                <SelectTrigger className="text-gray-800 dark:text-gray-200 h-8 text-center justify-center bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                  <SelectValue placeholder="월 요금 선택" className="text-center" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                  {currentCarrierData.monthlyFees5G
                                    .sort((a, b) => b - a)
                                    .map((fee) => (
                                    <SelectItem key={fee} value={fee.toString()} className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">{fee.toLocaleString()}원</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="w-full h-8 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                                -
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400 text-sm p-2 text-center">업체를 선택하세요.</div>
                    )
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-sm p-2 text-center">업체를 선택하세요.</div>
                  )}
                </div>
              </div>

              {/* 4열: 월 요금제 2 */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  LTE 월 요금제
                </div>
                <div className="space-y-2">
                  {currentDisplayCompany ? (
                    currentPlans.length > 0 ? (
                      currentPlans.map((plan) => {
                        const isSelected = plan in selectedPlans;
                        const planSelection = selectedPlans[plan];
                        
                        return (
                          <div key={plan} className="h-8 flex items-center">
                            {isSelected ? (
                              <Select
                                value={planSelection?.monthlyFee2?.toString() || ""}
                                onValueChange={(value) => handleMonthlyFeeChange(plan, 'monthlyFee2', value)}
                              >
                                <SelectTrigger className="text-gray-800 dark:text-gray-200 h-8 text-center justify-center bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                  <SelectValue placeholder="월 요금 선택" className="text-center" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                  {currentCarrierData.monthlyFeesLTE
                                    .sort((a, b) => b - a)
                                    .map((fee) => (
                                    <SelectItem key={fee} value={fee.toString()} className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">{fee.toLocaleString()}원</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="w-full h-8 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                                -
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400 text-sm p-2 text-center">업체를 선택하세요.</div>
                    )
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-sm p-2 text-center">업체를 선택하세요.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-700 mt-2 flex-shrink-0">
          <Button onClick={handleReset} className={`${BUTTON_THEME.danger_fill} flex items-center gap-2`}>
            <RotateCcw className="w-4 h-4" />
            초기화
          </Button>
          <Button 
            onClick={handleApply}
            className={`${BUTTON_THEME.primary} flex items-center gap-2`}
            disabled={!isAnySelectionMade}
          >
            <Filter className="w-4 h-4" />
            선택 완료
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}