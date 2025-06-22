import { useState, useCallback } from 'react';
import { TabType, DataSet, PublicSupportData } from '@/types/dashboard';

export function useDashboardState() {
  const [activeTab, setActiveTab] = useState<TabType>('local');
  const [localDataCount, setLocalDataCount] = useState(0);
  const [isCloudLoading, setIsCloudLoading] = useState(true);
  const [dataSets, setDataSets] = useState<DataSet[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [publicData, setPublicData] = useState<PublicSupportData | null>(null);
  const [isAdditionalServiceModalOpen, setIsAdditionalServiceModalOpen] = useState(false);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleReloadIntegrated = useCallback(() => {
    setReloadKey(k => k + 1);
  }, []);

  const handleOpenAdditionalServiceModal = useCallback(() => {
    setIsAdditionalServiceModalOpen(true);
    setActiveTab('integrated');
  }, []);

  return {
    activeTab,
    setActiveTab,
    localDataCount,
    setLocalDataCount,
    isCloudLoading,
    setIsCloudLoading,
    dataSets,
    setDataSets,
    reloadKey,
    publicData,
    setPublicData,
    handleTabChange,
    handleReloadIntegrated,
    isAdditionalServiceModalOpen,
    setIsAdditionalServiceModalOpen,
    handleOpenAdditionalServiceModal,
  };
} 