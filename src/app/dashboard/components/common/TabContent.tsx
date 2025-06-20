import { TabType, DataSet } from '@/types/dashboard';
import { SupportAmountData } from '../../utils/support-amounts';
import DataInputTab from '../data-input';
import IntegratedDataTab from '../integrated';
import ModelDataTab from '../model';
import VisualizationTab from '../visualization';
import React from 'react';

interface TabContentProps {
  activeTab: TabType;
  dataSets: DataSet[];
  setDataSets: React.Dispatch<React.SetStateAction<DataSet[]>>;
  reloadKey: number;
  publicData: SupportAmountData | null;
  dataInputTabRef: any;
}

export default function TabContent({ 
  activeTab, 
  dataSets, 
  setDataSets, 
  reloadKey, 
  publicData, 
  dataInputTabRef 
}: TabContentProps) {
  const tabStyle = (tabName: TabType) => ({
    display: activeTab === tabName ? 'block' : 'none',
  });

  return (
    <div className="flex-1 px-4 mt-4">
      <div style={tabStyle('local')}>
        <DataInputTab 
          ref={dataInputTabRef}
          dataSets={dataSets}
          setDataSets={setDataSets}
        />
      </div>
      <div style={tabStyle('integrated')}>
        <IntegratedDataTab
          dataSets={dataSets}
          setDataSets={setDataSets}
          activeTab={'integrated'}
          reloadKey={reloadKey}
          publicData={publicData}
        />
      </div>
      <div style={tabStyle('model')}>
        <ModelDataTab 
          dataSets={dataSets}
          setDataSets={setDataSets}
        />
      </div>
      <div style={tabStyle('visualization')}>
        <VisualizationTab />
      </div>
    </div>
  );
} 