"use client";

import { useUndo } from '@/hooks/use-undo';
import { DataSet, SheetData } from '@/types/dashboard';
import DataInputHeader from './DataInputHeader';
import { 
  SHEET_HEADER_LABELS, 
  DEFAULT_ROW_COUNT, 
  DEFAULT_COLUMN_COUNT,
  BUTTON_THEME
} from '@/styles/common';
import { getDynamicCellStyle } from '@/components/ui/colors';
import { useState, useCallback, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth';

interface DataInputSheetProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  onApplyData?: (data: any) => void;
}

export interface DataInputSheetRef {
  fillAllData: (modalData: any) => void;
  loadData: (data: any) => void;
}

// 선택 영역 상태 타입
interface CellPosition { row: number; col: number; }
interface SelectionRange {
  start: CellPosition | null;
  end: CellPosition | null;
}

const DataInputSheet = forwardRef<DataInputSheetRef, DataInputSheetProps>(({ dataSets, setDataSets, onApplyData }, ref) => {
  const { toast } = useToast();
  const tableRef = useRef<HTMLDivElement>(null);
  
  const [sheetData, setSheetData] = useState<string[][]>(
    Array(DEFAULT_ROW_COUNT - 1).fill(null).map(() => Array(DEFAULT_COLUMN_COUNT).fill(''))
  );

  const [
    currentSheetData,
    setCurrentSheetData,
    setCurrentSheetDataWithoutUndo,
    undo,
    redo,
    canUndo,
    canRedo
  ] = useUndo<string[][]>(sheetData);

  const { user } = useAuth();

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

  // 반응형 열 너비 계산
  const getColumnWidth = useMemo(() => {
    const numCols = currentSheetData[0]?.length || 0;
    if (numCols <= 1) return { aCol: '160px', otherCols: '80px' };
    
    // A열은 고정, 나머지 열들은 남은 공간을 균등 분할
    const aColWidth = '160px';
    const remainingWidth = `calc((100% - 160px) / ${numCols - 1})`;
    
    return { aCol: aColWidth, otherCols: remainingWidth };
  }, [currentSheetData]);

  const [selection, setSelection] = useState<SelectionRange>({ start: null, end: null });
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);

  // 셀 선택/드래그/Shift+방향키로 선택 영역 갱신
  const handleCellMouseDown = (row: number, col: number) => {
    setSelection({ start: { row, col }, end: { row, col } });
    setEditingCell(null);
  };
  const handleCellMouseOver = (row: number, col: number) => {
    if (selection.start && !editingCell) {
      setSelection(sel => ({ ...sel, end: { row, col } }));
    }
  };
  const handleCellMouseUp = () => {
    // 드래그 종료
  };

  // 셀 더블클릭 또는 엔터로 입력 모드 진입
  const handleCellDoubleClick = (row: number, col: number) => {
    setEditingCell({ row, col });
  };
  const handleCellKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key === 'Enter') {
      setEditingCell({ row, col });
    }
  };

  // 선택 영역 내 셀인지 확인
  const isCellSelected = (row: number, col: number) => {
    if (!selection.start || !selection.end) return false;
    const r1 = Math.min(selection.start.row, selection.end.row);
    const r2 = Math.max(selection.start.row, selection.end.row);
    const c1 = Math.min(selection.start.col, selection.end.col);
    const c2 = Math.max(selection.start.col, selection.end.col);
    return row >= r1 && row <= r2 && col >= c1 && col <= c2;
  };

  // Delete 키 이벤트 처리
  const handleSheetKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && selection.start && selection.end && !editingCell) {
      e.preventDefault();
      const r1 = Math.min(selection.start.row, selection.end.row);
      const r2 = Math.max(selection.start.row, selection.end.row);
      const c1 = Math.min(selection.start.col, selection.end.col);
      const c2 = Math.max(selection.start.col, selection.end.col);
      const newSheetData = currentSheetData.map(row => [...row]);
      for (let row = r1; row <= r2; row++) {
        for (let col = c1; col <= c2; col++) {
          newSheetData[row][col] = '';
        }
      }
      setCurrentSheetData(newSheetData);
    }
  }, [selection, editingCell, currentSheetData, setCurrentSheetData]);

  // 기존 handleKeyDown (붙여넣기 등)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      // 붙여넣기 이벤트는 handlePaste에서 처리됨
      return;
    }
  }, []);

  // handleSheetKeyDown과 handleKeyDown을 통합
  const handleCombinedKeyDown = useCallback((e: React.KeyboardEvent) => {
    handleSheetKeyDown(e);
    handleKeyDown(e);
  }, [handleSheetKeyDown, handleKeyDown]);

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
        setCurrentSheetDataWithoutUndo(data.sheetData);
        
        // 마지막으로 적용된 데이터 초기화 (새로운 데이터를 로드했으므로)
        setLastAppliedData(null);
      } else {
        console.error('Invalid data format for loadData:', data);
      }
    }
  }));

  const handleSave = async (dataName?: string) => {
    // 1. 사용자의 구독 플랜 확인
    let isPro = false;
    if (user?.id) {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan, ends_at')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data && data.plan === 'pro' && data.ends_at) {
        const now = new Date();
        const ends = new Date(data.ends_at);
        if (ends > now) {
          isPro = true;
        }
      }
    }
    // 2. 무료 플랜이고 normal 데이터셋이 3개 이상이면 제한
    const normalCount = dataSets.filter(ds => ds.type === 'normal').length;
    if (!isPro && normalCount >= 3) {
      toast({
        title: '데이터셋 개수 제한',
        description: '무료 플랜은 3개 이상의 데이터셋을 입력할 수 없습니다.\n더 많은 데이터 입력을 원하신다면 프로 플랜으로 구독해 주세요.',
      });
      return;
    }
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
    const emptySheet = Array(DEFAULT_ROW_COUNT - 1).fill(null).map(() => Array(DEFAULT_COLUMN_COUNT).fill(''));
    setCurrentSheetDataWithoutUndo(emptySheet);
    setLastAppliedData(null);
    toast({
      title: "초기화 완료",
      description: "시트가 초기화되었습니다.",
    });
  }, [setCurrentSheetDataWithoutUndo, toast]);

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

  return (
    <div className="flex flex-col w-full h-full">
      <div className="max-w-[61rem] mx-auto w-full px-4">
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
      </div>
      <div 
        ref={tableRef}
        className="bg-card rounded-lg shadow-md mx-4 sm:mx-8 lg:mx-16 mb-4 h-[1200px]"
        onPaste={handlePaste}
        onKeyDown={handleCombinedKeyDown}
        tabIndex={-1}
      >
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
                {/* 3행(요금제) 고유값 배열 생성 */}
                {(() => {
                  const planRow = currentSheetData[2] || [];
                  const uniquePlans = Array.from(new Set(planRow.slice(1).filter(Boolean)));
                  return currentSheetData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-muted/50">
                      {row.map((cell, colIndex) => {
                        let planColorIdx = undefined;
                        if (rowIndex === 2 && colIndex > 0 && cell) {
                          planColorIdx = uniquePlans.indexOf(cell);
                        }
                        const selected = isCellSelected(rowIndex, colIndex);
                        return (
                          <td 
                            key={colIndex}
                            className={`h-6 text-sm border border-[#020817] border-[1px] p-0 text-center ${
                              colIndex === 0 && rowIndex < 5
                                ? `sticky left-0 z-20 bg-gray-200 dark:bg-[#222222] text-center font-bold`
                                : colIndex === 0
                                  ? `sticky left-0 z-20 bg-gray-200 dark:bg-card text-center font-bold`
                                  : 'text-center'
                            } ${selected ? 'bg-blue-200 dark:bg-blue-700' : ''}`}
                            onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                            onMouseOver={e => e.buttons === 1 && handleCellMouseOver(rowIndex, colIndex)}
                            onMouseUp={handleCellMouseUp}
                            onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                            tabIndex={0}
                            onKeyDown={e => handleCellKeyDown(e, rowIndex, colIndex)}
                          >
                            {editingCell && editingCell.row === rowIndex && editingCell.col === colIndex ? (
                              <input
                                type="text"
                                value={cell}
                                autoFocus
                                onBlur={() => setEditingCell(null)}
                                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                className={`w-full h-full border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                                  ${colIndex === 0 && rowIndex >= 5 ? 'bg-gray-100 dark:bg-[#353535] text-left font-bold' : ''}
                                  ${colIndex > 0 ? 'text-center' : ''}
                                  ${rowIndex === 2 && colIndex > 0 && cell
                                    ? getDynamicCellStyle(rowIndex, cell, planColorIdx)
                                    : rowIndex < 5 && colIndex > 0
                                      ? getDynamicCellStyle(rowIndex, cell, colIndex)
                                      : ''}
                                `}
                              />
                            ) : colIndex === 0 && rowIndex < 5 ? (
                              <span className="text-foreground font-bold overflow-hidden truncate block" style={{ userSelect: 'none' }}>
                                {SHEET_HEADER_LABELS[rowIndex]}
                              </span>
                            ) : (
                              <span
                                className={
                                  rowIndex === 2 && colIndex > 0 && cell
                                    ? getDynamicCellStyle(rowIndex, cell, planColorIdx)
                                    : rowIndex < 5 && colIndex > 0
                                      ? getDynamicCellStyle(rowIndex, cell, colIndex)
                                      : ''
                                }
                                style={{ userSelect: 'none' }}
                              >
                                {cell}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
});

DataInputSheet.displayName = 'DataInputSheet';
export default DataInputSheet; 