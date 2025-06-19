"use client";
import { useEffect, useMemo } from 'react';
import { useDashboardState } from './hooks/useDashboardState';
import { useDataOperations } from './hooks/useDataOperations';
import { loadPublicDataFromStorage } from './utils/dashboardUtils';
import DashboardHeader from './components/common/DashboardHeader';
import DashboardTabs from './components/common/DashboardTabs';
import TabContent from './components/common/TabContent';
import SubscriptionCard from './components/cards/SubscriptionCard';
import DataCardContainer from './components/cards/DataCardContainer';

export default function Dashboard() {
  const {
    activeTab,
    setActiveTab,
    dataSets,
    setDataSets,
    reloadKey,
    publicData,
    setPublicData,
    handleTabChange,
    handleReloadIntegrated,
  } = useDashboardState();

  const {
    dataInputTabRef,
    handleLoadData,
  } = useDataOperations();

  // publicData 로드
  useEffect(() => {
    const data = loadPublicDataFromStorage();
    if (data) {
      setPublicData(data);
    }
  }, [reloadKey, setPublicData]);

  // 개발 모드에서 로그
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('publicData 로드됨:', publicData);
    }
  }, [publicData]);

  const memoizedDataSets = useMemo(() => dataSets, [dataSets]);
  const memoizedPublicData = useMemo(() => publicData, [publicData]);

  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto py-10 px-4">
      <DashboardHeader />

      {/* 상단 카드 2개 */}
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 md:gap-4 mb-4 w-full">
        <div className="flex flex-col w-full md:w-[36rem] max-w-full md:max-w-[90vw]">
          <DataCardContainer 
            dataSets={memoizedDataSets}
            setDataSets={setDataSets}
            onLoadData={handleLoadData}
            onTabChange={handleTabChange}
            onReloadIntegrated={handleReloadIntegrated}
          />
        </div>
        <div className="flex flex-col w-full md:w-[24rem] max-w-full md:max-w-[70vw]">
          <SubscriptionCard />
        </div>
      </div>

      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <TabContent 
        activeTab={activeTab}
        dataSets={memoizedDataSets}
        setDataSets={setDataSets}
        reloadKey={reloadKey}
        publicData={memoizedPublicData}
        dataInputTabRef={dataInputTabRef}
      />
    </div>
  );
}