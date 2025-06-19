import { RefreshCw, Download, Upload, Database, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataSet } from '@/types/dashboard';
import { cardStyles, flexColGap2, buttonStyles } from '@/styles/common';

interface DataCardBodyProps {
  dataSets: DataSet[];
  onLoadDataSet: (dataSet: DataSet) => void;
  onPreviewDataSet: (dataSet: DataSet) => void;
  onDeleteDataSet: (dataSet: DataSet) => void;
  onSupportDataLoad: () => void;
  onDownload: () => void;
  onUpload: () => void;
  isLoading: boolean;
  isCloudMode: boolean;
  onToggle: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

export default function DataCardBody({
  dataSets,
  onLoadDataSet,
  onPreviewDataSet,
  onDeleteDataSet,
  onSupportDataLoad,
  onDownload,
  onUpload,
  isLoading,
  isCloudMode,
  onToggle,
  scrollRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
}: DataCardBodyProps) {
  return (
    <div className={`${cardStyles} py-4 px-4`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          {isCloudMode ? <Cloud className="w-4 h-4 text-gray-400" /> : <Database className="w-4 h-4 text-gray-400" />}
          {isCloudMode ? 'Cloud 데이터' : '로컬 데이터'}
          <span className="ml-2 text-blue-700 font-semibold">{dataSets.length}개 데이터셋</span>
        </div>
        
        {/* 토글 스위치 */}
        <div className="flex items-center gap-2">
          <Database className={`w-5 h-5 ${!isCloudMode ? 'text-blue-600' : 'text-gray-400'}`} />
          <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${isCloudMode ? 'bg-blue-600' : 'bg-gray-200'}`}
            aria-label="로컬/클라우드 토글"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isCloudMode ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
          <Cloud className={`w-5 h-5 ${isCloudMode ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>
      </div>

      {/* 데이터셋 슬라이드와 공시 데이터 버튼 */}
      <div className="flex gap-4">
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto overflow-y-hidden"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          style={{ cursor: 'grab' }}
        >
          <div className="flex gap-2 min-w-max">
            {dataSets.length === 0 ? (
              <div className="text-center text-gray-400 py-2 w-full">
                저장된 데이터가 없습니다.
              </div>
            ) : (
              dataSets.map((dataSet) => (
                <button
                  key={dataSet.id}
                  onClick={() => onPreviewDataSet(dataSet)}
                  className={`px-5 h-10 text-sm font-bold border rounded-lg transition-colors duration-150 truncate whitespace-nowrap ${
                    dataSet.type === 'integrated'
                      ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-700'
                      : 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-blue-600 hover:text-white hover:border-blue-700'
                  }`}
                  style={{ flex: '0 0 auto' }}
                >
                  {dataSet.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* 공시 데이터 버튼 */}
        <button
          onClick={onSupportDataLoad}
          disabled={isLoading}
          className="px-5 h-10 text-sm font-bold border rounded-lg transition-colors duration-150 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-800 flex-shrink-0 flex items-center gap-2"
        >
          {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          공시
        </button>
      </div>

      {/* 하단 버튼 그룹 */}
      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="flex-1 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          다운로드
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onUpload}
          className="flex-1 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          업로드
        </Button>
      </div>
    </div>
  );
} 