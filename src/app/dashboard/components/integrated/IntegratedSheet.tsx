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
import { getDynamicCellStyle } from '@/app/dashboard/utils/common/colorUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);

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
    const existingIntegratedDataSet = dataSets.find(dataset => dataset.type === 'integrated');
    if (existingIntegratedDataSet) {
      setIsOverwriteModalOpen(true);
    } else {
      saveIntegratedData();
    }
  };

  const saveIntegratedData = () => {
    const existingIntegratedDataSet = dataSets.find(dataset => dataset.type === 'integrated');
    
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

    if (existingIntegratedDataSet) {
      const updatedDataSets = dataSets.map(dataset => 
        dataset.type === 'integrated' 
          ? { ...dataset, data: newSheetData, createdAt: new Date().toISOString() }
          : dataset
      );
      setDataSets(updatedDataSets);
      toast({
        title: "덮어쓰기 완료",
        description: "통합 데이터가 성공적으로 덮어쓰기되었습니다.",
      });
    } else {
      const newDataSet: DataSet = {
        id: 'integrated',
        name: "통합",
        type: 'integrated',
        createdAt: new Date().toISOString(),
        data: newSheetData,
      };
      setDataSets([...dataSets, newDataSet]);
      toast({
        title: "저장 완료",
        description: "통합 데이터가 성공적으로 저장되었습니다.",
      });
    }
    
    setIsOverwriteModalOpen(false);
  };

  const handleCancelOverwrite = () => {
    setIsOverwriteModalOpen(false);
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

  const applySelectedDataToSheet = (allSelections: Record<string, any>) => {
    const filteredColumns: string[][] = [];
    const carriers = ['SK', 'KT', 'LG'];

    // 1. SK, KT, LG 순서로 모든 통신사 필터링
    carriers.forEach(carrier => {
      const selection = allSelections[carrier];
      const company = selection?.selectedCompany;
      const selectionsByCompany = selection?.selectionsByCompany;

      if (company && selectionsByCompany) {
        const plans = selectionsByCompany[company];
        if (plans && Object.keys(plans).length > 0) {
          const selectedPlanNames = Object.keys(plans);

          // 2. 모든 데이터셋에서 필터 조건에 맞는 열 데이터를 임시 배열에 수집
          for (const dataSet of dataSets) {
            const sourceSheet = dataSet.data.sheetData;
            if (!sourceSheet || sourceSheet.length < 5) continue;

            for (let sourceCol = 1; sourceCol < sourceSheet[0].length; sourceCol++) {
              const sourceCarrier = sourceSheet[0]?.[sourceCol]?.trim();
              const sourceCompany = sourceSheet[4]?.[sourceCol]?.trim();
              const sourcePlanCell = sourceSheet[2]?.[sourceCol]?.trim() || '';
              const sourcePlanName = sourcePlanCell.split('|')[0];

              if (
                sourceCarrier === carrier &&
                sourceCompany === company &&
                selectedPlanNames.includes(sourcePlanName)
              ) {
                const columnData = [];
                // 1~5행의 데이터만 가져오기
                for (let row = 0; row < 5; row++) {
                  columnData.push(sourceSheet[row]?.[sourceCol] || '');
                }
                filteredColumns.push(columnData);
              }
            }
          }
        }
      }
    });

    // 3. 필요한 열 개수 계산 및 시트 생성
    const requiredDataCols = filteredColumns.length;
    const finalColCount = Math.max(DEFAULT_COLUMN_COUNT, requiredDataCols + 1);
    const newSheetData = Array(DEFAULT_ROW_COUNT)
      .fill(null)
      .map(() => Array(finalColCount).fill(''));

    // 4. 필터링된 데이터를 새 시트의 1~5행에 복사
    filteredColumns.forEach((columnData, index) => {
      const destCol = index + 1; // B열부터 시작
      for (let row = 0; row < 5; row++) {
        newSheetData[row][destCol] = columnData[row];
      }
    });

    setCurrentSheetData(newSheetData);
    toast({
      title: "데이터 필터링 완료",
      description: `총 ${requiredDataCols}개의 열이 시트에 적용되었습니다.`,
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
                        colIndex === 0
                          ? rowIndex < 5
                            ? 'text-center font-bold w-40 bg-gray-50 min-w-[160px]'
                            : 'text-left w-40 min-w-[160px]'
                          : 'text-center w-20 min-w-[80px]'
                      }`}
                    >
                      {colIndex === 0 && rowIndex < 5 ? (
                        <span className="text-black font-bold">
                          {SHEET_HEADER_LABELS[rowIndex]}
                        </span>
                      ) : (
                        <div
                          className={`w-full h-full px-2 flex items-center ${
                            colIndex > 0 ? 'justify-center' : 'justify-start'
                          } ${
                            colIndex > 0 && rowIndex < 5
                              ? getDynamicCellStyle(rowIndex, cell)
                              : 'text-gray-600'
                          }`}
                        >
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

      {/* 덮어쓰기 확인 모달 */}
      <Dialog open={isOverwriteModalOpen} onOpenChange={setIsOverwriteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>덮어쓰기 확인</DialogTitle>
            <DialogDescription>
              이미 '통합' 데이터가 존재합니다. 덮어쓰시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelOverwrite}>
              취소
            </Button>
            <Button type="submit" onClick={saveIntegratedData}>
              덮어쓰기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 