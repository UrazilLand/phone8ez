"use client";
import IntegratedSheet from './IntegratedSheet';
import { DataSet } from '@/types/dashboard';
import { SupportAmountData } from '@/app/dashboard/utils/support-amounts';

interface IntegratedTabProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  activeTab: 'integrated';
  reloadKey: number;
  publicData: SupportAmountData | null;
}

export default function IntegratedTab({ dataSets, setDataSets, publicData }: IntegratedTabProps) {
  return <IntegratedSheet dataSets={dataSets} setDataSets={setDataSets} publicData={publicData} />;
} 