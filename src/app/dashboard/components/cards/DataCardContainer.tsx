"use client";
import { useEffect, useCallback } from 'react';
import { DataSet, TabType } from '@/types/dashboard';
import { getAvailableDates, getSupportAmountsByDate } from '../../utils/support-amounts';
import { savePublicDataToStorage } from '../../utils/dashboardUtils';
import { useDragScroll } from '../../hooks/useDragScroll';
import { useFileOperations } from '../../hooks/useFileOperations';
import { useModalState } from '../../hooks/useModalState';
import { useCloudMode } from '../../hooks/useCloudMode';
import DataCardBody from './DataCardBody';
import SupportDataModal from './SupportDataModal';
import PreviewModal from './PreviewModal';
import { useToast } from "@/hooks/use-toast";

interface DataCardProps {
  dataSets: DataSet[];
  setDataSets: React.Dispatch<React.SetStateAction<DataSet[]>>;
  onLoadData: (data: DataSet['data'] | DataSet['data'][]) => void;
  onTabChange?: (tab: TabType) => void;
  onReloadIntegrated?: () => void;
  onOpenAdditionalServiceModal?: () => void;
}

export default function DataCardContainer({ dataSets, setDataSets, onLoadData, onTabChange, onReloadIntegrated, onOpenAdditionalServiceModal }: DataCardProps) {
  const { toast } = useToast();

  // 커스텀 훅 사용
  const dragScroll = useDragScroll();
  const cloudMode = useCloudMode();
  const modalState = useModalState();
  const fileOperations = useFileOperations(setDataSets, cloudMode.isCloudMode, dataSets);

  useEffect(() => {
    if (modalState.supportModalOpen) {
      const raw = localStorage.getItem('publicData');
      if (raw) modalState.setSupportData(JSON.parse(raw));
    }
  }, [modalState.supportModalOpen, modalState.setSupportData]);

  const handleLoadDataSet = useCallback((dataSet: DataSet) => {
    try {
      if (dataSet.type === 'integrated') {
        if (onTabChange) {
          onTabChange('integrated');
        }
        if (onReloadIntegrated) onReloadIntegrated();
      } else if (dataSet.type === 'additional') {
        if (onOpenAdditionalServiceModal) {
          onOpenAdditionalServiceModal();
        }
      } else {
        if (onTabChange) {
          onTabChange('local');
        }
        onLoadData(dataSet.data);
      }
      modalState.clearError();
      modalState.closePreviewModal();
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      modalState.setError('데이터를 불러오는데 실패했습니다.');
    }
  }, [onTabChange, onReloadIntegrated, onOpenAdditionalServiceModal, onLoadData, modalState]);

  const handlePreviewDataSet = useCallback((dataSet: DataSet) => {
    modalState.openPreviewModal(dataSet);
  }, [modalState]);

  const handleDeleteDataSet = useCallback((dataSet: DataSet) => {
    // 삭제 확인
    if (window.confirm(`"${dataSet.name}" 데이터셋을 삭제하시겠습니까?`)) {
      setDataSets((prev: DataSet[]) => {
        const filtered = prev.filter((d: DataSet) => d.id !== dataSet.id);
        return filtered;
      });
      
      modalState.closePreviewModal();
      modalState.clearError();
      
      // 삭제 완료 알림
      toast({
        title: "삭제 완료",
        description: `"${dataSet.name}" 데이터셋이 성공적으로 삭제되었습니다.`,
      });
    }
  }, [setDataSets, toast, modalState]);

  const handleSupportDataLoad = useCallback(async () => {
    // 바로 모달 열기
    modalState.openSupportModal();
    
    // 기존 데이터가 있으면 먼저 표시
    const raw = localStorage.getItem('publicData');
    if (raw) {
      modalState.setSupportData(JSON.parse(raw));
    }
  }, [modalState]);

  const handleRefreshSupportData = useCallback(async () => {
    // 이미 로딩 중이면 중복 호출 방지
    if (modalState.isLoading) return;
    
    try {
      modalState.setIsLoading(true);
      modalState.clearError();
      
      const dates = await getAvailableDates();
      
      if (!dates || dates.length === 0) {
        throw new Error('사용 가능한 공시 데이터가 없습니다.');
      }
      
      const latestDate = dates[0];
      const data = await getSupportAmountsByDate(latestDate);
      
      modalState.setSupportData(data);
      savePublicDataToStorage(data);
    } catch (error) {
      console.error('공시 데이터 로드 실패:', error);
      modalState.setError(error instanceof Error ? error.message : '공시 데이터를 불러오는데 실패했습니다.');
    } finally {
      // 약간의 지연을 두어 상태 변경을 안정화
      setTimeout(() => {
        modalState.setIsLoading(false);
      }, 100);
    }
  }, [modalState]);

  return (
    <>
      <DataCardBody
        dataSets={dataSets}
        onLoadDataSet={handleLoadDataSet}
        onPreviewDataSet={handlePreviewDataSet}
        onDeleteDataSet={handleDeleteDataSet}
        onSupportDataLoad={handleSupportDataLoad}
        onDownload={fileOperations.handleDownload}
        onUpload={fileOperations.handleUpload}
        isLoading={modalState.isLoading}
        isCloudMode={cloudMode.isCloudMode}
        onToggle={cloudMode.toggleCloudMode}
        scrollRef={dragScroll.scrollRef}
        onMouseDown={dragScroll.handleMouseDown}
        onMouseMove={dragScroll.handleMouseMove}
        onMouseUp={dragScroll.handleMouseUp}
        onMouseLeave={dragScroll.handleMouseLeave}
      />

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileOperations.fileInputRef}
        type="file"
        accept=".json"
        onChange={fileOperations.handleFileChange}
        style={{ display: 'none' }}
      />

      <SupportDataModal
        supportModalOpen={modalState.supportModalOpen}
        setSupportModalOpen={modalState.setSupportModalOpen}
        supportData={modalState.supportData}
        onRefreshSupportData={handleRefreshSupportData}
        isLoading={modalState.isLoading}
        error={modalState.error}
      />

      <PreviewModal
        previewModalOpen={modalState.previewModalOpen}
        setPreviewModalOpen={modalState.setPreviewModalOpen}
        selectedDataSet={modalState.selectedDataSet}
        onLoadDataSet={handleLoadDataSet}
        onDeleteDataSet={handleDeleteDataSet}
      />
    </>
  );
} 