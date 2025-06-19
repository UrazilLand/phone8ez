"use client";

import { DataSet } from '@/types/dashboard';
import ModelHeader from './ModelHeader';
import { SHEET_HEADER_LABELS, DEFAULT_ROW_COUNT, DEFAULT_COLUMN_COUNT } from '@/styles/common';

interface ModelSheetProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
}

export default function ModelSheet({ dataSets, setDataSets }: ModelSheetProps) {
  return (
    <div className="flex flex-col w-full h-full">
      <ModelHeader dataSets={dataSets} setDataSets={setDataSets} />
      
      {/* 테이블 카드 */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mx-4 mb-4 h-[800px]">
        <div className="overflow-auto h-full">
          <table className="border-collapse min-w-[1120px] table-fixed">
            <tbody>
              {Array.from({ length: DEFAULT_ROW_COUNT }, (_, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {Array.from({ length: DEFAULT_COLUMN_COUNT }, (_, colIndex) => (
                    <td 
                      key={colIndex}
                      className={`h-6 text-sm border-b border-gray-100 border-r border-gray-200 text-black ${
                        colIndex === 0 ? 
                          (rowIndex < 5 ? 'text-center font-bold w-40 bg-gray-50 min-w-[160px]' : 'text-left w-40 min-w-[160px]') : 
                          'text-center w-20 min-w-[80px]'
                      }`}
                    >
                      {/* A열에 1~5행에 라벨 배치 */}
                      {colIndex === 0 && rowIndex < 5 ? (
                        <span className="text-black font-bold">
                          {SHEET_HEADER_LABELS[rowIndex]}
                        </span>
                      ) : (
                        /* 나머지 셀은 빈 공간 */
                        <div className={`w-full h-full px-2 flex items-center ${
                          colIndex > 0 ? 'justify-center' : 'justify-start'
                        }`}>
                          {''}
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