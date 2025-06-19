"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SupportAmountData } from '../../utils/support-amounts';
import { RefreshCw } from 'lucide-react';
import { BUTTON_THEME } from '@/styles/common';

interface DataCardModalProps {
  // 공시 데이터 모달 props
  supportModalOpen: boolean;
  setSupportModalOpen: (open: boolean) => void;
  supportData: SupportAmountData | null;
  onRefreshSupportData: () => void;
  isLoading: boolean;

  // 에러 메시지
  error: string | null;
}

export default function DataCardModal({
  supportModalOpen,
  setSupportModalOpen,
  supportData,
  onRefreshSupportData,
  isLoading,
  error
}: DataCardModalProps) {
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
                  데이터 업데이트: {(() => {
                    if (!supportData.fileName) return '-';
                    const base = supportData.fileName.split('_')[0];
                    const match = base.match(/^(\d{4})(\d{2})(\d{2})$/);
                    if (!match) return supportData.fileName;
                    return `${match[1]}. ${match[2]}. ${match[3]}`;
                  })()}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from(new Set(supportData.models.map((m: { modelName: string }) => m.modelName))).map((modelName: string, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-center h-8">
                      <div className="font-normal text-black text-center w-full text-nowrap truncate">
                        {modelName}
                      </div>
                    </div>
                  ))}
                </div>
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
} 