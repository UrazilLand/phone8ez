"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataSet } from '@/types/dashboard';
import { BUTTON_THEME, cardStyles } from '@/styles/common';

interface PreviewModalProps {
  previewModalOpen: boolean;
  setPreviewModalOpen: (open: boolean) => void;
  selectedDataSet: DataSet | null;
  onLoadDataSet: (dataSet: DataSet) => void;
  onDeleteDataSet: (dataSet: DataSet) => void;
}

export default function PreviewModal({
  previewModalOpen,
  setPreviewModalOpen,
  selectedDataSet,
  onLoadDataSet,
  onDeleteDataSet,
}: PreviewModalProps) {
  return (
    <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
      <DialogContent className="max-w-7xl h-[90vh] p-6 flex flex-col">
        <DialogTitle className="text-blue-700 font-bold">
          데이터셋 상세 정보
        </DialogTitle>
        {selectedDataSet && (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 p-2">{selectedDataSet.name}</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onLoadDataSet(selectedDataSet)}
                  className={BUTTON_THEME.primary + " px-4 py-2 text-sm"}
                >
                  불러오기
                </button>
                <button
                  onClick={() => onDeleteDataSet(selectedDataSet)}
                  className={BUTTON_THEME.danger_fill + " px-4 py-2 text-sm"}
                >
                  삭제
                </button>
              </div>
            </div>
            
            {/* 데이터 내용 카드 */}
            <div className="bg-white rounded-xl shadow pt-5 pr-5 pl-5 pb-5 flex-1 min-h-0">
              <div className="h-full flex flex-col">
                <div className="flex-1 min-h-0 overflow-hidden">
                  <div className="h-full overflow-y-auto overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          {selectedDataSet.data.sheetData[0]?.map((header, index) => (
                            <th key={index} className={`px-2 h-6 font-semibold text-gray-900 border-b whitespace-nowrap ${index === 0 ? 'text-left' : 'text-center'}`}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDataSet.data.sheetData.slice(1).map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-b hover:bg-gray-50">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className={`px-2 h-6 text-gray-700 truncate whitespace-nowrap ${cellIndex === 0 ? 'text-left' : 'text-center'}`}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 