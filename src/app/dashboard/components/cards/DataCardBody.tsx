import React, { useMemo } from 'react';
import { DataSet } from '@/types/dashboard';
import DataCardHeader from './DataCardHeader';
import DataCardSlider from './DataCardSlider';
import DataCardActions from './DataCardActions';

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
  onCloudSave: () => void;
  onCloudLoad: () => void;
  isPro: boolean;
}

const DataCardBody = React.memo(({
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
  onCloudSave,
  onCloudLoad,
  isPro,
}: DataCardBodyProps) => {
  // 데이터셋 필터링을 useMemo로 최적화
  const { integratedDataSet, additionalDataSet, otherDataSets } = useMemo(() => {
    const integrated = dataSets.find((d) => d.type === 'integrated');
    const additional = dataSets.find((d) => d.type === 'additional');
    const other = dataSets.filter((d) => d.type !== 'integrated' && d.type !== 'additional');
    return { integratedDataSet: integrated, additionalDataSet: additional, otherDataSets: other };
  }, [dataSets]);

  return (
    <div className="bg-card border border-border rounded-lg p-4 h-full flex flex-col">
      {/* 헤더 */}
      <DataCardHeader
        isCloudMode={isCloudMode}
        otherDataSetsCount={otherDataSets.length}
        onToggle={onToggle}
      />

      {/* 데이터셋 슬라이더 */}
      <DataCardSlider
        dataSets={dataSets}
        onPreviewDataSet={onPreviewDataSet}
        onSupportDataLoad={onSupportDataLoad}
        scrollRef={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      />

      {/* 하단 액션 버튼들 */}
      <DataCardActions
        isCloudMode={isCloudMode}
        onDownload={onDownload}
        onUpload={onUpload}
        onCloudSave={onCloudSave}
        onCloudLoad={onCloudLoad}
        isPro={isPro}
      />
    </div>
  );
});

DataCardBody.displayName = 'DataCardBody';

export default DataCardBody; 