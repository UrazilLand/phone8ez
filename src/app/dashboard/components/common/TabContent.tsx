import { TabType, DataSet } from '@/types/dashboard';
import { SupportAmountData } from '../../utils/support-amounts';
import DataInputTab from '../data-input';
import IntegratedDataTab from '../integrated';
import ModelDataTab from '../model';
import VisualizationTab from '../visualization';

interface TabContentProps {
  activeTab: TabType;
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
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
  return (
    <div className="flex-1 p-4">
      {activeTab === 'local' && (
        <DataInputTab 
          dataSets={dataSets}
          setDataSets={setDataSets}
        />
      )}
      {activeTab === 'integrated' && (
        <IntegratedDataTab
          dataSets={dataSets}
          setDataSets={setDataSets}
          activeTab={activeTab}
          reloadKey={reloadKey}
          publicData={publicData}
        />
      )}
      {activeTab === 'model' && <ModelDataTab />}
      {activeTab === 'visualization' && <VisualizationTab />}
    </div>
  );
} 