"use client";

import { useState, useEffect } from 'react';
import { DataSet } from '@/types/dashboard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BUTTON_THEME, CARRIER_OPTIONS } from '@/components/ui/colors';
import { PublicSupportData } from '@/types/dashboard';

interface PublicDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModelContent: string; // 선택된 모델 정보
  publicData: PublicSupportData | null; // 공시 데이터
}

export default function PublicDataModal({ 
  isOpen, 
  onClose, 
  selectedModelContent,
  publicData 
}: PublicDataModalProps) {
  
  // 선택약정 할인 계산 함수
  const calculateSelectiveContractDiscount = (monthlyFee: number) => {
    // 월 요금 * 24개월 * 25%
    return Math.floor(monthlyFee * 24 * 0.25);
  };

  // 선택된 모델의 표준 모델번호 및 출고가 추출
  const standardModelNumber = selectedModelContent?.split('|').find(p => p.startsWith('standard:'))?.replace('standard:', '') || '';
  const priceMatch = selectedModelContent?.match(/price:(\d+)/);
  const price = priceMatch ? Number(priceMatch[1]) : null;

  // 선택된 모델의 공시 정보 찾기
  const selectedModelData = publicData?.manufacturers ? 
    Object.values(publicData.manufacturers).flatMap(manufacturer => 
      manufacturer.models.filter(model => model.model_number === standardModelNumber)
    )[0] : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] flex flex-col h-[90vh] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-blue-600 dark:text-blue-400 py-2">
            공시 데이터 - {selectedModelData?.model_name || '모델 정보 없음'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            선택된 모델의 공시 지원금 정보를 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 flex-1 overflow-y-hidden">
          {!selectedModelContent ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>모델을 먼저 선택해주세요.</p>
            </div>
          ) : !selectedModelData ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>해당 모델의 공시 정보를 찾을 수 없습니다.</p>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex-shrink-0">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">모델 정보</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-black dark:text-gray-100">
                  <div>
                    <span className="font-medium">모델명:</span> {selectedModelData.model_name}
                  </div>
                  <div>
                    <span className="font-medium">모델번호:</span> {selectedModelData.model_number}
                  </div>
                  <div>
                    <span className="font-medium">출시일:</span> {selectedModelData.release_date}
                  </div>
                  {price && (
                    <div>
                      <span className="font-medium">출고가:</span> {price.toLocaleString()}원
                    </div>
                  )}
                </div>
              </div>
              
              {/* 공시 데이터 테이블 (스크롤 적용) */}
              <div className="mt-4 flex-1 overflow-y-auto pr-2">
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  {/* 테이블 헤더 */}
                  <div className="grid grid-cols-3 sticky top-0 bg-gray-100 dark:bg-gray-700 z-10 rounded-t-lg">
                    {['SK', 'KT', 'LG'].map(carrierName => {
                      const carrierStyle = CARRIER_OPTIONS.find(c => c.value === carrierName)?.style || 'font-bold';
                      return (
                        <div key={carrierName} className={`px-4 py-2 text-center border-b border-gray-200 dark:border-gray-600 ${carrierStyle}`}>
                          {carrierName}
                        </div>
                      );
                    })}
                  </div>
                  {/* 테이블 바디 */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-600">
                    {selectedModelData.support_info.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="grid grid-cols-3">
                        {['SK', 'KT', 'LG'].map(carrierName => {
                          const carrierData = section.carriers[carrierName as keyof typeof section.carriers];
                          return (
                            <div key={carrierName} className="px-3 py-4 border-r border-gray-200 dark:border-gray-600 last:border-r-0">
                              {carrierData ? (
                                <div className="space-y-2 text-sm">
                                  <div className="font-bold text-base text-blue-700 dark:text-blue-400 text-center pb-2">{carrierData.plan_name}</div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">월 요금</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{carrierData.monthly_fee?.toLocaleString()}원</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">선택약정할인</span>
                                    <span className="font-bold text-red-600 dark:text-red-400">{calculateSelectiveContractDiscount(carrierData.monthly_fee).toLocaleString()}원</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">기기변경</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{carrierData.device_support?.toLocaleString()}원</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">번호이동</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">{carrierData.number_port_support?.toLocaleString()}원</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center text-gray-400 dark:text-gray-500 h-full flex items-center justify-center">-</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button onClick={onClose} className={BUTTON_THEME.primary}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 