import { useCallback, useRef } from 'react';
import { DataSet } from '@/types/dashboard';

export function useDataOperations() {
  const dataInputTabRef = useRef<any>(null);

  const handleLocalDownload = useCallback(() => {
    try {
      console.log('로컬 데이터 다운로드');
    } catch (error) {
      console.error('로컬 데이터 다운로드 실패:', error);
    }
  }, []);

  const handleLocalUpload = useCallback(() => {
    try {
      console.log('로컬 데이터 업로드');
    } catch (error) {
      console.error('로컬 데이터 업로드 실패:', error);
    }
  }, []);

  const handleCloudDownload = useCallback(() => {
    try {
      console.log('Cloud 데이터 다운로드');
    } catch (error) {
      console.error('Cloud 데이터 다운로드 실패:', error);
    }
  }, []);

  const handleCloudUpload = useCallback(() => {
    try {
      console.log('Cloud 데이터 업로드');
    } catch (error) {
      console.error('Cloud 데이터 업로드 실패:', error);
    }
  }, []);

  const handleLoadData = useCallback((data: DataSet['data'] | DataSet['data'][]) => {
    try {
      if ('filters' in data) {
        return;
      }
      if (dataInputTabRef.current) {
        if (Array.isArray(data)) {
          dataInputTabRef.current.loadAllData(data);
        } else {
          dataInputTabRef.current.loadData(data);
        }
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
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