"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BUTTON_THEME, CARRIER_OPTIONS, CONTRACT_OPTIONS, JOIN_TYPE_OPTIONS, COMPANY_OPTIONS } from '@/styles/common';
import { X, Filter, Search, RotateCcw, Database, FileText } from 'lucide-react';

interface DataSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterSettings) => void;
  dataSets: any[];
  publicData: any;
}

export interface FilterSettings {
  searchKeyword: string;
  carriers: string[];
  contracts: string[];
  joinTypes: string[];
  companies: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

export default function DataSelectionModal({ isOpen, onClose, onApplyFilters, dataSets, publicData }: DataSelectionModalProps) {
  const [filters, setFilters] = useState<FilterSettings>({
    searchKeyword: '',
    carriers: [],
    contracts: [],
    joinTypes: [],
    companies: [],
    dateRange: {
      start: '',
      end: ''
    }
  });

  const [activeTab, setActiveTab] = useState('SK');

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    setFilters({
      searchKeyword: '',
      carriers: [],
      contracts: [],
      joinTypes: [],
      companies: [],
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  const toggleCarrier = (carrier: string) => {
    setFilters(prev => ({
      ...prev,
      carriers: prev.carriers.includes(carrier)
        ? prev.carriers.filter(c => c !== carrier)
        : [...prev.carriers, carrier]
    }));
  };

  const toggleContract = (contract: string) => {
    setFilters(prev => ({
      ...prev,
      contracts: prev.contracts.includes(contract)
        ? prev.contracts.filter(c => c !== contract)
        : [...prev.contracts, contract]
    }));
  };

  const toggleJoinType = (joinType: string) => {
    setFilters(prev => ({
      ...prev,
      joinTypes: prev.joinTypes.includes(joinType)
        ? prev.joinTypes.filter(j => j !== joinType)
        : [...prev.joinTypes, joinType]
    }));
  };

  const toggleCompany = (company: string) => {
    setFilters(prev => ({
      ...prev,
      companies: prev.companies.includes(company)
        ? prev.companies.filter(c => c !== company)
        : [...prev.companies, company]
    }));
  };

  const renderCarrierTabContent = (carrier: string) => {
    return (
      <div className="space-y-4">
        {/* 데이터 카드 저장된 값 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Database className="w-4 h-4" />
            데이터 카드 저장된 값
          </div>
          <div className="bg-gray-50 rounded-lg p-3 min-h-[100px]">
            {dataSets && dataSets.length > 0 ? (
              <div className="space-y-2">
                {dataSets
                  .filter(dataset => dataset.data?.carrier === carrier)
                  .map((dataset, index) => (
                    <div key={dataset.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm">{dataset.name}</span>
                      <Button size="sm" variant="outline" className="text-xs">
                        선택
                      </Button>
                    </div>
                  ))}
                {dataSets.filter(dataset => dataset.data?.carrier === carrier).length === 0 && (
                  <p className="text-gray-500 text-sm">저장된 데이터가 없습니다.</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">저장된 데이터가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 공시 자료 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FileText className="w-4 h-4" />
            공시 자료
          </div>
          <div className="bg-gray-50 rounded-lg p-3 min-h-[100px]">
            {publicData && publicData[carrier] ? (
              <div className="space-y-2">
                {Object.entries(publicData[carrier]).map(([key, value]: [string, any], index) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="text-sm">{key}</span>
                    <Button size="sm" variant="outline" className="text-xs">
                      선택
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">공시 자료가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            데이터 선택
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="SK" className="text-red-600 font-bold">SK</TabsTrigger>
            <TabsTrigger value="KT" className="text-black font-bold">KT</TabsTrigger>
            <TabsTrigger value="LG" className="text-pink-700 font-bold">LG</TabsTrigger>
          </TabsList>

          <TabsContent value="SK" className="mt-4">
            {renderCarrierTabContent('SK')}
          </TabsContent>

          <TabsContent value="KT" className="mt-4">
            {renderCarrierTabContent('KT')}
          </TabsContent>

          <TabsContent value="LG" className="mt-4">
            {renderCarrierTabContent('LG')}
          </TabsContent>
        </Tabs>

        {/* 필터 옵션들 */}
        <div className="space-y-4 border-t pt-4">
          <div className="text-sm font-medium text-gray-700">추가 필터 옵션</div>
          
          {/* 검색 키워드 */}
          <div className="space-y-2">
            <Label htmlFor="search">검색 키워드</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="search"
                placeholder="모델명, 요금제, 업체명 등으로 검색..."
                value={filters.searchKeyword}
                onChange={(e) => setFilters(prev => ({ ...prev, searchKeyword: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          {/* 계약 유형 필터 */}
          <div className="space-y-2">
            <Label>계약 유형</Label>
            <div className="grid grid-cols-2 gap-2">
              {CONTRACT_OPTIONS.map((contract) => (
                <div key={contract.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`contract-${contract.value}`}
                    checked={filters.contracts.includes(contract.value)}
                    onCheckedChange={() => toggleContract(contract.value)}
                  />
                  <Label 
                    htmlFor={`contract-${contract.value}`}
                    className={`text-sm cursor-pointer ${contract.style}`}
                  >
                    {contract.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* 가입 유형 필터 */}
          <div className="space-y-2">
            <Label>가입 유형</Label>
            <div className="grid grid-cols-3 gap-2">
              {JOIN_TYPE_OPTIONS.map((joinType) => (
                <div key={joinType.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`joinType-${joinType.value}`}
                    checked={filters.joinTypes.includes(joinType.value)}
                    onCheckedChange={() => toggleJoinType(joinType.value)}
                  />
                  <Label 
                    htmlFor={`joinType-${joinType.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {joinType.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* 업체명 필터 */}
          <div className="space-y-2">
            <Label>업체명</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {COMPANY_OPTIONS.map((company) => (
                <div key={company.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`company-${company.value}`}
                    checked={filters.companies.includes(company.value)}
                    onCheckedChange={() => toggleCompany(company.value)}
                  />
                  <Label 
                    htmlFor={`company-${company.value}`}
                    className={`text-sm cursor-pointer ${company.style}`}
                  >
                    {company.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* 날짜 범위 */}
          <div className="space-y-2">
            <Label>날짜 범위</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="start-date" className="text-sm">시작일</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-sm">종료일</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleResetFilters}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            초기화
          </Button>
          <Button 
            onClick={handleApplyFilters}
            className={`${BUTTON_THEME.primary} flex items-center gap-2`}
          >
            <Filter className="w-4 h-4" />
            선택 완료
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 