"use client";
import IntegratedSheet from './IntegratedSheet';
import { DataSet } from '@/types/dashboard';
import { PublicSupportData } from '@/types/dashboard';
import React from 'react';

interface IntegratedTabProps {
  dataSets: DataSet[];
  setDataSets: React.Dispatch<React.SetStateAction<DataSet[]>>;
  activeTab: 'integrated';
  reloadKey: number;
  publicData: PublicSupportData | null;
  isAdditionalServiceModalOpen: boolean;
  setIsAdditionalServiceModalOpen: (isOpen: boolean) => void;
}

export default function IntegratedTab({ 
  dataSets, 
  setDataSets, 
  publicData, 
  reloadKey,
  isAdditionalServiceModalOpen,
  setIsAdditionalServiceModalOpen
}: IntegratedTabProps) {
  return (
    <IntegratedSheet 
      dataSets={dataSets} 
      setDataSets={setDataSets} 
      publicData={publicData} 
      reloadKey={reloadKey}
      isAdditionalServiceModalOpen={isAdditionalServiceModalOpen}
      setIsAdditionalServiceModalOpen={setIsAdditionalServiceModalOpen}
    />
  );
} 