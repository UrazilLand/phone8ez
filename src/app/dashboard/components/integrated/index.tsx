"use client";
import IntegratedSheet from './IntegratedSheet';
import { DataSet } from '@/types/dashboard';
import { SupportAmountData } from '@/app/dashboard/utils/support-amounts';
import React from 'react';

interface IntegratedTabProps {
  dataSets: DataSet[];
  setDataSets: React.Dispatch<React.SetStateAction<DataSet[]>>;
  activeTab: 'integrated';
  reloadKey: number;
  publicData: SupportAmountData | null;
}

export default function IntegratedTab({ dataSets, setDataSets, publicData, reloadKey }: IntegratedTabProps) {
  return <IntegratedSheet dataSets={dataSets} setDataSets={setDataSets} publicData={publicData} reloadKey={reloadKey} />;
} 