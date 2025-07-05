"use client";
import { useEffect, useMemo, useState } from 'react';
import { useDashboardState } from './hooks/useDashboardState';
import { useDataOperations } from './hooks/useDataOperations';
import { loadPublicDataFromStorage } from './utils/dashboardUtils';
import DashboardHeader from './components/common/DashboardHeader';
import DashboardTabs from './components/common/DashboardTabs';
import TabContent from './components/common/TabContent';
import SubscriptionCard from './components/cards/SubscriptionCard';
import DataCardContainer from './components/cards/DataCardContainer';
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRouter } from 'next/navigation';
import { createClient, User } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    isAdditionalServiceModalOpen,
    setIsAdditionalServiceModalOpen,
    handleOpenAdditionalServiceModal,
  } = useDashboardState();

  const {
    dataInputTabRef,
    handleLoadData,
  } = useDataOperations();

  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined: 체크 중, null: 비로그인, object: 로그인

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

  // 로그인 체크
  useEffect(() => {
    let ignore = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!ignore) setUser(data.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user === null) {
      router.replace('/auth/login?redirectTo=/dashboard');
    }
    // user가 undefined(아직 체크 중)일 때는 아무것도 하지 않음
  }, [user, router]);

  if (user === undefined) {
    return <div>로딩 중...</div>;
  }

  const memoizedDataSets = useMemo(() => dataSets, [dataSets]);
  const memoizedPublicData = useMemo(() => publicData, [publicData]);

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen py-10">
        <div className="max-w-[61rem] mx-auto px-4 w-full">
          <DashboardHeader />

          {/* 상단 카드 2개 */}
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 md:gap-4 mb-4 w-full">
            <div className="flex flex-col w-full md:w-[36rem]">
              <DataCardContainer 
                dataSets={memoizedDataSets}
                setDataSets={setDataSets}
                onLoadData={handleLoadData}
                onTabChange={handleTabChange}
                onReloadIntegrated={handleReloadIntegrated}
                onOpenAdditionalServiceModal={handleOpenAdditionalServiceModal}
              />
            </div>
            <div className="flex flex-col w-full md:w-[24rem]">
              <SubscriptionCard />
            </div>
          </div>

          <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <TabContent 
          activeTab={activeTab}
          dataSets={memoizedDataSets}
          setDataSets={setDataSets}
          reloadKey={reloadKey}
          publicData={memoizedPublicData}
          dataInputTabRef={dataInputTabRef}
          isAdditionalServiceModalOpen={isAdditionalServiceModalOpen}
          setIsAdditionalServiceModalOpen={setIsAdditionalServiceModalOpen}
        />
      </div>
    </TooltipProvider>
  );
}