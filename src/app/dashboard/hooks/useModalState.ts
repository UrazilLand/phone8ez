import { useState, useCallback } from 'react';
import { DataSet, PublicSupportData } from '@/types/dashboard';

export const useModalState = () => {
  const [selectedDataSet, setSelectedDataSet] = useState<DataSet | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportData, setSupportData] = useState<PublicSupportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPreviewModal = useCallback((dataSet: DataSet) => {
    setSelectedDataSet(dataSet);
    setPreviewModalOpen(true);
  }, []);

  const closePreviewModal = useCallback(() => {
    setPreviewModalOpen(false);
    setSelectedDataSet(null);
  }, []);

  const openSupportModal = useCallback(() => {
    setSupportModalOpen(true);
  }, []);

  const closeSupportModal = useCallback(() => {
    setSupportModalOpen(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 상태
    selectedDataSet,
    previewModalOpen,
    supportModalOpen,
    supportData,
    isLoading,
    error,
    
    // 상태 설정 함수
    setSelectedDataSet,
    setPreviewModalOpen,
    setSupportModalOpen,
    setSupportData,
    setIsLoading,
    setError,
    
    // 편의 함수
    openPreviewModal,
    closePreviewModal,
    openSupportModal,
    closeSupportModal,
    clearError
  };
}; 