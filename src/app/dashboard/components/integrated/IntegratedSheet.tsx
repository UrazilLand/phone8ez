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
import { getDynamicCellStyle, getDataCellStyle } from '@/app/dashboard/utils/common/colorUtils';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IntegratedSheetProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  publicData: any;
  reloadKey: number;
}

interface ModelInfo {
  selectedModelCodes: string[];      // 선택된 모델번호들
  standardModelCode: string;         // 표준 모델번호
  modelName: string;                 // 모델명
  price: string;                     // 출고가
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

  const sheetHeaders = useMemo(() => currentSheetData.slice(0, 5), [currentSheetData]);
  const aColumnData = useMemo(() => currentSheetData.map(row => row[0]), [currentSheetData]);

  const highlightedCells = useMemo(() => {
    const highlightSet = new Set<string>();
    if (currentSheetData.length < 5) return highlightSet;

    // 6행부터(rowIndex=5) 각 행을 순회
    for (let r = 5; r < currentSheetData.length; r++) {
      const row = currentSheetData[r];
      if (!row) continue;

      const minValues: Record<string, number> = {};

      // Pass 1: Find minimum value for each carrier-joinType combination in the row
      for (let c = 1; c < row.length; c++) {
        const carrier = sheetHeaders[0]?.[c]?.trim();
        const joinType = sheetHeaders[3]?.[c]?.trim();
        const cellValue = row[c]?.split('|')[0].split(';')[0].trim();

        if (carrier && joinType && cellValue && !isNaN(Number(cellValue))) {
          const key = `${carrier}-${joinType}`;
          const numValue = Number(cellValue);

          if (minValues[key] === undefined || numValue < minValues[key]) {
            minValues[key] = numValue;
          }
        }
      }

      // Pass 2: Highlight all cells that match the minimum value
      for (let c = 1; c < row.length; c++) {
        const carrier = sheetHeaders[0]?.[c]?.trim();
        const joinType = sheetHeaders[3]?.[c]?.trim();
        const cellValue = row[c]?.split('|')[0].split(';')[0].trim();

        if (carrier && joinType && cellValue && !isNaN(Number(cellValue))) {
          const key = `${carrier}-${joinType}`;
          const numValue = Number(cellValue);

          if (minValues[key] === numValue) {
            highlightSet.add(`${r}-${c}`);
          }
        }
      }
    }
    return highlightSet;
  }, [currentSheetData, sheetHeaders]);

  useEffect(() => {
    const findMatchingValue = (rowIndex: number, colIndex: number): string => {
      const carrier = sheetHeaders[0]?.[colIndex]?.trim();
      const supportType = sheetHeaders[1]?.[colIndex]?.trim();
      const planName = (sheetHeaders[2]?.[colIndex]?.trim() || '').split('|')[0];
      const joinType = sheetHeaders[3]?.[colIndex]?.trim();
      const company = sheetHeaders[4]?.[colIndex]?.trim();

      if (!carrier || !supportType || !planName || !joinType || !company) return '';

      const modelCellData = aColumnData[rowIndex] || '';
      if (!modelCellData.includes('codes:')) return '';
      
      const codesPart = modelCellData.split('|').find(p => p.startsWith('codes:'));
      if (!codesPart) return '';
      const targetModelCodes = codesPart.replace('codes:', '').split(',');

      const foundValues: string[] = [];
      const searchDataSets = dataSets.filter(ds => ds.type !== 'integrated');

      for (const ds of searchDataSets) {
        const sourceSheet = ds.data.sheetData;
        if (!sourceSheet || sourceSheet.length < 5) continue;

        for (let sourceCol = 1; sourceCol < sourceSheet[0].length; sourceCol++) {
          if (
            carrier === sourceSheet[0]?.[sourceCol]?.trim() &&
            supportType === sourceSheet[1]?.[sourceCol]?.trim() &&
            planName === (sourceSheet[2]?.[sourceCol]?.trim() || '').split('|')[0] &&
            joinType === sourceSheet[3]?.[sourceCol]?.trim() &&
            company === sourceSheet[4]?.[sourceCol]?.trim()
          ) {
            for (let sourceRow = 5; sourceRow < sourceSheet.length; sourceRow++) {
              const sourceModelCode = sourceSheet[sourceRow]?.[0]?.trim();
              if (sourceModelCode && targetModelCodes.includes(sourceModelCode)) {
                foundValues.push(sourceSheet[sourceRow]?.[sourceCol] || '');
              }
            }
          }
        }
      }

      const uniqueFoundValues = [...new Set(foundValues.filter(v => v))];
      if (uniqueFoundValues.length === 0) return '';
      if (uniqueFoundValues.length > 1) return `${uniqueFoundValues.join(';')}|WARN_MULTI`;
      return uniqueFoundValues[0];
    };

    const newSheet = currentSheetData.map(row => [...row]);
    let hasChanged = false;

    for (let r = 5; r < newSheet.length; r++) {
      for (let c = 1; c < newSheet[r].length; c++) {
        const newValue = findMatchingValue(r, c);
        if (newSheet[r][c] !== newValue) {
          newSheet[r][c] = newValue;
          hasChanged = true;
        }
      }
    }

    if (hasChanged) {
      setCurrentSheetDataWithoutUndo(newSheet);
    }
  }, [sheetHeaders, aColumnData, dataSets, setCurrentSheetDataWithoutUndo, currentSheetData]);

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
    
    const sheetDataForSaving = currentSheetData.map((row, rowIndex) => {
      // 1~5행은 모든 열의 데이터를 저장합니다.
      if (rowIndex < 5) {
        return row;
      }
      // 6행부터는 A열의 데이터만 저장하고 나머지 열은 비웁니다.
      const newRow = Array(row.length).fill('');
      newRow[0] = row[0] || '';
      return newRow;
    });
    
    const newSheetData: SheetData = {
      sheetData: sheetDataForSaving,
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
    
    // 기존 셀 데이터 파싱 (key:value 형식)
    const cellData = currentSheetData[rowIndex][0];
    
    if (cellData && cellData.includes('|')) {
      const parts = cellData.split('|');
      const parsedModelInfo: ModelInfo = {
        selectedModelCodes: [],
        standardModelCode: '',
        modelName: '',
        price: '',
      };
      
      // 각 key:value 쌍을 파싱
      parts.forEach(part => {
        const [key, value] = part.split(':');
        switch (key) {
          case 'standard':
            parsedModelInfo.standardModelCode = value || '';
            break;
          case 'display':
            parsedModelInfo.modelName = value || '';
            break;
          case 'price':
            parsedModelInfo.price = value || '';
            break;
          case 'codes':
            parsedModelInfo.selectedModelCodes = value ? value.split(',').filter(code => code.trim()) : [];
            break;
        }
      });
      
      // 파싱된 데이터를 상태에 저장
      setModelInfoData(prev => ({
        ...prev,
        [rowIndex]: parsedModelInfo
      }));
    }
    
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
    
    // A열에 필요한 정보만 저장: 선택된 모델번호(중복 제거), 표준 모델번호, 출고가, 모델명(표시용)
    const newSheetData = [...currentSheetData];
    let cellContent = '';
    
    // 선택된 모델번호들 (중복 제거)
    if (modelInfo.selectedModelCodes.length > 0) {
      const uniqueCodes = [...new Set(modelInfo.selectedModelCodes)];
      cellContent = `codes:${uniqueCodes.join(',')}`;
    }
    
    // 표준 모델번호
    if (modelInfo.standardModelCode) {
      cellContent += cellContent ? `|standard:${modelInfo.standardModelCode}` : `standard:${modelInfo.standardModelCode}`;
    }
    
    // 출고가 (숫자만 저장)
    if (modelInfo.price) {
      const numericPrice = modelInfo.price.replace(/[^\d]/g, '');
      cellContent += cellContent ? `|price:${numericPrice}` : `price:${numericPrice}`;
    }
    
    // 모델명 (표시용)
    if (modelInfo.modelName) {
      cellContent += cellContent ? `|display:${modelInfo.modelName}` : `display:${modelInfo.modelName}`;
    }
    
    newSheetData[selectedRowIndex][0] = cellContent;
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
    const newSheetData = currentSheetData.map((row, rowIndex) => {
      const newRow = Array(finalColCount).fill('');
      // A열 데이터 보존
      newRow[0] = currentSheetData[rowIndex]?.[0] || '';
      return newRow;
    });

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
          <div className="relative">
            <table className="border-collapse w-full" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: getColumnWidth.aCol, minWidth: '160px' }} />
                {currentSheetData[0]?.slice(1).map((_, index) => (
                  <col key={index + 1} style={{ width: getColumnWidth.otherCols, minWidth: '60px' }} />
                ))}
              </colgroup>
              <tbody>
                {currentSheetData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {row.map((cell, colIndex) => {
                      const baseStyle = 'h-6 text-sm border-b border-gray-200 border-r border-gray-300 text-black';
                      const positionStyle = colIndex === 0
                        ? rowIndex < 5
                          ? 'text-center font-bold bg-gray-50 sticky left-0 z-20'
                          : 'text-left sticky left-0 z-20 bg-white'
                        : 'text-center';
                      const dynamicCellStyle = getDataCellStyle(rowIndex, colIndex, currentSheetData);

                      const finalCellStyle = `${baseStyle} ${positionStyle} ${dynamicCellStyle}`;

                      return (
                        <td key={colIndex} className={finalCellStyle}>
                          {colIndex === 0 && rowIndex < 5 ? (
                            <span className="text-black font-bold">
                              {SHEET_HEADER_LABELS[rowIndex]}
                            </span>
                          ) : colIndex === 0 ? (
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="w-full h-full flex items-center justify-start text-gray-600"
                                    onDoubleClick={() => {
                                      if (rowIndex >= 5) {
                                        handleOpenModelInfoModal(rowIndex);
                                      }
                                    }}
                                    style={{
                                      cursor: rowIndex >= 5 ? 'pointer' : 'default'
                                    }}
                                  >
                                    {rowIndex >= 5 ? (() => {
                                      let displayName = cell;
                                      if (cell.includes('|')) {
                                        const parts = cell.split('|');
                                        const displayPart = parts.find(part => part.startsWith('display:'));
                                        displayName = displayPart ? displayPart.replace('display:', '') : cell;
                                      }
                                      return displayName.replace(/\[(5G|LTE)\]/g, '').trim();
                                    })() : cell}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-left">
                                    {cell.split('|').map((part, index) => {
                                      const [key, value] = part.split(':');
                                      let label = key;
                                      let finalValue = value;
                                      switch (key) {
                                        case 'display': label = '모델명'; break;
                                        case 'standard': label = '표준 모델'; break;
                                        case 'price': label = '출고가'; finalValue = `${Number(value).toLocaleString()}원`; break;
                                        case 'codes': label = '연결된 코드'; break;
                                        default: return <p key={index}>{part}</p>;
                                      }
                                      return <p key={index}><strong>{label}:</strong> {finalValue}</p>;
                                    })}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`relative w-full h-full flex items-center justify-center ${
                                      rowIndex < 5 ? getDynamicCellStyle(rowIndex, cell) : 'text-gray-600'
                                    }`}
                                  >
                                    {
                                      rowIndex < 5 ? (
                                        // 1~5행 렌더링
                                        rowIndex === 2 ? cell.split('|')[0] : cell.split('|WARN_MULTI')[0].split(';')[0]
                                      ) : (
                                        // 6행 이상 데이터 셀 렌더링
                                        (() => {
                                          const isHighlighted = highlightedCells.has(`${rowIndex}-${colIndex}`);
                                          const cellContent = cell.split('|WARN_MULTI')[0].split(';')[0];
                                          const joinType = sheetHeaders[3]?.[colIndex]?.trim();
                                          const isNegative = !isNaN(Number(cellContent)) && Number(cellContent) < 0;

                                          if (isHighlighted) {
                                            let styleClass = 'inline-block text-center w-12 rounded-md py-0 font-bold ';
                                            
                                            switch (joinType) {
                                              case '번호이동': styleClass += 'bg-blue-400 '; break;
                                              case '기기변경': styleClass += 'bg-green-400 '; break;
                                              case '신규가입': styleClass += 'bg-red-400 '; break;
                                            }

                                            if (isNegative) {
                                              // 음수이면서 빨간 배경일 경우 글자를 흰색으로 하여 가독성 확보
                                              if (joinType === '신규가입') {
                                                styleClass += 'text-white';
                                              } else {
                                                // 다른 배경에서는 진한 빨간색 글씨 사용
                                                styleClass += 'text-red-700';
                                              }
                                            } else {
                                              styleClass += 'text-black';
                                            }
                                            
                                            return <span className={styleClass}>{cellContent}</span>;

                                          } else {
                                            if (isNegative) {
                                              return <span className="text-red-500">{cellContent}</span>;
                                            }
                                            return cellContent;
                                          }
                                        })()
                                      )
                                    }
                                    {cell.includes('|WARN_MULTI') && (
                                      <div className="absolute top-0.5 right-0.5 w-3 h-3 text-yellow-500">
                                        <AlertTriangle className="w-full h-full" />
                                      </div>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {
                                      cell.includes('|WARN_MULTI')
                                        ? `여러 값이 발견됨: ${cell.split('|WARN_MULTI')[0].split(';').join(', ')}`
                                        : cell
                                    }
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        dataSets={dataSets}
        publicData={publicData}
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