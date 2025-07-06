import { useCallback, useRef } from 'react';
import { DataSet } from '@/types/dashboard';

export function useDataOperations() {
  const dataInputTabRef = useRef<any>(null);

  const handleLocalDownload = useCallback(() => {
    // ... existing code ...
  }, []);

  const handleLocalUpload = useCallback(() => {
    // ... existing code ...
  }, []);

  const handleCloudDownload = useCallback(() => {
    // ... existing code ...
  }, []);

  const handleCloudUpload = useCallback(() => {
    // ... existing code ...
  }, []);

  const handleLoadData = useCallback((data: DataSet['data'] | DataSet['data'][]) => {
    // ... existing code ...
  }, []);

  return {
    dataInputTabRef,
    handleLocalDownload,
    handleLocalUpload,
    handleCloudDownload,
    handleCloudUpload,
    handleLoadData,
  };
} 