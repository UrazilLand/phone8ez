"use client";

import { DataSet } from '@/types/dashboard';
import ModelHeader from './ModelHeader';
import { SHEET_HEADER_LABELS, DEFAULT_ROW_COUNT, DEFAULT_COLUMN_COUNT } from '@/styles/common';
import { useMemo, useState } from 'react';

interface ModelSheetProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
}

export default function ModelSheet({ dataSets, setDataSets }: ModelSheetProps) {
  const [sheetData, setSheetData] = useState<string[][]>(
    Array(DEFAULT_ROW_COUNT).fill(null).map(() => Array(DEFAULT_COLUMN_COUNT).fill(''))
  );

  // 반응형 열 너비 계산
  const getColumnWidth = useMemo(() => {
    const numCols = sheetData[0]?.length || 0;
    if (numCols <= 1) return { aCol: '160px', otherCols: '80px' };
    
    // A열은 고정, 나머지 열들은 남은 공간을 균등 분할
    const aColWidth = '160px';
    const remainingWidth = `calc((100% - 160px) / ${numCols - 1})`;
    
    return { aCol: aColWidth, otherCols: remainingWidth };
  }, [sheetData]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="max-w-[61rem] mx-auto w-full px-4">
        <ModelHeader dataSets={dataSets} setDataSets={setDataSets} />
      </div>

      {/* 테이블 카드 */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4 h-[800px] max-w-full mx-4 sm:max-w-6xl sm:mx-auto lg:max-w-7xl">
        <div className="overflow-auto h-full">
          <table className="border-collapse w-full" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: getColumnWidth.aCol, minWidth: '160px' }} />
              {sheetData[0]?.slice(1).map((_, index) => (
                <col key={index + 1} style={{ width: getColumnWidth.otherCols, minWidth: '60px' }} />
              ))}
            </colgroup>
            <tbody>
              {sheetData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className={`h-6 text-sm border-b border-gray-200 border-r border-gray-300 text-black ${
                        colIndex === 0
                          ? rowIndex < 5
                            ? 'text-center font-bold bg-gray-50 sticky left-0 z-20'
                            : 'text-left sticky left-0 z-20 bg-white'
                          : 'text-center'
                      }`}
                    >
                      {colIndex === 0 && rowIndex < 5 ? (
                        <span className="text-black font-bold">
                          {SHEET_HEADER_LABELS[rowIndex]}
                        </span>
                      ) : (
                        <div
                          className={`w-full h-full flex items-center ${
                            colIndex > 0 ? 'justify-center' : 'justify-start'
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
    </div>
  );
} 