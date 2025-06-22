import { useState, useCallback } from 'react';
import { TabType, DataSet, PublicSupportData } from '@/types/dashboard';

export function useDashboardState() {
  const [activeTab, setActiveTab] = useState<TabType>('local');
  const [localDataCount, setLocalDataCount] = useState(0);
  const [isCloudLoading, setIsCloudLoading] = useState(true);
  const [dataSets, setDataSets] = useState<DataSet[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [publicData, setPublicData] = useState<PublicSupportData | null>(null);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleReloadIntegrated = useCallback(() => {
    setReloadKey(k => k + 1);
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
  };
} 