"use client";

import { useUndo } from '@/hooks/use-undo';
import { DataSet, SheetData } from '@/types/dashboard';
import DataInputHeader from './DataInputHeader';
import { SHEET_HEADER_LABELS, DEFAULT_ROW_COUNT, DEFAULT_COLUMN_COUNT } from '@/styles/common';
import { useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useToast } from "@/hooks/use-toast";

interface DataInputSheetProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  onApplyData?: (data: any) => void;
}

export interface DataInputSheetRef {
  fillAllData: (modalData: any) => void;
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

  useImperativeHandle(ref, () => ({
    fillAllData: (modalData: any) => {
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
        const repeatCount = parseInt(planRepeatCount) || 1;
        
        const finalPattern: string[] = [];
        for (let i = 0; i < repeatCount; i++) {
          finalPattern.push(...subPattern);
        }

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
        const repeatCount = parseInt(companyRepeatCount) || 1;

        const finalPattern: string[] = [];
        for (let i = 0; i < repeatCount; i++) {
          finalPattern.push(...subPattern);
        }

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
    }
  }));

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
      name: `데이터 세트 ${dataSets.length + 1}`,
      type: 'normal',
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

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newSheetData = currentSheetData.map(row => [...row]);
    newSheetData[rowIndex][colIndex] = value;
    setCurrentSheetData(newSheetData);
  };
  
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
  }, [currentSheetData, setCurrentSheetData, toast]);

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
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                          className={`w-full h-full px-2 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                            colIndex > 0 ? 'text-center' : ''
                          }`}
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