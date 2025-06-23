import React from 'react';
import { FileText } from 'lucide-react';
import { DataSet } from '@/types/dashboard';
import { BUTTON_THEME } from '@/styles/common';

interface DataCardSliderProps {
  dataSets: DataSet[];
  onPreviewDataSet: (dataSet: DataSet) => void;
  onSupportDataLoad: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

const DataCardSlider = React.memo(({
  dataSets,
  onPreviewDataSet,
  onSupportDataLoad,
  scrollRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave
}: DataCardSliderProps) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div
        ref={scrollRef}
        className="overflow-x-auto flex-1"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        style={{ 
          cursor: 'grab',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="flex gap-2 min-w-max">
          {dataSets.length === 0 ? (
            <div className="text-center text-gray-400 py-2 w-full">
              저장된 데이터가 없습니다.
            </div>
          ) : (
            <>
              {/* 통합 데이터셋 */}
              {dataSets.find((d) => d.type === 'integrated') && (
                <button
                  key={dataSets.find((d) => d.type === 'integrated')!.id}
                  onDoubleClick={() => onPreviewDataSet(dataSets.find((d) => d.type === 'integrated')!)}
                  className={`px-5 h-10 text-sm font-bold border rounded-lg transition-colors duration-150 truncate whitespace-nowrap bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-700`}
                  style={{ flex: '0 0 auto' }}
                >
                  {dataSets.find((d) => d.type === 'integrated')!.name}
                </button>
              )}
              {/* 부가서비스 데이터셋 */}
              {dataSets.find((d) => d.type === 'additional') && (
                <button
                  key={dataSets.find((d) => d.type === 'additional')!.id}
                  onDoubleClick={() => onPreviewDataSet(dataSets.find((d) => d.type === 'additional')!)}
                  className={`px-5 h-10 text-sm font-bold border rounded-lg transition-colors duration-150 truncate whitespace-nowrap bg-green-100 border-green-300 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-700`}
                  style={{ flex: '0 0 auto' }}
                >
                  {dataSets.find((d) => d.type === 'additional')!.name}
                </button>
              )}
              {/* 기타 데이터셋들 */}
              {dataSets.filter((d) => d.type !== 'integrated' && d.type !== 'additional').map((dataSet) => (
                <button
                  key={dataSet.id}
                  onDoubleClick={() => onPreviewDataSet(dataSet)}
                  className={`px-5 h-10 text-sm font-bold border rounded-lg transition-colors duration-150 truncate whitespace-nowrap bg-gray-100 border-gray-300 text-gray-800 hover:bg-blue-600 hover:text-white hover:border-blue-700`}
                  style={{ flex: '0 0 auto' }}
                >
                  {dataSet.name}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
      
      {/* 공시 버튼 - 슬라이드 오른쪽 고정 */}
      <button
        onClick={onSupportDataLoad}
        className={`${BUTTON_THEME.primary} flex items-center justify-center gap-2 px-4 h-10 flex-shrink-0`}
      >
        <FileText className="w-4 h-4" />
        공시
      </button>
    </div>
  );
});

DataCardSlider.displayName = 'DataCardSlider';

export default DataCardSlider; 