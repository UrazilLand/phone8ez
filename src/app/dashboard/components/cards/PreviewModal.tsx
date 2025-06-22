"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataSet } from '@/types/dashboard';
import { BUTTON_THEME, cardStyles } from '@/styles/common';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const handleDelete = () => {
    if (!selectedDataSet) return;
    
    if (window.confirm(`"${selectedDataSet.name}" 데이터셋을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      onDeleteDataSet(selectedDataSet);
      setPreviewModalOpen(false);
      toast({
        title: "삭제 완료",
        description: `"${selectedDataSet.name}" 데이터셋이 삭제되었습니다.`,
        variant: "default",
      });
    }
  };

  // 부가서비스 데이터 렌더링
  const renderAdditionalServices = () => {
    if (!selectedDataSet?.data.additionalServices) return null;

    const services = selectedDataSet.data.additionalServices;
    const companies = Object.keys(services);

    return (
      <div className="space-y-4">
        {companies.map((companyKey) => {
          const [company, carrier] = companyKey.split('-');
          const companyServices = services[companyKey];
          
          return (
            <div key={companyKey} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-semibold text-gray-900">{company}</h4>
                <span className="text-sm text-gray-500">({carrier})</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-900">부가서비스명</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-900">할인금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyServices.map((service, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-700">{service.service || '-'}</td>
                        <td className="px-3 py-2 text-gray-700">{service.discount || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 일반 데이터셋 렌더링
  const renderNormalData = () => {
    if (!selectedDataSet?.data.sheetData) return null;

    return (
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
    );
  };

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
                  onClick={handleDelete}
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
                    {selectedDataSet.type === 'additional' 
                      ? renderAdditionalServices()
                      : renderNormalData()
                    }
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