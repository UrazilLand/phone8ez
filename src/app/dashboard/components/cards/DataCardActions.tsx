import React from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex gap-2 mt-auto pt-4">
      <Button
        onClick={onDownload}
        disabled={isCloudMode}
        variant="outline"
        className="h-10 flex-1 flex items-center justify-center gap-2 min-w-[140px]"
      >
        <Download className="w-4 h-4" />
        {isCloudMode ? 'Cloud 저장하기' : '파일 다운로드'}
      </Button>
      <Button
        onClick={onUpload}
        disabled={isCloudMode}
        variant="outline"
        className="h-10 flex-1 flex items-center justify-center gap-2 min-w-[140px]"
      >
        <Upload className="w-4 h-4" />
        {isCloudMode ? 'Cloud 불러오기' : '파일 업로드'}
      </Button>
    </div>
  );
});

DataCardActions.displayName = 'DataCardActions';

export default DataCardActions; 