"use client";

import { useUndo } from '@/hooks/use-undo';
import { DataSet, SheetData } from '@/types/dashboard';
import DataInputHeader from './DataInputHeader';
import { 
  SHEET_HEADER_LABELS, 
  DEFAULT_ROW_COUNT, 
  DEFAULT_COLUMN_COUNT,
  PLAN_BG_COLORS,
  COMPANY_TEXT_COLORS,
  CARRIER_OPTIONS,
  CONTRACT_OPTIONS,
  JOIN_TYPE_OPTIONS,
  COMPANY_OPTIONS
} from '@/styles/common';
import { useState, useCallback, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";

interface DataInputSheetProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  onApplyData?: (data: any) => void;
}

export interface DataInputSheetRef {
  fillAllData: (modalData: any) => void;
  loadData: (data: any) => void;
}

const DataInputSheet = forwardRef<DataInputSheetRef, DataInputSheetProps>(({ dataSets, setDataSets, onApplyData }, ref) => {
  const { toast } = useToast();
  const tableRef = useRef<HTMLDivElement>(null);
  
  const [sheetData, setSheetData] = useState<string[][]>(
    Array(DEFAULT_ROW_COUNT).fill(null).map(() => Array(DEFAULT_COLUMN_COUNT).fill(''))
  );

  const [
    currentSheetData,
    setCurrentSheetData,
    undo,
    redo,
    canUndo,
    canRedo
  ] = useUndo<string[][]>(sheetData);

  // 1,2,3,4,5행의 색상 매핑 생성
  const colorMapping = useMemo(() => {
    const mapping: { [key: string]: string } = {};
    let planColorIndex = 0;
    let companyColorIndex = 0;

    // 1행(통신사) 색상 매핑 - CARRIER_OPTIONS 사용
    const carrierValues = new Set<string>();
    for (let col = 1; col < currentSheetData[0]?.length; col++) {
      const value = currentSheetData[0][col]?.trim();
      if (value && !carrierValues.has(value)) {
        carrierValues.add(value);
        // variants 배열을 사용하여 대소문자와 변형들을 모두 매칭
        const carrierOption = CARRIER_OPTIONS.find(option => 
          option.variants && option.variants.some(variant => 
            variant.toLowerCase() === value.toLowerCase()
          )
        );
        if (carrierOption) {
          mapping[`carrier_${value}`] = carrierOption.style;
        }
      }
    }

    // 2행(지원 구분) 색상 매핑 - CONTRACT_OPTIONS 사용
    const contractValues = new Set<string>();
    for (let col = 1; col < currentSheetData[1]?.length; col++) {
      const value = currentSheetData[1][col]?.trim();
      if (value && !contractValues.has(value)) {
        contractValues.add(value);
        const contractOption = CONTRACT_OPTIONS.find(option => option.value === value);
        if (contractOption) {
          mapping[`contract_${value}`] = contractOption.style;
        }
      }
    }

    // 3행(요금제) 색상 매핑 - PLAN_BG_COLORS 사용 (배경색)
    const planValues = new Set<string>();
    for (let col = 1; col < currentSheetData[2]?.length; col++) {
      const value = currentSheetData[2][col]?.trim();
      if (value && !planValues.has(value)) {
        planValues.add(value);
        mapping[`plan_${value}`] = PLAN_BG_COLORS[planColorIndex % PLAN_BG_COLORS.length];
        planColorIndex++;
      }
    }

    // 4행(가입 유형) 색상 매핑 - JOIN_TYPE_OPTIONS 사용
    const joinTypeValues = new Set<string>();
    for (let col = 1; col < currentSheetData[3]?.length; col++) {
      const value = currentSheetData[3][col]?.trim();
      if (value && !joinTypeValues.has(value)) {
        joinTypeValues.add(value);
        const joinTypeOption = JOIN_TYPE_OPTIONS.find(option => option.value === value);
        if (joinTypeOption) {
          mapping[`joinType_${value}`] = joinTypeOption.style;
        }
      }
    }

    // 5행(업체명) 색상 매핑 - COMPANY_OPTIONS 사용
    const companyValues = new Set<string>();
    for (let col = 1; col < currentSheetData[4]?.length; col++) {
      const value = currentSheetData[4][col]?.trim();
      if (value && !companyValues.has(value)) {
        companyValues.add(value);
        const companyOption = COMPANY_OPTIONS.find(option => option.value === value);
        if (companyOption) {
          mapping[`company_${value}`] = companyOption.style;
        } else {
          // COMPANY_OPTIONS에 없는 경우 COMPANY_TEXT_COLORS 사용
          mapping[`company_${value}`] = COMPANY_TEXT_COLORS[companyColorIndex % COMPANY_TEXT_COLORS.length];
          companyColorIndex++;
        }
      }
    }
    return mapping;
  }, [currentSheetData]);

  // 테이블의 전체 너비를 동적으로 계산
  const tableWidth = useMemo(() => {
    const numCols = currentSheetData[0]?.length || 0;
    if (numCols === 0) {
      return 0; // 데이터가 없을 경우 너비 0
    }
    if (numCols === 1) {
      return 160; // A열만 있을 경우
    }
    // A열(160px) + 나머지 열(각 80px)
    return 160 + (numCols - 1) * 80;
  }, [currentSheetData]);

  // 셀의 색상 스타일을 반환하는 함수 (B열부터 적용)
  const getCellStyle = (rowIndex: number, colIndex: number, value: string) => {
    if (colIndex === 0) return {}; // A열은 색상 적용 안함
    
    const trimmedValue = value?.trim();
    if (!trimmedValue) return {};

    const style: React.CSSProperties = {};

    if (rowIndex === 0) { // 1행 (통신사) - CARRIER_OPTIONS 스타일 적용
      const colorClass = colorMapping[`carrier_${trimmedValue}`];
      // CARRIER_OPTIONS의 스타일을 인라인 스타일로 변환
      if (colorClass === 'text-red-600 font-bold') {
        style.color = '#dc2626';
        style.fontWeight = 'bold';
      } else if (colorClass === 'text-black font-bold') {
        style.color = '#000000';
        style.fontWeight = 'bold';
      } else if (colorClass === 'text-pink-700 font-bold') {
        style.color = '#be185d';
        style.fontWeight = 'bold';
      }
      
    } else if (rowIndex === 1) { // 2행 (지원 구분) - CONTRACT_OPTIONS 스타일 적용
      const colorClass = colorMapping[`contract_${trimmedValue}`];      
      // CONTRACT_OPTIONS의 스타일을 인라인 스타일로 변환
      if (colorClass === 'text-green-700 font-bold') {
        style.color = '#15803d';
        style.fontWeight = 'bold';
      } else if (colorClass === 'text-cyan-600 font-bold') {
        style.color = '#0891b2';
        style.fontWeight = 'bold';
      }
      
    } else if (rowIndex === 2) { // 3행 (요금제) - 배경색 적용
      const colorClass = colorMapping[`plan_${trimmedValue}`];
      
      // PLAN_BG_COLORS의 배경색을 인라인 스타일로 변환
      if (colorClass === 'bg-blue-300') style.backgroundColor = '#93c5fd';
      else if (colorClass === 'bg-indigo-300') style.backgroundColor = '#a5b4fc';
      else if (colorClass === 'bg-purple-300') style.backgroundColor = '#c4b5fd';
      else if (colorClass === 'bg-pink-300') style.backgroundColor = '#f9a8d4';
      else if (colorClass === 'bg-red-300') style.backgroundColor = '#fca5a5';
      else if (colorClass === 'bg-orange-300') style.backgroundColor = '#fdba74';
      else if (colorClass === 'bg-green-300') style.backgroundColor = '#86efac';
      else if (colorClass === 'bg-teal-300') style.backgroundColor = '#5eead4';
      
    } else if (rowIndex === 3) { // 4행 (가입 유형) - JOIN_TYPE_OPTIONS 스타일 적용
      const colorClass = colorMapping[`joinType_${trimmedValue}`];
      // JOIN_TYPE_OPTIONS의 스타일을 인라인 스타일로 변환
      if (colorClass === 'bg-blue-500 text-white') {
        style.backgroundColor = '#3b82f6';
        style.color = '#ffffff';
      } else if (colorClass === 'bg-green-600 text-white') {
        style.backgroundColor = '#16a34a';
        style.color = '#ffffff';
      } else if (colorClass === 'bg-red-500 text-white') {
        style.backgroundColor = '#ef4444';
        style.color = '#ffffff';
      }
      
    } else if (rowIndex === 4) { // 5행 (업체명) - COMPANY_OPTIONS 스타일 적용
      const colorClass = colorMapping[`company_${trimmedValue}`];
      
      // COMPANY_OPTIONS의 스타일을 인라인 스타일로 변환
      if (colorClass === 'text-blue-800 font-bold') {
        style.color = '#1e40af';
        style.fontWeight = 'bold';
      } else if (colorClass === 'text-pink-800 font-bold') {
        style.color = '#9d174d';
        style.fontWeight = 'bold';
      } else if (colorClass === 'text-indigo-800 font-bold') {
        style.color = '#3730a3';
        style.fontWeight = 'bold';
      } else if (colorClass === 'text-red-800 font-bold') {
        style.color = '#991b1b';
        style.fontWeight = 'bold';
      } else if (colorClass === 'text-purple-800 font-bold') {
        style.color = '#6b21a8';
        style.fontWeight = 'bold';
      } else if (colorClass === 'text-teal-800 font-bold') {
        style.color = '#115e59';
        style.fontWeight = 'bold';
      } else if (colorClass === 'text-orange-800 font-bold') {
        style.color = '#9a3412';
        style.fontWeight = 'bold';
      } else if (colorClass === 'text-green-800 font-bold') {
        style.color = '#166534';
        style.fontWeight = 'bold';
      } else if (colorClass === 'text-amber-800 font-bold') {
        style.color = '#92400e';
        style.fontWeight = 'bold';
      } else if (colorClass === 'text-cyan-800 font-bold') {
        style.color = '#155e75';
        style.fontWeight = 'bold';
      } else {
        // COMPANY_TEXT_COLORS의 텍스트 색상을 인라인 스타일로 변환 (fallback)
        if (colorClass === 'text-blue-800') style.color = '#1e40af';
        else if (colorClass === 'text-pink-800') style.color = '#9d174d';
        else if (colorClass === 'text-indigo-800') style.color = '#3730a3';
        else if (colorClass === 'text-red-800') style.color = '#991b1b';
        else if (colorClass === 'text-purple-800') style.color = '#6b21a8';
        else if (colorClass === 'text-teal-800') style.color = '#115e59';
        else if (colorClass === 'text-orange-800') style.color = '#9a3412';
        else if (colorClass === 'text-green-800') style.color = '#166534';
        else if (colorClass === 'text-amber-800') style.color = '#92400e';
        else if (colorClass === 'text-cyan-800') style.color = '#155e75';
      }
    }

    return style;
  };

  useImperativeHandle(ref, () => ({
    fillAllData: (modalData: any) => {
      
      // 마지막으로 적용된 데이터 저장
      setLastAppliedData(modalData);
      
      const { 
        carrier, supportItems, joinItems, 
        planSubInputs, planRepeatCount, 
        companySubInputs, companyRepeatCount 
      } = modalData;
      
      
      const newSheetData = currentSheetData.map(row => [...row]);

      // 1. 통신사 (0행)
      if (carrier) {
        for (let colIndex = 1; colIndex < newSheetData[0].length; colIndex++) {
          newSheetData[0][colIndex] = carrier;
        }
      }
      
      // 2. 지원 구분 (1행)
      if (supportItems && supportItems.length > 0) {
        const pattern: string[] = [];
        supportItems.forEach((item: any) => {
          const repeatCount = parseInt(item.value) || 0;
          for (let i = 0; i < repeatCount; i++) {
            pattern.push(item.label);
          }
        });

        if (pattern.length > 0) {
          for (let colIndex = 1; colIndex < newSheetData[1].length; colIndex++) {
            newSheetData[1][colIndex] = pattern[(colIndex - 1) % pattern.length];
          }
        } else {
          for (let colIndex = 1; colIndex < newSheetData[1].length; colIndex++) {
            newSheetData[1][colIndex] = '';
          }
        }
      }

      // 3. 요금제 분류 (2행)
      if (planSubInputs && planSubInputs.some((val: string) => val.trim() !== '')) {
        const subPattern = planSubInputs.filter((val: string) => val.trim() !== '');
        // 더 안전한 파싱 로직
        let repeatCount = 1;
        if (planRepeatCount !== undefined && planRepeatCount !== null && planRepeatCount !== '') {
          const parsed = parseInt(planRepeatCount.toString());
          if (!isNaN(parsed) && parsed > 0) {
            repeatCount = parsed;
          }
        }
        
        const finalPattern: string[] = [];
        // 각 항목을 반복횟수만큼 반복
        subPattern.forEach((item: string) => {
          for (let i = 0; i < repeatCount; i++) {
            finalPattern.push(item);
          }
        });
        
        if (finalPattern.length > 0) {
          for (let colIndex = 1; colIndex < newSheetData[2].length; colIndex++) {
            newSheetData[2][colIndex] = finalPattern[(colIndex - 1) % finalPattern.length];
          }
        } else {
          for (let colIndex = 1; colIndex < newSheetData[2].length; colIndex++) {
            newSheetData[2][colIndex] = '';
          }
        }
      }
      
      // 4. 가입 유형 (3행)
      if (joinItems && joinItems.length > 0) {
        const pattern: string[] = [];
        joinItems.forEach((item: any) => {
          const repeatCount = parseInt(item.value) || 0;
          for (let i = 0; i < repeatCount; i++) {
            pattern.push(item.label);
          }
        });

        if (pattern.length > 0) {
          for (let colIndex = 1; colIndex < newSheetData[3].length; colIndex++) {
            newSheetData[3][colIndex] = pattern[(colIndex - 1) % pattern.length];
          }
        } else {
            for (let colIndex = 1; colIndex < newSheetData[3].length; colIndex++) {
            newSheetData[3][colIndex] = '';
          }
        }
      }

      // 5. 업체명 분류 (4행)
      if (companySubInputs && companySubInputs.some((val: string) => val.trim() !== '')) {
        const subPattern = companySubInputs.filter((val: string) => val.trim() !== '');
        // 더 안전한 파싱 로직
        let repeatCount = 1;
        if (companyRepeatCount !== undefined && companyRepeatCount !== null && companyRepeatCount !== '') {
          const parsed = parseInt(companyRepeatCount.toString());
          if (!isNaN(parsed) && parsed > 0) {
            repeatCount = parsed;
          }
        }

        const finalPattern: string[] = [];
        // 각 항목을 반복횟수만큼 반복
        subPattern.forEach((item: string) => {
          for (let i = 0; i < repeatCount; i++) {
            finalPattern.push(item);
          }
        });

        if (finalPattern.length > 0) {
          for (let colIndex = 1; colIndex < newSheetData[4].length; colIndex++) {
            newSheetData[4][colIndex] = finalPattern[(colIndex - 1) % finalPattern.length];
          }
        } else {
          for (let colIndex = 1; colIndex < newSheetData[4].length; colIndex++) {
            newSheetData[4][colIndex] = '';
          }
        }
      }
      
      setCurrentSheetData(newSheetData);
    },
    loadData: (data: any) => {
      
      // 저장된 데이터셋의 sheetData를 직접 불러오기
      if (data && data.sheetData && Array.isArray(data.sheetData)) {
        setCurrentSheetData(data.sheetData);
        
        // 마지막으로 적용된 데이터 초기화 (새로운 데이터를 로드했으므로)
        setLastAppliedData(null);
      } else {
        console.error('Invalid data format for loadData:', data);
      }
    }
  }));

  const handleSave = (dataName?: string) => {
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
      name: dataName || `데이터 세트 ${dataSets.length + 1}`,
      type: 'normal',
      createdAt: new Date().toISOString(),
      data: newSheetData,
    };

    // 동일한 이름의 데이터셋이 있는지 확인
    const existingIndex = dataSets.findIndex(ds => ds.name === newDataSet.name);
    
    if (existingIndex !== -1) {
      // 기존 데이터를 덮어쓰기
      const updatedDataSets = [...dataSets];
      updatedDataSets[existingIndex] = newDataSet;
      setDataSets(updatedDataSets);
      toast({
        title: "덮어쓰기 완료",
        description: "기존 데이터를 덮어쓰고 저장되었습니다.",
      });
    } else {
      // 새로운 데이터 추가
      setDataSets([...dataSets, newDataSet]);
      toast({
        title: "저장 완료",
        description: "데이터가 성공적으로 저장되었습니다.",
      });
    }
  };

  const handleReset = useCallback(() => {
    const emptySheet = Array(DEFAULT_ROW_COUNT).fill(null).map(() => Array(DEFAULT_COLUMN_COUNT).fill(''));
    setCurrentSheetData(emptySheet);
    toast({
      title: "초기화 완료",
      description: "시트가 초기화되었습니다.",
    });
  }, [setCurrentSheetData, toast]);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newSheetData = currentSheetData.map(row => [...row]);
    
    // 열 자동 추가 로직 - 6행부터만 적용
    let shouldExtendColumns = false;
    if (rowIndex >= 5 && colIndex >= newSheetData[rowIndex].length) {
      shouldExtendColumns = true;
    }
    
    // 데이터 설정
    newSheetData[rowIndex][colIndex] = value;
    
    // 열 자동 추가
    if (shouldExtendColumns) {
      const maxCols = Math.max(...newSheetData.map(row => row.length), colIndex + 1);
      
      newSheetData.forEach((row, idx) => {
        while (row.length < maxCols) {
          row.push('');
        }
      });
      
      // 1~5행 자동채움 함수 재호출
      if (lastAppliedData && ref && 'current' in ref && ref.current) {
        setTimeout(() => {
          if (ref.current) {
            ref.current.fillAllData(lastAppliedData);
          }
        }, 0);
      }
    }
    
    setCurrentSheetData(newSheetData);
    
    // 1~5행이 변경된 경우 색상 매핑 업데이트를 위해 강제 리렌더링
    if (rowIndex >= 0 && rowIndex <= 4) {
    }
  };

  // 마지막으로 적용된 데이터를 저장하는 상태
  const [lastAppliedData, setLastAppliedData] = useState<any>(null);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const clipboardData = e.clipboardData.getData('text');
    if (!clipboardData) return;

    // 클립보드 데이터를 행과 열로 분리
    const rows = clipboardData.split('\n').filter(row => row.trim() !== '');
    const pastedData = rows.map(row => row.split('\t'));

    if (pastedData.length === 0) return;

    // 현재 선택된 셀의 위치를 찾기 (포커스된 셀에서 시작)
    const activeElement = document.activeElement as HTMLInputElement;
    if (!activeElement || !activeElement.closest('td')) return;

    const activeCell = activeElement.closest('td') as HTMLTableCellElement;
    const activeRow = activeCell.parentElement as HTMLTableRowElement;
    
    const startRowIndex = Array.from(activeRow.parentElement?.children || []).indexOf(activeRow);
    const startColIndex = Array.from(activeRow.children).indexOf(activeCell);

    // 6행부터만 데이터 입력 가능하도록 체크 (A열만 제한)
    if (startRowIndex < 5 && startColIndex === 0) {
      toast({
        title: "붙여넣기 제한",
        description: "1~5행 A열에는 데이터를 붙여넣을 수 없습니다. B열부터 붙여넣기 가능합니다.",
        variant: "destructive"
      });
      return;
    }

    // 새로운 시트 데이터 생성
    const newSheetData = currentSheetData.map(row => [...row]);
    
    // 필요한 행과 열 수 계산
    const maxRows = Math.max(currentSheetData.length, startRowIndex + pastedData.length);
    const maxCols = Math.max(currentSheetData[0]?.length || 0, startColIndex + Math.max(...pastedData.map(row => row.length)));

    // 행이 부족하면 추가
    while (newSheetData.length < maxRows) {
      newSheetData.push(Array(maxCols).fill(''));
    }

    // 열이 부족하면 기존 행들에 열 추가
    newSheetData.forEach((row, rowIndex) => {
      while (row.length < maxCols) {
        row.push('');
      }
    });

    // 데이터 붙여넣기 (1~5행은 B열부터, 6행부터는 모든 열)
    pastedData.forEach((rowData, rowOffset) => {
      const targetRowIndex = startRowIndex + rowOffset;
      
      // 1~5행은 B열부터만, 6행부터는 모든 열에 데이터 입력
      if (targetRowIndex < 5) {
        // 1~5행: B열부터만 데이터 입력
        rowData.forEach((cellData, colOffset) => {
          const targetColIndex = startColIndex + colOffset;
          if (targetColIndex > 0 && targetColIndex < newSheetData[targetRowIndex].length) {
            // 데이터가 없거나 빈 문자열인 경우 셀을 비움
            newSheetData[targetRowIndex][targetColIndex] = cellData.trim() || '';
          }
        });
      } else {
        // 6행부터: 모든 열에 데이터 입력
        rowData.forEach((cellData, colOffset) => {
          const targetColIndex = startColIndex + colOffset;
          if (targetColIndex >= 0 && targetColIndex < newSheetData[targetRowIndex].length) {
            // 데이터가 없거나 빈 문자열인 경우 셀을 비움
            newSheetData[targetRowIndex][targetColIndex] = cellData.trim() || '';
          }
        });
      }
    });

    setCurrentSheetData(newSheetData);
    
    // 붙여넣은 데이터의 최대 열 개수 계산
    const maxColsInPastedData = Math.max(...pastedData.map(row => row.length));
    
    // 6행부터 붙여넣기로 열이 추가된 경우 1~5행 자동채움 함수 재호출
    if (startRowIndex >= 5 && maxColsInPastedData > 0 && lastAppliedData && ref && 'current' in ref && ref.current) {
      setTimeout(() => {
        if (ref.current) {
          ref.current.fillAllData(lastAppliedData);
        }
      }, 0);
    }
  }, [currentSheetData, setCurrentSheetData, toast, lastAppliedData, ref]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      // 붙여넣기 이벤트는 handlePaste에서 처리됨
      return;
    }
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <DataInputHeader
        dataSets={dataSets}
        setDataSets={setDataSets}
        onSave={handleSave}
        onReset={handleReset}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo()}
        canRedo={canRedo()}
        onApplyData={onApplyData}
      />
      <div 
        ref={tableRef}
        className="bg-white rounded-lg shadow-md border border-gray-200 mx-4 mb-4 h-[800px]"
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className="overflow-auto h-full">
          <table className="border-collapse table-fixed" style={{ tableLayout: 'fixed', minWidth: `${tableWidth}px` }}>
            <colgroup>
              <col style={{ width: '160px', minWidth: '160px', maxWidth: '160px' }} />
              {currentSheetData[0]?.slice(1).map((_, index) => (
                <col key={index + 1} style={{ width: '80px', minWidth: '80px' }} />
              ))}
            </colgroup>
            <tbody>
              {currentSheetData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {row.map((cell, colIndex) => (
                    <td 
                      key={colIndex}
                      className={`h-6 text-sm border-b border-gray-100 border-r border-gray-200 text-black ${
                        colIndex === 0 ? 
                          (rowIndex < 5 ? 'text-center font-bold w-[160px] max-w-[160px] min-w-[160px] bg-gray-50' : 'text-left w-[160px] max-w-[160px] min-w-[160px]') : 
                          'text-center w-20 min-w-[80px]'
                      }`}
                    >
                      {colIndex === 0 && rowIndex < 5 ? (
                        <span className="text-black font-bold overflow-hidden truncate block">
                          {SHEET_HEADER_LABELS[rowIndex]}
                        </span>
                      ) : (
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                          className={`w-full h-full px-2 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                            colIndex > 0 ? 'text-center' : ''
                          }`}
                          style={{
                            ...getCellStyle(rowIndex, colIndex, cell),
                            fontWeight: rowIndex < 5 ? '600' : 'normal'
                          }}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

DataInputSheet.displayName = 'DataInputSheet';
export default DataInputSheet; 