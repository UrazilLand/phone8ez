"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BUTTON_THEME } from '@/styles/common';
import { Filter, RotateCcw, Building2, CreditCard, DollarSign } from 'lucide-react';
import { DataSet } from '@/types/dashboard';
import { SupportAmountData } from '@/app/dashboard/utils/support-amounts';
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
    selectedCompany: string | null;
    selectionsByCompany: Record<string, PlanSelections>; // { [companyName]: PlanSelections }
}

interface ExtractedDataByCarrier {
  companies: string[];
  plansByCompany: Record<string, string[]>; // { [companyName]: plans[] }
  monthlyFees: number[];
}

const getInitialCarrierState = (): CarrierSpecificState => ({
    selectedCompany: null,
    selectionsByCompany: {},
});

// --- 컴포넌트 Props ---
interface DataSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (selectedData: {
    carrier: string;
    company: string | null;
    plans: PlanSelections;
  }) => void;
  dataSets: DataSet[];
  publicData: SupportAmountData | null;
}

export default function DataSelectionModal({ isOpen, onClose, onApply, dataSets, publicData }: DataSelectionModalProps) {
  const [activeTab, setActiveTab] = useState('SK');
  
  const [selectionByCarrier, setSelectionByCarrier] = useState<Record<string, CarrierSpecificState>>({
    SK: getInitialCarrierState(),
    KT: getInitialCarrierState(),
    LG: getInitialCarrierState(),
  });

  // 모든 데이터를 미리 추출하여 저장
  const [extractedDataByCarrier, setExtractedDataByCarrier] = useState<Record<string, ExtractedDataByCarrier>>({
    SK: { companies: [], plansByCompany: {}, monthlyFees: [] },
    KT: { companies: [], plansByCompany: {}, monthlyFees: [] },
    LG: { companies: [], plansByCompany: {}, monthlyFees: [] },
  });

  // 모달 열릴 때 모든 데이터를 한 번에 추출
  useEffect(() => {
    if (isOpen) {
      const carriers = ['SK', 'KT', 'LG'];
      const newExtractedData: Record<string, ExtractedDataByCarrier> = {
        SK: { companies: [], plansByCompany: {}, monthlyFees: [] },
        KT: { companies: [], plansByCompany: {}, monthlyFees: [] },
        LG: { companies: [], plansByCompany: {}, monthlyFees: [] },
      };

      carriers.forEach(carrier => {
        // 업체명 추출
        const companies = extractCompaniesByCarrier(dataSets, carrier);
        
        // 각 업체별 요금제 추출
        const plansByCompany: Record<string, string[]> = {};
        companies.forEach(company => {
          plansByCompany[company] = extractPlansByCarrierAndCompany(dataSets, carrier, company);
        });
        
        // 월 요금제 추출
        const monthlyFees = extractMonthlyFeesByCarrier(publicData, carrier);

        newExtractedData[carrier] = {
          companies,
          plansByCompany,
          monthlyFees
        };
      });

      setExtractedDataByCarrier(newExtractedData);
    }
  }, [isOpen, dataSets, publicData]);

  // --- 이벤트 핸들러 ---
  const handleCompanySelect = (company: string) => {
    setSelectionByCarrier(prev => ({
        ...prev,
        [activeTab]: {
            ...prev[activeTab],
            selectedCompany: company,
        }
    }));
  };

  const handlePlanToggle = (plan: string) => {
    const { selectedCompany, selectionsByCompany } = selectionByCarrier[activeTab];
    if (!selectedCompany) return;

    const currentCompanySelections = selectionsByCompany[selectedCompany] || {};
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
            selectionsByCompany: { ...selectionsByCompany, [selectedCompany]: newSelections }
        }
    }));
  };

  const handleMonthlyFeeChange = (plan: string, feeType: 'monthlyFee1' | 'monthlyFee2', fee: string | null) => {
    const { selectedCompany, selectionsByCompany } = selectionByCarrier[activeTab];
    if (!selectedCompany) return;

    const feeAsNumber = fee ? parseInt(fee, 10) : null;
    const currentCompanySelections = selectionsByCompany[selectedCompany] || {};
    const currentPlanSelection = currentCompanySelections[plan] || { monthlyFee1: null, monthlyFee2: null };
    
    const newPlanSelection = { ...currentPlanSelection, [feeType]: feeAsNumber };
    const newSelections = { ...currentCompanySelections, [plan]: newPlanSelection };

    setSelectionByCarrier(prev => ({
        ...prev,
        [activeTab]: {
            ...prev[activeTab],
            selectionsByCompany: { ...selectionsByCompany, [selectedCompany]: newSelections }
        }
    }));
  };

  const handleApply = () => {
    const { selectedCompany, selectionsByCompany } = selectionByCarrier[activeTab];
    if (!selectedCompany) return;

    const plans = selectionsByCompany[selectedCompany] || {};
    onApply({ carrier: activeTab, company: selectedCompany, plans });
    onClose();
  };
  
  const handleReset = () => {
    setSelectionByCarrier(prev => ({ ...prev, [activeTab]: getInitialCarrierState() }));
  };

  // --- 렌더링을 위한 변수 ---
  const activeSelection = selectionByCarrier[activeTab];
  const selectedPlans = activeSelection.selectedCompany ? activeSelection.selectionsByCompany[activeSelection.selectedCompany] || {} : {};
  const currentCarrierData = extractedDataByCarrier[activeTab];
  const currentPlans = activeSelection.selectedCompany ? currentCarrierData.plansByCompany[activeSelection.selectedCompany] || [] : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col bg-white">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <Filter className="w-5 h-5" />
            데이터 선택
          </DialogTitle>
          <DialogDescription className="text-left text-gray-600">
            적용할 업체의 요금제를 선택하고, 각 요금제에 맞는 월 요금을 지정하세요. (최대 2개까지 선택 가능)
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg flex-shrink-0">
            <TabsTrigger value="SK" className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm rounded-md">SK</TabsTrigger>
            <TabsTrigger value="KT" className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md">KT</TabsTrigger>
            <TabsTrigger value="LG" className="data-[state=active]:bg-white data-[state=active]:text-pink-700 data-[state=active]:shadow-sm rounded-md">LG</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 flex-1 overflow-y-auto pr-4">
            <div className="grid grid-cols-4 gap-4">
              
              {/* 1열: 업체명 */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                  <Building2 className="w-4 h-4" />
                  업체명 선택
                </div>
                <div className="space-y-2">
                  {currentCarrierData.companies.map((company) => (
                    <Button
                      key={company}
                      onClick={() => handleCompanySelect(company)}
                      className={`w-full justify-center text-center h-8 ${activeSelection.selectedCompany === company ? BUTTON_THEME.primary : BUTTON_THEME.secondary}`}
                    >
                      {company}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 2열: 요금제 */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  요금제 선택
                </div>
                <div className="space-y-2 text-gray-800">
                  {activeSelection.selectedCompany ? (
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
                      <div className="text-gray-500 text-sm p-2 text-center">해당 업체의 요금제가 없습니다.</div>
                    )
                  ) : (
                    <div className="text-gray-500 text-sm p-2 text-center">왼쪽에서 업체를 선택하세요.</div>
                  )}
                </div>
              </div>

              {/* 3열: 월 요금제 1 */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  월 요금제 1
                </div>
                <div className="space-y-2">
                  {activeSelection.selectedCompany ? (
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
                                <SelectTrigger className="text-gray-800 h-8 text-center justify-center">
                                  <SelectValue placeholder="월 요금 선택" className="text-center" />
                                </SelectTrigger>
                                <SelectContent>
                                  {currentCarrierData.monthlyFees
                                    .sort((a, b) => b - a)
                                    .map((fee) => (
                                    <SelectItem key={fee} value={fee.toString()}>{fee.toLocaleString()}원</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="w-full h-8 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm">
                                -
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-500 text-sm p-2 text-center">해당 업체의 요금제가 없습니다.</div>
                    )
                  ) : (
                    <div className="text-gray-500 text-sm p-2 text-center">왼쪽에서 업체를 선택하세요.</div>
                  )}
                </div>
              </div>

              {/* 4열: 월 요금제 2 */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  월 요금제 2
                </div>
                <div className="space-y-2">
                  {activeSelection.selectedCompany ? (
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
                                <SelectTrigger className="text-gray-800 h-8 text-center justify-center">
                                  <SelectValue placeholder="월 요금 선택" className="text-center" />
                                </SelectTrigger>
                                <SelectContent>
                                  {currentCarrierData.monthlyFees
                                    .sort((a, b) => b - a)
                                    .map((fee) => (
                                    <SelectItem key={fee} value={fee.toString()}>{fee.toLocaleString()}원</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="w-full h-8 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm">
                                -
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-500 text-sm p-2 text-center">해당 업체의 요금제가 없습니다.</div>
                    )
                  ) : (
                    <div className="text-gray-500 text-sm p-2 text-center">왼쪽에서 업체를 선택하세요.</div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-2 pt-2 border-t mt-2 flex-shrink-0">
          <Button onClick={handleReset} className={`${BUTTON_THEME.danger_fill} flex items-center gap-2`}>
            <RotateCcw className="w-4 h-4" />
            초기화
          </Button>
          <Button 
            onClick={handleApply}
            className={`${BUTTON_THEME.primary} flex items-center gap-2`}
            disabled={!activeSelection.selectedCompany || Object.keys(selectedPlans).length === 0}
          >
            <Filter className="w-4 h-4" />
            선택 완료
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}