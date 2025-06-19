"use client";

import { Button } from '@/components/ui/button';
import { DataSet } from '@/types/dashboard';
import { Save, RotateCcw, Undo, Database } from 'lucide-react';
import { BUTTON_THEME, SHEET_HEADER_LABELS, DEFAULT_ROW_COUNT, DEFAULT_COLUMN_COUNT } from '@/styles/common';

interface IntegratedHeaderProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  publicData: any;
}

export default function IntegratedHeader({ dataSets, setDataSets, publicData }: IntegratedHeaderProps) {
  return (
    <div className="flex flex-col w-full">
      {/* 버튼 영역 */}
      <div className="flex items-center justify-between p-4">
        {/* 왼쪽 버튼 그룹 */}
        <div className="flex items-center gap-2">
          <Button 
            className={`${BUTTON_THEME.primary} flex items-center gap-2`}
            size="sm"
          >
            <Save className="w-4 h-4" />
            <span className="max-md:hidden">저장하기</span>
          </Button>
          <Button 
            className={`${BUTTON_THEME.danger_fill} flex items-center gap-2`}
            size="sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="max-md:hidden">시트초기화</span>
          </Button>
          <Button 
            className={`${BUTTON_THEME.danger} flex items-center gap-2`}
            size="sm"
          >
            <Undo className="w-4 h-4" />
            <span className="max-md:hidden">실행취소</span>
          </Button>
        </div>

        {/* 오른쪽 버튼 */}
        <div className="flex items-center">
          <Button 
            className={`${BUTTON_THEME.secondary} flex items-center gap-2`}
            size="sm"
          >
            <Database className="w-4 h-4" />
            <span className="max-md:hidden">데이터 입력</span>
          </Button>
        </div>
      </div>

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
                          (rowIndex < 5 ? 'text-center font-bold w-40 bg-gray-50' : 'text-left w-40') : 
                          'text-center w-20'
                      }`}
                    >
                      {/* A열에 1~5행에 라벨 배치 */}
                      {colIndex === 0 && rowIndex < 5 ? (
                        <span className="text-black font-bold">
                          {SHEET_HEADER_LABELS[rowIndex]}
                        </span>
                      ) : (
                        /* 나머지 셀은 빈 공간 */
                        ''
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