"use client";

import { useState } from 'react';
import { DataSet } from '@/types/dashboard';
import DataInputHeader from './DataInputHeader';

interface DataInputSheetProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
}

export default function DataInputSheet({ dataSets, setDataSets }: DataInputSheetProps) {
  return (
    <div className="flex flex-col w-full h-full">
      <DataInputHeader dataSets={dataSets} setDataSets={setDataSets} />
      <div className="flex-1 overflow-auto">
        {/* 시트 구현 */}
      </div>
    </div>
  );
} 