import React from 'react';
import { Database, Cloud } from 'lucide-react';

interface DataCardHeaderProps {
  isCloudMode: boolean;
  otherDataSetsCount: number;
  onToggle: () => void;
}

const DataCardHeader = React.memo(({
  isCloudMode,
  otherDataSetsCount,
  onToggle
}: DataCardHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        {isCloudMode ? <Cloud className="w-4 h-4 text-muted-foreground" /> : <Database className="w-4 h-4 text-muted-foreground" />}
        {isCloudMode ? 'Cloud 데이터' : '로컬 데이터'}
        <span className="ml-2 text-blue-600 dark:text-blue-500 font-semibold">{otherDataSetsCount}개 데이터셋</span>
      </div>
      
      {/* 토글 스위치 */}
      <div className="flex items-center gap-2">
        <Database className={`w-5 h-5 ${!isCloudMode ? 'text-blue-600 dark:text-blue-500' : 'text-muted-foreground'}`} />
        <button
          onClick={onToggle}
          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${isCloudMode ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          aria-label="로컬/클라우드 토글"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isCloudMode ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
        <Cloud className={`w-5 h-5 ${isCloudMode ? 'text-blue-600 dark:text-blue-500' : 'text-muted-foreground'}`} />
      </div>
    </div>
  );
});

DataCardHeader.displayName = 'DataCardHeader';

export default DataCardHeader; 