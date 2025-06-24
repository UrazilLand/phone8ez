"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PublicSupportData, DataSet } from '@/types/dashboard';
import { RefreshCw } from 'lucide-react';
import { BUTTON_THEME } from '@/components/ui/colors';
import { Button } from "@/components/ui/button";

interface SupportDataModalProps {
  // 공시 데이터 모달 props
  supportModalOpen: boolean;
  setSupportModalOpen: (open: boolean) => void;
  supportData: PublicSupportData | null;
  onRefreshSupportData: () => void;
  isLoading: boolean;

  // 에러 메시지
  error: string | null;
}

const SupportDataModal = React.memo(({
  supportModalOpen,
  setSupportModalOpen,
  supportData,
  onRefreshSupportData,
  isLoading,
  error
}: SupportDataModalProps) => {
  return (
    <>
      {/* 공시 데이터 모달 */}
      <Dialog open={supportModalOpen} onOpenChange={setSupportModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-6">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="text-blue-700">
              공시 지원금 데이터
            </DialogTitle>
          </DialogHeader>
          {supportData ? (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="text-sm text-gray-600">
                  데이터 업데이트: {supportData.collection_date ? new Date(supportData.collection_date).toLocaleDateString('ko-KR') : '-'}
                </div>
                <button
                  onClick={onRefreshSupportData}
                  disabled={isLoading}
                  className={`${BUTTON_THEME.secondary} flex items-center justify-center gap-2 px-3 py-1 text-sm min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? '로딩중...' : '최신 데이터 불러오기'}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-4 min-h-0">
                <div className="space-y-4">
                  {Object.values(supportData.manufacturers || {}).map((manufacturer, mIndex) => (
                    <div key={mIndex}>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{manufacturer.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {manufacturer.models.map((model, modelIndex) => (
                          <div key={modelIndex} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-center h-8">
                            <div className="font-normal text-black text-center w-full text-nowrap truncate text-sm">
                              {model.model_name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-4 text-center flex-shrink-0">
                공시 지원금 정보는{' '}
                <span className="text-blue-600">
                  스마트초이스
                </span>
                를 통해 매일 00시 업데이트 됩니다. 정확한 정보는{' '}
                <a 
                  href="https://m.smartchoice.or.kr/smc/mobile/dantongList.do?type=m" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  여기
                </a>
                를 참고하세요.
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex justify-end mb-4 flex-shrink-0">
                <button
                  onClick={onRefreshSupportData}
                  disabled={isLoading}
                  className={`${BUTTON_THEME.secondary} flex items-center justify-center gap-2 px-3 py-1 text-sm min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? '로딩중...' : '최신 데이터 불러오기'}
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-0">
                <div className="text-center text-gray-500">
                  {isLoading ? '데이터를 불러오는 중...' : '저장된 공시 데이터가 없습니다. 최신 데이터를 불러와주세요.'}
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-4 text-center flex-shrink-0">
                공시 지원금 정보는{' '}
                <span className="text-blue-600">
                  스마트초이스
                </span>
                를 통해 매일 00시 업데이트 됩니다. 정확한 정보는{' '}
                <a 
                  href="https://m.smartchoice.or.kr/smc/mobile/dantongList.do?type=m" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  여기
                </a>
                를 참고하세요.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 에러 메시지 */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}
    </>
  );
});

SupportDataModal.displayName = 'SupportDataModal';

export default SupportDataModal; 