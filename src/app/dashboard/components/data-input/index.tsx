"use client";
import DataInputSheet, { DataInputSheetRef } from './DataInputSheet';
import { DataSet } from '@/types/dashboard';
import { useRef, forwardRef, useImperativeHandle } from 'react';

interface DataInputTabProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
}

export interface DataInputTabRef {
  loadData: (data: any) => void;
  loadAllData: (data: any[]) => void;
}

const DataInputTab = forwardRef<DataInputTabRef, DataInputTabProps>(({ dataSets, setDataSets }, ref) => {
  const sheetRef = useRef<DataInputSheetRef>(null);

  useImperativeHandle(ref, () => ({
    loadData: (data: any) => {
      console.log('DataInputTab loadData called with:', data);
      if (sheetRef.current) {
        // DataInputSheet의 loadData 메서드를 사용하여 저장된 데이터 로드
        sheetRef.current.loadData(data);
      } else {
        console.error('sheetRef not available');
      }
    },
    loadAllData: (data: any[]) => {
      console.log('DataInputTab loadAllData called with:', data);
      if (data.length > 0 && sheetRef.current) {
        // 첫 번째 데이터만 로드 (여러 데이터셋이 있는 경우)
        sheetRef.current.loadData(data[0]);
      } else {
        console.error('No data available or sheetRef not available');
      }
    }
  }));

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
});

DataInputTab.displayName = 'DataInputTab';
export default DataInputTab; 