import React from 'react';
import { FileText } from 'lucide-react';
import { DataSet } from '@/types/dashboard';
import { Button } from '@/components/ui/button';

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
            <div className="text-center text-muted-foreground py-2 w-full">
              저장된 데이터가 없습니다.
            </div>
          ) : (
            <>
              {/* 통합 데이터셋 */}
              {dataSets.find((d) => d.type === 'integrated') && (
                <Button
                  key={dataSets.find((d) => d.type === 'integrated')!.id}
                  onDoubleClick={() => onPreviewDataSet(dataSets.find((d) => d.type === 'integrated')!)}
                  variant="outline"
                  className="px-5 h-10 text-sm font-bold truncate whitespace-nowrap"
                  style={{ flex: '0 0 auto' }}
                >
                  {dataSets.find((d) => d.type === 'integrated')!.name}
                </Button>
              )}
              {/* 부가서비스 데이터셋 */}
              {dataSets.find((d) => d.type === 'additional') && (
                <Button
                  key={dataSets.find((d) => d.type === 'additional')!.id}
                  onDoubleClick={() => onPreviewDataSet(dataSets.find((d) => d.type === 'additional')!)}
                  variant="outline"
                  className="px-5 h-10 text-sm font-bold truncate whitespace-nowrap"
                  style={{ flex: '0 0 auto' }}
                >
                  {dataSets.find((d) => d.type === 'additional')!.name}
                </Button>
              )}
              {/* 기타 데이터셋들 */}
              {dataSets.filter((d) => d.type !== 'integrated' && d.type !== 'additional').map((dataSet) => (
                <Button
                  key={dataSet.id}
                  onDoubleClick={() => onPreviewDataSet(dataSet)}
                  variant="secondary"
                  className="px-5 h-10 text-sm font-bold truncate whitespace-nowrap"
                  style={{ flex: '0 0 auto' }}
                >
                  {dataSet.name}
                </Button>
              ))}
            </>
          )}
        </div>
      </div>
      
      {/* 공시 버튼 - 슬라이드 오른쪽 고정 */}
      <Button
        onClick={onSupportDataLoad}
        className="flex items-center justify-center gap-2 px-4 h-10 flex-shrink-0"
      >
        <FileText className="w-4 h-4" />
        공시
      </Button>
    </div>
  );
});

DataCardSlider.displayName = 'DataCardSlider';

export default DataCardSlider; 