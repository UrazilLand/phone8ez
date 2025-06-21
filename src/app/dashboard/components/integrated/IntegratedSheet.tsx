"use client";

import { useUndo } from '@/hooks/use-undo';
import { DataSet, SheetData } from '@/types/dashboard';
import IntegratedHeader from './IntegratedHeader';
import DataSelectionModal from './DataSelectionModal';
import ModelInfoModal from './ModelInfoModal';
import { SHEET_HEADER_LABELS, DEFAULT_ROW_COUNT, DEFAULT_COLUMN_COUNT, BUTTON_THEME } from '@/styles/common';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  extractCompaniesByCarrier, 
  extractPlansByCarrierAndCompany, 
  extractMonthlyFeesByCarrier
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
  reloadKey: number;
}

interface ModelInfo {
  modelName: string;
  manufacturer: string;
  releaseDate: string;
  description: string;
  specifications: string;
}

const getInitialSheetData = (dataSets: DataSet[]): string[][] => {
  const integratedDataSet = dataSets.find(dataset => dataset.type === 'integrated');
  if (integratedDataSet && integratedDataSet.data.sheetData && integratedDataSet.data.sheetData.length > 0) {
    return integratedDataSet.data.sheetData;
  }
  return Array(DEFAULT_ROW_COUNT).fill(null).map(() => Array(DEFAULT_COLUMN_COUNT).fill(''));
};

export default function IntegratedSheet({ dataSets, setDataSets, publicData, reloadKey }: IntegratedSheetProps) {
  const { toast } = useToast();
  
  const [sheetData, setSheetData] = useState<string[][]>(() => getInitialSheetData(dataSets));
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);
  const [isModelInfoModalOpen, setIsModelInfoModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);
  const [modelInfoData, setModelInfoData] = useState<Record<number, ModelInfo>>({});

  const [
    currentSheetData,
    setCurrentSheetData,
    setCurrentSheetDataWithoutUndo,
    undo,
    redo,
    canUndo,
    canRedo
  ] = useUndo<string[][]>(sheetData);

  // 반응형 열 너비 계산
  const getColumnWidth = useMemo(() => {
    const numCols = currentSheetData[0]?.length || 0;
    if (numCols <= 1) return { aCol: '160px', otherCols: '80px' };
    
    // A열은 고정, 나머지 열들은 남은 공간을 균등 분할
    const aColWidth = '160px';
    const remainingWidth = `calc((100% - 160px) / ${numCols - 1})`;
    
    return { aCol: aColWidth, otherCols: remainingWidth };
  }, [currentSheetData]);

  useEffect(() => {
    setCurrentSheetDataWithoutUndo(sheetData);
  }, [sheetData, setCurrentSheetDataWithoutUndo]);

  useEffect(() => {
    if (reloadKey > 0) {
      const integratedDataSet = dataSets.find(dataset => dataset.type === 'integrated');
      if (integratedDataSet && integratedDataSet.data.sheetData) {
        setSheetData(integratedDataSet.data.sheetData);
        toast({
          title: "데이터 불러오기 완료",
          description: "통합 데이터를 시트에 불러왔습니다.",
        });
      }
    }
  }, [reloadKey, dataSets, toast]);

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
    
    // A열과 1~5행만 추출하여 저장
    const limitedSheetData = currentSheetData.slice(0, 5).map(row => {
      // A열(인덱스 0)만 포함
      return [row[0]];
    });
    
    const newSheetData: SheetData = {
      sheetData: limitedSheetData,
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
    setSheetData(emptySheet);
    toast({
      title: "초기화 완료",
      description: "시트가 초기화되었습니다.",
    });
  }, [toast]);

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleOpenModelInfoModal = (rowIndex: number) => {
    setSelectedRowIndex(rowIndex);
    setIsModelInfoModalOpen(true);
  };

  const handleCloseModelInfoModal = () => {
    setIsModelInfoModalOpen(false);
    setSelectedRowIndex(-1);
  };

  const handleSaveModelInfo = (modelInfo: ModelInfo) => {
    setModelInfoData(prev => ({
      ...prev,
      [selectedRowIndex]: modelInfo
    }));
    
    // A열에 모델명 표시
    const newSheetData = [...currentSheetData];
    newSheetData[selectedRowIndex][0] = modelInfo.modelName;
    setCurrentSheetData(newSheetData);
    
    toast({
      title: "모델정보 저장 완료",
      description: `${modelInfo.modelName} 모델 정보가 저장되었습니다.`,
    });
  };

  const applySelectedDataToSheet = (allSelections: Record<string, any>) => {
    const filteredColumns: string[][] = [];
    const monthlyFeesForColumns: { fee1: number | null, fee2: number | null }[] = [];
    const carriers = ['SK', 'KT', 'LG'];

    // 1. SK, KT, LG 순서로 모든 통신사 필터링
    carriers.forEach(carrier => {
      const selection = allSelections[carrier];
      const selectionsByCompany = selection?.selectionsByCompany;

      if (selectionsByCompany) {
        // selectionsByCompany에서 요금제가 선택된 업체들만 추출
        const companiesWithSelections = Object.keys(selectionsByCompany).filter(company => {
          const plans = selectionsByCompany[company];
          return plans && Object.keys(plans).length > 0;
        });

        // 요금제가 선택된 업체들을 순회
        companiesWithSelections.forEach((company: string) => {
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
                  
                  // 해당 열에 대한 월 요금 정보 저장
                  const planSelection = plans[sourcePlanName];
                  monthlyFeesForColumns.push({
                    fee1: planSelection?.monthlyFee1 || null,
                    fee2: planSelection?.monthlyFee2 || null,
                  });
                }
              }
            }
          }
        });
      }
    });

    // 3. 필요한 열 개수 계산 및 시트 생성
    const requiredDataCols = filteredColumns.length;
    const finalColCount = Math.max(DEFAULT_COLUMN_COUNT, requiredDataCols + 1);
    const newSheetData = Array(DEFAULT_ROW_COUNT)
      .fill(null)
      .map(() => Array(finalColCount).fill(''));

    // 4. 필터링된 데이터를 새 시트에 복사하고, 월 요금 정보를 3행에 함께 저장
    filteredColumns.forEach((columnData, index) => {
      const destCol = index + 1; // B열부터 시작
      
      // 1, 2, 4, 5행은 그대로 복사
      newSheetData[0][destCol] = columnData[0];
      newSheetData[1][destCol] = columnData[1];
      newSheetData[3][destCol] = columnData[3];
      newSheetData[4][destCol] = columnData[4];

      // 3행(요금제) 데이터는 월 요금과 함께 저장
      const planNameOnly = columnData[2]?.split('|')[0] || '';
      const fees = monthlyFeesForColumns[index];
      let planCellData = planNameOnly;
      if (fees.fee1 !== null) {
        planCellData += `|${fees.fee1}`;
      }
      if (fees.fee2 !== null) {
        planCellData += `|${fees.fee2}`;
      }
      newSheetData[2][destCol] = planCellData;
    });

    setSheetData(newSheetData);
    toast({
      title: "데이터 필터링 완료",
      description: `총 ${requiredDataCols}개의 열이 시트에 적용되었습니다.`,
    });
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="max-w-[61rem] mx-auto w-full px-4">
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
      </div>
      
      {/* 테이블 카드 */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mx-4 sm:mx-8 lg:mx-16 mb-4 h-[800px]">
        <div className="overflow-auto h-full w-full">
          <table className="border-collapse w-full" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: getColumnWidth.aCol, minWidth: '160px' }} />
              {currentSheetData[0]?.slice(1).map((_, index) => (
                <col key={index + 1} style={{ width: getColumnWidth.otherCols, minWidth: '80px' }} />
              ))}
            </colgroup>
            <tbody>
              {currentSheetData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className={`h-6 text-sm border-b border-gray-100 border-r border-gray-200 text-black ${
                        colIndex === 0
                          ? rowIndex < 5
                            ? 'text-center font-bold bg-gray-50'
                            : 'text-left'
                          : 'text-center'
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
                          onDoubleClick={() => {
                            // A열 6행부터 더블클릭 시 모델정보 모달 열기
                            if (colIndex === 0 && rowIndex >= 5) {
                              handleOpenModelInfoModal(rowIndex);
                            }
                          }}
                          style={{
                            cursor: colIndex === 0 && rowIndex >= 5 ? 'pointer' : 'default'
                          }}
                        >
                          {/* 3행(rowIndex===2)의 경우, '|' 앞의 요금제 이름만 표시 */}
                          {rowIndex === 2 && colIndex > 0 ? cell.split('|')[0] : cell}
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

      {/* 모델정보 입력 모달 */}
      <ModelInfoModal
        isOpen={isModelInfoModalOpen}
        onClose={handleCloseModelInfoModal}
        onSave={handleSaveModelInfo}
        initialData={selectedRowIndex >= 0 ? modelInfoData[selectedRowIndex] : undefined}
        rowIndex={selectedRowIndex}
      />

      {/* 덮어쓰기 확인 모달 */}
      <Dialog open={isOverwriteModalOpen} onOpenChange={setIsOverwriteModalOpen}>
        <DialogContent className="s:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-blue-600 py-2">덮어쓰기 확인</DialogTitle>
            <DialogDescription>
              이미 '통합' 데이터가 존재합니다. 덮어쓰시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCancelOverwrite} className={BUTTON_THEME.gray}>
              취소
            </Button>
            <Button onClick={saveIntegratedData} className={BUTTON_THEME.primary}>
              덮어쓰기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 