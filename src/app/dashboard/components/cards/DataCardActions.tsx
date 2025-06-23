import React from 'react';
import { Download, Upload } from 'lucide-react';
import { BUTTON_THEME } from '@/styles/common';

interface DataCardActionsProps {
  isCloudMode: boolean;
  onDownload: () => void;
  onUpload: () => void;
}

const DataCardActions = React.memo(({
  isCloudMode,
  onDownload,
  onUpload
}: DataCardActionsProps) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onDownload}
        disabled={isCloudMode}
        className={`${BUTTON_THEME.secondary} h-10 flex-1 flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Download className="w-4 h-4" />
        {isCloudMode ? 'Cloud 저장하기' : '파일 다운로드'}
      </button>
      <button
        onClick={onUpload}
        disabled={isCloudMode}
        className={`${BUTTON_THEME.secondary} h-10 flex-1 flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Upload className="w-4 h-4" />
        {isCloudMode ? 'Cloud 불러오기' : '파일 업로드'}
      </button>
    </div>
  );
});

DataCardActions.displayName = 'DataCardActions';

export default DataCardActions; 