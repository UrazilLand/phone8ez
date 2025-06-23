"use client";

import { useUndo } from '@/hooks/use-undo';
import { DataSet, SheetData } from '@/types/dashboard';
import IntegratedHeader from './IntegratedHeader';
import DataSelectionModal from './DataSelectionModal';
import ModelInfoModal from './ModelInfoModal';
import AdditionalServiceModal from './AdditionalServiceModal';
import { SHEET_HEADER_LABELS, DEFAULT_ROW_COUNT, DEFAULT_COLUMN_COUNT, BUTTON_THEME } from '@/styles/common';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  extractCompaniesByCarrier, 
  extractPlansByCarrierAndCompany, 
  extractMonthlyFeesByCarrier
} from '@/app/dashboard/utils/integrated/dataExtraction';
import { getDynamicCellStyle, getDataCellStyle } from '@/app/dashboard/utils/common/colorUtils';
import { AlertTriangle, X } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface IntegratedSheetProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  publicData: any;
  reloadKey: number;
  isAdditionalServiceModalOpen: boolean;
  setIsAdditionalServiceModalOpen: (isOpen: boolean) => void;
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

export default function IntegratedSheet({ 
  dataSets, 
  setDataSets, 
  publicData, 
  reloadKey,
  isAdditionalServiceModalOpen,
  setIsAdditionalServiceModalOpen
}: IntegratedSheetProps) {
  const { toast } = useToast();
  
  const [sheetData, setSheetData] = useState<string[][]>(() => getInitialSheetData(dataSets));
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);
  const [isModelInfoModalOpen, setIsModelInfoModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);
  const [modelInfoData, setModelInfoData] = useState<Record<number, ModelInfo>>({});
  const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number>(-1);

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
                const cellValue = sourceSheet[sourceRow]?.[sourceCol] || '';
                // 숫자만 추출 (음수 부호 포함)
                const numericValue = cellValue.replace(/[^\d-]/g, '');
                if (numericValue) {
                  foundValues.push(numericValue);
                }
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

  const handleOpenAdditionalServiceModal = () => {
    setIsAdditionalServiceModalOpen(true);
  };

  const handleCloseAdditionalServiceModal = () => {
    setIsAdditionalServiceModalOpen(false);
  };

  const handleApplyAdditionalServices = (additionalServicesData: Record<string, Array<{service: string, discount: string}>>) => {
    // '부가' 데이터셋으로 저장
    const existingAdditionalDataSet = dataSets.find(dataset => dataset.type === 'additional');
    
    const newAdditionalData: SheetData = {
      sheetData: [], // 부가서비스 데이터는 별도 구조로 저장
      carrier: '',
      contract: '',
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
      additionalServices: additionalServicesData, // 부가서비스 데이터 추가
    };

    if (existingAdditionalDataSet) {
      const updatedDataSets = dataSets.map(dataset => 
        dataset.type === 'additional' 
          ? { ...dataset, data: newAdditionalData, createdAt: new Date().toISOString() }
          : dataset
      );
      setDataSets(updatedDataSets);
      toast({
        title: "부가서비스 업데이트 완료",
        description: "부가서비스 정보가 성공적으로 업데이트되었습니다.",
      });
    } else {
      const newDataSet: DataSet = {
        id: 'additional',
        name: "부가",
        type: 'additional',
        createdAt: new Date().toISOString(),
        data: newAdditionalData,
      };
      setDataSets([...dataSets, newDataSet]);
      toast({
        title: "부가서비스 저장 완료",
        description: "부가서비스 정보가 성공적으로 저장되었습니다.",
      });
    }
  };

  const handleDeleteColumn = (columnIndex: number) => {
    if (columnIndex === 0) return; // A열은 삭제 불가
    
    const newSheetData = currentSheetData.map(row => {
      const newRow = [...row];
      newRow.splice(columnIndex, 1);
      return newRow;
    });
    
    setCurrentSheetData(newSheetData);
    setHoveredColumnIndex(-1);
    
    toast({
      title: "열 삭제 완료",
      description: "선택한 열이 삭제되었습니다.",
    });
  };

  // 출고가 추출 함수
  const getPriceFromAColumn = (rowIndex: number): number => {
    const cellData = currentSheetData[rowIndex]?.[0] || '';
    if (cellData.includes('price:')) {
      const pricePart = cellData.split('|').find(p => p.startsWith('price:'));
      if (pricePart) {
        const price = pricePart.replace('price:', '');
        return Number(price) || 0;
      }
    }
    return 0;
  };

  // 공시지원금 계산 함수
  const getPublicSupportAmount = (rowIndex: number, colIndex: number): number => {
    const standardModel = currentSheetData[rowIndex]?.[0]?.split('|').find(p => p.startsWith('standard:'))?.replace('standard:', '') || '';
    const joinType = currentSheetData[3]?.[colIndex]?.split('|')[0].split(';')[0] || ''; // 4행 가입유형
    const carrierInSheet = currentSheetData[0]?.[colIndex]?.trim() || ''; // 1행 통신사
    
    // 3행에서 월 요금 추출 (두 가지 값이 있을 수 있음)
    const planCell = currentSheetData[2]?.[colIndex] || '';
    const planParts = planCell.split('|');
    const monthlyFee1 = planParts[1] ? Number(planParts[1]) : null;
    const monthlyFee2 = planParts[2] ? Number(planParts[2]) : null;
    
    if (!standardModel || (monthlyFee1 === null && monthlyFee2 === null) || !carrierInSheet) {
      // 표준모델, 월요금, 통신사 중 하나라도 없으면 계산 불가
      return 0;
    }

    if (!publicData) {
      return 0;
    }
    
    for (const [manufacturerName, manufacturer] of Object.entries(publicData.manufacturers)) {
      const typedManufacturer = manufacturer as any;
      if (typedManufacturer.models) {
        for (const model of typedManufacturer.models) {
          if (model.model_number === standardModel) {
            for (const section of model.support_info.sections) {
              for (const [carrierName, carrierInfo] of Object.entries(section.carriers)) {
                // 통신사가 일치하는지 확인
                if (carrierInfo && typeof carrierInfo === 'object' && carrierName === carrierInSheet) {
                  const carrierMonthlyFee = (carrierInfo as any).monthly_fee;
                  const isMonthlyFeeMatch = (monthlyFee1 !== null && carrierMonthlyFee === monthlyFee1) || 
                                          (monthlyFee2 !== null && carrierMonthlyFee === monthlyFee2);
                  
                  if (isMonthlyFeeMatch) {
                    let supportAmount = 0;
                    if (joinType === '번호이동') {
                      supportAmount = (carrierInfo as any).number_port_support || 0;
                    } else {
                      supportAmount = (carrierInfo as any).device_support || 0;
                    }
                    
                    if (supportAmount > 0) {
                      return Number(supportAmount);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    return 0;
  };

  // 부가서비스 계산 함수
  const getAdditionalServiceAmount = (rowIndex: number, colIndex: number): number => {
    const carrier = currentSheetData[0]?.[colIndex]?.trim() || '';
    const company = currentSheetData[4]?.[colIndex]?.trim() || '';
    const serviceKey = `${company}-${carrier}`;
    
    if (!carrier || !company) {
      return 0;
    }

    const additionalDataSet = dataSets.find(ds => ds.type === 'additional');
    if (!additionalDataSet?.data.additionalServices) {
        return 0;
    }

    const additionalServices = additionalDataSet.data.additionalServices;
    const companyServices = additionalServices[serviceKey];

    if (!companyServices) {
        return 0;
    }

    let totalAmount = 0;
    companyServices.forEach(service => {
      const discount = Number(service.discount) || 0;
      totalAmount += discount;
    });

    return totalAmount;
  };

  // 최종 계산 함수
  const calculateFinalAmount = (rowIndex: number, colIndex: number): { 
    finalAmount: number; 
    price: number; 
    policySupport: number; 
    publicSupport: number; 
    additionalService: number; 
  } => {
    const price = getPriceFromAColumn(rowIndex);
    const policySupport = Number(currentSheetData[rowIndex]?.[colIndex]?.split('|')[0].split(';')[0]) || 0;
    const publicSupport = getPublicSupportAmount(rowIndex, colIndex);
    const additionalService = getAdditionalServiceAmount(rowIndex, colIndex);
    
    // 정책지원금이 0인 경우 빈칸으로 표시
    if (policySupport === 0) {
      return {
        finalAmount: 0,
        price,
        policySupport: 0,
        publicSupport,
        additionalService
      };
    }
    
    // 계산: (출고가 - 정책지원금*10000 - 공시지원금 - 부가서비스) / 10000
    const finalAmount = Math.floor((price - policySupport * 10000 - publicSupport - additionalService) / 10000);
    
    return {
      finalAmount,
      price,
      policySupport,
      publicSupport,
      additionalService
    };
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
          onOpenAdditionalServiceModal={handleOpenAdditionalServiceModal}
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
                  <col key={index + 1} style={{ width: getColumnWidth.otherCols, minWidth: '40px' }} />
                ))}
              </colgroup>
              <tbody>
                {currentSheetData.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className="hover:bg-gray-50"
                    onMouseEnter={() => rowIndex === 0 ? setHoveredColumnIndex(-1) : undefined}
                  >
                    {row.map((cell, colIndex) => {
                      const baseStyle = 'h-6 text-sm border-b border-gray-200 border-r border-gray-300 text-black';
                      // A열을 제외한 나머지 데이터가 비었는지 확인
                      const isEmptyRow = row.slice(1).every(c => !c || c.trim() === '');
                      
                      const positionStyle = colIndex === 0
                        ? rowIndex < 5
                          ? 'text-center font-bold bg-gray-50 sticky left-0 z-20'
                          : 'text-left sticky left-0 z-20 bg-white'
                        : 'text-center';

                      // 빈 행이 아닐 경우에만 통신사별 교차 색상 스타일을 적용
                      const dynamicCellStyle = !isEmptyRow 
                        ? getDataCellStyle(rowIndex, colIndex, currentSheetData) 
                        : '';

                      const finalCellStyle = `${baseStyle} ${positionStyle} ${dynamicCellStyle}`;

                      return (
                        <td 
                          key={colIndex} 
                          className={finalCellStyle}
                          onMouseEnter={() => rowIndex === 0 && colIndex > 0 ? setHoveredColumnIndex(colIndex) : undefined}
                          onMouseLeave={() => rowIndex === 0 && colIndex > 0 ? setHoveredColumnIndex(-1) : undefined}
                        >
                          {colIndex === 0 && rowIndex < 5 ? (
                            <span className="text-black font-bold">
                              {SHEET_HEADER_LABELS[rowIndex]}
                            </span>
                          ) : colIndex === 0 ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <div
                                  className="w-full h-full flex items-center justify-start text-gray-600"
                                  onDoubleClick={() => {
                                    if (rowIndex >= 5) {
                                      handleOpenModelInfoModal(rowIndex);
                                    }
                                  }}
                                  style={{
                                    cursor: rowIndex >= 5 ? 'pointer' : 'default',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
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
                              </PopoverTrigger>
                              <PopoverContent>
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
                              </PopoverContent>
                            </Popover>
                          ) : (
                            (rowIndex === 0 || rowIndex === 1 || rowIndex === 3 || rowIndex === 4) && colIndex > 0 ? (
                              // 1,2,4,5행은 툴팁 없이 일반 div
                              <div
                                className={`relative w-full h-full flex items-center justify-center ${
                                  rowIndex < 5 ? getDynamicCellStyle(rowIndex, cell) : 'text-gray-600'
                                }`}
                                style={{
                                  whiteSpace: rowIndex < 5 ? 'nowrap' : 'normal',
                                  overflow: rowIndex < 5 ? 'hidden' : 'visible',
                                  textOverflow: rowIndex < 5 ? 'ellipsis' : 'clip'
                                }}
                              >
                                {rowIndex === 0 && colIndex > 0 && hoveredColumnIndex === colIndex ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteColumn(colIndex);
                                    }}
                                    className="w-full h-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-lg font-bold transition-all duration-200"
                                    title="열 삭제"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                ) : (
                                  rowIndex === 3 ? (() => {
                                    // 4행(가입유형) 축약형 표시
                                    const fullText = cell.split('|WARN_MULTI')[0].split(';')[0];
                                    switch (fullText) {
                                      case '번호이동': return '번이';
                                      case '기기변경': return '기변';
                                      case '신규가입': return '신규';
                                      default: return fullText;
                                    }
                                  })() : cell.split('|WARN_MULTI')[0].split(';')[0]
                                )}
                              </div>
                            ) : (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div
                                    className={`relative w-full h-full flex items-center justify-center ${
                                      rowIndex < 5 ? getDynamicCellStyle(rowIndex, cell) : 'text-gray-600'
                                    }`}
                                    style={{
                                      whiteSpace: rowIndex < 5 ? 'nowrap' : 'normal',
                                      overflow: rowIndex < 5 ? 'hidden' : 'visible',
                                      textOverflow: rowIndex < 5 ? 'ellipsis' : 'clip'
                                    }}
                                  >
                                    {/* 1행 마우스오버 시 X 버튼으로 변환 */}
                                    {rowIndex === 0 && colIndex > 0 && hoveredColumnIndex === colIndex ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteColumn(colIndex);
                                        }}
                                        className="w-full h-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-lg font-bold transition-all duration-200"
                                        title="열 삭제"
                                      >
                                        <X className="w-5 h-5" />
                                      </button>
                                    ) : (
                                      <>
                                        {
                                          rowIndex < 5 ? (
                                            // 1~5행 렌더링
                                            rowIndex === 2 ? cell.split('|')[0] : 
                                            rowIndex === 3 ? (() => {
                                              // 4행(가입유형) 축약형 표시
                                              const fullText = cell.split('|WARN_MULTI')[0].split(';')[0];
                                              switch (fullText) {
                                                case '번호이동': return '번이';
                                                case '기기변경': return '기변';
                                                case '신규가입': return '신규';
                                                default: return fullText;
                                              }
                                            })() : cell.split('|WARN_MULTI')[0].split(';')[0]
                                          ) : (
                                            // 6행 이상 데이터 셀 렌더링
                                            (() => {
                                              const isHighlighted = highlightedCells.has(`${rowIndex}-${colIndex}`);
                                              const calculation = calculateFinalAmount(rowIndex, colIndex);
                                              const cellContent = calculation.finalAmount === 0 ? '' : calculation.finalAmount.toString();
                                              const joinType = sheetHeaders[3]?.[colIndex]?.trim();
                                              const isNegative = calculation.finalAmount < 0;

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
                                      </>
                                    )}
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent>
                                  <div className="text-left">
                                    {rowIndex === 2 && colIndex > 0 ? (
                                      // 3행(요금제) 툴팁
                                      (() => {
                                        const parts = cell.split('|');
                                        const planName = parts[0] || '';
                                        const monthlyFee1 = parts[1] || '';
                                        const monthlyFee2 = parts[2] || '';
                                        
                                        return (
                                          <div>
                                            <p><strong>요금제명:</strong> {planName}</p>
                                            {monthlyFee1 && <p><strong>표준요금:</strong> {Number(monthlyFee1).toLocaleString()}원</p>}
                                            {monthlyFee2 && <p><strong>표준요금:</strong> {Number(monthlyFee2).toLocaleString()}원</p>}
                                          </div>
                                        );
                                      })()
                                    ) : rowIndex >= 5 && colIndex > 0 ? (
                                      // B6셀부터 데이터 툴팁
                                      (() => {
                                        const calculation = calculateFinalAmount(rowIndex, colIndex);
                                        const cellContent = cell.split('|WARN_MULTI')[0];
                                        const hasWarning = cell.includes('|WARN_MULTI');
                                        const values = cellContent.split(';').filter(v => v.trim());
                                        
                                        // 정책지원금이 0인 경우 툴팁 표시하지 않음
                                        if (calculation.policySupport === 0) {
                                          return null;
                                        }
                                        
                                        return (
                                          <div>
                                            <p><strong>출고가:</strong> {calculation.price.toLocaleString()}원</p>
                                            {calculation.policySupport > 0 && (
                                              <p><strong>정책지원금:</strong> {(calculation.policySupport * 10000).toLocaleString()}원</p>
                                            )}
                                            <p><strong>공시지원금:</strong> {calculation.publicSupport.toLocaleString()}원</p>
                                            <p><strong>부가서비스:</strong> {calculation.additionalService.toLocaleString()}원</p>
                                            {hasWarning && (
                                              <p className="text-yellow-600 mt-2">
                                                <strong>⚠️ 경고:</strong> 여러 값이 발견됨
                                              </p>
                                            )}
                                            {values.length > 1 && !hasWarning && (
                                              <p className="text-blue-600 mt-2">
                                                <strong>ℹ️ 정보:</strong> 여러 값이 있음
                                              </p>
                                            )}
                                          </div>
                                        );
                                      })()
                                    ) : (
                                      // 기타 셀 툴팁 (3행만)
                                      <p>{cell}</p>
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )
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

      {/* 부가서비스 모달 */}
      <AdditionalServiceModal
        isOpen={isAdditionalServiceModalOpen}
        onClose={handleCloseAdditionalServiceModal}
        onApply={handleApplyAdditionalServices}
        dataSets={dataSets}
      />

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