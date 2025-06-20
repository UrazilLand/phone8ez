"use client";
import DataInputSheet, { DataInputSheetRef } from './DataInputSheet';
import { DataSet } from '@/types/dashboard';
import { useRef } from 'react';

interface DataInputTabProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
}

export default function DataInputTab({ dataSets, setDataSets }: DataInputTabProps) {
  const sheetRef = useRef<DataInputSheetRef>(null);

  const handleApplyData = (modalData: any) => {
    console.log('handleApplyData called with:', modalData);
    
    if (sheetRef.current) {
      sheetRef.current.fillAllData(modalData);
    } else {
      console.log('sheetRef not available');
    }
  };

  return (
    <DataInputSheet 
      ref={sheetRef}
      dataSets={dataSets} 
      setDataSets={setDataSets}
      onApplyData={handleApplyData}
    />
  );
} 