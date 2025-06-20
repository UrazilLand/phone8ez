"use client";

import { useUndo } from '@/hooks/use-undo';
import { DataSet, SheetData } from '@/types/dashboard';
import IntegratedHeader from './IntegratedHeader';
import DataSelectionModal from './DataSelectionModal';
import { SHEET_HEADER_LABELS, DEFAULT_ROW_COUNT, DEFAULT_COLUMN_COUNT } from '@/styles/common';
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  findMatchingData,
  createCellWithMonthlyFee 
} from '@/app/dashboard/utils/integrated/dataExtraction';

interface IntegratedSheetProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  publicData: any;
}

export default function IntegratedSheet({ dataSets, setDataSets, publicData }: IntegratedSheetProps) {
  const { toast } = useToast();
  
  // 시트 데이터 상태 관리
  const [sheetData, setSheetData] = useState<string[][]>(
    Array(DEFAULT_ROW_COUNT).fill(null).map(() => Array(DEFAULT_COLUMN_COUNT).fill(''))
  );

  // 필터 모달 상태 관리
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Undo/Redo 상태 관리
  const [
    currentSheetData,
    setCurrentSheetData,
    undo,
    redo,
    canUndo,
    canRedo
  ] = useUndo<string[][]>(sheetData);

  const handleSave = () => {
    // 시트 데이터를 DataSet 형식으로 변환하여 저장
    const newSheetData: SheetData = {
      sheetData: currentSheetData,
      carrier: currentSheetData[0][1] || '',
      contract: currentSheetData[1][1] || '',
      planOptions: [],
      companyOptions: [],
      joinTypeOrder: [],
      contractTypeOrder: [],
      planInput: '',
      planFields: [],
      planRepeatCount: '',
      companyInput: '',
      companyFields: [],
      policyInput: '',
      joinTypeRepeatCounts: {},
      contractTypeRepeatCounts: {},
    };

    const newDataSet: DataSet = {
      id: Date.now().toString(),
      name: `통합 데이터 세트 ${dataSets.length + 1}`,
      type: 'integrated',
      createdAt: new Date().toISOString(),
      data: newSheetData,
    };

    setDataSets([...dataSets, newDataSet]);
    toast({
      title: "저장 완료",
      description: "데이터가 성공적으로 저장되었습니다.",
    });
  };

  const handleReset = useCallback(() => {
    const emptySheet = Array(DEFAULT_ROW_COUNT).fill(null).map(() => Array(DEFAULT_COLUMN_COUNT).fill(''));
    setCurrentSheetData(emptySheet);
    toast({
      title: "초기화 완료",
      description: "시트가 초기화되었습니다.",
    });
  }, [setCurrentSheetData, toast]);

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const applySelectedDataToSheet = (selectedData: {
    carrier: string;
    company: string | null;
    plans: Record<string, { monthlyFee1: number | null; monthlyFee2: number | null }>;
  }) => {
    const { carrier, company, plans } = selectedData;
    if (!company) return;

    const newSheetData = currentSheetData.map(row => [...row]);
    
    let targetCol = 1;
    while (targetCol < newSheetData[0].length && newSheetData[0][targetCol] && newSheetData[0][targetCol] !== '') {
        targetCol++;
    }

    Object.entries(plans).forEach(([planName, feeSelection]) => {
      const matchingData = findMatchingData(dataSets, carrier, company, planName);
      
      if (matchingData) {
        // 첫 번째 월 요금제로 데이터 추가
        if (feeSelection.monthlyFee1 !== null && targetCol < newSheetData[0].length) {
          newSheetData[0][targetCol] = matchingData[0][0]; // 통신사
          newSheetData[1][targetCol] = matchingData[1][0]; // 지원구분
          newSheetData[2][targetCol] = createCellWithMonthlyFee(matchingData[2][0], feeSelection.monthlyFee1); // 요금제 + 월요금1
          newSheetData[3][targetCol] = matchingData[3][0]; // 가입유형
          newSheetData[4][targetCol] = matchingData[4][0]; // 업체명
          targetCol++;
        }

        // 두 번째 월 요금제로 데이터 추가 (있는 경우)
        if (feeSelection.monthlyFee2 !== null && targetCol < newSheetData[0].length) {
          newSheetData[0][targetCol] = matchingData[0][0]; // 통신사
          newSheetData[1][targetCol] = matchingData[1][0]; // 지원구분
          newSheetData[2][targetCol] = createCellWithMonthlyFee(matchingData[2][0], feeSelection.monthlyFee2); // 요금제 + 월요금2
          newSheetData[3][targetCol] = matchingData[3][0]; // 가입유형
          newSheetData[4][targetCol] = matchingData[4][0]; // 업체명
          targetCol++;
        }
      }
    });

    setCurrentSheetData(newSheetData);
    toast({
      title: "데이터 적용 완료",
      description: "선택된 데이터가 통합시트에 적용되었습니다.",
    });
  };

  return (
    <div className="flex flex-col w-full h-full">
      <IntegratedHeader
        dataSets={dataSets}
        setDataSets={setDataSets}
        publicData={publicData}
        onSave={handleSave}
        onReset={handleReset}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo()}
        canRedo={canRedo()}
        onOpenFilterModal={handleOpenFilterModal}
      />
      
      {/* 테이블 카드 */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mx-4 mb-4 h-[800px]">
        <div className="overflow-auto h-full">
          <table className="border-collapse min-w-[1120px] table-fixed">
            <tbody>
              {currentSheetData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {row.map((cell, colIndex) => (
                    <td 
                      key={colIndex}
                      className={`h-6 text-sm border-b border-gray-100 border-r border-gray-200 text-black ${
                        colIndex === 0 ? 
                          (rowIndex < 5 ? 'text-center font-bold w-40 bg-gray-50 min-w-[160px]' : 'text-left w-40 min-w-[160px]') : 
                          'text-center w-20 min-w-[80px]'
                      }`}
                    >
                      {colIndex === 0 && rowIndex < 5 ? (
                        <span className="text-black font-bold">
                          {SHEET_HEADER_LABELS[rowIndex]}
                        </span>
                      ) : (
                        <div className={`w-full h-full px-2 flex items-center ${
                          colIndex > 0 ? 'justify-center' : 'justify-start'
                        } text-gray-600`}>
                          {cell}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 필터 모달 */}
      <DataSelectionModal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilterModal}
        onApply={applySelectedDataToSheet}
        dataSets={dataSets}
        publicData={publicData}
      />
    </div>
  );
} 